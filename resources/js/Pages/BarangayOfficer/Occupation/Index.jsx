import ActionMenu from "@/Components/ActionMenu";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import DynamicTable from "@/Components/DynamicTable";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    Badge,
    Briefcase,
    Eye,
    HousePlus,
    ListPlus,
    MoveRight,
    Pencil,
    RotateCcw,
    Search,
    SquarePen,
    SquarePlus,
    Trash2,
    User,
    UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { IoIosArrowForward } from "react-icons/io";
import FilterToggle from "@/Components/FilterButtons/FillterToggle";
import DynamicTableControls from "@/Components/FilterButtons/DynamicTableControls";
import PersonDetailContent from "@/Components/SidebarModalContents/PersonDetailContent";
import SidebarModal from "@/Components/SidebarModal";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import InputLabel from "@/Components/InputLabel";
import InputField from "@/Components/InputField";
import InputError from "@/Components/InputError";
import RadioGroup from "@/Components/RadioGroup";
import DropdownInputField from "@/Components/DropdownInputField";
import { Toaster, toast } from "sonner";
import {
    EMPLOYMENT_TYPE_TEXT,
    OCCUPATION_STATUS_TEXT,
    RESIDENT_EMPLOYMENT_STATUS_TEXT,
    WORK_ARRANGEMENT_TEXT,
} from "@/constants";
import useResidentChangeHandler from "@/hooks/handleResidentChange";
import SelectField from "@/Components/SelectField";
import YearDropdown from "@/Components/YearDropdown";
import { IoIosAddCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import ExportButton from "@/Components/ExportButton";
import { toTitleCase } from "@/utils/stringFormat";
import OccupationSidebarModal from "./Partials/OccupationSidebarModal";
import PageHeader from "@/Components/PageHeader";

export default function Index({
    occupations,
    puroks,
    queryParams = null,
    residents = [],
    occupationTypes = [],
}) {
    const breadcrumbs = [
        { label: "Residents Information", showOnMobile: false },
        { label: "Residents Occupation", showOnMobile: true },
    ];
    queryParams = queryParams || {};
    const APP_URL = useAppUrl();
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;

    const [query, setQuery] = useState(queryParams["name"] ?? "");
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
        router.get(route("occupation.index", queryParams));
    };
    const onKeyPressed = (field, e) => {
        if (e.key === "Enter") {
            searchFieldName(field, e.target.value);
        } else {
            return;
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalState, setModalState] = useState("");
    const [occupationDetails, setOccupation] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); //delete
    const [residentToDelete, setResidentToDelete] = useState(null); //delete

    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            [
                "purok",
                "employment_type",
                "work_arrangement",
                "occupation_status",
                "is_ofw",
                "year_started",
                "year_ended",
                "latest_occupation",
            ].includes(key) &&
            value &&
            value !== "",
    );
    useEffect(() => {
        if (hasActiveFilter) {
            setShowFilters(true);
        }
    }, [hasActiveFilter]);

    const allColumns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "occupation", label: "Occupation / Livelihood" },
        { key: "employment_type", label: "Employment Type" },
        { key: "work_arrangement", label: "Work Arrangement" },
        { key: "occupation_status", label: "Status" },
        { key: "started_at", label: "Year Started" },
        { key: "ended_at", label: "Year Ended" },
        { key: "is_ofw", label: "Is OFW?" },
        { key: "is_main", label: "Is Main Livelihood?" },
        { key: "purok_number", label: "Purok" },
        { key: "actions", label: "Actions" },
    ];

    const [showFilters, setShowFilters] = useState(hasActiveFilter);
    // const toggleShowFilters = () => setShowFilters((prev) => !prev);
    // const [isPaginated, setIsPaginated] = useState(true);
    // const [showAll, setShowAll] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const defaultVisibleCols = allColumns.map((col) => col.key);
    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem("occupation_visible_columns");
        return saved ? JSON.parse(saved) : defaultVisibleCols;
    });
    useEffect(() => {
        localStorage.setItem(
            "occupation_visible_columns",
            JSON.stringify(visibleColumns),
        );
    }, [visibleColumns]);

    const columnRenderers = {
        id: (row) => row.id ?? "—",

        name: (row) => {
            const { firstname, middlename, lastname, suffix } =
                row.resident ?? {};
            const fullName = toTitleCase(
                `${firstname ?? ""} ${middlename ?? ""} ${lastname ?? ""} ${
                    suffix ?? ""
                }`,
            ).trim();
            return (
                fullName || (
                    <span className="text-gray-400 italic">Not specified</span>
                )
            );
        },

        occupation: (row) => (
            <span className="text-xs text-gray-800">
                {row.occupation ?? (
                    <span className="text-gray-400 italic">Not specified</span>
                )}
            </span>
        ),

        employment_type: (row) => (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md text-xs font-medium capitalize">
                {EMPLOYMENT_TYPE_TEXT[row.employment_type] ?? "Not specified"}
            </span>
        ),

        work_arrangement: (row) => (
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md text-xs font-medium capitalize">
                {WORK_ARRANGEMENT_TEXT[row.work_arrangement] ?? "Not specified"}
            </span>
        ),

        occupation_status: (row) => {
            const value = row.occupation_status ?? null;
            const statusColor =
                value === "active"
                    ? "bg-green-100 text-green-800"
                    : value === "inactive"
                      ? "bg-red-100 text-red-800"
                      : value === "retired"
                        ? "bg-gray-100 text-gray-700"
                        : value === "ended"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600";

            return (
                <span
                    className={`${statusColor} px-2 py-0.5 rounded-md text-xs font-medium capitalize`}
                >
                    {value
                        ? OCCUPATION_STATUS_TEXT[value] ||
                          value.replaceAll("_", " ")
                        : "Not specified"}
                </span>
            );
        },

        started_at: (row) => (
            <span className="text-xs text-gray-700">
                {row.started_at ?? (
                    <span className="text-gray-400 italic">Not specified</span>
                )}
            </span>
        ),

        ended_at: (row) => (
            <span className="text-xs text-gray-700">
                {row.ended_at ?? (
                    <span className="text-gray-400 italic">Not specified</span>
                )}
            </span>
        ),

        is_ofw: (row) => (
            <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                    row.is_ofw
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                }`}
            >
                {row.is_ofw ? "Yes" : "No"}
            </span>
        ),

        is_main: (row) => (
            <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                    row.is_main_livelihood
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                }`}
            >
                {row.is_main_livelihood ? "Yes" : "No"}
            </span>
        ),

        purok_number: (row) => (
            <span className="text-xs text-gray-800">
                {row.resident?.purok_number ?? (
                    <span className="text-gray-400 italic">Not specified</span>
                )}
            </span>
        ),

        actions: (row) => (
            <ActionMenu
                actions={[
                    {
                        label: "View",
                        icon: <Eye className="w-4 h-4 text-indigo-600" />,
                        onClick: () => handleView(row.resident?.id),
                    },
                    {
                        label: "Edit",
                        icon: <SquarePen className="w-4 h-4 text-green-500" />,
                        onClick: () => handleEdit(row.id),
                    },
                    {
                        label: "Delete",
                        icon: <Trash2 className="w-4 h-4 text-red-600" />,
                        onClick: () => handleDeleteClick(row.id),
                    },
                ]}
            />
        ),
    };

    const handleView = async (resident) => {
        setModalState("view");
        setSelectedResident(null);
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

    // list of residents for dropdown
    const residentsList = residents.map((res) => ({
        label: `${res.firstname} ${res.middlename} ${res.lastname} ${
            res.suffix ?? ""
        }`,
        value: res.id.toString(),
    }));

    // Handle Occupation Actions
    const { data, setData, post, errors, reset, clearErrors } = useForm({
        resident_id: null,
        resident_name: "",
        resident_image: null,
        birthdate: null,
        purok_number: null,
        employment_status: null,
        occupations: [[]],
        _method: undefined,
        occupation_id: null,
    });

    const handleResidentChange = useResidentChangeHandler(residents, setData);
    const addOccupation = () => {
        setData("occupations", [...(data.occupations || []), {}]);
    };

    const removeOccupation = (occIndex) => {
        const updated = [...(data.occupations || [])];
        updated.splice(occIndex, 1);
        setData("occupations", updated);
        toast.warning("Occupation removed.", {
            duration: 2000,
        });
    };

    const handleOccupationFieldChange = (e, occIndex, fieldName) => {
        const updated = [...(data.occupations || [])];
        updated[occIndex] = {
            ...updated[occIndex],
            [fieldName]: e.target.value,
        };
        setData("occupations", updated);
    };

    const handleAddOccupation = () => {
        setModalState("add");
        setIsModalOpen(true);
    };

    const handleEdit = async (id) => {
        setModalState("add");

        try {
            const response = await axios.get(
                `${APP_URL}/occupation/details/${id}`,
            );
            const occupation = response.data.occupation;
            console.log(occupation);
            setOccupation(occupation);
            setData({
                resident_id: occupation.resident.id,
                resident_name: `${occupation.resident.firstname} ${
                    occupation.resident.middlename ?? ""
                } ${occupation.resident.lastname}`,
                resident_image: occupation.resident.image ?? null,
                birthdate: occupation.resident.birthdate ?? null,
                purok_number: occupation.resident.purok_number ?? null,
                employment_status: occupation.resident.employment_status,
                occupations: [
                    {
                        employer: occupation.employer || "",
                        occupation: occupation.occupation || "",
                        occupation_status: occupation.occupation_status || "",
                        employment_type: occupation.employment_type || "",
                        is_ofw: occupation.is_ofw
                            ? occupation.is_ofw.toString()
                            : "0",
                        is_main_livelihood: occupation.is_main_livelihood
                            ? occupation.is_main_livelihood.toString()
                            : "0",
                        work_arrangement: occupation.work_arrangement || "",
                        income: occupation.monthly_income || 0,
                        income_frequency: "monthly",
                        started_at: occupation.started_at || "",
                        ended_at: occupation.ended_at || "",
                    },
                ],
                _method: "PUT",
                occupation_id: occupation.id,
            });

            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching occupation details:", error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalState("");
        setOccupation(null);
        reset();
        clearErrors();
    };

    const handleSubmitOccupation = (e) => {
        e.preventDefault();
        post(route("occupation.store"), {
            onError: () => {
                console.error("Validation Errors:", errors);
            },
        });
    };

    const handleUpdateOccupation = (e) => {
        e.preventDefault();
        post(route("occupation.update", data.occupation_id), {
            onError: () => {
                console.error("Validation Errors:", errors);
            },
        });
    };

    const handleDeleteClick = (id) => {
        setResidentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("occupation.destroy", residentToDelete));
        setIsDeleteModalOpen(false);
    };

    useEffect(() => {
        if (success) {
            handleModalClose();
            toast.success(success, {
                description: "Operation successful!",
                duration: 3000,
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
            <Head title="Residents Occupations" />
            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
            <Toaster richColors />
            <div className="p-2 md:p-4">
                <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                    {/* <pre>{JSON.stringify(occupations, undefined, 3)}</pre> */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                        <PageHeader
                            title="Occupation Records"
                            description="Manage and monitor resident occupation information across the barangays of the City of Ilagan, Isabela including employment status, profession, work classification, income source, and labor-related data. Maintain accurate occupational records to support workforce analysis, livelihood programs, economic planning, and community development initiatives."
                            icon={Briefcase}
                            badge={
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-200">
                                        PESO Ilagan
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                        DOLE Region II
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                        Livelihood Programs
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                        Workforce Analysis
                                    </span>
                                </div>
                            }
                            iconWrapperClassName="bg-yellow-100 text-yellow-600 shadow-sm"
                            containerClassName="border border-yellow-100 bg-gradient-to-r from-white via-slate-50 to-yellow-50/60 shadow-sm"
                            titleClassName="tracking-tight"
                            descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
                            actions={
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 border-blue-300 bg-white text-blue-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                                        onClick={handleAddOccupation}
                                        type="button"
                                    >
                                        <ListPlus className="h-4 w-4" />
                                        Add Occupation
                                    </Button>
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
                                    url="report/export-occupations-excel"
                                    queryParams={queryParams}
                                    label="Export Resident Occupations as XLSX"
                                />
                                <ExportButton
                                    url="report/export-occupations-pdf"
                                    queryParams={queryParams}
                                    label="Export Education Histories as PDF"
                                    type="pdf"
                                    totalRecords={occupations.total}
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
                                    "employment_type",
                                    "work_arrangement",
                                    "occupation_status",
                                    "is_ofw",
                                    "year_started",
                                    "year_ended",
                                    "latest_occupation",
                                ]}
                                puroks={puroks}
                                showFilters={true}
                                clearRouteName="occupation.index"
                                clearRouteParams={{}}
                            />
                        )}
                        <DynamicTable
                            passedData={occupations}
                            allColumns={allColumns}
                            columnRenderers={columnRenderers}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            showTotal={true}
                        />
                    </div>
                </div>
            </div>
            <OccupationSidebarModal
                isModalOpen={isModalOpen}
                handleModalClose={handleModalClose}
                modalState={modalState}
                occupationDetails={occupationDetails}
                data={data}
                errors={errors}
                residentsList={residentsList}
                handleResidentChange={handleResidentChange}
                handleUpdateOccupation={handleUpdateOccupation}
                handleSubmitOccupation={handleSubmitOccupation}
                handleOccupationFieldChange={handleOccupationFieldChange}
                occupationTypes={occupationTypes}
                removeOccupation={removeOccupation}
                addOccupation={addOccupation}
                reset={reset}
                selectedResident={selectedResident}
                setData={setData}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                }}
                onConfirm={confirmDelete}
                residentId={residentToDelete}
            />
        </AdminLayout>
    );
}
