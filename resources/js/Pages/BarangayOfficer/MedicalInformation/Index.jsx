import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    SquarePen,
    Trash2,
    SquarePlus,
    MoveRight,
    RotateCcw,
    Eye,
    ListPlus,
    Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { Toaster, toast } from "sonner";
import DynamicTable from "@/Components/DynamicTable";
import ActionMenu from "@/Components/ActionMenu";
import {
    BMI_STATUS,
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
import ExportButton from "@/Components/ExportButton";
import PageHeader from "@/Components/PageHeader";

export default function Index({ medical_information, puroks, queryParams }) {
    const breadcrumbs = [
        { label: "Residents Information", showOnMobile: false },
        { label: "Medical Information", showOnMobile: true },
    ];
    queryParams = queryParams || {};
    const APP_URL = useAppUrl();
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); //delete
    const [residentToDelete, setResidentToDelete] = useState(null); //delete

    const [query, setQuery] = useState(queryParams["name"] ?? "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);

    // const { data, setData, post, errors, reset, clearErrors } = useForm({
    //     // Resident-level fields
    //     resident_id: null,
    //     resident_name: "", // (optional: if you want full name)
    //     resident_image: null,
    //     birthdate: null,
    //     civil_status: "",
    //     purok_number: null,

    //     // Medical information fields
    //     weight_kg: "",
    //     height_cm: "",
    //     bmi: "",
    //     nutrition_status: "",
    //     blood_type: "",
    //     emergency_contact_number: "",
    //     emergency_contact_name: "",
    //     emergency_contact_relationship: "",
    //     is_smoker: false,
    //     is_alcohol_user: false,
    //     has_philhealth: false,
    //     philhealth_id_number: "",
    //     pwd_id_number: "",

    //     _method: undefined,
    // });

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
        router.get(route("medical.index", queryParams));
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
        { key: "weight_kg", label: "Weight (kg)" },
        { key: "height_cm", label: "Height (cm)" },
        { key: "sex", label: "Sex" },
        { key: "nutrition_status", label: "Nutritional Status" },
        { key: "blood_type", label: "Blood Type" },
        { key: "emergency_contact_number", label: "Emergency Contact Number" },
        { key: "is_smoker", label: "Smoker?" },
        { key: "is_alcohol_user", label: "Alcohol User?" },
        { key: "philhealth_id_number", label: "PhilHealth ID" },
        { key: "is_pwd", label: "Is PWD?" },
        { key: "purok_number", label: "Purok Number" },
        { key: "actions", label: "Actions" },
    ];

    const [visibleColumns, setVisibleColumns] = useState(
        allColumns.map((col) => col.key),
    );
    const [isPaginated, setIsPaginated] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            [
                "purok",
                "sex",
                "nutritional_status",
                "blood_type",
                "is_smoker",
                "alcohol_user",
                "has_philhealth",
                "is_pwd",
            ].includes(key) &&
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
        id: (row) => row.id,

        name: (row) => {
            const r = row.resident ?? {};
            return (
                <span>
                    {r.firstname} {r.middlename ?? ""} {r.lastname}{" "}
                    {r.suffix ?? ""}
                </span>
            );
        },

        weight_kg: (row) => row.weight_kg ?? "—",
        height_cm: (row) => row.height_cm ?? "—",
        sex: (row) => {
            const genderKey = row.resident.sex;
            const label = RESIDENT_GENDER_TEXT2[genderKey] ?? "Unknown";
            const className =
                RESIDENT_GENDER_COLOR_CLASS[genderKey] ?? "bg-gray-300";

            return (
                <span
                    className={`py-1 px-2 rounded-xl text-sm font-medium whitespace-nowrap ${className}`}
                >
                    {label}
                </span>
            );
        },
        nutrition_status: (row) => {
            const status = row.nutrition_status;
            const statusText = BMI_STATUS[status] ?? "—";
            let colorClass = "";
            switch (status) {
                case "normal":
                    colorClass = "bg-green-100 text-green-800 p-1 rounded";
                    break;
                case "underweight":
                case "severly_underweight":
                    colorClass = "bg-yellow-100 text-yellow-800 p-1 rounded";
                    break;
                case "overweight":
                    colorClass = "bg-orange-100 text-orange-800 p-1 rounded";
                    break;
                case "obese":
                    colorClass = "bg-red-100 text-red-800 p-1 rounded";
                    break;
                default:
                    colorClass = "bg-gray-100 text-gray-800 p-1 rounded";
            }
            return <span className={colorClass}>{statusText}</span>;
        },

        blood_type: (row) => row.blood_type ?? "—",
        emergency_contact_number: (row) => row.emergency_contact_number ?? "—",

        is_pwd: (row) => {
            const isPwd = (row.resident?.disabilities?.length ?? 0) > 0;
            const colorClass = isPwd
                ? "bg-green-100 text-green-800 px-2 py-1 rounded"
                : "bg-gray-100 text-gray-800 px-2 py-1 rounded";
            return <span className={colorClass}>{isPwd ? "Yes" : "No"}</span>;
        },

        is_smoker: (row) =>
            row.is_smoker ? (
                <span className="text-red-500">Yes</span>
            ) : (
                <span className="text-gray-500">No</span>
            ),

        is_alcohol_user: (row) =>
            row.is_alcohol_user ? (
                <span className="text-red-500">Yes</span>
            ) : (
                <span className="text-gray-500">No</span>
            ),
        philhealth_id_number: (row) => row.philhealth_id_number ?? "—",
        purok_number: (row) => row.resident?.purok_number ?? "—",

        actions: (medical) => (
            <ActionMenu
                actions={[
                    {
                        label: "View",
                        icon: <Eye className="w-4 h-4 text-indigo-600" />,
                        onClick: () => handleView(medical.resident.id),
                    },
                    {
                        label: "Edit",
                        icon: <SquarePen className="w-4 h-4 text-green-500" />,
                        onClick: () => {
                            router.get(route("medical.edit", medical.id));
                        },
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4 text-red-600" />,
                        onClick: () => handleDeleteClick(medical.id),
                    },
                ]}
            />
        ),
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedResident(null);
    };

    const handleDeleteClick = (id) => {
        setResidentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("medical.destroy", residentToDelete));
        setIsDeleteModalOpen(false);
    };

    const handleView = async (resident) => {
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
            <Head title="Medical Information" />
            <div>
                <Toaster richColors />
                <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
                {/* <pre>{JSON.stringify(medical_information, undefined, 2)}</pre> */}
                <div className="p-2 md:p-4">
                    <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                            <PageHeader
                                title="Medical Information"
                                description="Manage and monitor resident medical information across the barangays of the City of Ilagan, Isabela including health profiles, nutrition status, blood type, vital measurements, medical conditions, and emergency contact details. Maintain accurate healthcare records to support emergency response, public health programs, welfare assessment, and community medical profiling."
                                icon={Stethoscope}
                                badge={
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                            City Health Office
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                            Barangay Health Workers
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                            Emergency Response
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                            Medical Profiling
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                                            City of Ilagan, Isabela
                                        </span>
                                    </div>
                                }
                                iconWrapperClassName="bg-blue-100 text-blue-600 shadow-sm"
                                containerClassName="border border-blue-100 bg-gradient-to-r from-white via-slate-50 to-blue-50/60 shadow-sm"
                                titleClassName="tracking-tight"
                                descriptionClassName="max-w-4xl text-sm leading-6 text-slate-600"
                                actions={
                                    <div className="flex items-center gap-2">
                                        <Link href={route("medical.create")}>
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 border-blue-300 bg-white text-blue-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                                                type="button"
                                            >
                                                <ListPlus className="h-4 w-4" />
                                                Add Medical Record
                                            </Button>
                                        </Link>
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
                                        toggleShowFilters={() =>
                                            setShowFilters((prev) => !prev)
                                        }
                                    />
                                    <ExportButton
                                        url="report/export-medical-excel"
                                        queryParams={queryParams}
                                        label="Export Summon Records as XLSX"
                                    />
                                    <ExportButton
                                        url="report/export-medical-pdf"
                                        queryParams={queryParams}
                                        label="Export Education Histories as PDF"
                                        type="pdf"
                                        totalRecords={medical_information.total}
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                    <form
                                        onSubmit={handleSearchSubmit}
                                        className="flex w-[300px] max-w-lg items-center space-x-1"
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
                                        <div className="relative group z-50">
                                            <Link
                                                href={route("medical.create")}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white"
                                                    type={"button"}
                                                >
                                                    <ListPlus />
                                                </Button>
                                                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 rounded-md bg-blue-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                                    Add Medical Information
                                                </div>
                                            </Link>
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
                                        "nutritional_status",
                                        "blood_type",
                                        "is_smoker",
                                        "alcohol_user",
                                        "has_philhealth",
                                        "is_pwd",
                                    ]}
                                    puroks={puroks}
                                    showFilters={true}
                                    clearRouteName="medical.index"
                                    clearRouteParams={{}}
                                />
                            )}
                            <DynamicTable
                                passedData={medical_information}
                                allColumns={allColumns}
                                columnRenderers={columnRenderers}
                                queryParams={queryParams}
                                visibleColumns={visibleColumns}
                                showTotal={true}
                            />
                        </div>
                    </div>
                </div>
                <SidebarModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Resident Details"
                >
                    {selectedResident && (
                        <PersonDetailContent person={selectedResident} />
                    )}
                </SidebarModal>
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                    }}
                    onConfirm={confirmDelete}
                    residentId={residentToDelete}
                />
            </div>
        </AdminLayout>
    );
}
