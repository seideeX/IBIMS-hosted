import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SquarePen, Trash2, ListPlus, Filter, Car } from "lucide-react";
import { useEffect, useState } from "react";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { Toaster, toast } from "sonner";
import DynamicTable from "@/Components/DynamicTable";
import ActionMenu from "@/Components/ActionMenu";
import {
    VEHICLE_CLASS_TEXT,
    VEHICLE_USAGE_TEXT,
    VEHICLE_USAGE_STYLES,
} from "@/constants";
import SidebarModal from "@/Components/SidebarModal";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import FilterToggle from "@/Components/FilterButtons/FillterToggle";
import useResidentChangeHandler from "@/hooks/handleResidentChange";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import VehicleForm from "./Partials/VehicleForm";
import ExportButton from "@/Components/ExportButton";
import PageHeader from "@/Components/PageHeader";

export default function Index({
    vehicles,
    vehicle_types,
    puroks,
    queryParams: rawParams,
    residents,
}) {
    const queryParams = rawParams || {};

    const breadcrumbs = [
        { label: "Residents Information", showOnMobile: false },
        { label: "Vehicles", showOnMobile: true },
    ];

    const APP_URL = useAppUrl();
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;

    const [modalState, setModalState] = useState(null);
    const [vehicleDetails, setVehicleDetails] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState(null);

    const [query, setQuery] = useState(queryParams.name ?? "");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, errors, reset, clearErrors } = useForm({
        resident_id: null,
        resident_name: "",
        resident_image: null,
        birthdate: null,
        purok_number: null,
        has_vehicle: null,
        vehicles: [[]],
        vehicle_id: null,
        _method: undefined,
    });

    const handleResidentChange = useResidentChangeHandler(residents, setData);

    const handleArrayValues = (e, index, column, array) => {
        const updated = [...(data[array] || [])];
        updated[index] = {
            ...updated[index],
            [column]: e.target.value,
        };
        setData(array, updated);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        searchFieldName("name", query);
    };

    const searchFieldName = (field, value) => {
        if (value && value.trim() !== "") {
            queryParams[field] = value;
        } else {
            delete queryParams[field];
        }

        if (queryParams.page) {
            delete queryParams.page;
        }
        router.get(route("vehicle.index", queryParams));
    };

    const onKeyPressed = (field, e) => {
        if (e.key === "Enter") {
            searchFieldName(field, e.target.value);
        }
    };

    const addVehicle = () => {
        setData("vehicles", [...(data.vehicles || []), {}]);
    };

    const removeVehicle = (vehicleIndex) => {
        const updated = [...(data.vehicles || [])];
        updated.splice(vehicleIndex, 1);
        setData("vehicles", updated);
        toast.warning("Vehicle removed.", {
            duration: 2000,
        });
    };

    const allColumns = [
        { key: "id", label: "Vehicle ID" },
        { key: "name", label: "Owner Name" },
        { key: "vehicle_type", label: "Vehicle Type" },
        { key: "vehicle_class", label: "Class" },
        { key: "usage_status", label: "Usage" },
        { key: "is_registered", label: "Is Registered?" },
        { key: "purok_number", label: "Purok Number" },
        { key: "actions", label: "Actions" },
    ];

    const [visibleColumns, setVisibleColumns] = useState(
        allColumns.map((col) => col.key),
    );
    const [isPaginated, setIsPaginated] = useState(true);
    const [showAll, setShowAll] = useState(false);

    // check if filters are active
    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            ["purok", "v_type", "v_class", "usage"].includes(key) &&
            value &&
            value !== "",
    );

    const [showFilters, setShowFilters] = useState(hasActiveFilter);

    useEffect(() => {
        setShowFilters(hasActiveFilter);
    }, [hasActiveFilter]);

    const toggleShowFilters = () => setShowFilters((prev) => !prev);

    const columnRenderers = {
        id: (row) => row.vehicles?.[0]?.id ?? "—",

        name: (row) => (
            <span>
                {row.firstname} {row.middlename ?? ""} {row.lastname}{" "}
                {row.suffix ?? ""}
            </span>
        ),

        vehicle_type: (row) => (
            <span className="capitalize">
                {row.vehicles?.[0]?.vehicle_type ?? "—"}
            </span>
        ),

        vehicle_class: (row) =>
            row.vehicles?.[0]
                ? VEHICLE_CLASS_TEXT[row.vehicles[0].vehicle_class]
                : "—",

        usage_status: (row) => {
            const vehicle = row.vehicles?.[0];
            if (!vehicle) return "—";

            const statusLabel = VEHICLE_USAGE_TEXT[vehicle.usage_status];
            return (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        VEHICLE_USAGE_STYLES[vehicle.usage_status]
                    }`}
                >
                    {statusLabel}
                </span>
            );
        },

        is_registered: (row) => {
            const isRegistered = row.vehicles?.[0]?.is_registered;
            if (isRegistered === undefined) return "—";

            return isRegistered ? (
                <span className="text-green-600 font-medium">Yes</span>
            ) : (
                <span className="text-gray-500 font-medium">No</span>
            );
        },

        purok_number: (row) => row.purok_number,

        actions: (row) => {
            const vehicleId = row.vehicles?.[0]?.id;
            if (!vehicleId) return null;

            return (
                <ActionMenu
                    actions={[
                        {
                            label: "Edit",
                            icon: (
                                <SquarePen className="w-4 h-4 text-green-500" />
                            ),
                            onClick: () => handleEdit(vehicleId),
                        },
                        {
                            label: "Delete",
                            icon: <Trash2 className="w-4 h-4 text-red-600" />,
                            onClick: () => handleDeleteClick(vehicleId),
                        },
                    ]}
                />
            );
        },
    };

    const handleAddVehicle = () => {
        setModalState("add");
        setIsModalOpen(true);
    };

    const residentsList = residents.map((res) => ({
        label: `${res.firstname} ${res.middlename} ${res.lastname} ${
            res.suffix ?? ""
        }`,
        value: res.id.toString(),
    }));

    const onStoreSubmit = (e) => {
        e.preventDefault();
        post(route("vehicle.store"), {
            onError: (error) => console.log(error),
        });
    };

    const onUpdateSubmit = (e) => {
        e.preventDefault();
        post(route("vehicle.update", data.vehicle_id), {
            onError: (error) => console.log(error),
        });
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalState(null);
        setVehicleDetails(null);
        reset();
        clearErrors();
    };

    const handleEdit = async (id) => {
        setModalState("add");
        try {
            const response = await axios.get(
                `${APP_URL}/vehicle/details/${id}`,
            );
            const vehicle = response.data.vehicle;
            setVehicleDetails(vehicle);
            setData({
                resident_id: vehicle.resident.id,
                resident_name: `${vehicle.resident.firstname} ${
                    vehicle.resident.middlename ?? ""
                } ${vehicle.resident.lastname}`,
                resident_image: vehicle.resident.image ?? null,
                birthdate: vehicle.resident.birthdate ?? null,
                purok_number: vehicle.resident.purok_number ?? null,
                vehicles: [
                    {
                        usage_status: vehicle.usage_status || "",
                        vehicle_class: vehicle.vehicle_class || "",
                        vehicle_status: vehicle.vehicle_status || "",
                        vehicle_type: vehicle.vehicle_type || "",
                        is_registered: vehicle.is_registered
                            ? vehicle.is_registered.toString()
                            : "",
                    },
                ],
                _method: "PUT",
                vehicle_id: vehicle.id,
            });
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching occupation details:", error);
        }
    };

    const handleDeleteClick = (id) => {
        setResidentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("vehicle.destroy", residentToDelete));
        setIsDeleteModalOpen(false);
    };

    useEffect(() => {
        if (success) {
            handleModalClose();
            toast.success(success, {
                description: "Operation successful!",
                duration: 3000,
                closeButton: true,
            });
        }
        props.success = null;
    }, [success]);

    useEffect(() => {
        if (error) {
            toast.error(error, {
                description: "Operation failed!",
                duration: 3000,
                closeButton: true,
            });
        }
        props.error = null;
    }, [error]);

    return (
        <AdminLayout>
            <Head title="Vehicles" />
            <div>
                <Toaster richColors />
                <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
                <div className="p-2 md:p-4">
                    <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                            <PageHeader
                                title="Vehicle Records"
                                description="Manage and monitor vehicle information within the barangay including ownership details, classifications, transportation usage, and mobility data. Maintain accurate records to support public safety, emergency response coordination, traffic management, and community profiling."
                                icon={Car}
                                badge={
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                            Land and Transportation Office
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                            CDRRMO
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                            Traffic Management Unit
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                            Emergency Response Team
                                        </span>
                                    </div>
                                }
                                iconWrapperClassName="bg-blue-100 text-blue-600 shadow-sm"
                                containerClassName="border border-blue-100 bg-gradient-to-r from-white via-slate-50 to-blue-50/60 shadow-sm"
                                titleClassName="tracking-tight"
                                descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
                                actions={
                                    <div className="flex items-center gap-2">
                                        <div className="group relative z-50">
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 border-blue-300 bg-white text-blue-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                                                onClick={handleAddVehicle}
                                                type="button"
                                            >
                                                <ListPlus className="h-4 w-4" />
                                                Add Vehicle
                                            </Button>

                                            <div className="absolute left-1/2 z-10 mt-2 w-max -translate-x-1/2 rounded-md bg-blue-700 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                                                Register a new vehicle record
                                            </div>
                                        </div>
                                    </div>
                                }
                            />
                            <div className="flex flex-wrap items-start justify-between gap-2 w-full mb-0">
                                <div className="flex items-start gap-2 flex-wrap">
                                    <DynamicTableControls
                                        allColumns={allColumns}
                                        visibleColumns={visibleColumns}
                                        setVisibleColumns={setVisibleColumns}
                                        showFilters={showFilters}
                                        toggleShowFilters={toggleShowFilters}
                                    />
                                    <ExportButton
                                        url="report/export-vehicles-excel"
                                        queryParams={queryParams}
                                        label="Export Vehicles as XLSX"
                                    />
                                    <ExportButton
                                        url="report/export-vehicle-pdf"
                                        queryParams={queryParams}
                                        label="Export Households as PDF"
                                        type="pdf"
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                    {/* Search form */}
                                    <form
                                        onSubmit={handleSearchSubmit}
                                        className="flex w-[300px] max-w-lg items-center space-x-1"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Search Owners Name"
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                onKeyPressed("name", e)
                                            }
                                            className="w-full"
                                        />
                                        <div className="relative group z-50">
                                            <Button
                                                type="submit"
                                                className="border active:bg-blue-900 border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center gap-2 bg-transparent"
                                                variant="outline"
                                            >
                                                <Search />
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            {/* Filters */}
                            {showFilters && (
                                <FilterToggle
                                    queryParams={queryParams}
                                    searchFieldName={searchFieldName}
                                    visibleFilters={[
                                        "purok",
                                        "v_type",
                                        "v_class",
                                        "usage",
                                    ]}
                                    vehicle_types={vehicle_types}
                                    puroks={puroks}
                                    showFilters={true}
                                    clearRouteName="vehicle.index"
                                    clearRouteParams={{}}
                                />
                            )}
                            {/* Table */}
                            <DynamicTable
                                passedData={vehicles}
                                allColumns={allColumns}
                                columnRenderers={columnRenderers}
                                queryParams={queryParams}
                                visibleColumns={visibleColumns}
                                showTotal={true}
                            />
                            {/* Sidebar Modal */}
                            <SidebarModal
                                isOpen={isModalOpen}
                                onClose={handleModalClose}
                                title={
                                    vehicleDetails
                                        ? "Edit Vehicle Details"
                                        : "Add Vehicles"
                                }
                            >
                                {modalState === "add" && (
                                    <div className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg text-sm text-black p-4 space-y-4">
                                        <VehicleForm
                                            data={data}
                                            errors={errors}
                                            vehicleDetails={vehicleDetails}
                                            residentsList={residentsList}
                                            handleResidentChange={
                                                handleResidentChange
                                            }
                                            handleArrayValues={
                                                handleArrayValues
                                            }
                                            addVehicle={addVehicle}
                                            removeVehicle={removeVehicle}
                                            reset={reset}
                                            onSubmit={
                                                vehicleDetails
                                                    ? onUpdateSubmit
                                                    : onStoreSubmit
                                            }
                                        />
                                    </div>
                                )}
                            </SidebarModal>
                            {/* Delete Modal */}
                            <DeleteConfirmationModal
                                isOpen={isDeleteModalOpen}
                                onClose={() => {
                                    setIsDeleteModalOpen(false);
                                }}
                                onConfirm={confirmDelete}
                                residentId={residentToDelete}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
