// resources/js/Hooks/useGeolocation.jsx

import { useState, useCallback } from "react";
import { toast } from "sonner";

export default function useGeolocation() {
    const [gettingLocation, setGettingLocation] = useState(false);
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
    });

    const getCurrentLocation = useCallback((onSuccess = null) => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by this browser.");
            return;
        }

        setGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const coords = {
                    latitude,
                    longitude,
                };

                setLocation(coords);

                if (typeof onSuccess === "function") {
                    onSuccess(coords);
                }

                toast.success("Current location added successfully.");

                setGettingLocation(false);
            },
            (error) => {
                let message = "Unable to get your current location.";

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = "Location permission was denied.";
                        break;

                    case error.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable.";
                        break;

                    case error.TIMEOUT:
                        message = "Location request timed out.";
                        break;

                    default:
                        message = "Unable to retrieve your location.";
                }

                toast.error(message);

                setGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    }, []);

    return {
        location,
        gettingLocation,
        getCurrentLocation,
    };
}
