// lib/axiosInstance.ts
import axios from "axios";
import { API_URL } from "@/constant/api";
import Cookies from "js-cookie";

// Single axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,           // optional – adjust as needed
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor – attach token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Try to get token from cookies first (works everywhere including SSR)
    let token = Cookies.get("apto_token");

    // 2. If you're on client & zustand store is available → prefer fresh value from store
    if (typeof window !== "undefined") {
   
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor (handle 401 → logout, etc.)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
    
      Cookies.remove("apto_token");
      Cookies.remove("apto_user");

      // Optional: redirect to login
      if (typeof window !== "undefined") {
        // window.location.href = "/login"; // or use next/navigation
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;