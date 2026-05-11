import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Home,
    Eye,
    Search,
    UserRoundPlus,
    HousePlus,
    SquarePen,
    Trash2,
    Network,
    User,
    FileUser,
    MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import { Toaster, toast } from "sonner";
import ResidentTable from "@/Components/ResidentTable";
import DynamicTable from "@/Components/DynamicTable";
import ActionMenu from "@/Components/ActionMenu";
import * as CONSTANTS from "@/constants";

import FilterToggle from "@/Components/FilterButtons/FillterToggle";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import ExportButton from "@/Components/ExportButton";
import SidebarModal from "@/Components/SidebarModal";
import PersonDetailContent from "@/Components/SidebarModalContents/PersonDetailContent";
import { toTitleCase } from "@/utils/stringFormat";
import PageHeader from "@/Components/PageHeader";

export default function Index({ households, puroks, queryParams }) {
    const breadcrumbs = [
        { label: "Residents Information", showOnMobile: false },
        { label: "Households", showOnMobile: true },
    ];
    queryParams = queryParams || {};
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;

    const [query, setQuery] = useState(queryParams["name"] ?? "");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); //delete
    const [houseToDelete, setHouseToDelete] = useState(null); //delete

    const handleSubmit = (e) => {
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
        router.get(route("household.index", queryParams));
    };

    const onKeyPressed = (field, e) => {
        if (e.key === "Enter") {
            searchFieldName(field, e.target.value);
        } else {
            return;
        }
    };

    const allColumns = [
        { key: "household_info", label: "Household" },
        { key: "name", label: "Household Head" },
        { key: "status_info", label: "Ownership & Condition" },
        { key: "structure_info", label: "Structure Details" },
        { key: "household_count", label: "Occupants / Families" },
        { key: "actions", label: "Actions" },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);

    // Use useCallback for event handlers to prevent unnecessary re-renders of child components
    const handleView = async (residentId) => {
        try {
            // Using template literals for route if APP_URL is needed, or just route() helper
            const response = await axios.get(
                route("resident.showresident", residentId), // Assuming you have a route 'resident.showresident'
            );
            setSelectedResident(response.data.resident);
        } catch (error) {
            console.error("Error fetching resident details:", error);
            toast.error("Failed to load resident details.", {
                description: error.message,
            });
        }
        setIsModalOpen(true);
    };

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
            ["purok", "street", "own_type", "condition", "structure"].includes(
                key,
            ) &&
            value &&
            value !== "",
    );
    const calculateAge = useMemo(
        () => (birthdate) => {
            if (!birthdate) return "Unknown";
            const birth = new Date(birthdate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        },
        [],
    );

    useEffect(() => {
        if (hasActiveFilter) {
            setShowFilters(true);
        }
    }, [hasActiveFilter]);

    const [showFilters, setShowFilters] = useState(hasActiveFilter);
    const columnRenderers = {
        household_info: (entry) => {
            const household = entry;

            return (
                <div className="flex flex-col gap-1 min-w-[180px]">
                    <Link
                        href={route("household.show", household.id)}
                        className="font-semibold text-slate-800 hover:text-blue-600 hover:underline"
                    >
                        House #{household.house_number ?? "N/A"}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                            ID: {household.id}
                        </span>

                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            Purok {household.purok?.purok_number ?? "N/A"}
                        </span>
                    </div>
                </div>
            );
        },

        name: (entry) => {
            const head = entry.household_residents?.[0]?.resident;

            if (!head) {
                return (
                    <span className="text-gray-400 italic">
                        No household head
                    </span>
                );
            }

            const fullName = toTitleCase(
                `${head.firstname} ${head.middlename ?? ""} ${head.lastname ?? ""} ${head.suffix ?? ""}`,
            );

            return (
                <div className="flex flex-col gap-1 min-w-[220px]">
                    <button
                        type="button"
                        onClick={() => handleView(head.id)}
                        className="text-left font-semibold text-slate-800 hover:text-blue-600 hover:underline"
                    >
                        {fullName}
                    </button>
                </div>
            );
        },

        status_info: (entry) => {
            const household = entry;

            const ownershipText =
                CONSTANTS.HOUSEHOLD_OWNERSHIP_TEXT[household.ownership_type] ??
                "Unknown";

            const conditionText =
                CONSTANTS.HOUSEHOLD_CONDITION_TEXT[
                    household.housing_condition
                ] ?? "Unknown";

            const conditionColor =
                CONSTANTS.HOUSING_CONDITION_COLOR[
                    household.housing_condition
                ] ?? "bg-gray-100 text-gray-500";

            return (
                <div className="flex flex-col gap-2 min-w-[200px]">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            Ownership
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                            {ownershipText}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                            Condition
                        </p>
                        <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${conditionColor}`}
                        >
                            {conditionText}
                        </span>
                    </div>
                </div>
            );
        },

        structure_info: (entry) => {
            const household = entry;

            const structureText =
                CONSTANTS.HOUSEHOLD_STRUCTURE_TEXT[household.house_structure] ??
                "Unknown";

            return (
                <div className="grid gap-2 min-w-[220px]">
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-xs text-slate-500">
                            Structure
                        </span>
                        <span className="text-sm font-medium text-slate-800 text-right">
                            {structureText}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                        <span className="text-xs text-slate-500">
                            Year Built
                        </span>
                        <span className="text-sm font-medium text-slate-800">
                            {household.year_established ?? "N/A"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
                            <p className="text-xs text-blue-600">Rooms</p>
                            <p className="text-sm font-semibold text-blue-800">
                                {household.number_of_rooms ?? 0}
                            </p>
                        </div>

                        <div className="rounded-lg bg-indigo-50 px-3 py-2 text-center">
                            <p className="text-xs text-indigo-600">Floors</p>
                            <p className="text-sm font-semibold text-indigo-800">
                                {household.number_of_floors ?? 0}
                            </p>
                        </div>
                    </div>
                </div>
            );
        },

        household_count: (entry) => {
            const household = entry;

            return (
                <div className="flex flex-col gap-2 min-w-[160px]">
                    <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                        <span className="text-xs font-medium text-green-700">
                            Occupants
                        </span>
                        <span className="text-sm font-semibold text-green-800">
                            {household.residents_count ?? 0}
                        </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                        <span className="text-xs font-medium text-amber-700">
                            Families
                        </span>
                        <span className="text-sm font-semibold text-amber-800">
                            {household.families_count ?? 0}
                        </span>
                    </div>
                </div>
            );
        },

        actions: (entry) => (
            <ActionMenu
                actions={[
                    {
                        label: "View",
                        icon: <Eye className="w-4 h-4 text-indigo-600" />,
                        onClick: () =>
                            router.visit(route("household.show", entry.id)),
                    },
                    {
                        label: "Edit",
                        icon: <SquarePen className="w-4 h-4 text-green-500" />,
                        onClick: () =>
                            router.visit(route("household.edit", entry.id)),
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4 text-red-600" />,
                        onClick: () => handleDeleteClick(entry.id),
                    },
                ]}
            />
        ),
    };

    const handleDeleteClick = (id) => {
        setHouseToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("household.destroy", houseToDelete));
        setIsDeleteModalOpen(false);
    };

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
            <Head title="Households Dashboard" />
            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
            <Toaster richColors />
            {/* <pre>{JSON.stringify(households, undefined, 2)}</pre> */}
            <div className="pt-4">
                <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                        <PageHeader
                            title="Household Records"
                            description="Manage and monitor all registered households within the barangays of the City of Ilagan, Isabela. Maintain accurate residential information, household composition, geolocation data, and socio-economic profiles to support governance, disaster preparedness, resource allocation, and community development initiatives."
                            icon={Home}
                            badge={
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                                        Household Registry
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                        Barangay / City Registry
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                        CDRRMO
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                        Community Profiling
                                    </span>
                                </div>
                            }
                            iconWrapperClassName="bg-indigo-100 text-indigo-600 shadow-sm"
                            containerClassName="border border-indigo-100 bg-gradient-to-r from-white via-slate-50 to-indigo-50/60 shadow-sm"
                            titleClassName="tracking-tight"
                            descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
                            actions={
                                <div className="flex items-center gap-2">
                                    <Link href={route("household.create")}>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-300 bg-white text-blue-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                                        >
                                            <HousePlus className="h-4 w-4" />

                                            <span className="hidden sm:inline">
                                                Add Household
                                            </span>
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
                                    url="report/export-household-excel"
                                    queryParams={queryParams}
                                    label="Export Households as XLSX"
                                />
                                <ExportButton
                                    url="report/export-household-pdf"
                                    queryParams={queryParams}
                                    label="Export Households as PDF"
                                    type="pdf"
                                    totalRecords={households.total}
                                />
                                <ExportButton
                                    url="report/export-householdmembers-excel"
                                    queryParams={queryParams}
                                    icon={<FileUser />}
                                    label="Export Household Members as XLSX"
                                />
                                <ExportButton
                                    url="report/export-householdmembers-pdf"
                                    queryParams={queryParams}
                                    label="Export Households as PDF"
                                    type="pdf"
                                    totalRecords={households.total} // disables if total > 500
                                />
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex w-[300px] max-w-lg items-center space-x-1"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Search for Household Name"
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
                                    "own_type",
                                    "condition",
                                    "structure",
                                ]}
                                showFilters={true}
                                puroks={puroks}
                                clearRouteName="household.index"
                                clearRouteParams={{}}
                            />
                        )}
                        <DynamicTable
                            passedData={households}
                            allColumns={allColumns}
                            columnRenderers={columnRenderers}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            showTotal={true}
                        />
                        <DeleteConfirmationModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => {
                                setIsDeleteModalOpen(false);
                            }}
                            onConfirm={confirmDelete}
                            residentId={houseToDelete}
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
