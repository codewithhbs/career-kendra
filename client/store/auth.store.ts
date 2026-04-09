import { API_URL } from "@/constant/api";
import axios, { isAxiosError } from "axios";
import { create } from "zustand";
import Cookies from "js-cookie";

type LoginType = "otp" | "password";

type ProfileDetails = {
  id: number;
  userId: number;
  skills: [];
  experience: [];
  educations: [];
    user?: UserType;
  profileImage: string;
  percentageOfAccountComplete: number;
};


type UserType = {
  id: number;
  userName: string;
  contactNumber: string;
  uploadedCv?: string | null;
  emailAddress?: string;
  percentageOfAccountComplete?: number;
};

type AuthState = {
  token: string;
  user: UserType | null;
  profile: ProfileDetails | null;
  isOtpSent: boolean;
  otpTimer: number;
  otpInterval: NodeJS.Timeout | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  initAuth: () => void;
  clearError: () => void;

  startOtpTimer: (seconds?: number) => void;
  stopOtpTimer: () => void;

  register: (payload: {
    userName: string;
    contactNumber: string;
    emailAddress: string;
    password: string;
  }) => Promise<{ userId: number }>;

  resendOtp: (payload: {
    userId?: number;
    contactNumber?: string;
  }) => Promise<{ message: string }>;

  getProfile: () => Promise<{ data: ProfileDetails }>;

  verifyRegisterOtp: (payload: {
    userId: number;
    otp: string;
  }) => Promise<{ token: string; user: UserType }>;

  login: (payload: {
    contactNumber: string;
    loginType: LoginType;
    password?: string;
  }) => Promise<{ token?: string; user?: UserType; message?: string }>;

  verifyLoginOtp: (payload: {
    userId: number;
    otp: string;
  }) => Promise<{ token: string; user: UserType }>;

  logout: () => Promise<void>;

  updateProfile: (payload: {
    userName?: string;
    contactNumber?: string;
    emailAddress?: string;
  }) => Promise<{ data: Partial<UserType> }>;
};

// =========================
// Cookie Helpers
// =========================

const COOKIE_OPTIONS = {
  expires: 7,
  secure: true,
  sameSite: "strict" as const,
};

const setAuthCookies = (token: string, user: UserType) => {
  Cookies.set("apto_token", token, COOKIE_OPTIONS);
  Cookies.set("apto_user", JSON.stringify(user), COOKIE_OPTIONS);
};

const removeAuthCookies = () => {
  Cookies.remove("apto_token");
  Cookies.remove("apto_user");
};

const getAuthCookies = () => {
  if (typeof window === "undefined") return { token: "", user: null };

  const token = Cookies.get("apto_token") || "";
  const user = Cookies.get("apto_user");

  return {
    token,
    user: user ? JSON.parse(user) : null,
  };
};

// =========================
// Store
// =========================

export const useAuthStore = create<AuthState>((set, get) => ({
  token: "",
  user: null,
  profile: null,
  isOtpSent: false,
  otpTimer: 0,
  otpInterval: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // =========================
  // Init
  // =========================

  initAuth: async () => {
    const { token, user } = getAuthCookies();
    set({
      token,
      user,
      isAuthenticated: !!token,
    });

    await get().getProfile();
  },

  clearError: () => set({ error: null }),

  // =========================
  // OTP Timer
  // =========================

  startOtpTimer: (seconds = 60) => {
    const old = get().otpInterval;
    if (old) clearInterval(old);

    set({ otpTimer: seconds, isOtpSent: true });

    const interval = setInterval(() => {
      const current = get().otpTimer;

      if (current <= 1) {
        clearInterval(interval);
        set({ otpTimer: 0, otpInterval: null });
      } else {
        set({ otpTimer: current - 1 });
      }
    }, 1000);

    set({ otpInterval: interval });
  },

  stopOtpTimer: () => {
    const interval = get().otpInterval;
    if (interval) clearInterval(interval);

    set({ otpTimer: 0, otpInterval: null });
  },

  // =========================
  // Register
  // =========================

  register: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/auth/register`, payload);

      get().startOtpTimer(60);

      set({ loading: false });
      return res.data;
    } catch (err) {
      if (isAxiosError(err)) {
        set({
          loading: false,
          error: err.response?.data?.message || "Register failed",
        });
      }
      throw err;
    }
  },

  getProfile: async () => {
    try {
      const token = get().token || Cookies.get("apto_token") || "";
      const response = await axios.get(`${API_URL}/auth/get-profile-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        set({ profile: response.data.data });
      }
      set({ loading: false });

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
      }
    }
  },

  // =========================
  // Resend OTP
  // =========================

  resendOtp: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/auth/resend-otp`, payload);

      get().startOtpTimer(60);

      set({ loading: false });
      return res.data;
    } catch (err) {
      if (isAxiosError(err)) {
        set({
          loading: false,
          error: err.response?.data?.message || "Resend OTP failed",
        });
      }
      throw err;
    }
  },

  // =========================
  // Verify Register OTP
  // =========================

  verifyRegisterOtp: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(
        `${API_URL}/auth/verify-otp-for-register`,
        payload,
      );

      const { token, user } = res.data;

      if (token && user) {
        setAuthCookies(token, user);
        set({ token, user });
      }

      get().stopOtpTimer();

      set({ loading: false });
      return res.data;
    } catch (err) {
      if (isAxiosError(err)) {
        set({
          loading: false,
          error: err.response?.data?.message || "OTP verify failed",
        });
      }
      throw err;
    }
  },

  // =========================
  // Login
  // =========================

  login: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/auth/login`, payload);

      if (payload.loginType === "otp") {
        get().startOtpTimer(60);
      }

      if (payload.loginType === "password") {
        const { token, user } = res.data;

        if (token && user) {
          setAuthCookies(token, user);
          set({
            token,
            user,
            isAuthenticated: true,
          });
          await get().getProfile();
        }
      }

      set({ loading: false });
      return res.data;
    } catch (err) {
      if (isAxiosError(err)) {
        set({
          loading: false,
          error: err.response?.data?.message || "Login failed",
        });
      }
      throw err;
    }
  },

  // =========================
  // Verify Login OTP
  // =========================

  verifyLoginOtp: async (payload) => {
    try {
      set({ loading: true, error: null });

      const res = await axios.post(`${API_URL}/auth/login-otp-verify`, payload);

      const { token, user } = res.data;

      if (token && user) {
        setAuthCookies(token, user);
        set({
          token,
          user,
          isAuthenticated: true,
        });
        await get().getProfile();
      }

      get().stopOtpTimer();

      set({ loading: false });
      return res.data;
    } catch (err) {
      if (isAxiosError(err)) {
        set({
          loading: false,
          error: err.response?.data?.message || "OTP Login failed",
        });
      }
      throw err;
    }
  },

  // =========================
  // Logout
  // =========================

  logout: async () => {
    try {
      const token = get().token;

      if (token) {
        await axios.get(`${API_URL}/auth/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      // ignore logout errors
    } finally {
      removeAuthCookies();
      get().stopOtpTimer();

      set({
        token: "",
        user: null,
        isOtpSent: false,
        otpTimer: 0,
        loading: false,
        error: null,
      });
    }
  },

  // =========================
  // Update Profile
  // =========================

  updateProfile: async (payload) => {
    try {
      set({ loading: true, error: null });

      const token = get().token;

      const res = await axios.put(`${API_URL}/auth/update-details`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = res.data?.data;

      if (updatedUser) {
        const oldUser = get().user || {};
        const merged = { ...oldUser, ...updatedUser };

        Cookies.set("apto_user", JSON.stringify(merged), COOKIE_OPTIONS);
        set({ user: merged });
      }

      set({ loading: false });
      return res.data;
    } catch (err) {
      if (isAxiosError(err)) {
        set({
          loading: false,
          error: err.response?.data?.message || "Update profile failed",
        });
      }
      throw err;
    }
  },
}));
