import SidebarModal from "@/Components/SidebarModal";
import PersonDetailContent from "@/Components/SidebarModalContents/PersonDetailContent";
import DropdownInputField from "@/Components/DropdownInputField";
import InputError from "@/Components/InputError";
import InputField from "@/Components/InputField";
import InputLabel from "@/Components/InputLabel";
import { Button } from "@/components/ui/button";
import { MoveRight, Skull, UserRound, RotateCcw } from "lucide-react";

export default function DeathDetailsSidebarModal({
    isModalOpen,
    handleModalClose,
    modalState,
    deathDetails,
    data,
    errors,
    residentsList,
    handleResidentChange,
    handleEditSubmit,
    handleAddSubmit,
    setData,
    reset,
    selectedResident,
}) {
    return (
        <SidebarModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            title={
                modalState === "add"
                    ? deathDetails
                        ? "Edit Resident Death Details"
                        : "Add Resident Death Details"
                    : "View Resident Details"
            }
        >
            {modalState === "add" && (
                <div className="w-full space-y-6 bg-white p-1 text-sm text-slate-800">
                    <form
                        onSubmit={
                            deathDetails ? handleEditSubmit : handleAddSubmit
                        }
                        className="space-y-6"
                    >
                        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-red-50 via-white to-white p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                                    <Skull className="h-6 w-6 text-red-600" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
                                        {deathDetails
                                            ? "Update Death Record"
                                            : "Add Death Record"}
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        Record the resident’s death details,
                                        including cause, place, burial
                                        information, and official certificate
                                        details.
                                    </p>

                                    <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                        {data.resident_name ||
                                            "No resident selected"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h4 className="text-base font-semibold text-slate-900">
                                    Resident Information
                                </h4>
                                <p className="mt-1 text-sm text-slate-500">
                                    Select the resident and verify the basic
                                    profile details before saving the death
                                    record.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                                    <div className="relative">
                                        <img
                                            src={
                                                data.resident_image
                                                    ? `/storage/${data.resident_image}`
                                                    : "/images/default-avatar.jpg"
                                            }
                                            alt="Resident"
                                            className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
                                        />

                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-medium text-white shadow">
                                            Resident
                                        </div>
                                    </div>

                                    <h5 className="mt-4 text-sm font-semibold text-slate-900">
                                        {data.resident_name ||
                                            "No resident selected"}
                                    </h5>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {data.resident_id
                                            ? "Selected resident profile preview."
                                            : "Select a resident to display profile details."}
                                    </p>
                                </div>

                                <div className="space-y-5 lg:col-span-2">
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
                                            readOnly={deathDetails}
                                        />
                                        <InputError
                                            message={errors.resident_id}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <InputField
                                                label="Birthdate"
                                                name="birthdate"
                                                value={data.birthdate || ""}
                                                readOnly
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                Resident’s registered birthdate.
                                            </p>
                                            <InputError
                                                message={errors.birthdate}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <InputField
                                                label="Purok Number"
                                                name="purok_number"
                                                value={data.purok_number || ""}
                                                readOnly
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                Resident’s assigned purok.
                                            </p>
                                            <InputError
                                                message={errors.purok_number}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h4 className="text-base font-semibold text-slate-900">
                                    Death Information
                                </h4>
                                <p className="mt-1 text-sm text-slate-500">
                                    Provide the official death and burial
                                    information for this resident.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <InputField
                                        label="Cause of Death"
                                        name="cause_of_death"
                                        value={data.cause_of_death || ""}
                                        onChange={(e) =>
                                            setData(
                                                "cause_of_death",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Illness, Accident"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Specify the medical or situational
                                        reason for death.
                                    </p>
                                    <InputError
                                        message={errors.cause_of_death}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <InputField
                                        label="Date of Death"
                                        name="date_of_death"
                                        type="date"
                                        value={data.date_of_death || ""}
                                        onChange={(e) =>
                                            setData(
                                                "date_of_death",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Required. The exact date of death.
                                    </p>
                                    <InputError
                                        message={errors.date_of_death}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <InputField
                                        label="Place of Death"
                                        name="place_of_death"
                                        value={data.place_of_death || ""}
                                        onChange={(e) =>
                                            setData(
                                                "place_of_death",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Hospital, Home"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Indicate where the death occurred.
                                    </p>
                                    <InputError
                                        message={errors.place_of_death}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <InputField
                                        label="Death Certificate Number"
                                        name="death_certificate_number"
                                        value={
                                            data.death_certificate_number || ""
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "death_certificate_number",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., DC-12345"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Enter the official certificate number,
                                        if available.
                                    </p>
                                    <InputError
                                        message={
                                            errors.death_certificate_number
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <InputField
                                        label="Burial Place"
                                        name="burial_place"
                                        value={data.burial_place || ""}
                                        onChange={(e) =>
                                            setData(
                                                "burial_place",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., Municipal Cemetery"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Location of the burial site.
                                    </p>
                                    <InputError
                                        message={errors.burial_place}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <InputField
                                        label="Burial Date"
                                        name="burial_date"
                                        type="date"
                                        value={data.burial_date || ""}
                                        onChange={(e) =>
                                            setData(
                                                "burial_date",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Select the date when burial took place.
                                    </p>
                                    <InputError
                                        message={errors.burial_date}
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <InputLabel value="Remarks" />
                            <textarea
                                name="remarks"
                                value={data.remarks || ""}
                                onChange={(e) =>
                                    setData("remarks", e.target.value)
                                }
                                placeholder="Additional notes about the death record..."
                                className="mt-2 w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-200"
                                rows={4}
                            />
                            <InputError
                                message={errors.remarks}
                                className="mt-2"
                            />
                        </div>

                        <div className="sticky bottom-0 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs leading-5 text-slate-500">
                                    Review the resident’s death information
                                    before submitting the record.
                                </p>

                                <div className="flex items-center justify-end gap-2">
                                    {!deathDetails && reset && (
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
                                        type="submit"
                                        className="bg-red-700 hover:bg-red-800"
                                    >
                                        {deathDetails ? "Update" : "Add"}
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
                    <PersonDetailContent
                        person={selectedResident}
                        deceased={true}
                    />
                ) : null
            ) : null}
        </SidebarModal>
    );
}
