// import { useMemo } from "react";

// const useAppUrl = () => {
//     // Define the URL constants for offline and online
//     const appUrl = "http://localhost:8000";
//     // const appUrl = "http://192.168.1.135:8000";
//     //const appUrl = "http://127.0.0.1:8000";
//     // const appUrl = "https://isu.chaelx.online";
//     // const appUrl = "https://isu.chaelx.online".replace(/\/$/, "");
//     //const appUrl = "https://ilagan-city.bims-ph.online/".replace(/\/$/, ""); // Production URL

//     const API_URL = useMemo(() => {
//         return appUrl;
//     }, []);

//     return API_URL;
// };

// export default useAppUrl;

// Dynamic URL based on environment
import { useMemo } from "react";

const useAppUrl = () => {
    const API_URL = useMemo(() => {
        return window.location.origin;
    }, []);

    return API_URL;
};

export default useAppUrl;
