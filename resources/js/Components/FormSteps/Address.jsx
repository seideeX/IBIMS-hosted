import { useContext, useEffect, useState } from "react";
import { StepperContext } from "@/context/StepperContext";
import InputField from "@/Components/InputField";
import DropdownInputField from "../DropdownInputField";
import SelectField from "../SelectField";
import axios from "axios";
import useAppUrl from "@/hooks/useAppUrl";
import { MapPin, LoaderCircle } from "lucide-react";
import useGeolocation from "@/hooks/useGetGeoLocation";

const Address = ({ puroks, streets }) => {
    const { userData, setUserData, errors } = useContext(StepperContext);
    const APP_URL = useAppUrl();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "street") {
            const streetId = Number(value);
            const street = streets.find((s) => s.id === streetId);

            if (street) {
                setUserData((prev) => ({
                    ...prev,
                    street: street.id,
                    street_name: street.street_name,
                    purok_id: street.purok?.id || null,
                    purok: street.purok?.purok_number || "",
                }));
            }
            return;
        }

        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const purok_numbers = puroks.map((purok) => ({
        label: `Purok ${purok}`,
        value: purok.toString(),
    }));

    const streetList = streets.map((street) => ({
        label: street.street_name,
        value: street.id.toString(),
    }));

    const { location, gettingLocation, getCurrentLocation } = useGeolocation();

    const handleGetLocation = () => {
        getCurrentLocation((coords) => {
            setUserData((prev) => ({
                ...prev,
                latitude: coords.latitude,
                longitude: coords.longitude,
            }));
        });
    };

    useEffect(() => {
        const fetchLatestHouseNumber = async () => {
            try {
                const response = await axios.get(
                    `${APP_URL}/household/latest-house-number`,
                );

                if (response.data.success) {
                    const latest = response.data.house_number;

                    setUserData((prev) => ({
                        ...prev,
                        housenumber: prev.housenumber || latest,
                    }));
                }
            } catch (error) {
                console.error("Error fetching house number:", error);
            }
        };

        fetchLatestHouseNumber();
    }, []); // ✅ only once

    return (
        <div className="w-full">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {/* HEADER */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-blue-50 px-6 py-6">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
                        Household Address Information
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                        Complete the household location details to ensure
                        accurate identification and mapping.
                    </p>
                </div>

                <div className="space-y-6 bg-slate-50/60 px-6 py-6">
                    {/* PRIMARY */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h3 className="text-base font-semibold text-slate-800">
                                Primary Address Details
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Enter the main household identifier and street
                                information.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-white">
                                <InputField
                                    type="text"
                                    label="House/Unit No./Lot/Blk No."
                                    name="housenumber"
                                    value={userData.housenumber || ""}
                                    onChange={handleChange}
                                    placeholder="e.g., Lot 12 Blk 7 or Unit 3A"
                                    required
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Use the official house, lot, or unit number.
                                </p>
                                {errors.housenumber && (
                                    <p className="mt-2 text-sm font-medium text-red-500">
                                        {errors.housenumber}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-white">
                                <DropdownInputField
                                    type="text"
                                    label="Street Name"
                                    name="street"
                                    value={userData.street_name || ""}
                                    onChange={handleChange}
                                    placeholder="e.g., Rizal St., Mabini Avenue"
                                    items={streetList}
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Selecting a street may auto-fill the purok.
                                </p>
                                {errors.street && (
                                    <p className="mt-2 text-sm font-medium text-red-500">
                                        {errors.street}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ADDITIONAL */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h3 className="text-base font-semibold text-slate-800">
                                Additional Location Details
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Add subdivision and purok for better
                                classification.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-white">
                                <InputField
                                    type="text"
                                    label="Subdivision/Village/Compound"
                                    name="subdivision"
                                    value={userData.subdivision || ""}
                                    onChange={handleChange}
                                    placeholder="e.g., Villa Gloria Subdivision"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Leave blank if not applicable.
                                </p>
                                {errors.subdivision && (
                                    <p className="mt-2 text-sm font-medium text-red-500">
                                        {errors.subdivision}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-white">
                                <SelectField
                                    type="text"
                                    label="Purok/Zone/Sitio/Cabisera"
                                    name="purok"
                                    value={userData.purok || ""}
                                    onChange={handleChange}
                                    placeholder="Select purok"
                                    items={purok_numbers}
                                    required
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Helps group households by area.
                                </p>
                                {errors.purok && (
                                    <p className="mt-2 text-sm font-medium text-red-500">
                                        {errors.purok}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* GEOLOCATION */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">
                                    Geolocation
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    Optional coordinates for mapping and
                                    tracking.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                                    Optional
                                </span>

                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={gettingLocation}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {gettingLocation ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <MapPin className="h-4 w-4" />
                                    )}
                                    {gettingLocation
                                        ? "Locating..."
                                        : "Use Current Location"}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-white">
                                <InputField
                                    type="number"
                                    step="any"
                                    label="Latitude"
                                    name="latitude"
                                    value={userData.latitude || ""}
                                    onChange={handleChange}
                                    placeholder="e.g., 16.605000"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Range: -90 to 90
                                </p>
                                {errors.latitude && (
                                    <p className="mt-2 text-sm font-medium text-red-500">
                                        {errors.latitude}
                                    </p>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-white">
                                <InputField
                                    type="number"
                                    step="any"
                                    label="Longitude"
                                    name="longitude"
                                    value={userData.longitude || ""}
                                    onChange={handleChange}
                                    placeholder="e.g., 121.725000"
                                />
                                <p className="mt-2 text-xs text-slate-500">
                                    Range: -180 to 180
                                </p>
                                {errors.longitude && (
                                    <p className="mt-2 text-sm font-medium text-red-500">
                                        {errors.longitude}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FOOTNOTE */}
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4">
                        <p className="text-sm leading-6 text-slate-600">
                            Ensure all address details are correct to avoid
                            duplicate household records and support accurate
                            barangay mapping.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Address;
