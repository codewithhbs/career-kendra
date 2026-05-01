"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import loginImg from "@/assets/images/work/login.png";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const SignUpForm = () => {
  const { register, verifyRegisterOtp, resendOtp, loading, otpTimer } =
    useAuthStore();

  const [formData, setFormData] = useState({
    userName: "",
    emailAddress: "",
    contactNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    userName: "",
    emailAddress: "",
    contactNumber: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  // ============================
  // Validate
  // ============================
  useEffect(() => {
    const newErrors = {
      userName: "",
      emailAddress: "",
      contactNumber: "",
      password: "",
    };

    if (formData.userName && formData.userName.trim().length < 2) {
      newErrors.userName = "Name must be at least 2 characters";
    }

    if (formData.emailAddress) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailAddress)) {
        newErrors.emailAddress = "Please enter a valid email";
      }
    }

    if (formData.contactNumber) {
      const cleaned = formData.contactNumber.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        newErrors.contactNumber = "Enter valid 10-digit mobile number";
      }
    }

    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }

    setErrors(newErrors);
  }, [formData]);

  const isFormValid = () =>
    formData.userName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress) &&
    /^[0-9]{10}$/.test(formData.contactNumber.replace(/\D/g, "")) &&
    formData.password.length >= 8 &&
    Object.values(errors).every((e) => !e);

  // ============================
  // Register + Send OTP
  // ============================
  const handleRegisterAndSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fix the errors first.");
      return;
    }

    try {
      const res = await register({
        userName: formData.userName.trim(),
        contactNumber: formData.contactNumber.replace(/\D/g, ""),
        emailAddress: formData.emailAddress.toLowerCase().trim(),
        password: formData.password,
      });

      const id = res?.data?.id;

      if (!id) {
        toast.error("User id not received from server.");
        return;
      }

      setUserId(id);
      setOtpDialogOpen(true);
      toast.success("OTP sent successfully ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Register failed");
    }
  };

  // ============================
  // Verify OTP
  // ============================
  const handleVerifyOtp = async () => {
    if (!userId) {
      toast.error("User not found. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Enter complete 6-digit OTP");
      return;
    }

    try {
      const res = await verifyRegisterOtp({
        userId,
        otp,
      });

      toast.success(res?.message || "Account verified 🎉");

      setTimeout(() => {
        const destination =
          returnTo && returnTo.startsWith("/") ? returnTo : "/";
        window.location.replace(destination);
      }, 900);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    }
  };

  // ============================
  // Resend OTP
  // ============================
  const handleResendOtp = async () => {
    if (!userId) return toast.error("Register first");

    if (otpTimer > 0) return;

    try {
      await resendOtp({ userId });
      toast.success("OTP resent successfully ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Resend failed");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        {/* Mobile Top */}
        <div className="lg:hidden w-full bg-gradient-to-br from-[#FFF7DD] to-[#FFE8C0] py-10 px-6 text-center">
          <div className="text-4xl font-extrabold tracking-tight text-[#0B1E3C]">
            Career Kendra
            <span className="text-[#F7B500]">.</span>
            <span className="text-lg font-semibold text-[#F7B500] align-top ml-1">
              com
            </span>
          </div>
        </div>

        {/* Desktop Left */}
        <div className="hidden lg:flex lg:w-[32%] min-h-screen bg-white relative overflow-hidden flex-col items-center px-12 py-12">
          <div className="absolute top-0 left-0 w-full h-[48%] bg-gradient-to-br from-[#FFF7DD] to-[#FFE8C0] rounded-b-[180px] opacity-90" />

          <div className="relative z-10 self-start">
            <div className="text-4xl font-extrabold tracking-tight text-[#0B1E3C]">
              Career Kendra
              <span className="text-[#F7B500]">.</span>
              <span className="text-lg font-semibold text-[#F7B500] align-top ml-1">
                com
              </span>
            </div>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center my-8">
            <div className="w-[460px] h-[460px] relative">
              <Image
                src={loginImg}
                alt="Login illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-5xl font-extrabold text-[#2A2414] leading-tight">
              Find Your
              <br />
              Dream Job
            </h2>
            <p className="mt-5 text-lg text-slate-600 max-w-md">
              Connecting talent with opportunities that match your ambition.
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-[68%] min-h-screen bg-[#FAFAF9] flex items-center justify-center px-0 sm:px-12 py-10 relative overflow-hidden">
          <div className="w-full max-w-2xl relative z-10">
            <div className="p-8 md:p-12 border border-slate-100/70">
              <h1 className="text-4xl font-bold text-gray-900">
                Create Your Profile
              </h1>

              <form
                onSubmit={handleRegisterAndSendOtp}
                className="mt-8 space-y-4"
              >
                {/* Name */}
                <div>
                  <input
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, userName: e.target.value }))
                    }
                    placeholder="Full Name"
                    className={`w-full px-4 py-3.5 rounded-xl border text-base ${
                      errors.userName
                        ? "border-red-400"
                        : "border-slate-200 focus:border-amber-500"
                    } outline-none transition bg-white`}
                  />
                  {errors.userName && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.userName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        emailAddress: e.target.value,
                      }))
                    }
                    placeholder="Email Address"
                    className={`w-full px-4 py-3.5 rounded-xl border text-base ${
                      errors.emailAddress
                        ? "border-red-400"
                        : "border-slate-200 focus:border-amber-500"
                    } outline-none transition bg-white`}
                  />
                  {errors.emailAddress && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.emailAddress}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="Create Password"
                    className={`w-full px-4 py-3.5 rounded-xl border text-base ${
                      errors.password
                        ? "border-red-400"
                        : "border-slate-200 focus:border-amber-500"
                    } outline-none transition bg-white`}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <input
                    inputMode="numeric"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setFormData((p) => ({ ...p, contactNumber: val }));
                    }}
                    placeholder="10-digit Mobile Number"
                    className={`w-full px-4 py-3.5 rounded-xl border text-base ${
                      errors.contactNumber
                        ? "border-red-400"
                        : "border-slate-200 focus:border-amber-500"
                    } outline-none transition bg-white`}
                  />
                  {errors.contactNumber && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className={`w-full py-3.5 rounded-xl font-bold text-base mt-2 transition transform ${
                    loading || !isFormValid()
                      ? "bg-gray-400 cursor-not-allowed text-white/80"
                      : "bg-[#F7B500] hover:bg-[#e6a600] active:scale-[0.98] text-black shadow-md"
                  }`}
                >
                  {loading ? "Sending OTP..." : "Create Profile & Continue"}
                </button>
              </form>

              <p className="mt-10 text-center text-slate-600">
                Already have an account?{" "}
                <Link
                  href={`/auth/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
                  className="font-semibold text-[#C8641B] hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Dialog */}
      {otpDialogOpen && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 relative">
            <button
              onClick={() => setOtpDialogOpen(false)}
              className="absolute top-6 right-7 text-3xl text-gray-400 hover:text-gray-700"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold text-center mb-3">
              Verify Your Number
            </h2>

            <p className="text-center text-slate-500 mb-10">
              Enter OTP sent to{" "}
              <strong className="text-gray-800">
                +91 {formData.contactNumber}
              </strong>
            </p>

            <div className="flex justify-center gap-3 mb-8">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/, "");
                      const arr = otp.split("");
                      arr[i] = val;
                      setOtp(arr.join(""));

                      if (val && i < 5) {
                        const next = document.querySelector(
                          `input[data-otp-index="${i + 1}"]`,
                        ) as HTMLInputElement;
                        next?.focus();
                      }
                    }}
                    data-otp-index={i}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none transition bg-white"
                  />
                ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition ${
                otp.length === 6 && !loading
                  ? "bg-[#F7B500] hover:bg-[#e6a600] text-black shadow-md"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <div className="mt-6 text-center text-sm">
              {otpTimer > 0 ? (
                <p className="text-slate-500">Resend in {otpTimer}s</p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-amber-700 font-semibold hover:text-amber-800 underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUpForm;
