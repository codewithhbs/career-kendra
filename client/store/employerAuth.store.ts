// store/employerAuth.store.ts
"use client";

import { API_URL } from "@/constant/api";
import axios, { AxiosError, isAxiosError } from "axios";
import { create } from "zustand";
import Cookies from "js-cookie";

// ────────────────────────────────────────────────
// Types / Interfaces
// ────────────────────────────────────────────────

interface Employer {
  id: number;
  employerName: string;
  employerContactNumber: string;
  employerEmail: string;
  role: string;
}

export interface Company {
  id: number;
  companyName: string;
  companyStatus?: string;
  companyTagline?: string;
  companyCategory?: string;
  companySize?: string;
  GST?: string;
  PAN?: string;
  foundedYear?: string;
  country?: string;
  state?: string;
  city?: string;
  // 🔹 Contact Info
  companyEmail?: string;
  companyPhone?: string;
  whatsappNumber?: string;

  // 🔹 Web & Social
  companyWebsite?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  githubUrl?: string;
  googleMapsUrl?: string;

  // 🔹 Address
  pincode?: string;
  fullAddress?: string;

  // 🔹 Branding
  companyLogo?: string;

  // 🔹 About
  description?: string;

  // 🔹 Relation
  employer?: Employer;

  // 🔹 Timestamps (optional but useful)
  createdAt?: string;
  updatedAt?: string;
}
interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

interface RegisterPayload {
  employerName: string;
  employerContactNumber: string;
  employerEmail: string;
  password: string;
}

interface VerifyOtpPayload {
  userId: number;
  otp: string;
}

interface LoginPayload {
  employerContactNumber: string;
  loginType: "otp" | "password";
  password?: string;
}

interface StoreState {
  user: Employer | null;
  company: Company | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  otpTimer: number;

  readonly isAuthenticated: boolean;

  // Actions
  EmployerInitAuth: () => Promise<void>;
  startOtpTimer: () => void;
  resetError: () => void;

  register: (data: RegisterPayload) => Promise<{
    id: number;
    employerName: string;
    employerContactNumber: string;
  }>;
  verifyRegisterOtp: (payload: VerifyOtpPayload) => Promise<void>;
  resendRegisterOtp: (payload: {
    employerContactNumber: string;
  }) => Promise<void>;

  login: (data: LoginPayload) => Promise<unknown>;
  verifyLoginOtp: (payload: VerifyOtpPayload) => Promise<void>;
  resendLoginOtp: (contactNumber: string) => Promise<void>;

  fetchProfile: () => Promise<void>;
  logout: () => void;

  createCompanyStep1: (data: Record<string, unknown>) => Promise<void>;
  updateCompanyStep2: (
    data: Record<string, unknown> | FormData,
  ) => Promise<void>;
  fetchCompanyProfile: () => Promise<void>;
}

// ────────────────────────────────────────────────
// Axios Instance
// ────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("employer_token");
  console.log("Attaching token to request:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

const getAuthCookies = (): { token: string; user: Employer | null } => {
  if (typeof window === "undefined") {
    return { token: "", user: null };
  }

  const token = Cookies.get("employer_token") || "";
  let user: Employer | null = null;

  const userCookie = Cookies.get("employer_user");
  if (userCookie) {
    try {
      user = JSON.parse(userCookie) as Employer;
    } catch {
      Cookies.remove("employer_user");
    }
  }

  return { token, user };
};

const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const serverMessage =
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message ??
      defaultMessage;

    if (axiosError.response?.status === 401) {
      return "Session expired. Please sign in again.";
    }
    if (axiosError.response?.status === 429) {
      return "Too many requests. Please try again later.";
    }
    if (axiosError.code === "ECONNABORTED") {
      return "Request timed out. Please check your connection.";
    }
    return serverMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

// ────────────────────────────────────────────────
// Zustand Store
// ────────────────────────────────────────────────

export const useEmployerAuthStore = create<StoreState>()((set, get) => ({
  user: null,
  company: null,
  token: null,
  loading: false,
  error: null,
  otpTimer: 0,

  get isAuthenticated() {
    return !!get().token && !!get().user;
  },

  // ─── Initialize auth state from cookies + fetch profile ───
  EmployerInitAuth: async () => {
    const { token, user } = getAuthCookies();
    set({
      token,
      user,
      isAuthenticated: !!token && !!user,
      loading: false,
      error: null,
    });

    if (token) {
      await get().fetchProfile();
    }
  },

  startOtpTimer: () => {
    set({ otpTimer: 60 });

    const interval = setInterval(() => {
      set((state) => {
        if (state.otpTimer <= 1) {
          clearInterval(interval);
          return { otpTimer: 0 };
        }
        return { otpTimer: state.otpTimer - 1 };
      });
    }, 1000);

    // Optional: return cleanup (though zustand usually handles it)
    // return () => clearInterval(interval);
  },

  resetError: () => set({ error: null }),

  register: async (data: RegisterPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth-employer/register", data);
      get().startOtpTimer();
      return res.data.data ?? res.data; // { id, employerName, employerContactNumber }
    } catch (err) {
      const msg = handleApiError(err, "Failed to register. Please try again.");
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  verifyRegisterOtp: async ({ userId, otp }: VerifyOtpPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth-employer/verify-otp-for-register", {
        userId,
        otp,
      });

      const { token, user } = res.data;

      Cookies.set("employer_token", token, { expires: 7 });
      Cookies.set("employer_user", JSON.stringify(user), { expires: 7 });

      set({
        user,
        token,
        error: null,
      });
    } catch (err) {
      const msg = handleApiError(err, "Invalid or expired OTP.");
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  resendRegisterOtp: async (payload: { employerContactNumber: string }) => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth-employer/resend-otp", payload);
      get().startOtpTimer();
    } catch (err) {
      const msg = handleApiError(err, "Failed to resend OTP.");
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  // ────────────────────────────────────────────────
  // Login / OTP / Profile / Company actions
  // (kept mostly same, just stricter typing)
  // ────────────────────────────────────────────────

  login: async (data: LoginPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth-employer/login", data);
      if (data.loginType === "otp") {
        get().startOtpTimer();
        return res.data;
      }
      if (data.loginType === "password") {
        Cookies.set("employer_token", res.data.token, { expires: 7 });
        Cookies.set("employer_user", JSON.stringify(res.data.user), {
          expires: 7,
        });
        set({
          user: res.data.user,
          token: res.data.token,
          error: null,
        });
      }
      return res.data;
    } catch (err) {
      const msg = handleApiError(
        err,
        "Login failed. Please check your credentials.",
      );
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  verifyLoginOtp: async ({ userId, otp }: VerifyOtpPayload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth-employer/login-otp-verify", {
        userId,
        otp,
      });
      Cookies.set("employer_token", res.data.token, { expires: 7 });
      Cookies.set("employer_user", JSON.stringify(res.data.user), {
        expires: 7,
      });
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        error: null,
      });
    } catch (err) {
      const msg = handleApiError(err, "Invalid or expired OTP.");
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  resendLoginOtp: async (contactNumber: string) => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth-employer/login", {
        employerContactNumber: contactNumber,
        loginType: "otp",
      });
      get().startOtpTimer();
    } catch (err) {
      const msg = handleApiError(err, "Failed to resend OTP.");
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/auth-employer/get-profile-details");
      const profileData = res.data.data ?? res.data;
      set({ user: profileData, error: null });
      // Optional: sync cookie
      if (profileData) {
        Cookies.set("employer_user", JSON.stringify(profileData), {
          expires: 7,
        });
      }
    } catch (err) {
      const msg = handleApiError(err, "Failed to load profile.");
      set({ error: msg });
      if ((err as AxiosError)?.response?.status === 401) {
        get().logout();
      }
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    Cookies.remove("employer_token");
    Cookies.remove("employer_user");
    set({
      user: null,
      token: null,
      company: null,
      error: null,
      otpTimer: 0,
    });
  },

  createCompanyStep1: async (data: Record<string, unknown>) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/company/create-step1", data);
      set({ company: res.data.data ?? res.data, error: null });
      return res.data;
    } catch (err) {
      const msg = handleApiError(
        err,
        "Failed to create company profile (step 1).",
      );
      console.error("createCompanyStep1 failed:", err); // ✅ add this
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  updateCompanyStep2: async (data: Record<string, unknown> | FormData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put("/company/update-step2", data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      });
      set({ company: res.data.data ?? res.data, error: null });
    } catch (err) {
      const msg = handleApiError(
        err,
        "Failed to update company profile (step 2).",
      );
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  fetchCompanyProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/company/profile");
      // console.log("Fetched company profile:", res.data);
      if (res.data?.notFound === false && typeof window !== "undefined") {
        // window.location.href = "/company/onboarding/step1";
      }
      set({ company: res.data.data ?? res.data, error: null });
    } catch (err) {
      const msg = handleApiError(err, "Failed to fetch company profile.");
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  fetchCompanyList: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/company/companies-list`);
      return res.data.data ?? res.data;
    } catch (err) {
      const msg = handleApiError(err, "Failed to fetch company list.");
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  // employerAuth.store.ts mein add karo

fetchCompanyById: async (id: string) => {
  set({ loading: true });
  try {
    const res = await axios.get(`${API_URL}/company/company/${id}`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${get().token}` },
    });
    console.log("res",res)
    // set({ company: res.data?.data, loading: false });
    return res.data?.data;
  } catch (err) {
    console.error("fetchCompanyById error:", err);
    set({ loading: false });
  }
},

}));
