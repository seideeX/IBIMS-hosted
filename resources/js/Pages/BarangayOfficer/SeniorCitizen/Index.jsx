import React, {
    useCallback,
    useMemo,
    useState,
    useEffect,
    Suspense,
} from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Eye,
    Search,
    SquarePen,
    Trash2,
    UserCheck,
    IdCard,
} from "lucide-react";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import DynamicTable from "@/Components/DynamicTable";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import SidebarModal from "@/Components/SidebarModal";
import FilterToggle from "@/Components/FilterButtons/FillterToggle";
import PersonDetailContent from "@/Components/SidebarModalContents/PersonDetailContent";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import { Toaster, toast } from "sonner";
import debounce from "lodash.debounce";
import * as CONSTANTS from "@/constants";
import ActionMenu from "@/Components/ActionMenu";
import ExportButton from "@/Components/ExportButton";
import { toTitleCase } from "@/utils/stringFormat";
import PageHeader from "@/Components/PageHeader";

// Lazy load heavy form (optional)
const SeniorForm = React.lazy(() => import("./SeniorForm"));

export default function Index({
    seniorCitizens: initialSeniors,
    puroks,
    queryParams: initialQueryParams = {},
}) {
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;
    const APP_URL = useAppUrl();

    // Query/search state
    const [queryParams, setQueryParams] = useState(() => ({
        ...initialQueryParams,
    }));
    const [query, setQuery] = useState(queryParams["name"] ?? "");

    // modal + selection
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null); // for view
    const [registerSenior, setRegisterSenior] = useState(null); // when registering a new senior
    const [seniorDetails, setSeniorDetails] = useState(null); // when editing

    // delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState(null);

    // table / UI
    const [showFilters, setShowFilters] = useState(false);
    // const [isPaginated, setIsPaginated] = useState(true);
    // const [showAll, setShowAll] = useState(false);

    // resident cache to avoid refetching
    const [residentCache, setResidentCache] = useState({});

    // columns definition
    const allColumns = useMemo(
        () => [
            { key: "id", label: "ID" },
            { key: "purok_number", label: "Purok" },
            { key: "name", label: "Senior Name" },
            { key: "sex", label: "Sex" },
            { key: "birthdate", label: "Birthdate" },
            { key: "age", label: "Age" },
            { key: "is_pensioner", label: "Pensioner" },
            { key: "osca_id_number", label: "OSCA Number" },
            { key: "pension_type", label: "Pension Type" },
            { key: "living_alone", label: "Living Alone" },
            { key: "registered_senior", label: "Registered Senior" },
            { key: "actions", label: "Actions" },
        ],
        [],
    );

    // visible columns persisted to localStorage
    const [visibleColumns, setVisibleColumns] = useState(() => {
        try {
            const saved = localStorage.getItem("household_visible_columns");
            return saved ? JSON.parse(saved) : allColumns.map((c) => c.key);
        } catch {
            return allColumns.map((c) => c.key);
        }
    });

    useEffect(() => {
        localStorage.setItem(
            "household_visible_columns",
            JSON.stringify(visibleColumns),
        );
    }, [visibleColumns]);

    // age calculation memoized
    const calculateAge = useCallback((birthdate) => {
        if (!birthdate) return "Unknown";
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }, []);

    // inertia form for register/edit senior
    const { data, setData, post, errors, reset, clearErrors } = useForm({
        resident_id: null,
        resident_image: null,
        resident_name: "",
        gender: null,
        birthdate: null,
        purok_number: null,
        osca_id_number: "",
        is_pensioner: null,
        pension_type: null,
        living_alone: null,
        senior_id: null,
        _method: undefined,
    });

    // debounced search to reduce reloads
    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                const params = { ...queryParams };
                if (value && value.trim() !== "") params.name = value;
                else delete params.name;
                if (params.page) delete params.page;
                setQueryParams(params);
                router.get(
                    route("senior_citizen.index", params),
                    {},
                    { preserveState: true, preserveScroll: true },
                );
            }, 450),
        [queryParams],
    );

    // handlers
    const searchFieldName = (field, value) => {
        const params = { ...queryParams };
        if (value && value.trim() !== "") params[field] = value;
        else delete params[field];
        if (params.page) delete params.page;
        setQueryParams(params);
        router.get(
            route("senior_citizen.index", params),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        searchFieldName("name", query);
    };

    const onKeyPressed = (field, e) => {
        if (e.key === "Enter") searchFieldName(field, e.target.value);
    };

    const handleView = useCallback(
        async (residentId) => {
            try {
                if (residentCache[residentId]) {
                    setSelectedResident(residentCache[residentId]);
                } else {
                    const response = await axios.get(
                        `${APP_URL}/resident/showresident/${residentId}`,
                    );
                    setResidentCache((prev) => ({
                        ...prev,
                        [residentId]: response.data.resident,
                    }));
                    setSelectedResident(response.data.resident);
                }
                setIsModalOpen(true);
            } catch (err) {
                console.error("Error fetching resident:", err);
                toast.error("Failed to fetch resident details");
            }
        },
        [residentCache, APP_URL],
    );

    const handleRegister = (id) => {
        // find resident record from props (paginated or plain)
        const resident = (initialSeniors?.data ?? initialSeniors)?.find(
            (r) => r.id == id,
        );
        if (resident) {
            setIsModalOpen(true);
            setRegisterSenior(resident);
            setData("resident_id", resident.id);
            setData(
                "resident_name",
                `${resident.firstname} ${resident.middlename ?? ""} ${
                    resident.lastname ?? ""
                } ${resident.suffix ?? ""}`,
            );
            setData("purok_number", resident.purok_number);
            setData("birthdate", resident.birthdate);
            setData("resident_image", resident.resident_picture_path);
        }
    };

    const handleSubmitRegistration = (e) => {
        e.preventDefault();
        post(route("senior_citizen.store"), {
            onError: (errs) => {
                console.error("Validation Errors:", errs);
                const messages = Object.values(errs);
                toast.error("Validation Error", {
                    description: (
                        <ul>
                            {messages.map((m, i) => (
                                <li key={i}>{m}</li>
                            ))}
                        </ul>
                    ),
                });
            },
        });
    };

    const handleUpdateRegistration = (e) => {
        e.preventDefault();
        post(route("senior_citizen.update", data.senior_id), {
            onError: (errs) => {
                console.error("Validation Errors:", errs);
                const messages = Object.values(errs);
                toast.error("Validation Error", {
                    description: (
                        <ul>
                            {messages.map((m, i) => (
                                <li key={i}>{m}</li>
                            ))}
                        </ul>
                    ),
                });
            },
        });
    };

    const handleEdit = useCallback(
        async (seniorId) => {
            try {
                const response = await axios.get(
                    `${APP_URL}/senior_citizen/seniordetails/${seniorId}`,
                );
                const resident = response.data.seniordetails;
                setSeniorDetails(resident);

                setData("resident_id", resident.id);
                setData(
                    "resident_name",
                    `${resident.firstname} ${resident.middlename ?? ""} ${
                        resident.lastname ?? ""
                    } ${resident.suffix ?? ""}`,
                );
                setData("purok_number", resident.purok_number);
                setData("birthdate", resident.birthdate);
                setData("resident_image", resident.resident_picture_path);
                setData(
                    "osca_id_number",
                    resident.seniorcitizen?.osca_id_number
                        ? resident.seniorcitizen.osca_id_number.toString()
                        : "",
                );
                setData(
                    "is_pensioner",
                    resident.seniorcitizen?.is_pensioner || "",
                );
                setData(
                    "pension_type",
                    resident.seniorcitizen?.pension_type || "",
                );
                setData(
                    "living_alone",
                    resident.seniorcitizen?.living_alone || "",
                );
                setData("senior_id", resident.seniorcitizen.id);
                setData("_method", "PUT");

                setIsModalOpen(true);
            } catch (err) {
                console.error("Error fetching senior details:", err);
                toast.error("Failed to fetch senior details");
            }
        },
        [APP_URL, setData],
    );

    const handleDeleteClick = (id) => {
        setResidentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("senior_citizen.destroy", residentToDelete));
        setIsDeleteModalOpen(false);
    };

    // column renderers (uses handlers above)
    const columnRenderers = useMemo(
        () => ({
            id: (resident) => resident.id,
            purok_number: (resident) => (
                <span className="text-gray-800">{resident.purok_number}</span>
            ),
            name: (resident) => (
                <Link
                    href={route("resident.edit", resident.id)}
                    className="hover:text-blue-500 hover:underline"
                >
                    {toTitleCase(
                        `${resident.firstname} ${resident.middlename ?? ""} ${
                            resident.lastname ?? ""
                        }`,
                    )}
                    {resident.suffix ? `, ${resident.suffix}` : ""}
                </Link>
            ),
            sex: (resident) => {
                const genderKey = resident.sex;
                const label =
                    CONSTANTS.RESIDENT_GENDER_TEXT2[genderKey] ?? "Unknown";
                const className =
                    CONSTANTS.RESIDENT_GENDER_COLOR_CLASS[genderKey] ??
                    "bg-gray-300";
                return (
                    <span
                        className={`py-1 px-2 rounded-xl text-sm font-medium whitespace-nowrap ${className}`}
                    >
                        {label}
                    </span>
                );
            },
            birthdate: (resident) => {
                const date = resident.birthdate;
                if (!date)
                    return <span className="text-gray-400 italic">N/A</span>;
                const birthdate = new Date(date);
                return birthdate.toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            },
            age: (resident) => calculateAge(resident.birthdate),
            is_pensioner: (resident) =>
                resident.seniorcitizen == null ? (
                    <span className="text-yellow-600 font-medium">Pending</span>
                ) : resident.seniorcitizen.is_pensioner?.toLowerCase() ===
                  "yes" ? (
                    <span className="text-green-600 font-medium">Yes</span>
                ) : (
                    <span className="text-gray-500">No</span>
                ),
            osca_id_number: (resident) =>
                resident.seniorcitizen?.osca_id_number ? (
                    <span className="text-gray-800">
                        {resident.seniorcitizen.osca_id_number}
                    </span>
                ) : (
                    <span className="text-gray-400 italic">Not Assigned</span>
                ),
            pension_type: (resident) => {
                const value = resident.seniorcitizen?.pension_type;
                if (!value || value.toLowerCase() === "none") {
                    return <span className="text-gray-400 italic">None</span>;
                }
                return <span className="text-gray-800">{value}</span>;
            },
            living_alone: (resident) =>
                resident.seniorcitizen?.living_alone == 1 ? (
                    <span className="text-red-600 font-medium">Yes</span>
                ) : (
                    <span className="text-gray-500">No</span>
                ),
            registered_senior: (resident) =>
                resident.seniorcitizen ? (
                    <span className="text-green-600 font-medium">Yes</span>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-red-500 italic">No</span>
                    </div>
                ),
            actions: (resident) => {
                const isRegistered = !!resident.seniorcitizen;

                const baseActions = [
                    {
                        label: "View",
                        icon: <Eye className="w-4 h-4 text-indigo-600" />,
                        onClick: () => handleView(resident.id),
                    },
                ];

                if (isRegistered) {
                    baseActions.push(
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
                            onClick: () =>
                                handleDeleteClick(resident.seniorcitizen.id),
                        },
                    );
                } else {
                    baseActions.push({
                        label: "Register",
                        icon: <UserCheck className="w-4 h-4 text-blue-500" />,
                        onClick: () => handleRegister(resident.id),
                    });
                }
                return (
                    <div className="max-w-[140px] sm:max-w-none overflow-hidden">
                        <ActionMenu actions={baseActions} />
                    </div>
                );
            },
        }),
        [calculateAge, handleEdit],
    );

    // success / error handling from server
    useEffect(() => {
        if (success) {
            // close modal and show toast
            setIsModalOpen(false);
            reset();
            clearErrors();
            setRegisterSenior(null);
            setSeniorDetails(null);
            toast.success(success, { description: "Operation successful!" });
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            toast.error(error, { description: "Operation failed!" });
        }
    }, [error]);

    return (
        <AdminLayout>
            <Head title="Senior Citizen" />
            <BreadCrumbsHeader
                breadcrumbs={[
                    { label: "Residents Information", showOnMobile: false },
                    { label: "Senior Citizen", showOnMobile: true },
                ]}
            />
            <Toaster richColors />

            <div className="p-2 md:p-4">
                <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                        <PageHeader
                            title="Senior Citizen Records"
                            description="Manage and monitor senior citizen information including personal profiles, eligibility details, benefits status, and demographic data for the City of Ilagan, Isabela. Maintain accurate records to support healthcare programs, social services, emergency response planning, and community welfare initiatives for elderly residents across barangays."
                            icon={IdCard}
                            badge={
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                        Barangay/City Registry
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-200">
                                        OSCA
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                        City Health Office
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                        CDRRMO
                                    </span>
                                </div>
                            }
                            iconWrapperClassName="bg-yellow-100 text-yellow-600 shadow-sm"
                            containerClassName="border"
                            titleClassName="tracking-tight"
                            descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
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
                                    url="report/export-seniorcitizen-excel"
                                    queryParams={queryParams}
                                />
                                <ExportButton
                                    url="report/export-seniorcitizen-pdf"
                                    queryParams={queryParams}
                                    type="pdf"
                                    totalRecords={initialSeniors.total} // disables if total > 500
                                />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <form
                                    onSubmit={handleSubmit}
                                    className="flex w-[300px] max-w-lg items-center space-x-1"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Search Name"
                                        value={query}
                                        onChange={(e) => {
                                            setQuery(e.target.value);
                                            debouncedSearch(e.target.value);
                                        }}
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
                                    "gender",
                                    "is_pensioner",
                                    "pension_type",
                                    "living_alone",
                                    "birth_month",
                                    "is_registered",
                                ]}
                                puroks={puroks}
                                showFilters={true}
                                pensionTypes={[
                                    { label: "SSS", value: "SSS" },
                                    { label: "DSWD", value: "DSWD" },
                                    { label: "GSIS", value: "GSIS" },
                                    { label: "private", value: "private" },
                                    { label: "none", value: "none" },
                                ]}
                                months={[
                                    { label: "January", value: "1" },
                                    { label: "February", value: "2" },
                                    { label: "March", value: "3" },
                                    { label: "April", value: "4" },
                                    { label: "May", value: "5" },
                                    { label: "June", value: "6" },
                                    { label: "July", value: "7" },
                                    { label: "August", value: "8" },
                                    { label: "September", value: "9" },
                                    { label: "October", value: "10" },
                                    { label: "November", value: "11" },
                                    { label: "December", value: "12" },
                                ]}
                                clearRouteName="senior_citizen.index"
                                clearRouteParams={{}}
                            />
                        )}

                        <DynamicTable
                            passedData={initialSeniors}
                            columnRenderers={columnRenderers}
                            allColumns={allColumns}
                            visibleColumns={visibleColumns}
                            showTotal={true}
                        />
                    </div>
                </div>
            </div>

            <SidebarModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    reset();
                    clearErrors();
                    setRegisterSenior(null);
                    setSelectedResident(null);
                    setSeniorDetails(null);
                }}
                title={
                    registerSenior
                        ? "Register Senior Citizen"
                        : seniorDetails
                          ? "Edit Senior Citizen Details"
                          : selectedResident
                            ? "Resident Details"
                            : ""
                }
            >
                {selectedResident && (
                    <PersonDetailContent person={selectedResident} />
                )}

                {(registerSenior != null || seniorDetails != null) && (
                    <Suspense fallback={<div>Loading form...</div>}>
                        <SeniorForm
                            data={data}
                            errors={errors}
                            setData={setData}
                            reset={reset}
                            onSubmit={
                                seniorDetails
                                    ? handleUpdateRegistration
                                    : handleSubmitRegistration
                            }
                            registerSenior={registerSenior}
                        />
                    </Suspense>
                )}
            </SidebarModal>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                residentId={residentToDelete}
            />
        </AdminLayout>
    );
}
