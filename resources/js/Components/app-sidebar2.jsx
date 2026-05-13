import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Home,
    FileStack,
    FileText,
    FileUser,
    Files,
    Table,
    UsersRound,
    SquareUserRound,
    House,
    CarFront,
    GraduationCap,
    BriefcaseBusiness,
    SquareActivity,
    HeartPulse,
    Accessibility,
    Pill,
    Syringe,
    PersonStanding,
    Stethoscope,
    Tablets,
    ScrollText,
    Baby,
    MessageSquareWarning,
    Flag,
    ChevronDown,
    ChevronUp,
    Scale,
    CircleUser,
    FileInput,
    CircleUserRound,
    LayoutList,
    UtilityPole,
    UserPen,
    Settings,
    SlidersHorizontal,
    Plus,
    Cloudy,
    User2,
    Building2,
    Users,
    School,
    Hammer,
    ListChecks,
    BusFront,
    ContactRound,
    Waves,
    Mountain,
    UserSquare,
    SignpostBig,
    TableOfContents,
    Bolt,
    Logs,
    ListCheck,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import { useMemo } from "react";
import { useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { Toaster, toast } from "sonner";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export function AppSidebar({ auth }) {
    const location = useLocation();
    const [openIndex, setOpenIndex] = useState(null);
    const [barangay, setBarangay] = useState(null);
    const APP_URL = useAppUrl();
    const user = auth.user;
    const fetchedRef = useRef(false);
    const defaultLogo = "/images/city-of-ilagan.png";
    const [craList, setCraList] = useState([]);
    const [availableCra, setAvailableCra] = useState([]);
    const [craProgress, setCraProgress] = useState({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const props = usePage().props;
    const success = props?.success ?? null;

    const [pendingCount, setPendingCount] = useState(0);
    const pendingCountCacheKey = "pending-certificate-count";

    const fetchPendingCertificateCount = async () => {
        try {
            const res = await axios.get(`${APP_URL}/certificates/pending`);
            const apiCount = res.data.count;

            // Read cache
            const cached =
                JSON.parse(localStorage.getItem(pendingCountCacheKey)) || {};
            const cachedCount = cached.count || 0;

            if (cachedCount !== apiCount) {
                setPendingCount(apiCount);
                localStorage.setItem(
                    pendingCountCacheKey,
                    JSON.stringify({ count: apiCount, _cachedAt: Date.now() }),
                );
            } else {
                setPendingCount(cachedCount); // fallback to cached
            }
        } catch (err) {
            console.error("Failed to fetch pending certificate count:", err);
        }
    };

    useEffect(() => {
        if (
            !["barangay_officer", "admin"].some((role) =>
                userRoles.includes(role),
            )
        )
            return;
        fetchPendingCertificateCount();
    }, []);

    const fetchCRAList = async () => {
        try {
            const res = await axios.get(`${APP_URL}/getCRA`);
            const list = res.data?.data || []; // ✅ Access res.data.data
            setCraList(list);
        } catch (err) {
            console.error("Failed to fetch CRA list:", err);
        }
    };

    useEffect(() => {
        if (
            !["cdrrmo_admin", "barangay_officer", "admin"].some((role) =>
                userRoles.includes(role),
            )
        )
            return;

        fetchCRAList();
    }, []);

    const fetchCRAAvailableList = async () => {
        try {
            const res = await axios.get(`${APP_URL}/getCRAList`);
            const list = res.data?.data || []; // ✅ Access res.data.data
            setAvailableCra(list);
            // console.log(list);
        } catch (err) {
            console.error("Failed to fetch CRA list:", err);
        }
    };

    useEffect(() => {
        if (
            !["cdrrmo_admin", "barangay_officer", "admin"].some((role) =>
                userRoles.includes(role),
            )
        )
            return;

        fetchCRAAvailableList();
    }, []);

    const userRoles = user.roles.map((r) => r.name);

    useEffect(() => {
        if (
            (!userRoles.includes("admin") &&
                !userRoles.includes("barangay_officer")) ||
            fetchedRef.current
        )
            return;

        const cacheKey = "barangay_details_cache";
        const cachedDataRaw = localStorage.getItem(cacheKey);
        let cachedData = null;

        // ✅ Use cached data immediately if available
        if (cachedDataRaw) {
            try {
                cachedData = JSON.parse(cachedDataRaw);
                setBarangay(cachedData);
                fetchedRef.current = true;
            } catch {
                localStorage.removeItem(cacheKey);
            }
        }

        const fetchBarangayDetails = async () => {
            try {
                const res = await axios.get(
                    `${APP_URL}/barangay_management/barangaydetails`,
                );
                const apiData = res.data.data;

                // ✅ Compare with cached data, update if different
                const cachedDataWithoutTimestamp = cachedData
                    ? { ...cachedData }
                    : null;
                if (cachedDataWithoutTimestamp?._cachedAt) {
                    delete cachedDataWithoutTimestamp._cachedAt;
                }

                const isDifferent =
                    !cachedDataWithoutTimestamp ||
                    JSON.stringify(cachedDataWithoutTimestamp) !==
                        JSON.stringify(apiData);

                if (isDifferent) {
                    // Update state
                    setBarangay(apiData);

                    // Update cache with new data + timestamp
                    localStorage.setItem(
                        cacheKey,
                        JSON.stringify({ ...apiData, _cachedAt: Date.now() }),
                    );
                }

                fetchedRef.current = true;
            } catch (err) {
                console.error("Failed to fetch barangay details:", err);
            }
        };

        // Check if cache is expired (1 minute here)
        const cacheExpiry = 1000 * 60 * 5; // 5 min
        if (
            !cachedData ||
            (cachedData._cachedAt &&
                Date.now() - cachedData._cachedAt > cacheExpiry)
        ) {
            fetchBarangayDetails();
        } else {
            // ✅ Still fetch in background to check for changes
            fetchBarangayDetails();
        }
    }, [APP_URL, userRoles]);

    const items = [
        {
            title: "Barangay Officer",
            url: "/barangay_officer/dashboard",
            icon: LayoutDashboard,
            roles: ["barangay_officer"],
        },
        {
            title: "CDRRMO Dashboard",
            url: "/cdrrmo_admin/dashboard",
            icon: LayoutDashboard,
            roles: ["cdrrmo_admin"],
        },
        {
            title: "City Admin Dashboard",
            url: "/super_admin/dashboard",
            icon: LayoutDashboard,
            roles: ["super_admin"],
        },
        {
            title: "Admin Dashboard",
            url: "/admin/dashboard",
            icon: LayoutDashboard,
            roles: ["admin"],
        },
        {
            title: "Barangay Information",
            icon: Home,
            roles: ["barangay_officer", "admin"],
            submenu: [
                {
                    title: "Accounts",
                    url: "/user",
                    icon: CircleUser,
                    roles: ["admin"],
                },
                {
                    title: "Documents",
                    url: "/document",
                    icon: FileText,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Profile",
                    url: "/barangay_profile",
                    icon: UserPen,
                    roles: ["admin"],
                },
                {
                    title: "Activity Logs",
                    url: "/activity_log",
                    icon: Logs,
                    roles: ["admin"],
                },
            ],
        },
        {
            title: "Barangay Resources",
            icon: Bolt,
            roles: ["barangay_officer", "admin"],
            submenu: [
                {
                    title: "Infrastructure",
                    url: "/barangay_infrastructure",
                    icon: Building2,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Institutions",
                    url: "/barangay_institution",
                    icon: Users,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Facilities",
                    url: "/barangay_facility",
                    icon: School,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Projects",
                    url: "/barangay_project",
                    icon: Hammer,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Inventories",
                    url: "/inventory",
                    icon: ListChecks,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Roads",
                    url: "/barangay_road",
                    icon: BusFront,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Officials",
                    url: "/barangay_official",
                    icon: ContactRound,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Bodies of Water",
                    url: "/water",
                    icon: Waves,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Bodies of Land",
                    url: "/land",
                    icon: Mountain,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Street List",
                    url: "/street",
                    icon: SignpostBig,
                    roles: ["admin"],
                },
            ],
        },
        {
            title: "Residents Information",
            icon: FileUser,
            roles: ["barangay_officer", "admin"],
            submenu: [
                {
                    title: "Information Table",
                    url: "/resident",
                    icon: Table,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Senior Citizen",
                    url: "/senior_citizen",
                    icon: UsersRound,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Families",
                    url: "/family",
                    icon: SquareUserRound,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Households",
                    url: "/household",
                    icon: House,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Household Overview",
                    url: "/overview",
                    icon: UtilityPole,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Vehicles",
                    url: "/vehicle",
                    icon: CarFront,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Education",
                    url: "/education",
                    icon: GraduationCap,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Occupation/Livelihood",
                    url: "/occupation",
                    icon: BriefcaseBusiness,
                    roles: ["barangay_officer", "admin"],
                },
            ],
        },
        {
            title: "Medical Information",
            icon: HeartPulse,
            roles: ["barangay_officer", "admin"],
            submenu: [
                {
                    title: "Information Table",
                    url: "/medical",
                    icon: Table,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Allergies",
                    url: "/allergy",
                    icon: Tablets,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Child Health Records",
                    url: "/child_record",
                    icon: Baby,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Medical Condition",
                    url: "/medical_condition",
                    icon: Stethoscope,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Disabilities",
                    url: "/disability",
                    icon: Accessibility,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Medications",
                    url: "/medication",
                    icon: Pill,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Pregnancy Records",
                    url: "/pregnancy",
                    icon: SquareActivity,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Vaccinations",
                    url: "/vaccination",
                    icon: Syringe,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Deaths",
                    url: "/death/index",
                    icon: PersonStanding,
                    roles: ["barangay_officer", "admin"],
                },
            ],
        },
        {
            title: "Issuance",
            icon: Files,
            roles: ["barangay_officer", "admin"],
            submenu: [
                {
                    title: "Certificate Issuance",
                    url: "/certificate/index",
                    icon: FileText,
                    roles: ["barangay_officer", "admin"],
                },
            ],
        },
        {
            title: "Katarungang Pambarangay",
            icon: Scale,
            roles: ["barangay_officer", "admin"],
            submenu: [
                {
                    title: "Blotter Reports",
                    url: "/blotter_report",
                    icon: ScrollText,
                    roles: ["barangay_officer", "admin"],
                },
                {
                    title: "Summon",
                    url: "/summon",
                    icon: MessageSquareWarning,
                    roles: ["barangay_officer", "admin"],
                },
            ],
        },
        // {
        //     title: "Reports",
        //     url: "/report",
        //     icon: Flag,
        //     roles: ["barangay_officer", "admin"],
        // },
        {
            title: "Demographic Summary",
            icon: FileStack,
            roles: ["cdrrmo_admin"],
            submenu: [
                {
                    title: "Population and Residence",
                    url: "/cdrrmo_admin/population",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Livelihood Statistics",
                    url: "/cdrrmo_admin/livelihood",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Household Services",
                    url: "/cdrrmo_admin/services",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Buildings and other Infrastructures",
                    url: "/cdrrmo_admin/infraFacilities",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Primary Facilities and Services ",
                    url: "/cdrrmo_admin/primaryFacilities",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Inventory of Institutions",
                    url: "/cdrrmo_admin/institutions",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Human Resources",
                    url: "/cdrrmo_admin/humanResources",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Families At Risk",
                    url: "/cdrrmo_admin/familiesatrisk",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Persons with Disabilities",
                    url: "/cdrrmo_admin/disabilities",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Illnesses Statistics",
                    url: "/cdrrmo_admin/illnessesstats",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
            ],
        },
        {
            title: "Participartory Community Risk Assessment",
            icon: FileStack,
            roles: ["cdrrmo_admin"],
            submenu: [
                {
                    title: "Disaster Population Impact",
                    url: "/cdrrmo_admin/populationimpact",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Disaster Effect Impact",
                    url: "/cdrrmo_admin/effectimpact",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Damage To Property",
                    url: "/cdrrmo_admin/damageproperty",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Agricultural Damage",
                    url: "/cdrrmo_admin/damageagri",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Disaster Lifelines",
                    url: "/cdrrmo_admin/disasterlifelines",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Hazard Risks",
                    url: "/cdrrmo_admin/hazardrisks",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Risk Assessment Matrix",
                    url: "/cdrrmo_admin/riskmatrix",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Vulnerability Assessment Matrix",
                    url: "/cdrrmo_admin/vulnerabilitymatrix",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Population Exposure",
                    url: "/cdrrmo_admin/populationexposure",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Disaster Risk Population",
                    url: "/cdrrmo_admin/disasterpopulation",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
            ],
        },
        {
            title: "Inventories and Evcuations",
            icon: FileStack,
            roles: ["cdrrmo_admin"],
            url: "#",
            submenu: [
                {
                    title: "Disaster and Hazard Inventory",
                    url: "/cdrrmo_admin/disasterinventory",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Designated Evacuation Centers",
                    url: "/cdrrmo_admin/evacuationcenters",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Inventory of Evacuation Centers",
                    url: "/cdrrmo_admin/evacuationinven",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Places/Areas of Evacuation",
                    url: "/cdrrmo_admin/affectedPlaces",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Livelihood Evacuation",
                    url: "/cdrrmo_admin/livelihoodEvacuationSites",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Inventory of Prepositioned Food",
                    url: "/cdrrmo_admin/prepositionedInventories",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Distribution Sites",
                    url: "/cdrrmo_admin/reliefDistributions",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Distribution Process",
                    url: "/cdrrmo_admin/reliefProcess",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Inventory of Trainings",
                    url: "/cdrrmo_admin/bdrrmcTrainings",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "Inventory of Response Equipment ",
                    url: "/cdrrmo_admin/equipmentInventories",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
            ],
        },
        {
            title: "Barangay  Directories",
            icon: FileStack,
            roles: ["cdrrmo_admin"],
            url: "#",
            submenu: [
                {
                    title: "BDRRMC DIRECTORY",
                    url: "/cdrrmo_admin/bdrrmcDirectories",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
                {
                    title: "BARANGAY EVACUATION PLAN",
                    url: "/cdrrmo_admin/evacuationPlans",
                    icon: Table,
                    roles: ["cdrrmo_admin"],
                },
            ],
        },
        // {
        //     title: "Community Risk Assessment",
        //     icon: Cloudy,
        //     roles: ["barangay_officer", "admin"],
        //     url: "#",
        //     submenu: (() => {
        //         if (!availableCra) {
        //             return [
        //                 {
        //                     title: "Loading years...",
        //                     url: "#",
        //                     icon: FileInput,
        //                     roles: ["barangay_officer", "admin"],
        //                     progress: 0,
        //                 },
        //             ];
        //         }

        //         const filtered = availableCra.filter(
        //             (cra) =>
        //                 !cra.barangay_id || cra.barangay_id === barangay?.id
        //         );

        //         if (filtered.length === 0) {
        //             return [
        //                 {
        //                     title: "No CRA Available",
        //                     url: "#",
        //                     icon: FileInput,
        //                     roles: ["barangay_officer", "admin"],
        //                     progress: 0,
        //                 },
        //             ];
        //         }

        //         return filtered.map((cra) => ({
        //             title: `Submit CRA ${cra.year}`,
        //             url: `/cra/create?year=${cra.year}`,
        //             icon: FileInput,
        //             roles: ["barangay_officer", "admin"],
        //             year: cra.year,
        //             progress: cra.percentage ?? 0,
        //         }));
        //     })(),
        // },
        // {
        //     title: "CRA Settings",
        //     icon: Settings,
        //     roles: ["cdrrmo_admin"],
        //     url: "#",
        //     submenu: [
        //         {
        //             title: "Selectfield",
        //             icon: SlidersHorizontal, // import this
        //             url: "/cra/selectfield", // or your actual route
        //             roles: ["cdrrmo_admin"], // make sure it matches your current user role
        //         },
        //     ],
        // },
        {
            title: "Certificate Issuance",
            icon: FileStack,
            roles: ["resident"],
            url: "/account/certificates",
        },
        {
            title: "Basic Information",
            icon: UserSquare,
            roles: ["resident", "barangay_officer"],
            url: "/account/user/basic-information",
        },
        {
            title: "Barangay Accounts",
            url: "/super_admin/accounts",
            icon: CircleUserRound,
            roles: ["super_admin"],
        },
        {
            title: "List of Barangays",
            url: "/super_admin/barangay",
            icon: LayoutList,
            roles: ["super_admin"],
        },
        {
            title: "Population Summary",
            url: "/super_admin/statistics/population-summary",
            icon: Users,
            roles: ["super_admin"],
        },
        {
            title: "Employment Summary",
            url: "/super_admin/statistics/employment-summary",
            icon: Users,
            roles: ["super_admin"],
        },
        {
            title: "Activity Logs",
            url: "/activity_log",
            icon: ListCheck,
            roles: ["super_admin"],
        },
        // {
        //     title: "Statistics of Barangays",
        //     url: "#",
        //     icon: TableOfContents,
        //     roles: ["super_admin"],
        //     submenu: [
        //         {
        //             title: "Population Summary",
        //             url: "/super_admin/statistics/population-summary",
        //             icon: Users,
        //             roles: ["super_admin"],
        //         },
        //         {
        //             title: "Household Summary",
        //             url: "#",
        //             icon: Users,
        //             roles: ["super_admin"],
        //         },
        //         {
        //             title: "Senior Citizen Summary",
        //             url: "#",
        //             icon: Users,
        //             roles: ["super_admin"],
        //         },
        //         {
        //             title: "Occupation Summary",
        //             url: "#",
        //             icon: Users,
        //             roles: ["super_admin"],
        //         },
        //         {
        //             title: "Education Summary",
        //             url: "#",
        //             icon: Users,
        //             roles: ["super_admin"],
        //         },
        //     ],
        // },
    ];

    const normalize = (u) => {
        if (!u) return "";
        let s = u.trim();
        if (!s.startsWith("/")) s = "/" + s;
        if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
        return s;
    };

    const isActive = (url) => {
        if (!url) return false;
        const n = normalize(url);
        return location.pathname === n || location.pathname.startsWith(n + "/");
    };

    // Filter items based on user roles
    const filteredItems = useMemo(() => {
        return items.filter((item) =>
            item.roles.some((role) => userRoles.includes(role)),
        );
    }, [items, userRoles]);

    useEffect(() => {
        const matchedIndex = filteredItems.findIndex(
            (item) =>
                Array.isArray(item.submenu) &&
                item.submenu.some((sub) => isActive(sub.url)),
        );
        setOpenIndex(matchedIndex === -1 ? null : matchedIndex);
    }, [location.pathname, JSON.stringify(filteredItems)]);

    const toggleCollapse = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    const logoSrc = barangay?.logo_path?.trim()
        ? `/storage/${barangay.logo_path}`
        : defaultLogo;

    const [selectedYear, setSelectedYear] = useState("");

    // On mount, only load if there’s a saved value
    useEffect(() => {
        const savedYear = sessionStorage.getItem("cra_year");
        if (savedYear) {
            setSelectedYear(savedYear);
        }
    }, []);

    const handleAddCRA = async () => {
        try {
            // ✅ Find latest year from current CRA list (default to current year if empty)
            const latestYear =
                craList.length > 0
                    ? Math.max(...craList.map((cra) => parseInt(cra.year)))
                    : new Date().getFullYear();

            const nextYear = latestYear + 1;

            // ✅ Send the next year to backend
            const res = await axios.post(`${APP_URL}/cdrrmo_admin/addCRA`, {
                year: nextYear,
            });

            if (res.data.success) {
                setCraList((prev) => [...prev, res.data.data]);

                toast.success(`CRA for year ${nextYear} added successfully!`, {
                    description:
                        "The CRA record has been successfully added to the system.",
                    duration: 3000,
                    closeButton: true,
                });
            }
        } catch (error) {
            console.error("Failed to add CRA:", error);
            toast.error("Failed to add CRA. Please try again.");
        }
    };

    const handleYearChange = (e) => {
        const year = e.target.value;
        setSelectedYear(year);
        sessionStorage.setItem("cra_year", year);

        router.get(
            window.location.pathname,
            { year },
            { preserveState: true, replace: true },
        );
    };

    const handleDeleteClick = (id) => {
        setRecordToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("cdrrmo_admin.destroy", recordToDelete), {
            onSuccess: () => {
                fetchCRAList(); // ⬅️ Call your data fetcher again
                toast.success("CRA Record deleted successfully!", {
                    description: "The record has been removed.",
                    duration: 3000,
                    closeButton: true,
                });
            },
        });

        setIsDeleteModalOpen(false);
    };

    return (
        <Sidebar>
            <Toaster richColors />
            {/* Header with blue branding */}
            <div className="bg-white px-4 py-[8px] flex items-center border-b border-gray-200">
                <img
                    src={logoSrc}
                    onError={(e) => {
                        e.currentTarget.src = defaultLogo;
                    }}
                    alt={`${barangay?.barangay_name || "Barangay"} Logo`}
                    className="max-h-10 max-w-10 mr-3 object-contain rounded-full border border-gray-200"
                />

                <div className="flex flex-col leading-none space-y-0">
                    <p className="font-black text-[20px] text-sky-700 font-montserrat m-0 pb-1 leading-none">
                        iBIMS
                    </p>
                    <p className="font-light text-sm text-gray-500 font-montserrat m-0 p-0 leading-none">
                        {(() => {
                            if (userRoles.includes("super_admin"))
                                return "Super Administrator";
                            if (userRoles.includes("admin"))
                                return (
                                    barangay?.barangay_name || "Administrator"
                                );
                            if (userRoles.includes("cdrrmo_admin"))
                                return "CDRRMO Administrator";
                            if (userRoles.includes("barangay_officer"))
                                return (
                                    barangay?.barangay_name ||
                                    "Barangay Officer"
                                );
                            if (userRoles.includes("resident"))
                                return barangay?.barangay_name || "Resident";
                            return "Loading...";
                        })()}
                    </p>
                </div>
            </div>

            <SidebarContent className="bg-white shadow-lg">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-500 mx-0 mr-4 text-sm">
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredItems.map((item, index) => (
                                <div key={item.title}>
                                    {/* Parent Item */}
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            onClick={() =>
                                                item.submenu?.length > 0 &&
                                                toggleCollapse(index)
                                            }
                                        >
                                            <a
                                                href={item.url || "#"}
                                                className={`flex items-center justify-between w-full my-1 px-2 py-2 rounded-lg transition-all duration-200 ${
                                                    isActive(item.url) ||
                                                    (item.submenu &&
                                                        item.submenu.some(
                                                            (sub) =>
                                                                isActive(
                                                                    sub.url,
                                                                ),
                                                        ))
                                                        ? "text-gray-900 font-semibold"
                                                        : "text-gray-700 hover:text-gray-900"
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <item.icon className="mr-2 h-5 w-5" />
                                                    <span>{item.title}</span>

                                                    {item.title ===
                                                        "Issuance" &&
                                                        pendingCount > 0 && (
                                                            <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                                                                {pendingCount}
                                                            </span>
                                                        )}
                                                </div>

                                                {item.submenu?.length > 0 && (
                                                    <span className="ml-2">
                                                        {openIndex === index ? (
                                                            <ChevronUp className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                    </span>
                                                )}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>

                                    {/* Submenu */}
                                    {item.submenu?.length > 0 && (
                                        <SidebarGroupContent
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                openIndex === index
                                                    ? "max-h-[1000px] opacity-100"
                                                    : "max-h-0 opacity-0"
                                            }`}
                                        >
                                            {item.submenu?.length > 0 && (
                                                <SidebarGroupContent
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                        openIndex === index
                                                            ? "max-h-[1000px] opacity-100"
                                                            : "max-h-0 opacity-0"
                                                    }`}
                                                >
                                                    {/* Check if this is CRA Settings */}
                                                    {item.title ===
                                                    "CRA Settings" ? (
                                                        <div className="px-4 py-3">
                                                            <label
                                                                htmlFor="cra-year"
                                                                className="block text-sm font-medium text-gray-600 mb-1"
                                                            >
                                                                Select Year
                                                            </label>

                                                            <select
                                                                id="cra-year"
                                                                name="cra-year"
                                                                value={
                                                                    selectedYear
                                                                }
                                                                onChange={
                                                                    handleYearChange
                                                                }
                                                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option
                                                                    value=""
                                                                    disabled
                                                                >
                                                                    -- Select
                                                                    Year --
                                                                </option>

                                                                {craList &&
                                                                craList.length >
                                                                    0 ? (
                                                                    [
                                                                        ...new Set(
                                                                            craList.map(
                                                                                (
                                                                                    cra,
                                                                                ) =>
                                                                                    cra.year,
                                                                            ),
                                                                        ),
                                                                    ].map(
                                                                        (
                                                                            year,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    year
                                                                                }
                                                                                value={
                                                                                    year
                                                                                }
                                                                            >
                                                                                {
                                                                                    year
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )
                                                                ) : (
                                                                    <option
                                                                        disabled
                                                                    >
                                                                        Loading
                                                                        years...
                                                                    </option>
                                                                )}
                                                            </select>

                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    handleAddCRA
                                                                }
                                                                className="mt-3 flex items-center gap-2 w-full justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
                                                            >
                                                                <Plus
                                                                    size={16}
                                                                />
                                                                <span>
                                                                    Add CRA
                                                                </span>
                                                            </button>

                                                            <div className="mt-4 border-t pt-3">
                                                                <h3 className="text-sm font-medium text-gray-700 mb-2">
                                                                    Existing CRA
                                                                    Years
                                                                </h3>
                                                                {craList &&
                                                                craList.length >
                                                                    0 ? (
                                                                    [
                                                                        ...new Set(
                                                                            craList.map(
                                                                                (
                                                                                    cra,
                                                                                ) =>
                                                                                    cra.year,
                                                                            ),
                                                                        ),
                                                                    ].map(
                                                                        (
                                                                            year,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    year
                                                                                }
                                                                                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mb-2"
                                                                            >
                                                                                <span className="text-sm text-gray-700">
                                                                                    {
                                                                                        year
                                                                                    }
                                                                                </span>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        handleDeleteClick(
                                                                                            year,
                                                                                        )
                                                                                    }
                                                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        ),
                                                                    )
                                                                ) : (
                                                                    <p className="text-xs text-gray-500 italic">
                                                                        No CRA
                                                                        years
                                                                        available.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : item.title ===
                                                      "Community Risk Assessment" ? (
                                                        <div className="px-4 py-2">
                                                            {item.submenu
                                                                .filter((sub) =>
                                                                    sub.roles.some(
                                                                        (
                                                                            role,
                                                                        ) =>
                                                                            userRoles.includes(
                                                                                role,
                                                                            ),
                                                                    ),
                                                                )
                                                                .map(
                                                                    (
                                                                        sub,
                                                                        index,
                                                                    ) => {
                                                                        const percentage =
                                                                            sub.progress ??
                                                                            0;

                                                                        return (
                                                                            <div
                                                                                key={`${sub.year}-${sub.title}-${index}`}
                                                                                className="mb-3"
                                                                            >
                                                                                <SidebarMenuItem>
                                                                                    <SidebarMenuButton
                                                                                        asChild
                                                                                    >
                                                                                        <a
                                                                                            href={
                                                                                                sub.url
                                                                                            }
                                                                                            className={`flex items-center pl-8 pr-2 py-2 my-1 rounded-md transition-all duration-200 ${
                                                                                                isActive(
                                                                                                    sub.url,
                                                                                                )
                                                                                                    ? "bg-gray-200 text-gray-900 font-semibold"
                                                                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                                                            }`}
                                                                                        >
                                                                                            <sub.icon className="mr-2 h-4 w-4" />
                                                                                            <span>
                                                                                                {
                                                                                                    sub.title
                                                                                                }
                                                                                            </span>
                                                                                        </a>
                                                                                    </SidebarMenuButton>
                                                                                </SidebarMenuItem>

                                                                                <div className="ml-10 mr-2">
                                                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                                        <div
                                                                                            className={`h-2 rounded-full transition-all duration-500 ${
                                                                                                percentage >=
                                                                                                100
                                                                                                    ? "bg-green-500"
                                                                                                    : "bg-blue-500"
                                                                                            }`}
                                                                                            style={{
                                                                                                width: `${percentage}%`,
                                                                                            }}
                                                                                        ></div>
                                                                                    </div>
                                                                                    <p className="text-xs text-gray-500 mt-1 text-right">
                                                                                        {
                                                                                            percentage
                                                                                        }

                                                                                        %
                                                                                        Complete
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}
                                                        </div>
                                                    ) : (
                                                        item.submenu
                                                            .filter((sub) =>
                                                                sub.roles.some(
                                                                    (role) =>
                                                                        userRoles.includes(
                                                                            role,
                                                                        ),
                                                                ),
                                                            )
                                                            .map((sub) => (
                                                                <SidebarMenuItem
                                                                    key={
                                                                        sub.title
                                                                    }
                                                                >
                                                                    <SidebarMenuButton
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={
                                                                                sub.url
                                                                            }
                                                                            className={`flex items-center pl-8 pr-2 py-2 my-1 rounded-md transition-all duration-200 ${
                                                                                isActive(
                                                                                    sub.url,
                                                                                )
                                                                                    ? "bg-gray-200 text-gray-900 font-semibold"
                                                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                                                            }`}
                                                                        >
                                                                            <sub.icon className="mr-2 h-4 w-4" />
                                                                            <span>
                                                                                {
                                                                                    sub.title
                                                                                }
                                                                            </span>
                                                                        </a>
                                                                    </SidebarMenuButton>
                                                                </SidebarMenuItem>
                                                            ))
                                                    )}
                                                </SidebarGroupContent>
                                            )}
                                        </SidebarGroupContent>
                                    )}
                                </div>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="bg-white border-t border-gray-200">
                <NavUser user={user} auth={auth} />
            </SidebarFooter>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                }}
                onConfirm={confirmDelete}
                residentId={recordToDelete}
            />
        </Sidebar>
    );
}
