import {
    Baby,
    CalendarDays,
    HeartPulse,
    Plus,
    RotateCcw,
    Ruler,
    Save,
    Scale,
    ShieldCheck,
    Syringe,
    UserRound,
    X,
} from "lucide-react";
import { Textarea } from "@/Components/ui/textarea";
import InputLabel from "@/Components/InputLabel";
import DropdownInputField from "@/Components/DropdownInputField";
import InputField from "@/Components/InputField";
import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";

export default function ChildHealthMonitoringForm({
    data,
    setData,
    errors = {},
    processing = false,
    residentsList = [],
    vaccineList = [],
    onSubmit,
    onReset,
    handleResidentChange,
    RESIDENT_GENDER_TEXT2 = {},
    submitLabel = "Submit",
    title = "Child Health Monitoring",
    description = "Record child growth measurements, health details, developmental notes, and vaccination history.",
    toast,
}) {
    const handleArrayChange = (field, index, key, value) => {
        const updated = [...(data[field] || [])];

        updated[index] = {
            ...updated[index],
            [key]: value,
        };

        setData(field, updated);
    };

    const addArrayItem = (field, item) => {
        setData(field, [...(data[field] || []), item]);

        toast.success("Item added successfully.", {
            description: `A new ${field.replace("_", " ")} entry has been added.`,
            duration: 2500,
            closeButton: true,
        });
    };

    const removeArrayItem = (field, index) => {
        setData(
            field,
            data[field].filter((_, i) => i !== index),
        );

        toast.success("Item removed successfully.", {
            description: `${field.replace("_", " ")} entry has been removed.`,
            duration: 2500,
            closeButton: true,
        });
    };

    const InfoCard = ({ icon: Icon, label, value }) => (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                <Icon className="h-4 w-4 text-blue-600" />
                {label}
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-800">
                {value || "—"}
            </p>
        </div>
    );

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Header */}
            <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 shadow-sm">
                <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-md">
                            <Baby className="h-7 w-7" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                                {title}
                            </h2>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
                        Growth & Immunization Record
                    </div>
                </div>
            </div>

            {/* Resident Profile */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                        <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Resident Information
                        </h3>
                        <p className="text-sm text-gray-500">
                            Select the child resident to automatically load
                            basic profile details.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 lg:col-span-3">
                        <InputLabel
                            htmlFor="resident_image"
                            value="Profile Photo"
                            className="mb-3"
                        />

                        <img
                            src={
                                data.resident_image
                                    ? `/storage/${data.resident_image}`
                                    : "/images/default-avatar.jpg"
                            }
                            alt="Resident Image"
                            className="h-36 w-36 rounded-full border-4 border-white object-cover shadow-md ring-1 ring-gray-200"
                        />

                        <p className="mt-3 text-center text-xs text-gray-500">
                            Resident photo from barangay profile
                        </p>
                    </div>

                    <div className="space-y-4 lg:col-span-9">
                        <div>
                            <DropdownInputField
                                label="Full Name"
                                name="fullname"
                                value={data.resident_name || ""}
                                placeholder="Select a resident"
                                onChange={(e) =>
                                    handleResidentChange(e.target.value)
                                }
                                items={residentsList}
                            />

                            <InputError
                                message={errors.resident_id}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <InfoCard
                                icon={CalendarDays}
                                label="Birthdate"
                                value={data.birthdate}
                            />

                            <InfoCard
                                icon={UserRound}
                                label="Sex"
                                value={
                                    RESIDENT_GENDER_TEXT2[data.sex || ""] || ""
                                }
                            />

                            <InfoCard
                                icon={Baby}
                                label="Age"
                                value={data.age}
                            />

                            <InfoCard
                                icon={CalendarDays}
                                label="Age in Months"
                                value={data.age_in_months}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Growth Details */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                        <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Growth Monitoring
                        </h3>
                        <p className="text-sm text-gray-500">
                            Encode the latest measurements used for child health
                            and nutrition assessment.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Scale className="h-4 w-4 text-blue-600" />
                            Weight Details
                        </div>

                        <InputField
                            label="Weight (kg)"
                            name="weight_kg"
                            type="number"
                            step="0.1"
                            value={data.weight_kg || ""}
                            onChange={(e) =>
                                setData("weight_kg", e.target.value)
                            }
                        />

                        <InputError
                            message={errors.weight_kg}
                            className="mt-2"
                        />
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Ruler className="h-4 w-4 text-blue-600" />
                            Height Details
                        </div>

                        <InputField
                            label="Height (cm)"
                            name="height_cm"
                            type="number"
                            step="0.1"
                            value={data.height_cm || ""}
                            onChange={(e) =>
                                setData("height_cm", e.target.value)
                            }
                        />

                        <InputError
                            message={errors.height_cm}
                            className="mt-2"
                        />
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            Assessment Result
                        </div>

                        <InputField
                            label="Nutrition Status"
                            name="nutrition_status"
                            value={data.nutrition_status || ""}
                            placeholder="Automatically determined"
                            disabled
                        />
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Baby className="h-4 w-4 text-blue-600" />
                            Head Measurement
                        </div>

                        <InputField
                            label="Head Circumference (cm)"
                            name="head_circumference"
                            type="number"
                            step="0.1"
                            value={data.head_circumference || ""}
                            onChange={(e) =>
                                setData("head_circumference", e.target.value)
                            }
                        />

                        <InputError
                            message={errors.head_circumference}
                            className="mt-2"
                        />
                    </div>
                </div>
            </section>

            {/* Developmental Milestones */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
                        <HeartPulse className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Developmental Milestones
                        </h3>
                        <p className="text-sm text-gray-500">
                            Add observations about movement, speech, behavior,
                            social interaction, or other development indicators.
                        </p>
                    </div>
                </div>

                <Textarea
                    id="developmental_milestones"
                    name="developmental_milestones"
                    placeholder="Example: Can sit without support, responds to name, starts crawling..."
                    value={data.developmental_milestones || ""}
                    onChange={(e) =>
                        setData("developmental_milestones", e.target.value)
                    }
                    className="min-h-[120px]"
                />

                <InputError
                    message={errors.developmental_milestones}
                    className="mt-2"
                />
            </section>

            {/* Vaccinations */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                            <Syringe className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Vaccination Records
                            </h3>
                            <p className="text-sm text-gray-500">
                                Add vaccines received by the child and their
                                corresponding vaccination dates.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            addArrayItem("vaccinations", {
                                vaccine: "",
                                vaccination_date: "",
                            })
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                        <Plus className="h-4 w-4" />
                        Add Vaccination
                    </button>
                </div>

                <div className="space-y-4">
                    {(data.vaccinations || []).map((vaccination, index) => (
                        <div
                            key={index}
                            className="relative rounded-2xl border border-gray-200 bg-gray-50 p-4"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Vaccine Entry #{index + 1}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Select vaccine name and date received.
                                    </p>
                                </div>

                                {(data.vaccinations || []).length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeArrayItem(
                                                "vaccinations",
                                                index,
                                            )
                                        }
                                        className="rounded-full p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <DropdownInputField
                                        label="Vaccine"
                                        name={`vaccinations.${index}.vaccine`}
                                        value={vaccination.vaccine || ""}
                                        placeholder="Select a vaccine"
                                        onChange={(e) =>
                                            handleArrayChange(
                                                "vaccinations",
                                                index,
                                                "vaccine",
                                                e.target.value,
                                            )
                                        }
                                        items={vaccineList}
                                    />

                                    <InputError
                                        message={
                                            errors[
                                                `vaccinations.${index}.vaccine`
                                            ]
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputField
                                        label="Vaccination Date"
                                        name={`vaccinations.${index}.vaccination_date`}
                                        type="date"
                                        value={
                                            vaccination.vaccination_date || ""
                                        }
                                        onChange={(e) =>
                                            handleArrayChange(
                                                "vaccinations",
                                                index,
                                                "vaccination_date",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <InputError
                                        message={
                                            errors[
                                                `vaccinations.${index}.vaccination_date`
                                            ]
                                        }
                                        className="mt-2"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Actions */}
            <div className="sticky bottom-0 z-10 flex w-full justify-end gap-3 border-t border-gray-200 bg-white/90 px-4 py-4 backdrop-blur">
                <Button
                    type="button"
                    onClick={onReset}
                    disabled={processing}
                    className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>

                <Button
                    className="min-w-40 bg-blue-700 text-white hover:bg-blue-600"
                    type="submit"
                    disabled={processing}
                >
                    <Save className="h-4 w-4" />
                    {processing ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
