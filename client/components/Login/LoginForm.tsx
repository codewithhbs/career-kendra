"use client";

import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import loginImg from "@/assets/images/work/login.png";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const LoginForm = () => {
  const { login, verifyLoginOtp, otpTimer, loading, token } = useAuthStore();

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [loginVia, setLoginVia] = useState<"otp" | "password">("otp");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  const isValidMobile = (num: string) =>
    /^[0-9]{10}$/.test(num.replace(/\D/g, ""));

  // =========================
  // Send OTP or Password Login
  // =========================

  const redirectAfterLogin = () => {
    // prevent open-redirect (only allow internal paths)
    if (returnTo && returnTo.startsWith("/")) {
      router.replace(returnTo);
    } else {
      router.replace("/");
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNumber = contactNumber.replace(/\D/g, "");

    if (!isValidMobile(cleanNumber)) {
      toast.error("Enter valid 10-digit mobile number");
      return;
    }

    try {
      const res = await login({
        contactNumber: cleanNumber,
        loginType: loginVia,
        password: loginVia === "password" ? password : undefined,
      });

      if (loginVia === "otp") {
        const id = res?.data?.userId;
        if (!id) {
          toast.error("User not found");
          return;
        }
        setUserId(id);
        toast.success("OTP sent successfully ✅");
      }

      if (loginVia === "password") {
        toast.success("Login successful 🎉");
        redirectAfterLogin();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  // =========================
  // Verify OTP Login
  // =========================
  const handleVerifyOtp = async () => {
    if (!userId) return toast.error("Please request OTP first");

    if (otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }

    try {
      await verifyLoginOtp({
        userId,
        otp,
      });

      toast.success("Login successful 🎉");
      redirectAfterLogin();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    }
  };

  // =========================
  // Resend OTP
  // =========================
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    await handleLogin(new Event("submit") as any);
  };
  React.useEffect(() => {
    if (token) {
      const destination = returnTo && returnTo.startsWith("/") ? returnTo : "/";
      router.replace(destination);
    }
  }, [token, returnTo, router]);
  return (
    <div className="min-h-dvh bg-white flex flex-col lg:flex-row">
      {/* Left Panel (unchanged UI) */}
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

      {/* Right Panel */}
      <div className="flex-1 bg-[#F9F9F8] flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold">Welcome Back</h1>

          {/* Toggle */}
          <div className="mt-6 flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setLoginVia("otp")}
              className={`flex-1 py-3 rounded-xl ${
                loginVia === "otp"
                  ? "bg-white shadow text-black"
                  : "text-gray-500"
              }`}
            >
              OTP
            </button>
            <button
              onClick={() => setLoginVia("password")}
              className={`flex-1 py-3 rounded-xl ${
                loginVia === "password"
                  ? "bg-white shadow text-black"
                  : "text-gray-500"
              }`}
            >
              Password
            </button>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="10-digit Mobile Number"
              value={contactNumber}
              onChange={(e) =>
                setContactNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              className="w-full px-5 py-4 rounded-2xl border"
              required
            />

            {loginVia === "password" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border"
                required
              />
            )}

            {loginVia === "otp" && userId && (
              <>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full px-5 py-4 rounded-2xl border"
                />

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full py-4 bg-green-500 text-white rounded-2xl"
                >
                  Verify & Login
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0}
                  className="w-full py-2 text-sm text-amber-700"
                >
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
                </button>
              </>
            )}

            {loginVia === "password" && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#F7B500] rounded-2xl font-bold"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            )}

            {loginVia === "otp" && !userId && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#F7B500] rounded-2xl font-bold"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            )}
          </form>

          <p className="mt-6 text-sm text-center">
            Don't have an account?{" "}
            <Link
              href={`/auth/register${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
              className="text-amber-700"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
