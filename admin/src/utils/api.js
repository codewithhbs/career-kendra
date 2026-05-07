import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://api.careerkendra.com/api/v1",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("adpt_token") || localStorage.getItem("empl_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message =
            error.response?.data?.error ||   // server "error" field bhejta hai
            error.response?.data?.message || 
            "Something went wrong";

        if (status === 401) {
            console.warn("Session expired. Logging out...");

            // Dono tokens remove karo
            localStorage.removeItem("adpt_token");
            localStorage.removeItem("empl_token");
            localStorage.removeItem("user");

            toast.error(message); // "Token expired. Please login again."

            window.location.href = "/login";

            return Promise.reject({ status, message, original: error });
        }

        // Baaki sab errors pe toast dikhao
        toast.error(message);

        if (status === 403) console.warn("Forbidden:", message);
        if (status === 404) console.warn("Not Found:", message);
        if (status >= 500) console.error("Server Error:", message);
        if (!error.response) console.error("Network Error. Check internet connection.");

        return Promise.reject({
            status,
            message,
            original: error,
        });
    }
);

export default api;