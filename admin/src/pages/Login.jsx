import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import { Eye, EyeClosed, Layers, Users } from "lucide-react";
import api from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [activeTab, setActiveTab] = useState("admin"); // "admin" | "employee"
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = activeTab === "admin"
        ? "/ad/admin/login"
        : "/ad/employee/login";

      const res = await api.post(endpoint, {
        email: form.email,
        password: form.password,
      });

      const { token, [activeTab]: userData } = res.data.data;

      if (activeTab === "admin") {
        // Admin Login - adpt_ prefix
        localStorage.setItem("adpt_token", token);
        localStorage.setItem("adpt_admin", JSON.stringify(userData));
        localStorage.setItem("adpt_role", userData?.role?.roleName);
        localStorage.setItem("adpt_role_id", userData?.roleId);
        localStorage.setItem("adpt_admin_id", userData?.id);

        toast.success("Admin login successful");
        login(userData, token);
        window.location.href = "/dashboard";
      } else {
        // Employee Login - empl_ prefix
        localStorage.setItem("empl_token", token);
        localStorage.setItem("empl_employee", JSON.stringify(userData));
        localStorage.setItem("empl_employee_id", userData?.id);
        localStorage.setItem("empl_role", JSON.stringify(userData?.role || "employee"));

        toast.success("Employee login successful");
        login(userData, token);
        window.location.href = "/employee/dashboard"; // Change if needed
      }
    } catch (error) {
      console.error(`${activeTab} Login error:`, error);

      const msg = error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#1a140f] flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#b8975a10_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-md text-center">
          {/* Decorative Line */}
          <div className="flex justify-center mb-12">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#b8975a] to-transparent" />
          </div>

          {/* Logo Icon */}
          <div className="mx-auto mb-8 w-16 h-16 bg-gradient-to-br from-[#b8975a] to-[#d4b483] rounded-xl flex items-center justify-center shadow-xl shadow-[#b8975a]/30">
            <Layers className="w-9 h-9 text-[#1a140f]" />
          </div>

          {/* Brand Name */}
          <h1 className="text-7xl font-semibold text-[#f5f1ea] tracking-tight mb-2">
            Career Kendra
          </h1>
          <div className="text-[#b8975a] text-sm tracking-[4px] uppercase font-medium mb-6">
            Consulting Group
          </div>

          <p className="text-[#7a7268] text-lg leading-relaxed max-w-xs mx-auto">
            Empowering businesses through strategic insight, expert guidance, and measurable results.
          </p>

          {/* Decorative Divider */}
          <div className="flex items-center gap-4 my-16">
            <div className="flex-1 h-px bg-[#b8975a]/20" />
            <div className="text-[#b8975a]">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 0L7.5 4.5H12L8.25 7.25L9.75 12L6 9L2.25 12L3.75 7.25L0 4.5H4.5Z" />
              </svg>
            </div>
            <div className="flex-1 h-px bg-[#b8975a]/20" />
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Tab Switcher */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-10">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("admin");
                  setForm({ email: "", password: "" });
                }}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all ${activeTab === "admin"
                    ? "bg-[#b8975a] text-white shadow"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Layers className="w-5 h-5" />
                Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("employee");
                  setForm({ email: "", password: "" });
                }}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all ${activeTab === "employee"
                    ? "bg-[#b8975a] text-white shadow"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Users className="w-5 h-5" />
                Employee
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">
              {activeTab === "admin" ? "Admin Sign In" : "Employee Sign In"}
            </h2>
            <p className="text-gray-600">
              {activeTab === "admin"
                ? "Access the Career Consulting dashboard"
                : "Access your employee portal"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-500 tracking-widest uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={
                  activeTab === "admin"
                    ? "admin@careerkendra.com"
                    : "employee@careerkendra.com"
                }
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#b8975a] transition-colors placeholder:text-gray-400"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-500 tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#b8975a] transition-colors pr-12 placeholder:text-gray-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeClosed className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#b8975a] rounded"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-[#b8975a] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b8975a] hover:bg-[#a17f4a] disabled:bg-[#b8975a]/70 text-white font-semibold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#b8975a]/30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Authenticating...</>
              ) : (
                <>Sign In as {activeTab === "admin" ? "Admin" : "Employee"}</>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-10">
            © {new Date().getFullYear()} Career Consulting Group. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;