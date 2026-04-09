"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AptoEmployerLogin() {
  const router = useRouter();
  const { login, verifyLoginOtp, resendLoginOtp, loading, error, otpTimer, user, token } =
    useEmployerAuthStore();

  const [mode, setMode] = useState<"initial" | "otp" | "password">("initial");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userIdFromLogin, setUserIdFromLogin] = useState<number | null>(null);

  useEffect(() => {
    if (token && user) {
      router.push("/employer/profile");
    }
  }, [token, user, router]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!contactNumber.trim()) return;

    try {
      const payload = {
        employerContactNumber: contactNumber.trim(),
        loginType: mode === "password" ? "password" : "otp",
        ...(mode === "password" ? { password } : {}),
      };

      const res = await login(payload);
     
      if (res?.otpsend === true && res?.data?.userId) {
        setUserIdFromLogin(res?.data.userId);
        setMode("otp");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userIdFromLogin || !otp.trim()) return;
    try {
      await verifyLoginOtp({ userId: userIdFromLogin, otp: otp.trim() });
    } catch {
      
    }
  };

  const handleResend = async () => {
    if (!contactNumber.trim() || otpTimer > 0) return;
    try {
      await resendLoginOtp(contactNumber.trim());
    } catch {}
  };

  const reset = () => {
    setMode("initial");
    setOtp("");
    setPassword("");
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row">
      {/* Left - Employer-focused branding (30% width on desktop) */}
      <div className="hidden md:flex md:w-[40%] bg-gradient-to-br from-orange-50 via-yellow-50 to-white items-center justify-center p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-yellow-300 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-orange-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Career Kendra
          </h1>

          <p className="text-2xl lg:text-3xl font-bold text-orange-600 mb-8">
            Employer Dashboard
          </p>

          <div className="space-y-8 text-gray-800 text-lg lg:text-xl">
            <p className="font-medium">
              Hire smarter. Faster. Better.
            </p>

            <ul className="space-y-5 text-left max-w-sm mx-auto">
              <li className="flex items-start gap-3">
                <span className="text-2xl">📢</span>
                <span>Post jobs instantly to notice period candidates</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🔍</span>
                <span>Access verified talent pool with fast turnaround</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">💼</span>
                <span>Manage applications, interviews & onboarding</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <span>Reduce hiring time with Career Kendra's smart matching</span>
              </li>
            </ul>

            <p className="text-gray-600 pt-6 text-base">
              Join thousands of companies already hiring better with Career Kendra.
            </p>
          </div>
        </div>
      </div>

      {/* Right - Login Form (70% width on desktop) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-white md:w-[70%]">
        <div className="w-full max-w-lg">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {mode === "otp" ? "Verify Your OTP" : "Sign in to Employer Portal"}
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              {mode === "otp"
                ? `One-time password sent to ${contactNumber}`
                : "Manage jobs, candidates & hiring process"}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(mode === "initial" || mode === "password") && (
            <form onSubmit={handleSend} className="space-y-7">
              <div>
                <Label className="text-gray-700 text-base font-medium mb-2 block">
                  Mobile Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="Enter your registered mobile number"
                    className="h-14 pl-12 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {mode === "password" && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-gray-700 text-base font-medium">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="h-14 pl-12 text-base border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={loading || !contactNumber.trim()}
              >
                {loading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                {mode === "password" ? "Sign In" : "Get OTP"}
                {!loading && <ArrowRight className="ml-3 h-5 w-5" />}
              </Button>

              {mode === "initial" ? (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode("password")}
                    className="text-orange-600 hover:text-orange-700 font-medium text-base"
                  >
                    Sign in with password instead <ArrowRight className="h-4 w-4 inline mr-2"/>
                  </button>
                </div>
              ) : (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="text-gray-600 hover:text-gray-800 text-base"
                  >
                    <ArrowLeft className="h-4 w-4 inline mr-2"/>Back to OTP login
                  </button>
                </div>
              )}
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={handleVerify} className="space-y-7">
              <div>
                <Label className="text-gray-700 text-base font-medium mb-2 block">
                  Enter 6-digit OTP
                </Label>
                <Input
                  type="text"
                  placeholder="______"
                  maxLength={6}
                  className="h-14 text-center text-3xl tracking-[1em] border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                  required
                />
                <div className="mt-4 text-center text-sm">
                  {otpTimer > 0 ? (
                    <span className="text-gray-500">Resend in {otpTimer} seconds</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                disabled={loading || otp.length !== 6}
              >
                {loading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                Verify & Sign In
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={reset}
                  className="text-gray-600 hover:text-gray-800 text-base"
                >
                 <ArrowLeft className="h-4 w-4 inline mr-2"/>Try different number
                </button>
              </div>
            </form>
          )}

          <div className="mt-12 text-center text-gray-600">
            <p className="mb-2">New employer?</p>
            <Link
              href="/auth/regsiter-employers"
              className="text-orange-600 hover:text-orange-700 font-semibold text-base inline-flex items-center gap-2"
            >
              Create your employer account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}