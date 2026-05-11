import React, { useEffect, useState } from "react";
import { IoIosAddCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import useAppUrl from "@/hooks/useAppUrl";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import DropdownInputField from "@/Components/DropdownInputField";
import InputField from "@/Components/InputField";
import SelectField from "@/Components/SelectField";
import YearDropdown from "@/Components/YearDropdown";
import InputError from "@/Components/InputError";
import RadioGroup from "@/Components/RadioGroup";
import { MapPin, LoaderCircle, LocateFixed } from "lucide-react";
import useGeolocation from "@/hooks/useGetGeoLocation";

const SectionCard = ({ title, description, children }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
            {description && (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
        </div>
        {children}
    </div>
);

const SubCard = ({ title, description, children }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
        </div>
        {children}
    </div>
);

const EntryCard = ({ title, children, onRemove }) => (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                {title}
            </h4>

            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-full p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                    title="Remove"
                >
                    <IoIosCloseCircleOutline className="text-2xl" />
                </button>
            )}
        </div>
        {children}
    </div>
);

const FieldHint = ({ children }) => (
    <p className="mt-1 text-xs leading-relaxed text-slate-500">{children}</p>
);

const DynamicSelectList = ({
    label,
    field,
    items,
    entries = [],
    errors,
    addLabel,
    addDynamicField,
    removeDynamicField,
    handleDynamicFieldChange,
    valueKey,
    placeholder,
}) => {
    const safeEntries = Array.isArray(entries) ? entries : [];

    return (
        <SubCard title={label}>
            <div className="space-y-3">
                {safeEntries.length > 0 ? (
                    safeEntries.map((entry, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3"
                        >
                            <div className="flex-1">
                                <DropdownInputField
                                    name={valueKey}
                                    value={entry?.[valueKey] || ""}
                                    onChange={(e) =>
                                        handleDynamicFieldChange(field, idx, e)
                                    }
                                    placeholder={placeholder}
                                    items={items}
                                />
                                <InputError
                                    message={
                                        errors?.[`${field}.${idx}.${valueKey}`]
                                    }
                                    className="mt-1"
                                />
                            </div>

                            {safeEntries.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        removeDynamicField(field, idx)
                                    }
                                    className="mt-1 rounded-full p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                    title="Remove"
                                >
                                    <IoIosCloseCircleOutline className="text-2xl" />
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-sm italic text-slate-500">
                        No entries added yet.
                    </p>
                )}

                <button
                    type="button"
                    onClick={() =>
                        addDynamicField(field, {
                            [valueKey]: "",
                        })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                >
                    <IoIosAddCircleOutline className="text-2xl" />
                    <span>{addLabel}</span>
                </button>
            </div>
        </SubCard>
    );
};

export default function HouseForm({
    data,
    setData,
    errors,
    handleArrayValues,
    puroks,
    households = [],
    streets,
    head = false,
}) {
    const APP_URL = useAppUrl();
    const [showNewHouseToggle, setShowNewHouseToggle] = useState(false);

    const purok_numbers = puroks.map((purok) => ({
        label: "Purok " + purok,
        value: purok.toString(),
    }));
    const { gettingLocation, getCurrentLocation } = useGeolocation();
    const handleGetLocation = () => {
        getCurrentLocation((coords) => {
            setData("latitude", coords.latitude);
            setData("longitude", coords.longitude);
        });
    };

    const streetList = streets.map((street) => ({
        label: street.street_name,
        value: street.id.toString(),
    }));

    const householdList = households?.map((house) => ({
        label:
            house.household.house_number.toString().padStart(4, "0") +
            " || " +
            house.lastname +
            "'s Residence",
        value: house.household.id.toString(),
    }));

    const addLivestock = () => {
        setData("livestocks", [...(data.livestocks || []), {}]);
    };

    const removeLivestock = (livestockIndex) => {
        const updated = [...(data.livestocks || [])];
        updated.splice(livestockIndex, 1);
        setData("livestocks", updated);
    };

    const addPet = () => {
        setData("pets", [...(data.pets || []), {}]);
    };

    const removePet = (petIndex) => {
        const updated = [...(data.pets || [])];
        updated.splice(petIndex, 1);
        setData("pets", updated);
    };

    const handleHouseholdChange = (e) => {
        const householdId = Number(e.target.value);
        if (!householdId) return;

        const foundHead = households.find(
            (r) =>
                Number(r.household_id) === householdId && r.is_household_head,
        );

        const fullName = foundHead
            ? [
                  foundHead.firstname,
                  foundHead.middlename,
                  foundHead.lastname,
                  foundHead.suffix,
              ]
                  .filter(Boolean)
                  .join(" ")
            : "";

        setData((prev) => ({
            ...prev,
            housenumber: String(householdId),
            name_of_head: fullName,
        }));
    };

    const handleStreetChange = (e) => {
        const street_id = Number(e.target.value);
        const street = streets.find((s) => s.id == street_id);

        if (street) {
            setData((prev) => ({
                ...prev,
                street_id: street.id,
                street_name: street?.street_name || "",
                purok_id: street.purok.id,
                purok_number: street.purok.purok_number,
            }));
        }
    };

    const addDynamicField = (field, defaultValue = {}) => {
        const currentArray = data[field] || [];
        const updatedArray = [...currentArray, defaultValue];
        setData((prev) => ({ ...prev, [field]: updatedArray }));
    };

    const removeDynamicField = (field, index) => {
        const currentArray = [...(data[field] || [])];
        currentArray.splice(index, 1);
        setData((prev) => ({ ...prev, [field]: currentArray }));
    };

    const handleDynamicFieldChange = (field, index, e) => {
        const { name, value } = e.target;
        const currentArray = [...(data[field] || [])];

        currentArray[index] = {
            ...currentArray[index],
            [name]: value,
        };

        setData((prev) => ({ ...prev, [field]: currentArray }));
    };

    useEffect(() => {
        if (!head) return;

        const fetchLatestHouseNumber = async () => {
            try {
                const response = await axios.get(
                    `${APP_URL}/household/latest-house-number`,
                );

                if (response.data.success) {
                    const latest = response.data.house_number;

                    setData((prev) => ({
                        ...prev,
                        housenumber: prev.housenumber || latest,
                    }));
                }
            } catch (error) {
                console.error("Error fetching house number:", error);
            }
        };

        fetchLatestHouseNumber();
    }, []);

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-slate-50 px-6 py-5 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
                    Housing, Utilities & Household Assets
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">
                    Record the resident&apos;s household, location coordinates,
                    home conditions, utilities, livestock, and pet ownership
                    information.
                </p>
            </div>

            {head === false && (
                <SectionCard
                    title="House Information"
                    description="Select the household where this resident belongs and define the resident's relationship to the household head."
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <DropdownInputField
                                type="text"
                                label="House/Unit No./Lot/Blk No."
                                name="housenumber"
                                value={data.housenumber || ""}
                                onChange={handleHouseholdChange}
                                placeholder="Select house number"
                                items={householdList}
                            />
                            <InputError
                                message={errors.housenumber}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <InputField
                                type="text"
                                label="Head of Household"
                                name="name_of_head"
                                value={data.name_of_head || ""}
                                placeholder="Head of Household"
                                disabled
                            />
                            <InputError
                                message={errors.name_of_head}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <SelectField
                                label="Relationship to Household Head"
                                name="relationship_to_head"
                                value={data.relationship_to_head || ""}
                                onChange={(e) =>
                                    setData(
                                        "relationship_to_head",
                                        e.target.value,
                                    )
                                }
                                placeholder="Select relationship"
                                items={[
                                    { label: "Spouse", value: "spouse" },
                                    { label: "Child", value: "child" },
                                    { label: "Sibling", value: "sibling" },
                                    { label: "Parent", value: "parent" },
                                    {
                                        label: "Parent-in-law",
                                        value: "parent_in_law",
                                    },
                                    {
                                        label: "Sibling of Spouse",
                                        value: "sibling-of-spouse",
                                    },
                                    {
                                        label: "Spouse of (Sibling of Spouse)",
                                        value: "spouse-of-sibling-of-spouse",
                                    },
                                    {
                                        label: "Spouse of Sibling",
                                        value: "spouse-sibling",
                                    },
                                    {
                                        label: "Niece/Nephew",
                                        value: "niblings",
                                    },
                                    {
                                        label: "Grandparent",
                                        value: "grandparent",
                                    },
                                ]}
                            />
                            <InputError
                                message={errors.relationship_to_head}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <InputField
                                type="text"
                                label="Street Name"
                                name="street_name"
                                value={data.street_name || ""}
                                placeholder="e.g., Rizal St."
                                disabled={data.is_household_head != 1}
                            />
                            <InputError
                                message={errors.street_name}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <InputField
                                type="text"
                                label="Subdivision/Village/Compound"
                                name="subdivision"
                                value={data.subdivision || ""}
                                onChange={(e) =>
                                    setData("subdivision", e.target.value)
                                }
                                placeholder="e.g., Villa Gloria Subdivision"
                                disabled={data.is_household_head != 1}
                            />
                            <InputError
                                message={errors.subdivision}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <SelectField
                                label="Purok Number"
                                name="purok_number"
                                value={data.purok_number || ""}
                                onChange={(e) =>
                                    setData("purok_number", e.target.value)
                                }
                                items={purok_numbers}
                                disabled={data.is_household_head != 1}
                            />
                            <InputError
                                message={errors.purok_number}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <InputField
                                type="number"
                                step="any"
                                label="Latitude"
                                name="latitude"
                                value={data.latitude || ""}
                                onChange={(e) =>
                                    setData("latitude", e.target.value)
                                }
                                placeholder="e.g., 16.9380"
                                disabled={data.is_household_head != 1}
                            />
                            <InputError
                                message={errors.latitude}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <InputField
                                type="number"
                                step="any"
                                label="Longitude"
                                name="longitude"
                                value={data.longitude || ""}
                                onChange={(e) =>
                                    setData("longitude", e.target.value)
                                }
                                placeholder="e.g., 121.7600"
                                disabled={data.is_household_head != 1}
                            />
                            <InputError
                                message={errors.longitude}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={showNewHouseToggle}
                                onCheckedChange={setShowNewHouseToggle}
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Add new house number
                                </p>
                                <p className="text-xs text-slate-500">
                                    Use this if the household is not yet in the
                                    records.
                                </p>
                            </div>
                        </div>

                        <div
                            className={`overflow-hidden transition-all duration-300 ${
                                showNewHouseToggle
                                    ? "mt-4 max-h-60 opacity-100"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            <div className="pt-2">
                                <InputField
                                    type="text"
                                    label="New House Number"
                                    name="new_housenumber"
                                    value={data.new_housenumber || ""}
                                    onChange={(e) =>
                                        setData(
                                            "new_housenumber",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter new house or lot number"
                                />
                                <InputError
                                    message={errors.new_housenumber}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </SectionCard>
            )}

            {head !== false && (
                <>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">
                                    Main House
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Mark this household as the primary or main
                                    residence.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <Switch
                                    checked={data.is_main_house == 1}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            "is_main_house",
                                            checked ? 1 : 0,
                                        )
                                    }
                                />

                                <div>
                                    <p className="text-sm font-medium text-slate-700">
                                        {data.is_main_house == 1
                                            ? "Main House"
                                            : "Not Main House"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {data.is_main_house == 1
                                            ? "This is the primary residence."
                                            : "This is not the primary residence."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <InputError
                            message={errors.is_main_house}
                            className="mt-2"
                        />
                    </div>
                    <SectionCard
                        title="Household Structure"
                        description="Provide the main housing, address, location coordinates, and physical structure details of the household."
                    >
                        <div className="space-y-6">
                            {/* Address Details */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold text-slate-800">
                                        Address Information
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Enter the household address and assigned
                                        purok location.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                                    <div>
                                        <InputField
                                            type="text"
                                            label="House/Unit No./Lot/Blk No."
                                            name="housenumber"
                                            value={data.housenumber || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "housenumber",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter house number"
                                        />
                                        <InputError
                                            message={errors.housenumber}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <DropdownInputField
                                            label="Street Name"
                                            name="street_id"
                                            type="text"
                                            value={data.street_name || ""}
                                            onChange={handleStreetChange}
                                            placeholder="Select street"
                                            items={streetList}
                                        />
                                        <InputError
                                            message={errors.street_id}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <InputField
                                            type="text"
                                            label="Subdivision/Village/Compound"
                                            name="subdivision"
                                            value={data.subdivision || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "subdivision",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter subdivision or village"
                                        />
                                        <InputError
                                            message={errors.subdivision}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <SelectField
                                            label="Purok Number"
                                            name="purok_number"
                                            value={data.purok_number || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "purok_number",
                                                    e.target.value,
                                                )
                                            }
                                            items={purok_numbers}
                                        />
                                        <InputError
                                            message={errors.purok_number}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Coordinates */}
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
                                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 shadow-sm">
                                            <MapPin className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h3 className="text-base font-semibold text-slate-800">
                                                Geographic Coordinates
                                            </h3>

                                            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-500">
                                                Add the exact household location
                                                for mapping, monitoring,
                                                disaster response, and emergency
                                                reference purposes.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
                                            Optional
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={gettingLocation}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {gettingLocation ? (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <LocateFixed className="h-4 w-4" />
                                            )}

                                            {gettingLocation
                                                ? "Locating..."
                                                : "Use Current Location"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-emerald-200">
                                        <InputField
                                            type="number"
                                            step="any"
                                            label="Latitude"
                                            name="latitude"
                                            value={data.latitude || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "latitude",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., 16.9380"
                                        />

                                        <InputError
                                            message={errors.latitude}
                                            className="mt-1"
                                        />

                                        <p className="mt-2 text-xs text-slate-500">
                                            Valid range: -90 to 90.
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition hover:border-emerald-200">
                                        <InputField
                                            type="number"
                                            step="any"
                                            label="Longitude"
                                            name="longitude"
                                            value={data.longitude || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "longitude",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., 121.7600"
                                        />

                                        <InputError
                                            message={errors.longitude}
                                            className="mt-1"
                                        />

                                        <p className="mt-2 text-xs text-slate-500">
                                            Valid range: -180 to 180.
                                        </p>
                                    </div>
                                </div>

                                {(data.latitude || data.longitude) && (
                                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                                                <LocateFixed className="h-4 w-4" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    Current Coordinates
                                                </p>

                                                <div className="mt-1 space-y-1 text-sm text-slate-500">
                                                    <p>
                                                        Latitude:{" "}
                                                        <span className="font-medium text-slate-700">
                                                            {data.latitude ||
                                                                "—"}
                                                        </span>
                                                    </p>

                                                    <p>
                                                        Longitude:{" "}
                                                        <span className="font-medium text-slate-700">
                                                            {data.longitude ||
                                                                "—"}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* House Details */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold text-slate-800">
                                        House Details
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Specify ownership, condition, structure
                                        type, and building details.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                                    <div>
                                        <DropdownInputField
                                            label="Ownership Type"
                                            name="ownership_type"
                                            value={data.ownership_type || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "ownership_type",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Select ownership type"
                                            items={[
                                                "owned",
                                                "rented",
                                                "shared",
                                                "goverment-provided",
                                                "inherited",
                                            ]}
                                        />
                                        <InputError
                                            message={errors.ownership_type}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <SelectField
                                            label="Housing Condition"
                                            name="housing_condition"
                                            value={data.housing_condition || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "housing_condition",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Select house condition"
                                            items={[
                                                {
                                                    label: "Good",
                                                    value: "good",
                                                },
                                                {
                                                    label: "Needs Repair",
                                                    value: "needs_repair",
                                                },
                                                {
                                                    label: "Dilapidated",
                                                    value: "dilapidated",
                                                },
                                            ]}
                                        />
                                        <InputError
                                            message={errors.housing_condition}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <SelectField
                                            label="House Structure"
                                            name="house_structure"
                                            value={data.house_structure || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "house_structure",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Select house structure"
                                            items={[
                                                {
                                                    label: "Concrete",
                                                    value: "concrete",
                                                },
                                                {
                                                    label: "Semi-Concrete",
                                                    value: "semi_concrete",
                                                },
                                                {
                                                    label: "Wood",
                                                    value: "wood",
                                                },
                                                {
                                                    label: "Makeshift",
                                                    value: "makeshift",
                                                },
                                            ]}
                                        />
                                        <InputError
                                            message={errors.house_structure}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <YearDropdown
                                            label="Year Established"
                                            name="year_established"
                                            value={data.year_established || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "year_established",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Select year"
                                        />
                                        <InputError
                                            message={errors.year_established}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <InputField
                                            type="number"
                                            label="Number of Rooms"
                                            name="number_of_rooms"
                                            value={data.number_of_rooms || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "number_of_rooms",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter number of rooms"
                                        />
                                        <InputError
                                            message={errors.number_of_rooms}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <InputField
                                            type="number"
                                            label="Number of Floors"
                                            name="number_of_floors"
                                            value={data.number_of_floors || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "number_of_floors",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter number of floors"
                                        />
                                        <InputError
                                            message={errors.number_of_floors}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <DropdownInputField
                                            label="Bath and Wash Area"
                                            name="bath_and_wash_area"
                                            value={
                                                data.bath_and_wash_area || ""
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "bath_and_wash_area",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Select option"
                                            items={[
                                                {
                                                    label: "With own sink and bath",
                                                    value: "with_own_sink_and_bath",
                                                },
                                                {
                                                    label: "With own sink only",
                                                    value: "with_own_sink_only",
                                                },
                                                {
                                                    label: "With own bath only",
                                                    value: "with_own_bath_only",
                                                },
                                                {
                                                    label: "Shared or communal",
                                                    value: "shared_or_communal",
                                                },
                                                {
                                                    label: "None",
                                                    value: "none",
                                                },
                                            ]}
                                        />
                                        <InputError
                                            message={errors.bath_and_wash_area}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <DropdownInputField
                                            label="Internet Connection Type"
                                            name="type_of_internet"
                                            value={data.type_of_internet || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "type_of_internet",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Select internet connection type"
                                            items={[
                                                {
                                                    label: "Mobile Data",
                                                    value: "mobile_data",
                                                },
                                                {
                                                    label: "Wireless Fidelity (Wi-Fi)",
                                                    value: "wireless_fidelity",
                                                },
                                                {
                                                    label: "None",
                                                    value: "none",
                                                },
                                            ]}
                                        />
                                        <InputError
                                            message={errors.type_of_internet}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Utilities & Sanitation"
                        description="Record utility sources and sanitation-related facilities used by the household."
                    >
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            <DynamicSelectList
                                label="Type of Toilet(s)"
                                field="toilets"
                                entries={data.toilets}
                                errors={errors}
                                items={[
                                    {
                                        label: "Water sealed",
                                        value: "water_sealed",
                                    },
                                    {
                                        label: "Compost pit toilet",
                                        value: "compost_pit_toilet",
                                    },
                                    {
                                        label: "Shared communal public toilet",
                                        value: "shared_communal_public_toilet",
                                    },
                                    {
                                        label: "Shared or communal",
                                        value: "shared_or_communal",
                                    },
                                    {
                                        label: "No latrine",
                                        value: "no_latrine",
                                    },
                                ]}
                                addLabel="Add type of toilet"
                                addDynamicField={addDynamicField}
                                removeDynamicField={removeDynamicField}
                                handleDynamicFieldChange={
                                    handleDynamicFieldChange
                                }
                                valueKey="toilet_type"
                                placeholder="Select toilet type"
                            />

                            <DynamicSelectList
                                label="Electricity Source(s)"
                                field="electricity_types"
                                entries={data.electricity_types}
                                errors={errors}
                                items={[
                                    {
                                        label: "ISELCO II",
                                        value: "distribution_company_iselco_ii",
                                    },
                                    { label: "Generator", value: "generator" },
                                    {
                                        label: "Solar / Renewable",
                                        value: "solar_renewable_energy_source",
                                    },
                                    { label: "Battery", value: "battery" },
                                    { label: "None", value: "none" },
                                ]}
                                addLabel="Add electricity source"
                                addDynamicField={addDynamicField}
                                removeDynamicField={removeDynamicField}
                                handleDynamicFieldChange={
                                    handleDynamicFieldChange
                                }
                                valueKey="electricity_type"
                                placeholder="Select electricity source"
                            />

                            <DynamicSelectList
                                label="Water Source(s)"
                                field="water_source_types"
                                entries={data.water_source_types}
                                errors={errors}
                                items={[
                                    {
                                        label: "Level II",
                                        value: "level_ii_water_system",
                                    },
                                    {
                                        label: "Level III",
                                        value: "level_iii_water_system",
                                    },
                                    {
                                        label: "Deep Well",
                                        value: "deep_well_level_i",
                                    },
                                    {
                                        label: "Artesian Well",
                                        value: "artesian_well_level_i",
                                    },
                                    {
                                        label: "Shallow Well",
                                        value: "shallow_well_level_i",
                                    },
                                    {
                                        label: "Refill Source",
                                        value: "commercial_water_refill_source",
                                    },
                                    { label: "None", value: "none" },
                                ]}
                                addLabel="Add water source"
                                addDynamicField={addDynamicField}
                                removeDynamicField={removeDynamicField}
                                handleDynamicFieldChange={
                                    handleDynamicFieldChange
                                }
                                valueKey="water_source_type"
                                placeholder="Select water source"
                            />

                            <DynamicSelectList
                                label="Waste Disposal Method(s)"
                                field="waste_management_types"
                                entries={data.waste_management_types}
                                errors={errors}
                                items={[
                                    {
                                        label: "Open Dump",
                                        value: "open_dump_site",
                                    },
                                    {
                                        label: "Sanitary Landfill",
                                        value: "sanitary_landfill",
                                    },
                                    {
                                        label: "Compost Pits",
                                        value: "compost_pits",
                                    },
                                    {
                                        label: "Material Recovery",
                                        value: "material_recovery_facility",
                                    },
                                    {
                                        label: "Garbage Collected",
                                        value: "garbage_is_collected",
                                    },
                                    { label: "None", value: "none" },
                                ]}
                                addLabel="Add waste disposal method"
                                addDynamicField={addDynamicField}
                                removeDynamicField={removeDynamicField}
                                handleDynamicFieldChange={
                                    handleDynamicFieldChange
                                }
                                valueKey="waste_management_type"
                                placeholder="Select waste disposal method"
                            />
                        </div>
                    </SectionCard>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <SectionCard
                            title="Livestock Ownership"
                            description="Record animals raised by the household for personal or commercial use."
                        >
                            <div className="space-y-4">
                                <RadioGroup
                                    label="Do you have livestock?"
                                    name="has_livestock"
                                    options={[
                                        { label: "Yes", value: 1 },
                                        { label: "No", value: 0 },
                                    ]}
                                    selectedValue={data.has_livestock || ""}
                                    onChange={(e) =>
                                        setData("has_livestock", e.target.value)
                                    }
                                />

                                {data.has_livestock == 1 && (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            {(data.livestocks || []).map(
                                                (livestock, livIndex) => (
                                                    <EntryCard
                                                        key={livIndex}
                                                        title={`Livestock #${livIndex + 1}`}
                                                        onRemove={() =>
                                                            removeLivestock(
                                                                livIndex,
                                                            )
                                                        }
                                                    >
                                                        <div className="space-y-4">
                                                            <DropdownInputField
                                                                label="Livestock Animal"
                                                                name="livestock_type"
                                                                value={
                                                                    livestock.livestock_type ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleArrayValues(
                                                                        e,
                                                                        livIndex,
                                                                        "livestock_type",
                                                                        "livestocks",
                                                                    )
                                                                }
                                                                placeholder="Select animal"
                                                                items={[
                                                                    "cattle",
                                                                    "carabao",
                                                                    "goat",
                                                                    "pig",
                                                                    "chicken",
                                                                    "duck",
                                                                    "sheep",
                                                                    "horse",
                                                                ]}
                                                            />

                                                            <InputField
                                                                label="Quantity"
                                                                name="quantity"
                                                                value={
                                                                    livestock.quantity ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleArrayValues(
                                                                        e,
                                                                        livIndex,
                                                                        "quantity",
                                                                        "livestocks",
                                                                    )
                                                                }
                                                                placeholder="Enter quantity"
                                                                type="number"
                                                            />

                                                            <SelectField
                                                                label="Purpose"
                                                                name="purpose"
                                                                value={
                                                                    livestock.purpose ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleArrayValues(
                                                                        e,
                                                                        livIndex,
                                                                        "purpose",
                                                                        "livestocks",
                                                                    )
                                                                }
                                                                placeholder="Select purpose"
                                                                items={[
                                                                    {
                                                                        label: "Personal Consumption",
                                                                        value: "personal_consumption",
                                                                    },
                                                                    {
                                                                        label: "Commercial",
                                                                        value: "commercial",
                                                                    },
                                                                    {
                                                                        label: "Both",
                                                                        value: "both",
                                                                    },
                                                                ]}
                                                            />
                                                        </div>
                                                    </EntryCard>
                                                ),
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addLivestock}
                                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                                        >
                                            <IoIosAddCircleOutline className="text-2xl" />
                                            <span>Add Livestock</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Pet Ownership"
                            description="Record household pets and rabies vaccination information."
                        >
                            <div className="space-y-4">
                                <RadioGroup
                                    label="Do you have pets?"
                                    name="has_pets"
                                    options={[
                                        { label: "Yes", value: 1 },
                                        { label: "No", value: 0 },
                                    ]}
                                    selectedValue={data.has_pets || ""}
                                    onChange={(e) =>
                                        setData("has_pets", e.target.value)
                                    }
                                />

                                {data.has_pets == 1 && (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            {(data.pets || []).map(
                                                (pet, petIndex) => (
                                                    <EntryCard
                                                        key={petIndex}
                                                        title={`Pet #${petIndex + 1}`}
                                                        onRemove={() =>
                                                            removePet(petIndex)
                                                        }
                                                    >
                                                        <div className="space-y-4">
                                                            <DropdownInputField
                                                                label="Type of Pet"
                                                                name="pet_type"
                                                                value={
                                                                    pet.pet_type ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleArrayValues(
                                                                        e,
                                                                        petIndex,
                                                                        "pet_type",
                                                                        "pets",
                                                                    )
                                                                }
                                                                placeholder="Select pet type"
                                                                items={[
                                                                    "dog",
                                                                    "cat",
                                                                    "rabbit",
                                                                ]}
                                                            />

                                                            <RadioGroup
                                                                label="Vaccinated for Rabies?"
                                                                name="is_vaccinated"
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
                                                                selectedValue={
                                                                    pet.is_vaccinated ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleArrayValues(
                                                                        e,
                                                                        petIndex,
                                                                        "is_vaccinated",
                                                                        "pets",
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </EntryCard>
                                                ),
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addPet}
                                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                                        >
                                            <IoIosAddCircleOutline className="text-2xl" />
                                            <span>Add Pet</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </SectionCard>
                    </div>
                </>
            )}
        </div>
    );
}
