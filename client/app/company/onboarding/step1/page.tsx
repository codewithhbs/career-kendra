"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { INDUSTRIES } from "@/lib/industries";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompanyStep1() {
  const router = useRouter();
  const { createCompanyStep1, loading, isAuthenticated, EmployerInitAuth } =
    useEmployerAuthStore();

  useEffect(() => {
    EmployerInitAuth();
  }, [EmployerInitAuth]);

  if (!isAuthenticated) {
    // router.replace("/auth/login-employers");
    return null;
  }

  const [form, setForm] = useState({
  companyName: "",
  companyTagline: "",
  companyCategory: "",
  companySize: "",
  GST: "",
  PAN: "",
  foundedYear: "",
  country: "India",
  state: "",
  city: "",
});

  const [errors, setErrors] = useState<Partial<typeof form>>({});
const [taglineLength, setTaglineLength] = useState(0);

  const validateForm = () => {
    const newErrors: Partial<typeof form> = {};

    if (!form.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (form.GST.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.GST.trim().toUpperCase())) {
      newErrors.GST = "Invalid GSTIN format";
    }

    if (form.PAN.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.PAN.trim().toUpperCase())) {
      newErrors.PAN = "Invalid PAN format";
    }

    if (form.foundedYear.trim() && !/^(19|20)\d{2}$/.test(form.foundedYear)) {
      newErrors.foundedYear = "Please enter a valid year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors", { duration: 4000 });
      return;
    }

    try {
      await createCompanyStep1({
        companyName: form.companyName.trim(),
        companyTagline: form.companyTagline.trim() || undefined,
        companyCategory: form.companyCategory || undefined,
        companySize: form.companySize || undefined,
        GST: form.GST.trim().toUpperCase() || undefined,
        PAN: form.PAN.trim().toUpperCase() || undefined,
        foundedYear: form.foundedYear.trim() || undefined,
        country: form.country.trim() || undefined,
        state: form.state.trim() || undefined,
        city: form.city.trim() || undefined,
      });

      toast.success("Company created successfully!", { icon: "🏢" });
      router.push("/company/onboarding/step2");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to create company. Please try again.";
      toast.error(msg, { duration: 5000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 flex items-center justify-center px-5 py-10 md:py-16">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Progress header */}
        <div className="px-6 pt-6 pb-3 md:px-10">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-2.5">
            <span className="text-amber-700 font-semibold">Step 1 of 2</span>
            <span>Basic Information</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: "50%" }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="px-6 pb-10 md:px-10">
          <div className="text-center mb-9">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 text-xl font-bold mb-4">
              1
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Tell us about your company
            </h1>
            <p className="mt-2.5 text-sm text-slate-600 max-w-md mx-auto">
              Complete the essential details — everything else can be added or changed later.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 – Name & Tagline */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Acme Innovations Pvt Ltd"
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm transition-all ${
                    errors.companyName
                      ? "border-red-300 bg-red-50/50 focus:border-red-400"
                      : "border-slate-200 focus:border-amber-400 focus:ring-amber-100/30"
                  } outline-none bg-white`}
                />
                {errors.companyName && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tagline / Slogan
                </label>
                <input
                  value={form.companyTagline}
                  onChange={(e) => {
                    setForm({ ...form, companyTagline: e.target.value });
                    setTaglineLength(e.target.value.length);
                  }}
                  placeholder="e.g. Innovating the Future of Work"
                  maxLength={100}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-amber-400 text-sm outline-none bg-white transition-all"
                />
                <div className="mt-1.5 flex justify-between text-xs">
                  <span className="text-slate-500">Optional – keep it short & catchy</span>
                  <span className={taglineLength > 90 ? "text-amber-600" : "text-slate-400"}>
                    {taglineLength}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2 – Category & Size */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Category
                </label>
                <Select
                  value={form.companyCategory}
                  onValueChange={(value) => setForm({ ...form, companyCategory: value })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:border-amber-400 text-sm">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[320px] rounded-xl">
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry} className="text-sm py-2.5">
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Size
                </label>
                <Select
                  value={form.companySize}
                  onValueChange={(value) => setForm({ ...form, companySize: value })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:border-amber-400 text-sm">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1-10">1–10 employees</SelectItem>
                    <SelectItem value="11-50">11–50 employees</SelectItem>
                    <SelectItem value="51-200">51–200 employees</SelectItem>
                    <SelectItem value="201-500">201–500 employees</SelectItem>
                    <SelectItem value="501-1000">501–1,000 employees</SelectItem>
                    <SelectItem value="1001+">1,001+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* GST & PAN */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  GSTIN (optional)
                </label>
                <input
                  value={form.GST}
                  onChange={(e) => setForm({ ...form, GST: e.target.value.toUpperCase() })}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm uppercase tracking-wide ${
                    errors.GST
                      ? "border-red-300 bg-red-50/50 focus:border-red-400"
                      : "border-slate-200 focus:border-amber-400"
                  } outline-none bg-white transition-all`}
                />
                {errors.GST && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.GST}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  PAN (optional)
                </label>
                <input
                  value={form.PAN}
                  onChange={(e) => setForm({ ...form, PAN: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm uppercase tracking-wide ${
                    errors.PAN
                      ? "border-red-300 bg-red-50/50 focus:border-red-400"
                      : "border-slate-200 focus:border-amber-400"
                  } outline-none bg-white transition-all`}
                />
                {errors.PAN && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.PAN}</p>
                )}
              </div>
            </div>

            {/* Founded + Location */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Founded Year
                </label>
                <input
                  type="number"
                  value={form.foundedYear}
                  onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
                  placeholder="2018"
                  min="1900"
                  max={new Date().getFullYear()}
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm ${
                    errors.foundedYear
                      ? "border-red-300 bg-red-50/50 focus:border-red-400"
                      : "border-slate-200 focus:border-amber-400"
                  } outline-none bg-white transition-all`}
                />
                {errors.foundedYear && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.foundedYear}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Country
                </label>
                <input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="India"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-amber-400 text-sm outline-none bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  State, City
                </label>
                <input
                  value={form.state && form.city ? `${form.state}, ${form.city}` : ""}
                  onChange={(e) => {
                    const parts = e.target.value.split(",").map((p) => p.trim());
                    setForm({
                      ...form,
                      state: parts[0] || "",
                      city: parts[1] || "",
                    });
                  }}
                  placeholder="Delhi, New Delhi"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-amber-400 text-sm outline-none bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-medium text-base transition-all duration-200 ${
                  loading
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-900 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Creating company..." : "Create Company Profile →"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Only company name is required — complete the rest anytime from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}