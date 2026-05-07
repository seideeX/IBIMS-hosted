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
} from "lucide-react";
import { useEffect, useState } from "react";
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
import PageHeader from "@/Components/PageHeader";

export default function Service({
    households,
    puroks,
    queryParams,
    toiletTypes,
    electricityTypes,
    waterSourceTypes,
    wasteManagementTypes,
    internetTypes,
    bathTypes,
}) {
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
        router.get(route("household.overview", queryParams));
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
        { key: "house_number", label: "House Number" },
        { key: "bath_and_wash_area", label: "Bath & Wash Area" },
        { key: "toilets", label: "Toilet Type(s)" },
        { key: "electricity_types", label: "Electricity Source(s)" },
        { key: "water_source_types", label: "Water Source(s)" },
        { key: "waste_management_types", label: "Waste Management Type(s)" },
        { key: "livestocks_text", label: "Livestock Summary" },
        { key: "pets_text", label: "Pet Summary" },
        { key: "internet_accessibility", label: "Internet Accessibility" },
        { key: "purok", label: "Purok Number" },
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
            [
                "purok",
                "toilet",
                "electricity",
                "water",
                "waste",
                "internet",
                "bath",
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
        id: (house) => (
            <span className="text-gray-800 font-medium">
                {house.id ?? "Not specified"}
            </span>
        ),

        house_number: (house) => (
            <Link
                href={route("household.show", { household: house.id })}
                className="text-blue-600 hover:underline font-semibold"
            >
                {house.house_number ?? (
                    <span className="text-gray-400 font-normal italic">
                        Not specified
                    </span>
                )}
            </Link>
        ),

        bath_and_wash_area: (house) =>
            house.bath_and_wash_area ? (
                <span className="text-gray-800 capitalize font-medium">
                    {house.bath_and_wash_area}
                </span>
            ) : (
                <span className="text-gray-400 italic">Not specified</span>
            ),

        toilets: (house) => {
            const toilets = house.toilets ?? [];
            return toilets.length ? (
                <ul className="text-gray-800 space-y-0.5">
                    {toilets.map((t, index) => (
                        <li key={index} className="capitalize">
                            <span className="font-medium">
                                {t.toilet_type.replace(/_/g, " ")}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <span className="text-gray-400 italic">No toilet data</span>
            );
        },

        electricity_types: (house) => {
            const electricity = house.electricity_types ?? [];
            return electricity.length ? (
                <ul className="text-gray-800 space-y-0.5">
                    {electricity.map((e, index) => (
                        <li key={index} className="capitalize">
                            <span className="font-medium">
                                {e.electricity_type.replace(/_/g, " ")}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <span className="text-gray-400 italic">
                    No electricity data
                </span>
            );
        },

        water_source_types: (house) => {
            const water = house.water_source_types ?? [];
            return water.length ? (
                <ul className="text-gray-800 space-y-0.5">
                    {water.map((w, index) => (
                        <li key={index} className="capitalize">
                            <span className="font-medium">
                                {w.water_source_type.replace(/_/g, " ")}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <span className="text-gray-400 italic">
                    No water source data
                </span>
            );
        },

        waste_management_types: (house) => {
            const waste = house.waste_management_types ?? [];
            return waste.length ? (
                <ul className="text-gray-800 space-y-0.5">
                    {waste.map((w, index) => (
                        <li key={index} className="capitalize">
                            <span className="font-medium">
                                {w.waste_management_type.replace(/_/g, " ")}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <span className="text-gray-400 italic">No waste data</span>
            );
        },

        livestocks_text: (house) => {
            const livestocks = house.livestocks ?? [];
            if (livestocks.length === 0)
                return (
                    <span className="text-gray-400 italic">
                        No livestock recorded
                    </span>
                );

            const grouped = livestocks.reduce((acc, l) => {
                acc[l.livestock_type] =
                    (acc[l.livestock_type] ?? 0) + (l.quantity ?? 1);
                return acc;
            }, {});

            return (
                <ul className="space-y-0.5 text-gray-800">
                    {Object.entries(grouped).map(([type, qty]) => (
                        <li key={type}>
                            <span className="capitalize font-medium">
                                {type.replace(/_/g, " ")}:
                            </span>{" "}
                            <span className="text-gray-700 font-semibold">
                                {qty}
                            </span>
                        </li>
                    ))}
                </ul>
            );
        },

        pets_text: (house) => {
            const pets = house.pets ?? [];
            if (pets.length === 0)
                return (
                    <span className="text-gray-400 italic">
                        No pets recorded
                    </span>
                );

            const grouped = pets.reduce((acc, p) => {
                if (!acc[p.pet_type])
                    acc[p.pet_type] = { total: 0, vaccinated: 0 };
                acc[p.pet_type].total += 1;
                if (p.is_vaccinated) acc[p.pet_type].vaccinated += 1;
                return acc;
            }, {});

            return (
                <ul className="space-y-0.5 text-gray-800">
                    {Object.entries(grouped).map(([type, data]) => (
                        <li key={type}>
                            <span className="capitalize font-medium">
                                {type.replace(/_/g, " ")}:
                            </span>{" "}
                            <span className="text-gray-700 font-semibold">
                                {data.total}
                            </span>{" "}
                            <span className="text-gray-500">
                                ({data.vaccinated}/{data.total} vaccinated)
                            </span>
                        </li>
                    ))}
                </ul>
            );
        },

        internet_accessibility: (house) => {
            const internet = house.internet_accessibility ?? [];
            if (internet.length === 0)
                return (
                    <span className="text-gray-400 italic">
                        No internet information
                    </span>
                );

            return (
                <ul className="text-gray-800 space-y-0.5">
                    {internet.map((i, index) => (
                        <li key={index}>
                            <span className="capitalize font-medium">
                                {i.connection_type ?? "Not specified"}:
                            </span>{" "}
                            <span className="text-gray-700 font-semibold">
                                {i.provider ?? "Not provided"}
                            </span>
                        </li>
                    ))}
                </ul>
            );
        },

        purok: (house) =>
            house.purok?.purok_number ? (
                <span className="text-gray-800 font-medium">
                    {house.purok.purok_number}
                </span>
            ) : (
                <span className="text-gray-400 italic">Not specified</span>
            ),

        actions: (house) => (
            <ActionMenu
                actions={[
                    {
                        label: "View",
                        icon: <Eye className="w-4 h-4 text-indigo-600" />,
                        onClick: () =>
                            router.visit(
                                route("household.show", {
                                    household: house.id,
                                }),
                            ),
                    },
                    {
                        label: "Edit",
                        icon: <SquarePen className="w-4 h-4 text-green-500" />,
                        onClick: () =>
                            router.visit(
                                route("household.edit", {
                                    household: house.id,
                                }),
                            ),
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4 text-red-600" />,
                        onClick: () => handleDeleteClick(house.id),
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
                            title="Household Data Overview"
                            description="Review, organize, and manage comprehensive household information across the barangays of the City of Ilagan, Isabela. Monitor residential records, household composition, geolocation details, and socio-economic data to support community profiling, disaster preparedness, governance, and effective public service delivery."
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
                                            Add Household
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
                                    url="report/export-householdoverview-pdf"
                                    queryParams={queryParams}
                                    label="Export Households Services as PDF"
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
                                        placeholder="Search for Household Number"
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
                                    "toilet",
                                    "electricity",
                                    "water",
                                    "waste",
                                    "internet",
                                    "bath",
                                ]}
                                showFilters={true}
                                puroks={puroks}
                                toiletTypes={toiletTypes}
                                electricityTypes={electricityTypes}
                                wasteManagementTypes={wasteManagementTypes}
                                waterSourceTypes={waterSourceTypes}
                                internetTypes={internetTypes}
                                bathTypes={bathTypes}
                                clearRouteName="household.overview"
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
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
