import { Button } from "@/components/ui/button";
import SidebarModal from "@/Components/SidebarModal";
import PersonDetailContent from "@/Components/SidebarModalContents/PersonDetailContent";
import DropdownInputField from "@/Components/DropdownInputField";
import InputError from "@/Components/InputError";
import InputField from "@/Components/InputField";
import RadioGroup from "@/Components/RadioGroup";
import SelectField from "@/Components/SelectField";
import YearDropdown from "@/Components/YearDropdown";
import {
    MoveRight,
    BriefcaseBusiness,
    Building2,
    UserRound,
    RotateCcw,
    Plus,
    Trash2,
} from "lucide-react";

export default function OccupationSidebarModal({
    isModalOpen,
    handleModalClose,
    modalState,
    occupationDetails,
    data,
    errors,
    residentsList,
    handleResidentChange,
    handleUpdateOccupation,
    handleSubmitOccupation,
    handleOccupationFieldChange,
    occupationTypes,
    removeOccupation,
    addOccupation,
    reset,
    selectedResident,
    setData,
}) {
    return (
        <SidebarModal
            isOpen={isModalOpen}
            onClose={() => {
                handleModalClose();
            }}
            title={
                modalState === "add" && occupationDetails
                    ? "Edit Occupation"
                    : modalState === "add"
                      ? "Add Occupation"
                      : "View Resident"
            }
        >
            {modalState === "add" && (
                <div className="w-full space-y-6 bg-white p-1 text-sm text-slate-800">
                    <form
                        onSubmit={
                            occupationDetails
                                ? handleUpdateOccupation
                                : handleSubmitOccupation
                        }
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-white p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                                    <BriefcaseBusiness className="h-6 w-6 text-emerald-600" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
                                        {occupationDetails
                                            ? "Update Occupation"
                                            : "Add Occupation"}
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        Manage employment details, work
                                        arrangement, and livelihood information
                                        for the selected resident.
                                    </p>

                                    <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                        {data.resident_name ||
                                            "No resident selected"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resident Information */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h4 className="text-base font-semibold text-slate-900">
                                    Resident Information
                                </h4>
                                <p className="mt-1 text-sm text-slate-500">
                                    Select a resident and review the basic
                                    details before managing occupation records.
                                </p>
                            </div>

                            <div className="space-y-6 p-6">
                                <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
                                    <div className="flex justify-center sm:block">
                                        <img
                                            src={
                                                data.resident_image
                                                    ? `/storage/${data.resident_image}`
                                                    : "/images/default-avatar.jpg"
                                            }
                                            alt="Resident Image"
                                            className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-sm"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1 text-center sm:text-left">
                                        <h5 className="truncate text-base font-semibold text-slate-900">
                                            {data.resident_name ||
                                                "No resident selected"}
                                        </h5>

                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            {data.resident_id
                                                ? "Selected resident profile is ready for occupation record management."
                                                : "Select a resident to automatically display their basic profile details."}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <DropdownInputField
                                        label="Full Name"
                                        name="resident_name"
                                        value={data.resident_name || ""}
                                        placeholder="Select a resident"
                                        onChange={(e) =>
                                            handleResidentChange(e)
                                        }
                                        items={residentsList}
                                        readOnly={occupationDetails}
                                    />
                                    <InputError
                                        message={errors.resident_id}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                    <div>
                                        <InputField
                                            label="Birthdate"
                                            name="birthdate"
                                            value={data.birthdate || ""}
                                            readOnly={true}
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            Resident's registered birthdate.
                                        </p>
                                    </div>

                                    <div>
                                        <InputField
                                            label="Purok Number"
                                            name="purok_number"
                                            value={data.purok_number || ""}
                                            readOnly={true}
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            Assigned purok information.
                                        </p>
                                    </div>

                                    <div className="xl:col-span-2">
                                        <SelectField
                                            label="Current Employment Status"
                                            name="employment_status"
                                            value={data.employment_status || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "employment_status",
                                                    e.target.value,
                                                )
                                            }
                                            items={[
                                                {
                                                    label: "Employed",
                                                    value: "employed",
                                                },
                                                {
                                                    label: "Unemployed",
                                                    value: "unemployed",
                                                },
                                                {
                                                    label: "Retired",
                                                    value: "retired",
                                                },
                                                {
                                                    label: "Student",
                                                    value: "student",
                                                },
                                                {
                                                    label: "Child",
                                                    value: "child",
                                                },
                                                {
                                                    label: "Homemaker",
                                                    value: "homemaker",
                                                },
                                                {
                                                    label: "Not Applicable",
                                                    value: "not_applicable",
                                                },
                                            ]}
                                        />
                                        <InputError
                                            message={errors.employment_status}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Occupation Records */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h4 className="text-base font-semibold text-slate-900">
                                            Occupation Records
                                        </h4>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Add one or more occupation records
                                            for the selected resident.
                                        </p>
                                    </div>

                                    {occupationDetails === null && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addOccupation}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Occupation
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-5 p-6">
                                {Array.isArray(data.occupations) &&
                                    data.occupations.map(
                                        (occupation, occIndex) => (
                                            <div
                                                key={occIndex}
                                                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
                                            >
                                                <div className="border-b border-slate-200 bg-white px-5 py-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                                                <Building2 className="h-5 w-5 text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-semibold text-slate-900">
                                                                    Occupation
                                                                    Record{" "}
                                                                    {occIndex +
                                                                        1}
                                                                </h5>
                                                                <p className="text-xs text-slate-500">
                                                                    Enter work
                                                                    details,
                                                                    income, and
                                                                    livelihood
                                                                    information.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {occupationDetails ===
                                                            null && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    removeOccupation(
                                                                        occIndex,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-8 p-6">
                                                    {/* Work Details */}
                                                    <div>
                                                        <div className="mb-4">
                                                            <h6 className="text-sm font-semibold text-slate-800">
                                                                Work Details
                                                            </h6>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Basic employment
                                                                and work
                                                                arrangement
                                                                information.
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                                            <div>
                                                                <DropdownInputField
                                                                    label="Occupation"
                                                                    name="occupation"
                                                                    value={
                                                                        occupation.occupation ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "occupation",
                                                                        )
                                                                    }
                                                                    placeholder="Select or Enter Occupation"
                                                                    items={
                                                                        occupationTypes
                                                                    }
                                                                    disabled={
                                                                        occupation.employment_status ===
                                                                        "unemployed"
                                                                    }
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.occupation`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>

                                                            <div>
                                                                <SelectField
                                                                    label="Employment Type"
                                                                    name="employment_type"
                                                                    value={
                                                                        occupation.employment_type ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "employment_type",
                                                                        )
                                                                    }
                                                                    items={[
                                                                        {
                                                                            label: "Full-time",
                                                                            value: "full_time",
                                                                        },
                                                                        {
                                                                            label: "Part-time",
                                                                            value: "part_time",
                                                                        },
                                                                        {
                                                                            label: "Seasonal",
                                                                            value: "seasonal",
                                                                        },
                                                                        {
                                                                            label: "Contractual",
                                                                            value: "contractual",
                                                                        },
                                                                        {
                                                                            label: "Self-employed",
                                                                            value: "self_employed",
                                                                        },
                                                                    ]}
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.employment_type`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>

                                                            <div>
                                                                <SelectField
                                                                    label="Occupation Status"
                                                                    name="occupation_status"
                                                                    value={
                                                                        occupation.occupation_status ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "occupation_status",
                                                                        )
                                                                    }
                                                                    items={[
                                                                        {
                                                                            label: "Active",
                                                                            value: "active",
                                                                        },
                                                                        {
                                                                            label: "Inactive",
                                                                            value: "inactive",
                                                                        },
                                                                        {
                                                                            label: "Ended",
                                                                            value: "ended",
                                                                        },
                                                                        {
                                                                            label: "Retired",
                                                                            value: "retired",
                                                                        },
                                                                        {
                                                                            label: "Terminated",
                                                                            value: "terminated",
                                                                        },
                                                                        {
                                                                            label: "Resigned",
                                                                            value: "resigned",
                                                                        },
                                                                    ]}
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.occupation_status`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>

                                                            <div>
                                                                <SelectField
                                                                    label="Work Arrangement"
                                                                    name="work_arrangement"
                                                                    value={
                                                                        occupation.work_arrangement ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "work_arrangement",
                                                                        )
                                                                    }
                                                                    items={[
                                                                        {
                                                                            label: "Remote",
                                                                            value: "remote",
                                                                        },
                                                                        {
                                                                            label: "On-site",
                                                                            value: "on_site",
                                                                        },
                                                                        {
                                                                            label: "Hybrid",
                                                                            value: "hybrid",
                                                                        },
                                                                    ]}
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.work_arrangement`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Employer and Income */}
                                                    <div className="border-t border-slate-200 pt-6">
                                                        <div className="mb-4">
                                                            <h6 className="text-sm font-semibold text-slate-800">
                                                                Employer and
                                                                Income
                                                            </h6>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Add employer,
                                                                income amount,
                                                                and payment
                                                                frequency.
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                                            <div className="xl:col-span-2">
                                                                <InputField
                                                                    label="Employer Name"
                                                                    name="employer"
                                                                    type="text"
                                                                    value={
                                                                        occupation.employer ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "employer",
                                                                        )
                                                                    }
                                                                    placeholder="Enter employer name"
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.employer`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>

                                                            <div>
                                                                <InputField
                                                                    type="number"
                                                                    label="Income"
                                                                    name="income"
                                                                    value={
                                                                        occupation.income ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "income",
                                                                        )
                                                                    }
                                                                    placeholder="Enter income"
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.income`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>

                                                            <div>
                                                                <SelectField
                                                                    label="Income Frequency"
                                                                    name="income_frequency"
                                                                    value={
                                                                        occupation.income_frequency ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "income_frequency",
                                                                        )
                                                                    }
                                                                    items={[
                                                                        {
                                                                            label: "Daily",
                                                                            value: "daily",
                                                                        },
                                                                        {
                                                                            label: "Weekly",
                                                                            value: "weekly",
                                                                        },
                                                                        {
                                                                            label: "Bi-weekly",
                                                                            value: "bi_weekly",
                                                                        },
                                                                        {
                                                                            label: "Monthly",
                                                                            value: "monthly",
                                                                        },
                                                                        {
                                                                            label: "Annually",
                                                                            value: "annually",
                                                                        },
                                                                    ]}
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.income_frequency`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Duration */}
                                                    <div className="border-t border-slate-200 pt-6">
                                                        <div className="mb-4">
                                                            <h6 className="text-sm font-semibold text-slate-800">
                                                                Employment
                                                                Duration
                                                            </h6>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Specify when the
                                                                occupation
                                                                started and
                                                                ended.
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                                            <div>
                                                                <YearDropdown
                                                                    label="Year Started"
                                                                    name="started_at"
                                                                    value={
                                                                        occupation.started_at ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "started_at",
                                                                        )
                                                                    }
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.started_at`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>

                                                            <div>
                                                                <YearDropdown
                                                                    label="Year Ended"
                                                                    name="ended_at"
                                                                    value={
                                                                        occupation.ended_at ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleOccupationFieldChange(
                                                                            e,
                                                                            occIndex,
                                                                            "ended_at",
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        occupation.occupation_status ===
                                                                        "active"
                                                                    }
                                                                />
                                                                <InputError
                                                                    message={
                                                                        errors[
                                                                            `occupations.${occIndex}.ended_at`
                                                                        ]
                                                                    }
                                                                    className="mt-2"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Flags */}
                                                    <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 xl:grid-cols-2">
                                                        <RadioGroup
                                                            label="Overseas Filipino Worker"
                                                            name="is_ofw"
                                                            selectedValue={
                                                                occupation.is_ofw ||
                                                                ""
                                                            }
                                                            options={[
                                                                {
                                                                    label: "Yes",
                                                                    value: 1,
                                                                },
                                                                {
                                                                    label: "No",
                                                                    value: 0,
                                                                },
                                                            ]}
                                                            onChange={(e) =>
                                                                handleOccupationFieldChange(
                                                                    e,
                                                                    occIndex,
                                                                    "is_ofw",
                                                                )
                                                            }
                                                        />

                                                        <RadioGroup
                                                            label="Is Main Livelihood"
                                                            name="is_main_livelihood"
                                                            selectedValue={
                                                                occupation.is_main_livelihood ||
                                                                ""
                                                            }
                                                            options={[
                                                                {
                                                                    label: "Yes",
                                                                    value: 1,
                                                                },
                                                                {
                                                                    label: "No",
                                                                    value: 0,
                                                                },
                                                            ]}
                                                            onChange={(e) =>
                                                                handleOccupationFieldChange(
                                                                    e,
                                                                    occIndex,
                                                                    "is_main_livelihood",
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )}

                                {(!data.occupations ||
                                    data.occupations.length === 0) && (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200">
                                            <UserRound className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <h5 className="mt-4 text-sm font-semibold text-slate-900">
                                            No occupation records added yet
                                        </h5>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Start by adding an occupation record
                                            for this resident.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs leading-5 text-slate-500">
                                    Review all occupation details before
                                    submitting the form.
                                </p>

                                <div className="flex items-center justify-end gap-2">
                                    {occupationDetails == null && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => reset()}
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Reset
                                        </Button>
                                    )}

                                    <Button
                                        className="bg-emerald-700 hover:bg-emerald-800"
                                        type="submit"
                                    >
                                        {occupationDetails ? "Update" : "Add"}
                                        <MoveRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {modalState === "view" ? (
                selectedResident ? (
                    <PersonDetailContent person={selectedResident} />
                ) : null
            ) : null}
        </SidebarModal>
    );
}
