import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Eye,
    Search,
    UserRoundPlus,
    HousePlus,
    SquarePen,
    Baby,
    Trash2,
    Network,
    User,
    ListPlus,
    FileUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { Toaster, toast } from "sonner";
import ResidentTable from "@/Components/ResidentTable";
import DynamicTable from "@/Components/DynamicTable";
import ActionMenu from "@/Components/ActionMenu";
import * as CONSTANTS from "@/constants";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import FilterToggle from "@/Components/FilterButtons/FillterToggle";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import SidebarModal from "@/Components/SidebarModal";
import PersonDetailContent from "@/Components/SidebarModalContents/PersonDetailContent";
import PageHeader from "@/Components/PageHeader";

export default function Index({ children, queryParams, puroks }) {
    const breadcrumbs = [
        { label: "Medical Information", showOnMobile: false },
        { label: "Child Health Monitoring Records", showOnMobile: true },
    ];
    queryParams = queryParams || {};
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;
    const APP_URL = useAppUrl();
    const [query, setQuery] = useState(queryParams["name"] ?? "");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); //delete
    const [recordToDelete, setRecordToDelete] = useState(null); //delete
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        searchFieldName("name", query);
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

    const searchFieldName = (field, value) => {
        if (value && value.trim() !== "") {
            queryParams[field] = value;
        } else {
            delete queryParams[field];
        }

        if (queryParams.page) {
            delete queryParams.page;
        }
        router.get(route("child_record.index", queryParams));
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
        { key: "resident_name", label: "Name" },
        { key: "birthdate", label: "Birthdate" },
        { key: "age", label: "Age (Years)" },
        { key: "age_months", label: "Age (Months)" },
        { key: "sex", label: "Sex" },
        { key: "nutrition_status", label: "Nutrition Status" },
        { key: "latest_vaccine", label: "Latest Vaccination" },
        { key: "purok_number", label: "Purok" },
        { key: "actions", label: "Actions" },
    ];

    const [visibleColumns, setVisibleColumns] = useState(
        allColumns.map((col) => col.key),
    );

    useEffect(() => {
        if (visibleColumns.length === 0) {
            setVisibleColumns(allColumns.map((col) => col.key));
        }
    }, []);

    const [isPaginated, setIsPaginated] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            ["purok", "sex", "birthdate", "nutritional_status"].includes(key) &&
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
        id: (child) => child.id,

        resident_name: (child) => {
            const r = child.resident;
            if (!r) return "—";
            return `${r.firstname ?? ""} ${r.middlename ?? ""} ${
                r.lastname ?? ""
            } ${r.suffix ?? ""}`.trim();
        },

        birthdate: (child) =>
            child.resident?.birthdate
                ? new Date(child.resident.birthdate).toLocaleDateString()
                : "—",

        age: (child) => {
            if (!child.resident?.birthdate) return "—";
            const birthdate = new Date(child.resident.birthdate);
            const today = new Date();
            let age = today.getFullYear() - birthdate.getFullYear();
            const monthDiff = today.getMonth() - birthdate.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthdate.getDate())
            ) {
                age--;
            }
            return `${age} yrs`;
        },

        age_months: (child) => {
            if (!child.resident?.birthdate) return "—";
            const birthdate = new Date(child.resident.birthdate);
            const today = new Date();
            const years = today.getFullYear() - birthdate.getFullYear();
            const months = today.getMonth() - birthdate.getMonth();
            const totalMonths =
                years * 12 +
                months -
                (today.getDate() < birthdate.getDate() ? 1 : 0);
            return `${totalMonths} mos`;
        },

        sex: (child) => {
            return (
                <span
                    className={`px-2 py-1 text-sm rounded-lg ${
                        CONSTANTS.RESIDENT_GENDER_COLOR_CLASS[
                            child.resident.sex
                        ] ?? "bg-gray-100 text-gray-700"
                    }`}
                >
                    {
                        CONSTANTS.RESIDENT_GENDER_TEXT2[
                            child.resident.sex.replace("_", " ")
                        ]
                    }
                </span>
            );
        },

        purok_number: (child) => child.resident?.purok_number ?? "—",

        nutrition_status: (child) => {
            const statusColors = {
                normal: "bg-green-100 text-green-700",
                underweight: "bg-yellow-100 text-yellow-700",
                severely_underweight: "bg-red-100 text-red-700",
                overweight: "bg-blue-100 text-blue-700",
                obese: "bg-purple-100 text-purple-700",
            };
            const status =
                child.resident?.medical_information?.nutrition_status;
            return (
                <span
                    className={`px-2 py-1 text-sm rounded-lg ${
                        statusColors[status] ?? "bg-gray-100 text-gray-700"
                    }`}
                >
                    {CONSTANTS.BMI_STATUS[status]}
                </span>
            );
        },

        latest_vaccine: (child) => {
            const vax = child.resident?.vaccinations;
            if (!vax || vax.length === 0) {
                return <span className="text-gray-500">No record</span>;
            }
            // Assuming array is sorted (latest last), otherwise sort by date
            const latest = vax.reduce((latest, current) =>
                new Date(current.vaccination_date) >
                new Date(latest.vaccination_date)
                    ? current
                    : latest,
            );
            return (
                <span className="text-sm text-indigo-600 font-medium">
                    {latest.vaccine} <br />
                    <span className="text-xs text-gray-500">
                        {new Date(latest.vaccination_date).toLocaleDateString()}
                    </span>
                </span>
            );
        },

        actions: (child) => (
            <ActionMenu
                actions={[
                    {
                        label: "View",
                        icon: <Eye className="w-4 h-4 text-indigo-600" />,
                        onClick: () => handleView(child.resident.id),
                    },
                    {
                        label: "Edit",
                        icon: <SquarePen className="w-4 h-4 text-green-500" />,
                        onClick: () => handleEdit(child.id),
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4 text-red-600" />,
                        onClick: () => handleDeleteClick(child.id),
                    },
                ]}
            />
        ),
    };

    // delete
    const handleDeleteClick = (id) => {
        setRecordToDelete(id);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        router.delete(route("child_record.destroy", recordToDelete));
        setIsDeleteModalOpen(false);
    };

    const handleEdit = (id) => {
        router.get(route("child_record.edit", id));
    };

    // feedback
    useEffect(() => {
        if (success) {
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
            <Head title="Medical Information - Child Health Records" />
            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
            <Toaster richColors />
            {/* <pre>{JSON.stringify(children, undefined, 2)}</pre> */}
            <div className="pt-4">
                <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                        <PageHeader
                            title="Child Health Records"
                            description="Track and manage child health information across the barangays of the City of Ilagan, Isabela including growth monitoring, nutrition status, immunization history, and healthcare-related records. Maintain accurate child health data to support public health programs, nutrition initiatives, early intervention, and community healthcare planning."
                            icon={Baby}
                            badge={
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                        City Health Office
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                        Nutrition Programs
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                        Immunization Monitoring
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                        Barangay Health Workers
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                                        City of Ilagan, Isabela
                                    </span>
                                </div>
                            }
                            iconWrapperClassName="bg-blue-100 text-blue-600 shadow-sm"
                            containerClassName="border border-blue-100 bg-gradient-to-r from-white via-slate-50 to-blue-50/60 shadow-sm"
                            titleClassName="tracking-tight"
                            descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
                            actions={
                                <div className="flex items-center gap-2">
                                    <Link href={route("child_record.create")}>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-300 bg-white text-blue-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                                        >
                                            <ListPlus className="h-4 w-4" />
                                            Add Record
                                        </Button>
                                    </Link>
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
                                    onSubmit={handleSubmit}
                                    className="flex w-[300px] max-w-lg items-center space-x-1"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Search for Resident"
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
                                    "birthdate",
                                    "nutritional_status",
                                ]}
                                showFilters={true}
                                puroks={puroks}
                                clearRouteName="child_record.index"
                                clearRouteParams={{}}
                            />
                        )}
                        <DynamicTable
                            passedData={children}
                            allColumns={allColumns}
                            columnRenderers={columnRenderers}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            showTotal={true}
                        ></DynamicTable>
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => {
                                setIsDeleteModalOpen(false);
                            }}
                            onConfirm={confirmDelete}
                            residentId={recordToDelete}
                        />
                        <SidebarModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Resident Details"
                        >
                            {selectedResident && (
                                <PersonDetailContent
                                    person={selectedResident}
                                />
                            )}
                        </SidebarModal>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
