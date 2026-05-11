import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import ActionMenu from "@/components/ActionMenu";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import DynamicTable from "@/Components/DynamicTable";
import { useState, useEffect } from "react";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import FilterToggle from "@/Components/FilterButtons/FillterToggle";
import {
    HousePlus,
    MoveRight,
    Search,
    SquarePen,
    Trash2,
    User,
    Users,
    UserPlus,
    UserRoundPlus,
    UsersRound,
    GraduationCap,
    BookOpen,
    School,
    RotateCcw,
    FileUser,
    Sheet,
    FileText,
} from "lucide-react";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import {
    FAMILY_TYPE_TEXT,
    INCOME_BRACKET_TEXT,
    INCOME_BRACKETS,
} from "@/constants";
import SidebarModal from "@/Components/SidebarModal";
import InputLabel from "@/Components/InputLabel";
import DropdownInputField from "@/Components/DropdownInputField";
import InputError from "@/Components/InputError";
import InputField from "@/Components/InputField";
import { IoIosAddCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import { PiUsersFourBold } from "react-icons/pi";
import { Toaster, toast } from "sonner";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import ExportButton from "@/Components/ExportButton";
import { useQuery } from "@tanstack/react-query";
import FamilyFormModal from "./Partials/FamilyFormModal";
import PageHeader from "@/Components/PageHeader";

export default function Index({ families, queryParams = null, puroks }) {
    const breadcrumbs = [
        { label: "Residents Information", showOnMobile: false },
        {
            label: "Families",
            href: route("family.index"),
            showOnMobile: true,
        },
    ];
    queryParams = queryParams || {};
    const APP_URL = useAppUrl();
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;

    const totalFamilies = families.data.length;

    const [query, setQuery] = useState(queryParams["name"] ?? "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [familyDetails, setFamilyDetails] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); //delete
    const [familyToDelete, setFamilyToDelete] = useState(null); //delete

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
        router.get(route("family.index", queryParams));
    };
    const onKeyPressed = (field, e) => {
        if (e.key === "Enter") {
            searchFieldName(field, e.target.value);
        } else {
            return;
        }
    };

    const allColumns = [
        { key: "family_id", label: "Family ID" },
        { key: "name", label: "Name of Family Head" },
        { key: "family_name", label: "Family Name" },
        { key: "income_bracket", label: "Income Bracket" },
        { key: "income_category", label: "Income Category" },
        { key: "family_type", label: "Family Type" },
        { key: "family_member_count", label: "Members" },
        { key: "house_number", label: "House Number" },
        { key: "purok_number", label: "Purok Number" },
        { key: "actions", label: "Actions" },
    ];

    const viewFamily = (id) => {
        router.get(route("family.showfamily", id));
    };

    const [visibleColumns, setVisibleColumns] = useState(
        allColumns.map((col) => col.key),
    );
    const [isPaginated, setIsPaginated] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            ["purok", "famtype", "household_head", "income_bracket"].includes(
                key,
            ) &&
            value &&
            value !== " ",
    );

    useEffect(() => {
        if (hasActiveFilter) {
            setShowFilters(true);
        }
    }, [hasActiveFilter]);

    const [showFilters, setShowFilters] = useState(hasActiveFilter);
    const columnRenderers = {
        family_id: (row) => row.id,
        name: (row) =>
            row.latest_head
                ? `${row.latest_head.firstname ?? ""} ${
                      row.latest_head.middlename ?? ""
                  } ${row.latest_head.lastname ?? ""} ${
                      row.latest_head.suffix ?? ""
                  }`
                : "Unknown",
        is_household_head: (row) =>
            row.is_household_head ? (
                <span className="py-1 px-2 rounded-xl bg-green-100 text-green-800">
                    Yes
                </span>
            ) : (
                <span className="py-1 px-2 rounded-xl bg-red-100 text-red-800">
                    No
                </span>
            ),
        family_name: (row) => (
            <Link
                href={route("family.showfamily", row?.id ?? 0)}
                className="hover:text-blue-500 hover:underline"
            >
                {(row?.family_name ?? "Unnamed") + " Family"}
            </Link>
        ),

        family_member_count: (row) => (
            <span className="flex items-center">
                {row?.family_member_count ?? 0}{" "}
                <User className="ml-2 h-5 w-5" />
            </span>
        ),

        income_bracket: (row) => {
            const bracketKey = row?.income_bracket;
            const bracketText = INCOME_BRACKET_TEXT?.[bracketKey];
            const bracketMeta = INCOME_BRACKETS?.[bracketKey];

            return bracketText ? (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                        bracketMeta?.className ?? ""
                    }`}
                >
                    {bracketText}
                </span>
            ) : (
                <span className="text-gray-500 italic">Unknown</span>
            );
        },

        income_category: (row) => {
            const bracketMeta = INCOME_BRACKETS?.[row?.income_bracket];

            return bracketMeta ? (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${bracketMeta.className}`}
                >
                    {bracketMeta.label}
                </span>
            ) : (
                <span className="text-gray-500 italic">Unknown</span>
            );
        },

        family_type: (row) => FAMILY_TYPE_TEXT?.[row?.family_type] ?? "Unknown",

        house_number: (row) => {
            if (row?.household?.house_number) return row.household.house_number;
            return "Unknown";
        },

        purok_number: (row) => row?.latest_head?.purok_number ?? "Unknown",

        actions: (row) => (
            <ActionMenu
                actions={[
                    {
                        label: "View Family",
                        icon: <UsersRound className="w-4 h-4 text-blue-600" />,
                        onClick: () => viewFamily(row?.id),
                    },
                    {
                        label: "Edit",
                        icon: <SquarePen className="w-4 h-4 text-green-500" />,
                        onClick: () => {
                            if (!row?.id) return;

                            router.visit(route("family.edit", row.id));
                        },
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4 text-red-600" />,
                        onClick: () => handleDeleteClick(row?.id),
                    },
                ]}
            />
        ),
    };

    const defaultMember = {
        resident_id: null,
        resident_name: "",
        resident_image: null,
        birthdate: "",
        purok_number: "",
        relationship_to_head: "",
        household_position: "",
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setFamilyDetails(null);
    };

    const handleEdit = async (id) => {
        try {
            const response = await axios.get(
                `${APP_URL}/family/getfamilydetails/${id}`,
            );

            const details = response.data.family_details;

            // Find the latest household head
            // const latestHead =
            //     details.members
            //         .filter((m) => m.is_household_head === 1)
            //         .sort(
            //             (a, b) =>
            //                 new Date(b.updated_at) - new Date(a.updated_at),
            //         )[0] || details.members[0];

            // setData({
            //     resident_id: latestHead?.id ?? null,
            //     resident_name: `${latestHead?.firstname} ${
            //         latestHead?.middlename ? latestHead?.middlename + " " : ""
            //     }${latestHead?.lastname} ${latestHead?.suffix}`.trim(),
            //     resident_image: latestHead?.resident_picture_path,
            //     birthdate: latestHead?.birthdate ?? null,
            //     purok_number: latestHead?.purok_number ?? null,
            //     house_number:
            //         latestHead?.household?.house_number ??
            //         details.household?.house_number ??
            //         null,
            //     family_type: details.family_type,
            //     family_name: details.family_name,
            //     members: (details.members || [])
            //         .map((m) => {
            //             const householdResident =
            //                 m.household_residents?.[0] || {};
            //             return {
            //                 resident_id: m.id,
            //                 resident_name: `${m.firstname} ${
            //                     m.middlename ? m.middlename + " " : ""
            //                 }${m.lastname} ${m.suffix}`.trim(),
            //                 resident_image: m.resident_picture_path,
            //                 birthdate: m.birthdate,
            //                 purok_number: m.purok_number,
            //                 relationship_to_head:
            //                     householdResident.relationship_to_head ?? "",
            //                 household_position:
            //                     householdResident.household_position ?? "",
            //             };
            //         })
            //         .filter(
            //             (m) => m.relationship_to_head.toLowerCase() !== "self",
            //         ),
            //     family_id: details.id,
            //     _method: "PUT",
            // });

            console.log(details);
            setFamilyDetails(details);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching family details:", error);
        }
    };

    const handleDeleteClick = (id) => {
        setFamilyToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("family.destroy", familyToDelete), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setFamilyDetails(null);
            },
        });
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
            <Head title="Family" />
            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
            <Toaster richColors />
            <div className="pt-4">
                <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                    {/* <pre>{JSON.stringify(families, undefined, 2)}</pre> */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                        <PageHeader
                            title="Family Records"
                            description="Manage, organize, and monitor all registered families and households within the barangays of the City of Ilagan, Isabela. Maintain updated family composition, household affiliations, and demographic information to support community profiling, social services, disaster preparedness, and local governance initiatives."
                            icon={Users}
                            badge={
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                        {totalFamilies ?? 0} Registered Families
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                        CSWDO
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                        CDRRMO Ilagan
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                        Barangay / City Registry
                                    </span>
                                </div>
                            }
                            iconWrapperClassName="bg-blue-100 text-blue-600 shadow-sm"
                            containerClassName="border border-blue-100 bg-gradient-to-r from-white via-slate-50 to-blue-50/60 shadow-sm"
                            titleClassName="tracking-tight"
                            descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
                            actions={
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link href={route("family.create")}>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-300 bg-white text-blue-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                                        >
                                            <PiUsersFourBold className="h-4 w-4" />

                                            <span className="hidden md:inline">
                                                Add Family
                                            </span>
                                        </Button>
                                    </Link>

                                    <Link href={route("resident.create")}>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-emerald-300 bg-white text-emerald-700 shadow-sm transition-all hover:bg-emerald-600 hover:text-white"
                                        >
                                            <HousePlus className="h-4 w-4" />

                                            <span className="hidden md:inline">
                                                Add Household
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
                            }
                        />
                        {/* <pre>{JSON.stringify(residents, undefined, 3)}</pre> */}
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
                                    url="report/export-family-excel"
                                    queryParams={queryParams}
                                    label="Export Family as XLSX"
                                />
                                <ExportButton
                                    url="report/export-family-pdf"
                                    queryParams={queryParams}
                                    label="Export Family as PDF"
                                    type="pdf"
                                    totalRecords={families.total} // disables if total > 500
                                />
                                <ExportButton
                                    url="report/export-familymembers-excel"
                                    queryParams={queryParams}
                                    label="Export Family Members as XLSX"
                                />
                                <ExportButton
                                    url="report/export-familymembers-pdf"
                                    queryParams={queryParams}
                                    label="Export Family Members as PDF"
                                    type="pdf"
                                    totalRecords={families.total} // disables if total > 500
                                />
                            </div>
                            {/* Search, and other buttons */}
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex w-[300px] max-w-lg items-center space-x-1"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Search Family or House No."
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            onKeyPressed("name", e.target.value)
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
                                {/* <div className="relative group z-50">
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white"
                                        onClick={handleAddFamily}
                                    >
                                        <PiUsersFourBold className="w-4 h-4" />
                                    </Button>
                                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 rounded-md bg-blue-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                        Add a Family
                                    </div>
                                </div>
                                <Link href={route("resident.create")}>
                                    <div className="relative group z-50">
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white"
                                        >
                                            <HousePlus className="w-4 h-4" />
                                        </Button>
                                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-3 py-1.5 rounded-md bg-blue-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                            Add Household
                                        </div>
                                    </div>
                                </Link> */}
                            </div>
                        </div>

                        {showFilters && (
                            <FilterToggle
                                queryParams={queryParams}
                                searchFieldName={searchFieldName}
                                visibleFilters={[
                                    "purok",
                                    "famtype",
                                    "household_head",
                                    "income_bracket",
                                ]}
                                puroks={puroks}
                                showFilters={true}
                                clearRouteName="family.index"
                                clearRouteParams={{}}
                            />
                        )}
                        <DynamicTable
                            passedData={families}
                            allColumns={allColumns}
                            columnRenderers={columnRenderers}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            showTotal={true}
                        />
                    </div>
                    {/* WILL ADD A FAMILY */}
                    {/* <FamilyFormModal
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        familyDetails={familyDetails}
                        data={data}
                        setData={setData}
                        errors={errors}
                        memberList={memberList}
                        handleResidentChange={handleResidentChange}
                        handleDynamicResidentChange={
                            handleDynamicResidentChange
                        }
                        handleMemberFieldChange={handleMemberFieldChange}
                        handleSubmitFamily={handleSubmitFamily}
                        handleUpdateFamily={handleUpdateFamily}
                        addMember={addMember}
                        removeMember={removeMember}
                        reset={reset}
                    /> */}
                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => {
                            setIsDeleteModalOpen(false);
                        }}
                        onConfirm={confirmDelete}
                        residentId={familyToDelete}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
