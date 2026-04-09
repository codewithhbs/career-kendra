import { useState, useEffect } from "react";
import api from "../utils/api";

export const useUserHook = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get(`/ad/user-details/${userId}`);

      console.log("USER DATA:", data);

      setUser(data?.data || null);
    } catch (err) {
      console.error("Fetch User Error:", err);
      setError(err?.response?.data?.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser, 
  };
};