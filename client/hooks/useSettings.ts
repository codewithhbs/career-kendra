import axiosInstance from "@/lib/user_axios"; // ← new import
import { useCallback, useState } from "react";

export const useSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/ad/get-web-settings");
            setSettings(response.data.data || null);
        } catch (err) {
            setError("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    }, []);

    return { settings, loading, error, fetchSettings };
};