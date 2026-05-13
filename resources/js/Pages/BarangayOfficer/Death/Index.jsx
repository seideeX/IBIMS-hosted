import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    SquarePen,
    Trash2,
    SquarePlus,
    Eye,
    Cross,
    MoveRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { Toaster, toast } from "sonner";
import DynamicTable from "@/Components/DynamicTable";
import ActionMenu from "@/Components/ActionMenu";
import {
    RESIDENT_GENDER_COLOR_CLASS,
    RESIDENT_GENDER_TEXT2,
} from "@/constants";
import SidebarModal from "@/Components/SidebarModal";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import FilterToggle from "@/Components/FilterButtons/FillterToggle";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import PersonDetailContent from "@/Components/SidebarModalContents/PersonDetailContent";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import useResidentChangeHandler from "@/hooks/handleResidentChange";
import DropdownInputField from "@/Components/DropdownInputField";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import InputField from "@/Components/InputField";
import DeathDetailsSidebarModal from "./Partials/DeathDetailsSidebarModal";
import PageHeader from "@/Components/PageHeader";

export default function Index({ deaths, puroks, queryParams, residents }) {
    const breadcrumbs = [
        { label: "Resident Information", showOnMobile: false },
        { label: "Deaths", showOnMobile: true },
    ];
    queryParams = queryParams || {};
    const APP_URL = useAppUrl();
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); //delete
    const [recordToDelete, setRecordToDelete] = useState(null); //delete
    const [deathDetails, setDeathDetails] = useState(null); //delete

    const [query, setQuery] = useState(queryParams["name"] ?? "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalState, setModalState] = useState("");
    const [selectedResident, setSelectedResident] = useState(null);

    const calculateAgeAtDeath = (birthdate, dateOfDeath) => {
        if (!birthdate || !dateOfDeath) return "Unknown";

        const birth = new Date(birthdate);
        const death = new Date(dateOfDeath);

        let age = death.getFullYear() - birth.getFullYear();
        const m = death.getMonth() - birth.getMonth();

        if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) {
            age--;
        }

        return age;
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
        router.get(route("death.index", queryParams));
    };
    const onKeyPressed = (field, e) => {
        if (e.key === "Enter") {
            searchFieldName(field, e.target.value);
        } else {
            return;
        }
    };

    const allColumns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Resident Name" },
        { key: "sex", label: "Sex" },
        { key: "age", label: "Age of Death" },
        { key: "birthdate", label: "Date of Birth" },
        { key: "date_of_death", label: "Date of Death" },
        { key: "cause_of_death", label: "Cause of Death" },
        { key: "burial_place", label: "Burial Place" },
        { key: "purok_number", label: "Purok Number" },
        { key: "remarks", label: "Remarks" },
        { key: "actions", label: "Actions" },
    ];

    const residentsList = residents.map((res) => ({
        label: `${res.firstname} ${res.middlename} ${res.lastname} ${
            res.suffix ?? ""
        }`,
        value: res.id.toString(),
    }));
    const [visibleColumns, setVisibleColumns] = useState(
        allColumns.map((col) => col.key),
    );
    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            ["purok", "sex", "age_group", "date_of_death"].includes(key) &&
            value &&
            value !== "",
    );

    useEffect(() => {
        if (hasActiveFilter) {
            setShowFilters(true);
        }
    }, [hasActiveFilter]);

    const [showFilters, setShowFilters] = useState(hasActiveFilter);
    const columnRenderers = {
        id: (row) => (
            <span className="text-xs font-semibold text-gray-500">
                {row.id}
            </span>
        ),

        name: (row) => (
            <span className="font-medium text-gray-800">
                {row.resident?.firstname} {row.resident?.middlename ?? ""}{" "}
                {row.resident?.lastname}
                <span className="text-gray-500">
                    {" "}
                    {row.resident?.suffix ?? ""}
                </span>
            </span>
        ),

        sex: (row) => {
            const genderKey = row?.resident?.sex;
            const label =
                RESIDENT_GENDER_TEXT2?.[genderKey] ?? genderKey ?? "Unknown";
            const className =
                RESIDENT_GENDER_COLOR_CLASS?.[genderKey] ??
                "bg-gray-100 text-gray-800";

            return (
                <span
                    className={`py-1 px-3 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap ${className}`}
                >
                    {label}
                </span>
            );
        },

        birthdate: (row) =>
            row.resident?.birthdate ? (
                <span className="text-gray-700 text-sm">
                    {new Date(row.resident.birthdate).toLocaleDateString()}
                </span>
            ) : (
                <span className="italic text-gray-400">—</span>
            ),

        age: (row) => {
            const age = calculateAgeAtDeath(
                row.resident?.birthdate,
                row.date_of_death,
            );

            if (age === null)
                return <span className="italic text-gray-400">Unknown</span>;

            return (
                <div className="flex flex-col text-sm">
                    <span className="font-bold text-indigo-700">{age} yrs</span>
                    {age > 60 && (
                        <span className="text-xs text-rose-500 font-semibold mt-0.5">
                            Senior Citizen
                        </span>
                    )}
                </div>
            );
        },

        date_of_death: (row) =>
            row.date_of_death ? (
                <span className="text-red-600 font-medium">
                    {new Date(row.date_of_death).toLocaleDateString()}
                </span>
            ) : (
                <span className="italic text-gray-400">—</span>
            ),

        purok_number: (row) => (
            <span className="text-gray-700 font-medium">
                {row.resident?.purok_number ?? "—"}
            </span>
        ),

        // ✅ Added renderers for deceased info
        cause_of_death: (row) =>
            row.cause_of_death ? (
                <span className="text-gray-700">{row.cause_of_death}</span>
            ) : (
                <span className="italic text-gray-400">—</span>
            ),

        burial_place: (row) =>
            row.burial_place ? (
                <span className="text-gray-700">{row.burial_place}</span>
            ) : (
                <span className="italic text-gray-400">—</span>
            ),

        remarks: (row) =>
            row.remarks ? (
                <span className="text-gray-700">{row.remarks}</span>
            ) : (
                <span className="italic text-gray-400">—</span>
            ),

        actions: (record) => (
            <ActionMenu
                actions={[
                    {
                        label: "View",
                        icon: <Eye className="w-4 h-4 text-indigo-600" />,
                        onClick: () => handleView(record.id),
                    },
                    {
                        label: "Edit",
                        icon: <SquarePen className="w-4 h-4 text-green-500" />,
                        onClick: () => handleEdit(record.resident_id),
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4 text-red-600" />,
                        onClick: () => handleDeleteClick(record.resident_id),
                    },
                ]}
            />
        ),
    };

    // add
    const { data, setData, post, errors, reset, clearErrors } = useForm({
        resident_id: null,
        resident_name: "",
        resident_image: null,
        birthdate: null,
        purok_number: null,

        // Deceased details
        date_of_death: new Date().toISOString().split("T")[0], // default today
        cause_of_death: "",
        place_of_death: "",
        burial_place: "",
        burial_date: null,
        death_certificate_number: "",
        remarks: "",

        death_id: null, // for update/edit reference
        _method: undefined,
    });
    const handleResidentChange = useResidentChangeHandler(residents, setData);
    const handleAddDeath = () => {
        setModalState("add");
        setIsModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        post(route("death.store"), {
            onError: (errors) => {
                // console.error("Validation Errors:", errors);
                const errorList = Object.values(errors).map(
                    (msg, i) => `<div key=${i}> ${msg}</div>`,
                );

                toast.error("Validation Error", {
                    description: (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: errorList.join(""),
                            }}
                        />
                    ),
                    duration: 4000,
                    closeButton: true,
                });
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        post(route("death.update", data.resident_id), {
            onError: () => {
                // console.error("Validation Errors:", errors);
                const errorList = Object.values(errors).map(
                    (msg, i) => `<div key=${i}> ${msg}</div>`,
                );

                toast.error("Validation Error", {
                    description: (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: errorList.join(""),
                            }}
                        />
                    ),
                    duration: 4000,
                    closeButton: true,
                });
            },
        });
    };

    const handleModalClose = () => {
        setModalState(null);
        setIsModalOpen(false);
        setSelectedResident(null);
        setDeathDetails(null);
        reset();
        clearErrors();
    };

    const handleEdit = async (id) => {
        setModalState("add");
        setDeathDetails(null);
        try {
            const response = await axios.get(`${APP_URL}/death/details/${id}`);
            const details = response.data.details;

            setDeathDetails(details);

            setData("resident_id", details.id);
            setData(
                "resident_name",
                `${details.firstname} ${details.middlename ?? ""} ${
                    details.lastname
                } ${details.suffix ?? ""}`.replace(/\s+/g, " "),
            );
            setData("purok_number", details.purok_number);
            setData("birthdate", details.birthdate);
            setData("resident_image", details.resident_picture_path);

            // ✅ deceased fields
            setData("date_of_death", details.date_of_death);
            setData("death_id", details.death_id);
            setData("cause_of_death", details.cause_of_death ?? "");
            setData("place_of_death", details.place_of_death ?? "");
            setData("burial_place", details.burial_place ?? "");
            setData("burial_date", details.burial_date ?? "");
            setData(
                "death_certificate_number",
                details.death_certificate_number ?? "",
            );
            setData("remarks", details.remarks ?? "");

            setData("_method", "PUT");
        } catch (error) {
            console.error("Error fetching placeholders:", error);

            let title = "Error";
            let description = "Something went wrong. Please try again.";

            if (
                error.response?.status === 422 &&
                error.response?.data?.errors
            ) {
                title = "Validation Error";

                const errorList = Object.values(
                    error.response.data.errors,
                ).flat();
                description = (
                    <ul className="list-disc ml-5">
                        {errorList.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                );
            }

            toast.error(title, {
                description,
                duration: 4000,
                closeButton: true,
            });
        } finally {
            setIsModalOpen(true);
        }
    };

    const handleDeleteClick = (id) => {
        setRecordToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("death.destroy", recordToDelete), {
            onError: (errors) => {
                //console.error("Validation Errors:", errors);
                const errorList = Object.values(errors).map(
                    (msg, i) => `<div key=${i}> ${msg}</div>`,
                );

                toast.error("Validation Error", {
                    description: (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: errorList.join(""),
                            }}
                        />
                    ),
                    duration: 4000,
                    closeButton: true,
                });
            },
        });
        setIsDeleteModalOpen(false);
    };

    const handleView = async (resident) => {
        setModalState("view");
        try {
            const response = await axios.get(
                `${APP_URL}/resident/showresident/${resident}`,
            );
            setSelectedResident(response.data.resident);
        } catch (error) {
            console.error("Error fetching placeholders:", error);
        }
        setIsModalOpen(true);
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
            <Head title="Resident Information" />
            <div>
                <Toaster richColors />
                <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
                {/* <pre>{JSON.stringify(deaths, undefined, 2)}</pre> */}
                <div className="p-2 md:p-4">
                    <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                            <PageHeader
                                title="Death Records"
                                description="Maintain and monitor resident death records across the barangays of the City of Ilagan, Isabela including cause of death, date of death, place of death, burial details, certificate information, and remarks. Keep accurate mortality records to support civil documentation, demographic reporting, public health monitoring, and barangay-level planning."
                                icon={Cross}
                                badge={
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                                            Civil Registry
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                                            Mortality Records
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                            Barangay Reports
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                            Public Health
                                        </span>
                                    </div>
                                }
                                iconWrapperClassName="bg-red-100 text-red-600 shadow-sm"
                                containerClassName="border border-red-100 bg-gradient-to-r from-white via-slate-50 to-red-50/60 shadow-sm"
                                titleClassName="tracking-tight"
                                descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
                                actions={
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-red-300 bg-white text-red-700 shadow-sm transition-all hover:bg-red-600 hover:text-white"
                                            onClick={handleAddDeath}
                                            type="button"
                                        >
                                            <SquarePlus className="h-4 w-4" />
                                            Add Death Record
                                        </Button>
                                    </div>
                                }
                            />

                            <div className="flex flex-wrap items-start justify-between gap-2 w-full mb-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <DynamicTableControls
                                        allColumns={allColumns}
                                        visibleColumns={visibleColumns}
                                        setVisibleColumns={setVisibleColumns}
                                        showFilters={showFilters}
                                        toggleShowFilters={() =>
                                            setShowFilters((prev) => !prev)
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                    <form
                                        onSubmit={handleSearchSubmit}
                                        className="flex w-[380px] max-w-lg items-center space-x-1"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Search Resident Name"
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                onKeyPressed(
                                                    "name",
                                                    e.target.value,
                                                )
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
                                            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 rounded-md bg-blue-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                Search
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            {showFilters && (
                                <FilterToggle
                                    queryParams={queryParams}
                                    searchFieldName={searchFieldName}
                                    visibleFilters={[
                                        "purok",
                                        "sex",
                                        "age_group",
                                        "date_of_death",
                                    ]}
                                    puroks={puroks}
                                    showFilters={true}
                                    clearRouteName="death.index"
                                    clearRouteParams={{}}
                                />
                            )}
                            <DynamicTable
                                passedData={deaths}
                                allColumns={allColumns}
                                columnRenderers={columnRenderers}
                                queryParams={queryParams}
                                visibleColumns={visibleColumns}
                                showTotal={true}
                            />
                        </div>
                    </div>
                </div>
                <DeathDetailsSidebarModal
                    isModalOpen={isModalOpen}
                    handleModalClose={handleModalClose}
                    modalState={modalState}
                    deathDetails={deathDetails}
                    data={data}
                    errors={errors}
                    residentsList={residentsList}
                    handleResidentChange={handleResidentChange}
                    handleEditSubmit={handleEditSubmit}
                    handleAddSubmit={handleAddSubmit}
                    setData={setData}
                    reset={reset}
                    selectedResident={selectedResident}
                />
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                    }}
                    onConfirm={confirmDelete}
                    residentId={recordToDelete}
                />
            </div>
        </AdminLayout>
    );
}
