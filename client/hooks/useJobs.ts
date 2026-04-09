// hooks/useJob.ts
import { useState, useEffect, useCallback } from "react";
import { isAxiosError } from "axios";
import axiosInstance from "@/lib/user_axios";

export const useJob = () => {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    jobType: "",
    workMode: "",
    shiftType: "",
    city: "",
    minSalary: "",
    maxSalary: "",
    minExperience: "",
    maxExperience: "",
    industry: "",
    jobCategory: "",
    sortBy: "createdAt",
    order: "DESC",
  });

  /**
   * Fetch Jobs
   */
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/jobs/for-user", {
        params: { page, limit, ...filters },
      });

      setJobs(response.data.jobs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err?.response?.data?.message || "Failed to fetch jobs");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  /**
   * Fetch Saved Jobs
   */
  const fetchSavedJobs = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/applications/get-all-saved-job");
      setSavedJobs(response.data.data || []);
    } catch (err) {
      if (isAxiosError(err)) {
        console.log(err.response);
      }
    }
  }, []);

  /**
   * Save Job
   */
  const saveJob = async (jobId: number) => {
    try {
      const response = await axiosInstance.post(`/applications/saved-job/${jobId}`);
      await fetchSavedJobs();
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        throw err.response?.data || { message: "Failed to save job" };
      }
      throw err;
    }
  };

  /**
   * Check Saved Status
   */
  const checkAlreadySaved = async (jobId: number) => {
    try {
      const response = await axiosInstance.get(`/applications/get-check-saved/${jobId}`);
      setIsAlreadySaved(!!response.data?.data?.isSaved);
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(err.response);
      }
      setIsAlreadySaved(false);
    }
  };

  /**
   * Remove Saved Job
   */
  const removeSavedJob = async (jobId: number) => {
    try {
      const response = await axiosInstance.post(`/applications/remove-job/${jobId}`);
      await fetchSavedJobs();
      return response.data;
    } catch (err) {
      if (isAxiosError(err)) {
        throw err.response?.data || { message: "Failed to remove saved job" };
      }
      throw err;
    }
  };

  /**
   * Update Multiple Filters (FIXED)
   */
  const updateFilter = (newFilters: Partial<typeof filters>) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  /**
   * Fetch Jobs When Filters Change
   */
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /**
   * Fetch Saved Jobs Once
   */
  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  return {
    jobs,
    savedJobs,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    filters,
    updateFilter,
    refetch: fetchJobs,
    fetchSavedJobs,
    checkAlreadySaved,
    isAlreadySaved,
    saveJob,
    removeSavedJob,
  };
};