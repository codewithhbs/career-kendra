"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import loginImg from "@/assets/images/signimage.png"; // Replace with orange-themed illustration
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { useRouter } from "next/navigation";

export default function SignUpEmployer() {
  const router = useRouter();
  const { register, verifyRegisterOtp, resendRegisterOtp, loading, otpTimer } =
    useEmployerAuthStore();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    employerName: "",
    employerEmail: "",
    employerContactNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<keyof typeof formData, string>>({
    employerName: "",
    employerEmail: "",
    employerContactNumber: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [phoneForDisplay, setPhoneForDisplay] = useState("");

  // Real-time validation (unchanged logic)
  useEffect(() => {
    const newErrors: typeof errors = {
      employerName: "",
      employerEmail: "",
      employerContactNumber: "",
      password: "",
    };

    if (
      formData.employerName.trim() &&
      formData.employerName.trim().length < 2
    ) {
      newErrors.employerName = "Minimum 2 characters";
    }

    if (formData.employerEmail.trim()) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(formData.employerEmail.trim().toLowerCase())) {
        newErrors.employerEmail = "Invalid email format";
      }
    }

    const cleaned = formData.employerContactNumber.replace(/\D/g, "");
    if (cleaned && cleaned.length !== 10) {
      newErrors.employerContactNumber = "Enter valid 10-digit mobile number";
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Minimum 8 characters";
    }

    setErrors(newErrors);
  }, [formData]);

  const isFormValid = () =>
    formData.employerName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      formData.employerEmail.trim().toLowerCase(),
    ) &&
    formData.employerContactNumber.replace(/\D/g, "").length === 10 &&
    formData.password.length >= 8 &&
    Object.values(errors).every((err) => !err);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast.error("Please fix the errors above");
      return;
    }

    const payload = {
      employerName: formData.employerName.trim(),
      employerEmail: formData.employerEmail.trim().toLowerCase(),
      employerContactNumber: formData.employerContactNumber.replace(/\D/g, ""),
      password: formData.password,
    };

    try {
      const res = await register(payload);
      console.log("Registration response:", res);
      setUserId(res.id);
      setPhoneForDisplay(res.employerContactNumber);
      setStep("otp");
      toast.success("OTP sent to your mobile number");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      toast.error(msg);
    }
  };

  const handleVerifyOtp = async () => {
    if (!userId) return toast.error("Session expired. Please start again.");
    if (otp.length !== 6) return toast.error("Please enter 6-digit OTP");

    try {
      await verifyRegisterOtp({ userId, otp });
      toast.success("Account verified successfully!");
      // router.push("/company/onboarding/step1");
      router.push("/job-posting");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired OTP";
      toast.error(msg);
    }
  };

  const handleResendOtp = async () => {
    if (!userId) return toast.error("Please register first");
    if (otpTimer > 0) return;

    try {
      await resendRegisterOtp({ userId });
      toast.success("New OTP sent");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not resend OTP. Try again.",
      );
    }
  };

  const handleOtpInput = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;

    const chars = otp.split("");
    chars[idx] = value;
    setOtp(chars.join(""));

    if (value && idx < 5) {
      const next = document.querySelector<HTMLInputElement>(
        `[data-otp-idx="${idx + 1}"]`,
      );
      next?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50/30 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl grid lg:grid-cols-5 gap-8 xl:gap-12 items-center">
        {/* Left side – ~30% branding & illustration */}
        <div className="hidden lg:flex lg:col-span-2 flex-col justify-center items-center text-center px-6 space-y-10">
          <div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-orange-600 tracking-tight">
              Career<span className="text-yellow-500">.</span> Kandra
            </h1>
            <p className="mt-2 text-xl text-gray-800 font-semibold">
              Hire Local Talent Fast!
            </p>
          </div>

          <div className="relative w-full max-w-[520px] aspect-[4/3]">
            <Image
              src={loginImg}
              alt="Employer hiring illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className=" max-w-md">
            <p className="text-lg text-gray-800 font-medium leading-relaxed">
              Post jobs, find reliable workers nearby — hire in hours, not
              weeks!
            </p>
            <ul className="text-left text-gray-700 space-y-2.5 text-base">
              <li className="flex items-center gap-2">
                <span className="text-yellow-500 text-xl">★</span> Verified
                candidates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500 text-xl">★</span> Free job
                posting
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500 text-xl">★</span> Fast
                shortlisting
              </li>
            </ul>
          </div>
        </div>

        {/* Right side – ~70% form / OTP card */}
        <div className="lg:col-span-3 rounded-2xl   p-8 md:p-10 w-full max-w-2xl mx-auto">
          {step === "form" ? (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">
                  Create Employer Account
                </h2>
                <p className="mt-3 text-gray-600 text-lg">
                  Start hiring great people today
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.employerName}
                    onChange={(e) =>
                      setFormData({ ...formData, employerName: e.target.value })
                    }
                    placeholder="John Doe"
                    className={`w-full px-5 py-3.5 rounded-xl border text-base transition-all shadow-sm ${
                      errors.employerName
                        ? "border-red-400 focus:border-red-400 ring-2 ring-red-200/50"
                        : "border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200/40"
                    } outline-none bg-white`}
                  />
                  {errors.employerName && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.employerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={formData.employerEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employerEmail: e.target.value,
                      })
                    }
                    placeholder="you@company.com"
                    className={`w-full px-5 py-3.5 rounded-xl border text-base transition-all shadow-sm ${
                      errors.employerEmail
                        ? "border-red-400 focus:border-red-400 ring-2 ring-red-200/50"
                        : "border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200/40"
                    } outline-none bg-white`}
                  />
                  {errors.employerEmail && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.employerEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mobile Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formData.employerContactNumber}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setFormData({ ...formData, employerContactNumber: val });
                    }}
                    placeholder="9876543210"
                    className={`w-full px-5 py-3.5 rounded-xl border text-base transition-all shadow-sm ${
                      errors.employerContactNumber
                        ? "border-red-400 focus:border-red-400 ring-2 ring-red-200/50"
                        : "border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200/40"
                    } outline-none bg-white`}
                  />
                  {errors.employerContactNumber && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.employerContactNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className={`w-full px-5 py-3.5 rounded-xl border text-base transition-all shadow-sm ${
                      errors.password
                        ? "border-red-400 focus:border-red-400 ring-2 ring-red-200/50"
                        : "border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200/40"
                    } outline-none bg-white`}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98] ${
                    loading || !isFormValid()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? "Creating..." : "Create Account →"}
                </button>
              </form>

              <p className="mt-8 text-center text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-bold text-orange-600 hover:text-orange-700 underline"
                >
                  Sign In
                </Link>
              </p>
            </>
          ) : (
            <div className="space-y-8 text-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Verify Mobile Number
                </h2>
                <p className="mt-3 text-gray-600 text-lg">
                  Enter 6-digit OTP sent to{" "}
                  <strong className="text-orange-700">
                    +91 {phoneForDisplay || formData.employerContactNumber}
                  </strong>
                </p>
              </div>

              <div className="flex justify-center gap-3 sm:gap-5">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => handleOtpInput(e.target.value, i)}
                      data-otp-idx={i}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-3xl font-bold border-2 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200/30 outline-none transition bg-white shadow-sm"
                    />
                  ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className={`w-full py-4 rounded-xl font-bold text-lg transition transform active:scale-[0.98] ${
                  otp.length === 6 && !loading
                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="text-sm">
                {otpTimer > 0 ? (
                  <p className="text-gray-500">Resend in {otpTimer}s</p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="text-orange-600 font-bold hover:text-orange-700 underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
