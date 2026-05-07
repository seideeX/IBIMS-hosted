import ActionMenu from "@/Components/ActionMenu";
import BreadCrumbsHeader from "@/Components/BreadcrumbsHeader";
import DynamicTable from "@/Components/DynamicTable";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    Eye,
    GraduationCap,
    HousePlus,
    ListPlus,
    MoveRight,
    RotateCcw,
    Search,
    SquarePen,
    SquarePlus,
    Trash2,
    UserPlus,
    UserRoundPlus,
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
    EDUCATION_LEVEL_TEXT,
    EDUCATION_SCHOOL_TYPE,
    EDUCATION_STATUS_TEXT,
} from "@/constants";
import useResidentChangeHandler from "@/hooks/handleResidentChange";
import { IoIosAddCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import SelectField from "@/Components/SelectField";
import YearDropdown from "@/Components/YearDropdown";
import DeleteConfirmationModal from "@/Components/DeleteConfirmationModal";
import ExportButton from "@/Components/ExportButton";
import { toTitleCase } from "@/utils/stringFormat";
import EducationHistorySidebarModal from "./Partials/EducationHistorySidebarModal";
import PageHeader from "@/Components/PageHeader";

export default function Index({
    educations,
    puroks,
    queryParams = null,
    residents,
}) {
    const breadcrumbs = [
        { label: "Residents Information", showOnMobile: false },
        { label: "Residents Education", showOnMobile: true },
    ];
    queryParams = queryParams || {};
    const APP_URL = useAppUrl();
    const props = usePage().props;
    const success = props?.success ?? null;
    const error = props?.error ?? null;

    const [query, setQuery] = useState(queryParams["name"] ?? "");

    // filter form handling
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
        router.get(route("education.index", queryParams));
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

    // active filters
    const hasActiveFilter = Object.entries(queryParams || {}).some(
        ([key, value]) =>
            [
                "purok",
                "educational_attainment",
                "educational_status",
                "school_type",
                "year_started",
                "year_ended",
                "latest_education",
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
        { key: "id", label: "Histoy ID" },
        { key: "name", label: "Name" },
        { key: "educational_attainment", label: "Educational Attainment" },
        { key: "education_status", label: "Education Status" },
        { key: "school_name", label: "School Name" },
        { key: "school_type", label: "School Type" },
        { key: "year_started", label: "Year Started" },
        { key: "year_ended", label: "Year Ended" },
        { key: "program", label: "Program (Course)" },
        { key: "purok_number", label: "Purok" },
        { key: "actions", label: "Actions" },
    ];

    // action buttons
    const [showFilters, setShowFilters] = useState(hasActiveFilter);
    const [selectedResident, setSelectedResident] = useState(null);
    const [educationHistory, setEducationHistory] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); //delete
    const [deleteHistoryID, setDeleteHistoryID] = useState(null); //delete

    const defaultVisibleCols = allColumns.map((col) => col.key);
    const [visibleColumns, setVisibleColumns] = useState(() => {
        const saved = localStorage.getItem("education_visible_columns");
        return saved ? JSON.parse(saved) : defaultVisibleCols;
    });
    useEffect(() => {
        localStorage.setItem(
            "education_visible_columns",
            JSON.stringify(visibleColumns),
        );
    }, [visibleColumns]);

    // list of residents for dropdown
    const residentsList = residents.map((res) => ({
        label: `${res.firstname} ${res.middlename} ${res.lastname} ${
            res.suffix ?? ""
        }`,
        value: res.id.toString(),
    }));

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

    const columnRenderers = {
        id: (row) => row.id ?? "—",

        name: (row) => {
            const r = row?.resident;
            if (!r)
                return <span className="text-gray-400 italic">Unknown</span>;
            const fullName = toTitleCase(
                `${r.firstname ?? ""} ${r.middlename ?? ""} ${
                    r.lastname ?? ""
                } ${r.suffix ?? ""}`,
            ).trim();
            return (
                fullName || (
                    <span className="text-gray-400 italic">Not specified</span>
                )
            );
        },

        educational_attainment: (row) =>
            EDUCATION_LEVEL_TEXT[row.educational_attainment] ?? (
                <span className="text-gray-400 italic">Not specified</span>
            ),

        education_status: (row) => {
            const status = row.education_status;
            const label = EDUCATION_STATUS_TEXT[status] || "N/A";

            const badgeMap = {
                graduated: "bg-green-100 text-green-800",
                enrolled: "bg-blue-100 text-blue-800",
                incomplete: "bg-yellow-100 text-yellow-800",
                dropped_out: "bg-red-100 text-red-800",
            };

            const badgeClass = badgeMap[status] || "bg-gray-100 text-gray-600";

            return (
                <span
                    className={`px-2 py-1 text-xs font-medium rounded ${badgeClass}`}
                >
                    {label}
                </span>
            );
        },

        school_name: (row) =>
            row.school_name ?? (
                <span className="text-gray-400 italic">Not specified</span>
            ),

        school_type: (row) => {
            const type = row.school_type;
            const label = EDUCATION_SCHOOL_TYPE[type] ?? "Not specified";
            const badgeClass =
                type === "private"
                    ? "bg-purple-100 text-purple-800"
                    : type === "public"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600";

            return (
                <span className={`px-2 py-1 text-xs rounded ${badgeClass}`}>
                    {label}
                </span>
            );
        },

        year_started: (row) =>
            row.year_started ?? (
                <span className="text-gray-400 italic">Not specified</span>
            ),

        year_ended: (row) =>
            row.year_ended ?? (
                <span className="text-gray-400 italic">Not specified</span>
            ),

        program: (row) =>
            row.program ?? (
                <span className="text-gray-400 italic">Not specified</span>
            ),

        purok_number: (row) =>
            row?.resident?.purok_number ?? (
                <span className="text-gray-400 italic">Not specified</span>
            ),

        actions: (row) => (
            <ActionMenu
                actions={[
                    {
                        label: "View",
                        icon: <Eye className="w-4 h-4 text-indigo-600" />,
                        onClick: () => handleView(row?.resident?.id),
                    },
                    {
                        label: "Edit",
                        icon: <SquarePen className="w-4 h-4 text-green-500" />,
                        onClick: () => handleEdit(row?.id),
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

    // Form handling
    const { data, setData, post, errors, reset, clearErrors } = useForm({
        resident_id: null,
        resident_name: "",
        resident_image: null,
        birthdate: null,
        purok_number: null,
        educational_histories: [[]],
        history_id: null,
        _method: undefined,
    });
    const handleResidentChange = useResidentChangeHandler(residents, setData);

    const handleAddEducation = () => {
        setModalState("add");
        setIsModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        post(route("education.store"), {
            onError: () => {
                console.error("Validation Errors:", errors);
            },
        });
    };
    const handleEditSubmit = (e) => {
        e.preventDefault();
        post(route("education.update", data.history_id), {
            onError: () => {
                console.error("Validation Errors:", errors);
            },
        });
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalState("");
        setEducationHistory(null);
        reset();
        clearErrors();
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

    const addEducation = () => {
        setData("educational_histories", [
            ...(data.educational_histories || []),
            {},
        ]);
    };

    const removeEducation = (occIndex) => {
        const updated = [...(data.educational_histories || [])];
        updated.splice(occIndex, 1);
        setData("educational_histories", updated);
        toast.warning("History removed.", {
            duration: 2000,
        });
    };

    const handleArrayValues = (e, index, column, array) => {
        const updated = [...(data[array] || [])];
        updated[index] = {
            ...updated[index],
            [column]: e.target.value,
        };
        setData(array, updated);
    };

    const handleEdit = async (id) => {
        setModalState("add");
        setEducationHistory(null);
        try {
            const response = await axios.get(
                `${APP_URL}/education/history/${id}`,
            );
            const history = response.data.history;
            setEducationHistory(history);
            setData("resident_id", history.resident.id);
            setData(
                "resident_name",
                `${history.resident.firstname} ${history.resident.middlename} ${
                    history.resident.lastname
                } ${history.resident.suffix ?? ""}`,
            );
            setData("purok_number", history.resident.purok_number);
            setData("birthdate", history.resident.birthdate);
            setData("resident_image", history.resident.resident_picture_path);
            setData("educational_histories", [
                {
                    education: history.educational_attainment || "",
                    education_status: history.education_status || "",
                    school_name: history.school_name || "",
                    program: history.program || "",
                    school_type: history.school_type || "",
                    year_ended: history.year_ended || "",
                    year_started: history.year_started || "",
                },
            ]);
            setData("history_id", history.id);
            setData("_method", "PUT");
        } catch (error) {
            console.error("Error fetching placeholders:", error);
        }
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteHistoryID(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route("education.destroy", deleteHistoryID));
        setIsDeleteModalOpen(false);
    };

    return (
        <AdminLayout>
            <Head title="Resident Education" />
            <BreadCrumbsHeader breadcrumbs={breadcrumbs} />
            <Toaster richColors />
            <div className="p-2 md:p-4">
                <div className="mx-auto max-w-8xl px-2 sm:px-4 lg:px-6">
                    {/* <pre>{JSON.stringify(educations, undefined, 3)}</pre> */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-lg p-4 m-0">
                        <PageHeader
                            title="Education Records"
                            description="Track and manage resident educational information across the barangays of the City of Ilagan, Isabela including educational attainment, school details, academic status, literacy levels, and scholarship-related data. Maintain accurate education records to support demographic analysis, workforce planning, educational assistance programs, and community development initiatives."
                            icon={GraduationCap}
                            badge={
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                                        DepEd Ilagan
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                                        TESDA
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                                        CHED
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
                                        DSWD
                                    </span>

                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                                        Scholarship Programs
                                    </span>
                                </div>
                            }
                            iconWrapperClassName="bg-green-100 text-green-600 shadow-sm"
                            containerClassName="border border-green-100 bg-gradient-to-r from-white via-slate-50 to-green-50/60 shadow-sm"
                            titleClassName="tracking-tight"
                            descriptionClassName="max-w-3xl text-sm leading-6 text-slate-600"
                            actions={
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 border-blue-300 bg-white text-blue-700 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                                        onClick={handleAddEducation}
                                        type="button"
                                    >
                                        <ListPlus className="h-4 w-4" />
                                        Add Education
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
                                    url="report/export-education-excel"
                                    queryParams={queryParams}
                                    label="Export Resident Educations as XLSX"
                                />
                                <ExportButton
                                    url="report/export-education-pdf"
                                    queryParams={queryParams}
                                    label="Export Education Histories as PDF"
                                    type="pdf"
                                    totalRecords={educations.total}
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
                                    "educational_attainment",
                                    "educational_status",
                                    "school_type",
                                    "year_started",
                                    "year_ended",
                                    "latest_education",
                                ]}
                                puroks={puroks}
                                showFilters={true}
                                clearRouteName="education.index"
                                clearRouteParams={{}}
                            />
                        )}
                        <DynamicTable
                            passedData={educations}
                            allColumns={allColumns}
                            columnRenderers={columnRenderers}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            showTotal={true}
                        />
                    </div>
                </div>
            </div>
            <EducationHistorySidebarModal
                isModalOpen={isModalOpen}
                handleModalClose={handleModalClose}
                modalState={modalState}
                educationHistory={educationHistory}
                data={data}
                errors={errors}
                residentsList={residentsList}
                handleResidentChange={handleResidentChange}
                handleEditSubmit={handleEditSubmit}
                handleAddSubmit={handleAddSubmit}
                handleArrayValues={handleArrayValues}
                removeEducation={removeEducation}
                addEducation={addEducation}
                reset={reset}
                selectedResident={selectedResident}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                }}
                onConfirm={confirmDelete}
                residentId={deleteHistoryID}
            />
        </AdminLayout>
    );
}
