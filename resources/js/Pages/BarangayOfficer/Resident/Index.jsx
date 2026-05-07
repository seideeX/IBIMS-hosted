import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { Toaster, toast } from "sonner";
import {
    Search,
    UserRoundPlus,
    HousePlus,
    SquarePen,
    Trash2,
    Network,
    Eye,
    Table,
    FileText,
    FileUser,
    UsersRound,
    UserPlus,
} from "lucide-react";
import * as CONSTANTS from "@/constants";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import { useQuery } from "@tanstack/react-query";
import ExportButton from "@/Components/ExportButton";
import { toTitleCase } from "@/utils/stringFormat";
import PageHeader from "@/Components/PageHeader";

// Lazy load heavy components
const AdminLayout = lazy(() => import("@/Layouts/AdminLayout"));
const SidebarModal = lazy(() => import("@/Components/SidebarModal"));
const PersonDetailContent = lazy(
    () => import("@/Components/SidebarModalContents/PersonDetailContent"),
);
const BreadCrumbsHeader = lazy(() => import("@/Components/BreadcrumbsHeader"));
const DynamicTable = lazy(() => import("@/Components/DynamicTable"));
const ActionMenu = lazy(() => import("@/Components/ActionMenu"));
const FilterToggle = lazy(
    () => import("@/Components/FilterButtons/FillterToggle"),
);
const DynamicTableControls = lazy(
    () => import("@/Components/FilterButtons/DynamicTableControls"),
);
const DeleteConfirmationModal = lazy(
    () => import("@/Components/DeleteConfirmationModal"),
);
const ResidentCharts = lazy(() => import("./ResidentCharts"));

// Memoize expensive calculations or objects that don't change often
const breadcrumbs = [
    { label: "Residents Information", showOnMobile: false },
    { label: "Information Table", showOnMobile: true },
];

const allColumns = [
    { key: "resident_id", label: "ID" },
    { key: "resident_picture", label: "Resident Image" },
    { key: "name", label: "Name" },
    { key: "sex", label: "Sex" },
    { key: "age", label: "Age" },
    { key: "civil_status", label: "Civil Status" },
    { key: "employment_status", label: "Employment" },
    { key: "occupation", label: "Occupation" },
    { key: "ethnicity", label: "Ethnicity" },
    { key: "registered_voter", label: "Registered Voter" },
    { key: "contact_number", label: "Contact Number" },
    { key: "email", label: "Email" },
    { key: "purok_number", label: "Purok" },
    { key: "actions", label: "Actions" },
];

export default function Index({
    residents,
    queryParams = null,
    puroks,
    ethnicities,
}) {
    // Use useMemo for queryParams to ensure it's stable across renders if not explicitly updated
    const currentQueryParams = useMemo(() => queryParams || {}, [queryParams]);

    const { props } = usePage();
    const { success, error } = props; // Destructure directly for cleaner access
    const APP_URL = useAppUrl();

    // Use a single useEffect for toasts, clearing both success and error
    useEffect(() => {
        if (success) {
            toast.success(success, {
                description: "Operation successful!",
                duration: 3000,
                closeButton: true,
            });
            // Clear success message in Inertia props to prevent re-toasting on subsequent renders
            // This requires modifying props, which is generally discouraged for direct mutation.
            // A better pattern might involve an Inertia middleware to flash messages once.
            // For now, if you must clear it client-side:
            // props.success = null; // Be cautious with direct mutation of usePage().props
        }
        if (error) {
            toast.error(error, {
                description: "Operation failed!",
                duration: 3000,
                closeButton: true,
            });
            // props.error = null; // Be cautious with direct mutation
        }
    }, [success, error]); // Depend on success and error props

    const [query, setQuery] = useState(currentQueryParams["name"] ?? "");

    // *** NEW: Extract welfare filters from queryParams ***
    const welfareFilters = useMemo(() => {
        const activeFilters = [];
        if (currentQueryParams.pwd === "1") {
            activeFilters.push("PWD");
        }
        if (currentQueryParams.fourps === "1") {
            activeFilters.push("FourPs");
        }
        if (currentQueryParams.solo_parent === "1") {
            activeFilters.push("SoloParent");
        }
        return activeFilters;
    }, [
        currentQueryParams.pwd,
        currentQueryParams.fourps,
        currentQueryParams.solo_parent,
    ]);

    // Optimize useQuery to prevent unnecessary re-fetches and improve caching
    const {
        data: chartData,
        isLoading: isChartLoading,
        isError: isChartError,
    } = useQuery({
        queryKey: ["residents-chart", currentQueryParams], // Key reflects chart data
        queryFn: async ({ signal }) => {
            const { data } = await axios.get(
                `${APP_URL}/resident/chartdata`,
                { params: queryParams, signal }, // cancel old requests
            );
            return data.residents;
        },
        // Only refetch if queryParams change significantly or if explicitly told
        enabled: true, // or some condition if you only want to fetch chart data under certain circumstances
        placeholderData: (previousData) => previousData, // Show previous data while loading new
        staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
        cacheTime: 10 * 60 * 1000, // Unused cache entries are kept for 10 minutes
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch on component mount if data is already in cache and not stale
    });

    // Memoize search function to prevent it from recreating on every render
    const searchFieldName = useMemo(
        () => (field, value) => {
            let newQueryParams = { ...currentQueryParams };

            if (value && value.trim() !== "" && value !== "0") {
                // Added value !== "0" check for welfare filters
                newQueryParams[field] = value;
            } else {
                delete newQueryParams[field];
            }

            // Always delete page when searching to reset pagination
            delete newQueryParams.page;

            router.get(route("resident.index", newQueryParams), {
                preserveState: true, // Keep scroll position and form data
                replace: true, // Replace history entry instead of pushing a new one
            });
        },
        [currentQueryParams],
    ); // Dependency on currentQueryParams

    const handleSubmit = (e) => {
        e.preventDefault();
        searchFieldName("name", query);
    };

    const onKeyPressed = (field, e) => {
        if (e.key === "Enter") {
            searchFieldName(field, e.target.value);
        }
    };

    // Memoize calculateAge to ensure it's only created once
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

    const handleEdit = (id) => {
        router.get(route("resident.edit", id));
    };

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

    // Memoize the check for active filters
    const hasActiveFilter = useMemo(
        () =>
            Object.entries(currentQueryParams).some(
                ([key, value]) =>
                    [
                        "purok",
                        "sex",
                        "gender",
                        "age_group",
                        "estatus",
                        "ethnic",
                        "voter_status",
                        "cstatus",
                        "pwd",
                        "fourps",
                        "solo_parent",
                    ].includes(key) &&
                    value &&
                    value !== "" && // Check for empty string
                    value !== "0", // Explicitly ignore "0" for welfare filters
            ),
        [currentQueryParams],
    );

    const [showFilters, setShowFilters] = useState(hasActiveFilter);
    useEffect(() => {
        setShowFilters(hasActiveFilter);
    }, [hasActiveFilter]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState(null);

    const handleDeleteClick = (id) => {
        setResidentToDelete(id);
        setIsDeleteModalOpen(true);
    };
    const handleExportPdf = (id) => {
        const fullUrl = `/export-resident-pdf/${id}`;
        window.open(fullUrl, "_blank");
    };

    const handleExportRBI = (id) => {
        const fullUrl = `/export-resident-rbi/${id}`;
        window.open(fullUrl, "_blank");
    };
    // Memoize confirmDelete to ensure it's stable
    const selectedResidentToDelete = useMemo(() => {
        return residents?.data?.find((r) => r.id === residentToDelete);
    }, [residents, residentToDelete]);
    const residentDeleteName = selectedResidentToDelete?.full_name || "";
    const confirmDelete = useMemo(
        () => () => {
            if (residentToDelete) {
                router.delete(route("resident.destroy", residentToDelete), {
                    onError: (err) => {
                        toast.error("Failed to delete resident.", {
                            description: err.message,
                        });
                        setIsDeleteModalOpen(false);
                    },
                });
            }
        },
        [residentToDelete],
    );

    // Memoize columnRenderers to prevent unnecessary re-creation on every render
    // const columnRenderers = useMemo(
    //     () => ({
    //         resident_id: (resident) => resident.id,
    //         resident_picture: (resident) => (
    //             // Use an optimized image component or service if available.
    //             // For now, ensure default-avatar.jpg is small and optimized.
    //             <img
    //                 src={
    //                     resident.resident_picture
    //                         ? `/storage/${resident.resident_picture}`
    //                         : "/images/default-avatar.jpg"
    //                 }
    //                 onError={(e) => {
    //                     e.target.onerror = null;
    //                     e.target.src = "/images/default-avatar.jpg";
    //                 }}
    //                 alt="Resident"
    //                 className="w-16 h-16 min-w-16 min-h-16 object-cover rounded-full border"
    //                 loading="lazy" // Add lazy loading for images
    //             />
    //         ),
    //         name: (resident) => (
    //             <div className="text-sm break-words whitespace-normal leading-snug">
    //                 {toTitleCase(
    //                     `${resident.firstname} ${
    //                         resident.middlename ? resident.middlename + " " : ""
    //                     }${resident.lastname ?? ""} ${
    //                         resident.suffix ? resident.suffix : ""
    //                     }`,
    //                 )}
    //             </div>
    //         ),
    //         sex: (resident) => {
    //             const genderKey = resident.sex;
    //             const label =
    //                 CONSTANTS.RESIDENT_GENDER_TEXT2[genderKey] ?? "Unknown";
    //             const className =
    //                 CONSTANTS.RESIDENT_GENDER_COLOR_CLASS[genderKey] ??
    //                 "bg-gray-300";
    //             return (
    //                 <span
    //                     className={`py-1 px-2 rounded-xl text-sm font-medium whitespace-nowrap ${className}`}
    //                 >
    //                     {label}
    //                 </span>
    //             );
    //         },
    //         age: (resident) => {
    //             const age = calculateAge(resident.birthdate);
    //             if (typeof age !== "number") return "Unknown";
    //             return (
    //                 <div className="flex flex-col text-sm">
    //                     <span className="font-medium text-gray-800">{age}</span>
    //                     {age > 60 && (
    //                         <span className="text-xs text-rose-500 font-semibold">
    //                             Senior Citizen
    //                         </span>
    //                     )}
    //                 </div>
    //             );
    //         },
    //         civil_status: (resident) =>
    //             CONSTANTS.RESIDENT_CIVIL_STATUS_TEXT[resident.civil_status],
    //         employment_status: (resident) =>
    //             CONSTANTS.RESIDENT_EMPLOYMENT_STATUS_TEXT[
    //                 resident.employment_status
    //             ],
    //         occupation: (resident) => {
    //             const occ = resident.occupation;
    //             return occ ? (
    //                 <span className="text-sm text-gray-700">
    //                     {resident.occupation}
    //                 </span>
    //             ) : (
    //                 <span className="text-gray-400 text-[12px] italic">
    //                     No occupation available
    //                 </span>
    //             );
    //         },
    //         ethnicity: (resident) => {
    //             const eth = resident.ethnicity;
    //             return eth ? (
    //                 <span className="text-sm text-gray-700">{eth}</span>
    //             ) : (
    //                 <span className="text-gray-400 text-[12px] italic">
    //                     No ethnicity data
    //                 </span>
    //             );
    //         },
    //         registered_voter: (resident) => {
    //             const voter = resident.registered_voter;

    //             return voter !== null && voter !== undefined ? (
    //                 <span
    //                     className={`${CONSTANTS.RESIDENT_REGISTER_VOTER_CLASS[voter]} whitespace-nowrap`}
    //                 >
    //                     {CONSTANTS.RESIDENT_REGISTER_VOTER_TEXT[voter]}
    //                 </span>
    //             ) : (
    //                 <span className="text-gray-400 text-[12px] italic">
    //                     No voter data
    //                 </span>
    //             );
    //         },
    //         contact_number: (resident) => {
    //             const contact = resident.contact_number;

    //             return contact ? (
    //                 <span className="whitespace-nowrap text-sm text-gray-700">
    //                     {contact}
    //                 </span>
    //             ) : (
    //                 <span className="text-gray-400 text-[12px] italic whitespace-nowrap">
    //                     No contact number
    //                 </span>
    //             );
    //         },
    //         purok_number: (resident) => resident.purok_number,
    //         email: (resident) => {
    //             const email = resident.email;

    //             return email ? (
    //                 <span className="text-sm text-gray-700 whitespace-nowrap">
    //                     {email}
    //                 </span>
    //             ) : (
    //                 <span className="text-gray-400 text-[12px] italic whitespace-nowrap">
    //                     No email provided
    //                 </span>
    //             );
    //         },
    //         actions: (resident) => (
    //             <ActionMenu
    //                 actions={[
    //                     {
    //                         label: "View",
    //                         icon: <Eye className="w-4 h-4 text-indigo-600" />,
    //                         onClick: () => handleView(resident.id),
    //                     },
    //                     {
    //                         label: "Export to PDF",
    //                         icon: <FileText className="w-4 h-4 text-red-600" />,
    //                         onClick: () => handleExportPdf(resident.id),
    //                     },
    //                     {
    //                         label: "Export RBI Form B",
    //                         icon: <FileText className="w-4 h-4 text-red-600" />,
    //                         onClick: () => handleExportRBI(resident.id),
    //                     },
    //                     {
    //                         label: "Edit",
    //                         icon: (
    //                             <SquarePen className="w-4 h-4 text-green-500" />
    //                         ),
    //                         onClick: () => handleEdit(resident.id),
    //                     },
    //                     {
    //                         label: "Delete",
    //                         icon: <Trash2 className="w-4 h-4 text-red-600" />,
    //                         onClick: () => handleDeleteClick(resident.id),
    //                     },
    //                     {
    //                         label: "Family Tree",
    //                         icon: <Network className="w-4 h-4 text-blue-500" />,
    //                         href: route("resident.familytree", resident.id),
    //                         tooltip: "See Family Tree",
    //                     },
    //                 ]}
    //             />
    //         ),
    //     }),
    //     [
    //         calculateAge,
    //         handleView,
    //         handleDeleteClick,
    //         handleEdit,
    //         handleExportPdf,
    //         handleExportRBI,
    //     ],
    // ); // Dependencies for columnRenderers

    const columnRenderers = useMemo(
        () => ({
            resident_id: (resident) => (
                <div className="min-w-0 text-sm font-medium text-slate-700">
                    #{resident.id}
                </div>
            ),

            resident_picture: (resident) => (
                <div className="flex items-center justify-center">
                    <img
                        src={
                            resident.resident_picture
                                ? `/storage/${resident.resident_picture}`
                                : "/images/default-avatar.jpg"
                        }
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/default-avatar.jpg";
                        }}
                        alt="Resident"
                        className="h-14 w-14 min-h-14 min-w-14 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200"
                        loading="lazy"
                    />
                </div>
            ),

            name: (resident) => (
                <div className="min-w-0 max-w-full">
                    <p className="text-sm font-semibold leading-snug text-slate-800 break-words whitespace-normal">
                        {toTitleCase(
                            `${resident.firstname} ${
                                resident.middlename
                                    ? resident.middlename + " "
                                    : ""
                            }${resident.lastname ?? ""} ${
                                resident.suffix ? resident.suffix : ""
                            }`,
                        )}
                    </p>
                </div>
            ),

            sex: (resident) => {
                const genderKey = resident.sex;
                const label =
                    CONSTANTS.RESIDENT_GENDER_TEXT2[genderKey] ?? "Unknown";
                const className =
                    CONSTANTS.RESIDENT_GENDER_COLOR_CLASS[genderKey] ??
                    "bg-gray-100 text-gray-700";

                return (
                    <div className="min-w-0">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
                        >
                            {label}
                        </span>
                    </div>
                );
            },

            age: (resident) => {
                const age = calculateAge(resident.birthdate);

                if (typeof age !== "number") {
                    return (
                        <span className="text-xs italic text-slate-400">
                            Unknown age
                        </span>
                    );
                }

                return (
                    <div className="min-w-0 flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">
                            {age}
                        </span>
                        {age >= 60 && (
                            <span className="mt-0.5 inline-flex w-fit rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                                Senior Citizen
                            </span>
                        )}
                    </div>
                );
            },

            civil_status: (resident) => {
                const civilStatus =
                    CONSTANTS.RESIDENT_CIVIL_STATUS_TEXT[resident.civil_status];

                return civilStatus ? (
                    <div className="min-w-0 text-sm text-slate-700 break-words whitespace-normal">
                        {civilStatus}
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">
                        No civil status
                    </span>
                );
            },

            employment_status: (resident) => {
                const employmentStatus =
                    CONSTANTS.RESIDENT_EMPLOYMENT_STATUS_TEXT[
                        resident.employment_status
                    ];

                return employmentStatus ? (
                    <div className="min-w-0 text-sm text-slate-700 break-words whitespace-normal">
                        {employmentStatus}
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">
                        No employment data
                    </span>
                );
            },

            occupation: (resident) => {
                const occ = resident.occupation;

                return occ ? (
                    <div className="min-w-0 max-w-full text-sm text-slate-700 break-words whitespace-normal">
                        {occ}
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">
                        No occupation available
                    </span>
                );
            },

            ethnicity: (resident) => {
                const eth = resident.ethnicity;

                return eth ? (
                    <div className="min-w-0 text-sm text-slate-700 break-words whitespace-normal">
                        {eth}
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">
                        No ethnicity data
                    </span>
                );
            },

            registered_voter: (resident) => {
                const voter = resident.registered_voter;

                return voter !== null && voter !== undefined ? (
                    <div className="min-w-0">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                CONSTANTS.RESIDENT_REGISTER_VOTER_CLASS[voter]
                            }`}
                        >
                            {CONSTANTS.RESIDENT_REGISTER_VOTER_TEXT[voter]}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">
                        No voter data
                    </span>
                );
            },

            contact_number: (resident) => {
                const contact = resident.contact_number;

                return contact ? (
                    <div className="min-w-0 text-sm text-slate-700 break-all whitespace-normal">
                        {contact}
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">
                        No contact number
                    </span>
                );
            },

            purok_number: (resident) => (
                <div className="min-w-0">
                    <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        Purok {resident.purok_number}
                    </span>
                </div>
            ),

            email: (resident) => {
                const email = resident.email;

                return email ? (
                    <div className="min-w-0 max-w-full text-sm text-slate-700 break-all whitespace-normal">
                        {email}
                    </div>
                ) : (
                    <span className="text-xs italic text-slate-400">
                        No email provided
                    </span>
                );
            },

            actions: (resident) => (
                <ActionMenu
                    actions={[
                        {
                            label: "View",
                            icon: <Eye className="w-4 h-4 text-indigo-600" />,
                            onClick: () => handleView(resident.id),
                        },
                        {
                            label: "Export to PDF",
                            icon: <FileText className="w-4 h-4 text-red-600" />,
                            onClick: () => handleExportPdf(resident.id),
                        },
                        {
                            label: "Export RBI Form B",
                            icon: <FileText className="w-4 h-4 text-red-600" />,
                            onClick: () => handleExportRBI(resident.id),
                        },
                        {
                            label: "Edit",
                            icon: (
                                <SquarePen className="w-4 h-4 text-green-500" />
                            ),
                            onClick: () => handleEdit(resident.id),
                        },
                        {
                            label: "Delete",
                            icon: <Trash2 className="w-4 h-4 text-red-600" />,
                            onClick: () => handleDeleteClick(resident.id),
                        },
                        {
                            label: "Family Tree",
                            icon: <Network className="w-4 h-4 text-blue-500" />,
                            href: route("resident.familytree", resident.id),
                            tooltip: "See Family Tree",
                        },
                    ]}
                />
            ),
        }),
        [
            calculateAge,
            handleView,
            handleDeleteClick,
            handleEdit,
            handleExportPdf,
            handleExportRBI,
        ],
    );

    const [showAll, setShowAll] = useState(currentQueryParams.all === "true");

    useEffect(() => {
        setShowAll(currentQueryParams.all === "true");
    }, [currentQueryParams.all]);

    const toggleShowAll = () => {
        let newQueryParams = { ...currentQueryParams };

        if (showAll) {
            delete newQueryParams.all;
        } else {
            newQueryParams.all = "true";
        }

        delete newQueryParams.page;

        router.get(route("resident.index", newQueryParams), {
            preserveState: true,
            replace: true,
        });
    };
    // console.log("Rendering Resident Index with residents:", residents);

    return (
        <AdminLayout>
            <Head title="Resident" />
            <div>
                <Toaster richColors />
                <BreadCrumbsHeader breadcrumbs={breadcrumbs} />

                <div className="p-2 md:p-4">
                    <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-0">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                            <ResidentCharts
                                residents={chartData ?? []}
                                isLoading={isChartLoading}
                                welfareFilters={welfareFilters}
                            />
                            <PageHeader
                                title="Resident Information"
                                description="Manage and monitor resident demographic information including personal profiles, civil status, employment, voter registration, contact details, and household affiliations. Maintain accurate resident records to support community profiling, public service delivery, disaster preparedness, and barangay planning initiatives."
                                icon={UserRoundPlus}
                                badge={
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                            Barangay/City Registry
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                            PSA
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                            CDRRMO
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                            Health Office
                                        </span>

                                        <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                                            COMELEC
                                        </span>
                                    </div>
                                }
                                iconWrapperClassName="bg-indigo-100 text-indigo-600 shadow-sm"
                                containerClassName="border border-indigo-100 bg-gradient-to-r from-white via-slate-50 to-indigo-50/60 shadow-sm"
                                titleClassName="tracking-tight"
                                descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
                                actions={
                                    <div className="flex items-center gap-2">
                                        <Link href={route("resident.create")}>
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

                                        <Link
                                            href={route(
                                                "resident.createresident",
                                            )}
                                        >
                                            <Button
                                                variant="outline"
                                                className="flex items-center gap-2 border-emerald-300 bg-white text-emerald-700 shadow-sm transition-all hover:bg-emerald-600 hover:text-white"
                                            >
                                                <UserRoundPlus className="h-4 w-4" />

                                                <span className="hidden sm:inline">
                                                    Add Resident
                                                </span>
                                            </Button>
                                        </Link>
                                    </div>
                                }
                            />
                            <div className="flex flex-wrap items-start justify-between gap-2 w-full mb-0">
                                <div className="flex items-start gap-2 flex-wrap">
                                    <Suspense
                                        fallback={
                                            <div>Loading Controls...</div>
                                        }
                                    >
                                        <DynamicTableControls
                                            allColumns={allColumns}
                                            visibleColumns={visibleColumns}
                                            setVisibleColumns={
                                                setVisibleColumns
                                            }
                                            showFilters={showFilters}
                                            toggleShowFilters={() =>
                                                setShowFilters((prev) => !prev)
                                            }
                                        />
                                    </Suspense>
                                    <ExportButton
                                        url="report/export-residents-excel"
                                        queryParams={currentQueryParams}
                                    />
                                    <ExportButton
                                        url="report/export-resident-pdf"
                                        queryParams={currentQueryParams}
                                        type="pdf"
                                        totalRecords={residents.total} // dynamically disable if over 500
                                    />
                                    <ExportButton
                                        url="/report/export-monitoring-form-pdf"
                                        queryParams={currentQueryParams}
                                        type="pdf"
                                        label={"Export Monitoring Form sa PDF"}
                                        icon={<UsersRound />} // replace with any icon component
                                    />
                                </div>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                    <form
                                        onSubmit={handleSubmit}
                                        className="flex w-[300px] max-w-lg items-center space-x-1"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Search"
                                            value={query}
                                            onChange={(e) =>
                                                setQuery(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                onKeyPressed("name", e)
                                            }
                                            className="ml-4"
                                        />
                                        <div className="relative group z-5">
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
                                <Suspense
                                    fallback={<div>Loading Filters...</div>}
                                >
                                    <FilterToggle
                                        queryParams={currentQueryParams}
                                        searchFieldName={searchFieldName}
                                        visibleFilters={[
                                            "purok",
                                            "sex",
                                            "gender",
                                            "age_group",
                                            "estatus",
                                            "ethnic",
                                            "voter_status",
                                            "cstatus",
                                            "pwd",
                                            "fourps",
                                            "solo_parent",
                                        ]}
                                        showFilters={true} // Always true when rendered here
                                        puroks={puroks}
                                        clearRouteName="resident.index"
                                        clearRouteParams={{}}
                                        ethnicities={ethnicities}
                                    />
                                </Suspense>
                            )}

                            <Suspense fallback={<div>Loading Table...</div>}>
                                <DynamicTable
                                    passedData={residents}
                                    allColumns={allColumns}
                                    columnRenderers={columnRenderers}
                                    showAll={showAll}
                                    visibleColumns={visibleColumns}
                                    showTotal={true}
                                />
                            </Suspense>
                        </div>
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
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                residentId={residentToDelete} // ✅ FIXED
                title="Delete Resident Record"
                description="This action requires password confirmation before proceeding."
                message="You are about to permanently delete this resident record. This action cannot be undone."
                itemName={residentDeleteName} // ✅ CLEAN
                itemLabel="Resident"
                note="Deleting this resident may also remove or affect related household, document, and profiling records."
                buttonLabel="Confirm and Delete"
                cancelLabel="Cancel"
                processingText="Verifying..."
            />
        </AdminLayout>
    );
}
