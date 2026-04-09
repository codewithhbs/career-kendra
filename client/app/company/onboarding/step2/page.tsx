"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import Image from "next/image";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { IMAGE_URL } from "@/constant/api";
import { isAxiosError } from "axios";

export default function CompanyStep2() {
  const router = useRouter();
  const {
    updateCompanyStep2,
    loading,
    isAuthenticated,
    fetchCompanyProfile,
    company,
  } = useEmployerAuthStore();

  if (!isAuthenticated) {
    router.replace("/auth/login-employers");
    return null;
  }
  console.log(company);

  const [form, setForm] = useState({
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    linkedinUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    githubUrl: "",
    whatsappNumber: "",
    googleMapsUrl: "",
    pincode: "",
    fullAddress: "",
    description: "", // about company
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // ────────────────────────────────────────────────
  // Logo Upload with Dropzone
  // ────────────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Only images allowed (png, jpg, jpeg, webp)");
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image must be under 2MB");
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    multiple: false,
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (!company) return;

    setForm({
      companyEmail:
        company.companyEmail || company?.employer?.employerEmail || "",
      companyPhone:
        company.companyPhone || company?.employer?.employerContactNumber || "",
      companyWebsite: company.companyWebsite || "",
      linkedinUrl: company.linkedinUrl || "",
      facebookUrl: company.facebookUrl || "",
      instagramUrl: company.instagramUrl || "",
      twitterUrl: company.twitterUrl || "",
      youtubeUrl: company.youtubeUrl || "",
      githubUrl: company.githubUrl || "",
      whatsappNumber: company.whatsappNumber || "",
      googleMapsUrl: company.googleMapsUrl || "",
      pincode: company.pincode || "",
      fullAddress: company.fullAddress || "",
      description: company.description || "", // ⚠️ you used wrong key earlier
    });

    if (company.companyLogo) {
      setLogoPreview(`${IMAGE_URL}${company.companyLogo}`);
    }
  }, [company]);
  // ────────────────────────────────────────────────
  // Simple client-side validation
  // ────────────────────────────────────────────────
  const validate = () => {
    const newErrors: Partial<typeof form> = {};

    // Optional but format checks
    if (
      form.companyEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail)
    ) {
      newErrors.companyEmail = "Invalid email format";
    }

    if (form.companyPhone && !/^[6-9]\d{9}$/.test(form.companyPhone)) {
      newErrors.companyPhone = "Enter valid 10-digit Indian number";
    }

    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "PIN code must be 6 digits";
    }

    if (form.description.trim() && form.description.trim().length < 30) {
      newErrors.description = "Description too short (min 30 chars if filled)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ────────────────────────────────────────────────
  // Submit handler – supports FormData for logo
  // ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please correct the errors");
      return;
    }

    const payload: Record<string, any> = {
      companyEmail: form.companyEmail.trim() || undefined,
      companyPhone: form.companyPhone.trim() || undefined,
      companyWebsite: form.companyWebsite.trim() || undefined,
      linkedinUrl: form.linkedinUrl.trim() || undefined,
      facebookUrl: form.facebookUrl.trim() || undefined,
      instagramUrl: form.instagramUrl.trim() || undefined,
      twitterUrl: form.twitterUrl.trim() || undefined,
      youtubeUrl: form.youtubeUrl.trim() || undefined,
      githubUrl: form.githubUrl.trim() || undefined,
      whatsappNumber: form.whatsappNumber.trim() || undefined,
      googleMapsUrl: form.googleMapsUrl.trim() || undefined,
      pincode: form.pincode.trim() || undefined,
      fullAddress: form.fullAddress.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    try {
      if (logoFile) {
        const formData = new FormData();

        // Append all text fields
        Object.entries(payload).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });

        // Append logo file
        formData.append("companyLogo", logoFile);

        await updateCompanyStep2(formData);
      } else {
        // No logo → send JSON
        await updateCompanyStep2(payload);
      }

      toast.success("Company profile updated successfully!", { icon: "🎉" });
      router.push("/employer/profile"); // or "/company/jobs" / "/employer/profile"
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          router.replace("/auth/login-employers");
          return;
        }

        const msg = err.response?.data?.message || "Failed to update profile";

        toast.error(msg, { duration: 5000 });
      } else {
        toast.error("Something went wrong", { duration: 5000 });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-5 py-10 md:py-16">
      <div className="w-full max-w-6xl bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        {/* Progress */}
        <div className="px-6 pt-6 pb-3 md:px-10">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-2.5">
            <span className="text-amber-700 font-semibold">Step 2 of 2</span>
            <span>Company Details</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-amber-500 rounded-full transition-all duration-700" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-10 md:px-10">
          <div className="text-center mb-9">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 text-xl font-bold mb-4">
              2
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Complete your company profile
            </h1>
            <p className="mt-2.5 text-sm text-slate-600 max-w-md mx-auto">
              Add contact info, social links & address to help candidates reach
              you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Logo Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Company Logo{" "}
                <span className="text-slate-500 text-xs">(recommended)</span>
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 md:p-10 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-amber-500 bg-amber-50/60"
                    : "border-slate-300 hover:border-amber-400 hover:bg-slate-50"
                }`}
              >
                <input {...getInputProps()} />
                {logoPreview ? (
                  <div className="space-y-4">
                    <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
               
                        className="object-contain p-2"
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      Click or drag to change logo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-6">
                    <div className="text-4xl text-amber-500">↑</div>
                    <p className="font-medium text-slate-700">
                      Drag & drop logo here
                    </p>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, WebP • Max 2MB • Recommended 512×512
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. About Company */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                About the Company
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                placeholder="Tell candidates what your company does, culture, values..."
                className={`w-full px-4 py-3.5 rounded-xl border text-sm resize-y min-h-[110px] ${
                  errors.description
                    ? "border-red-300 bg-red-50/40 focus:border-red-400"
                    : "border-slate-200 focus:border-amber-400 focus:ring-amber-100/40"
                } outline-none bg-white transition-all`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* 3. Contact Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Email
                </label>
                <input
                  type="email"
                  value={form.companyEmail}
                  onChange={(e) =>
                    setForm({ ...form, companyEmail: e.target.value })
                  }
                  placeholder="hr@yourcompany.com"
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm ${
                    errors.companyEmail
                      ? "border-red-300 bg-red-50/40"
                      : "border-slate-200 focus:border-amber-400"
                  } outline-none bg-white transition-all`}
                />
                {errors.companyEmail && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.companyEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Phone
                </label>
                <input
                  type="tel"
                  value={form.companyPhone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      companyPhone: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    })
                  }
                  placeholder="9876543210"
                  maxLength={10}
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm ${
                    errors.companyPhone
                      ? "border-red-300 bg-red-50/40"
                      : "border-slate-200 focus:border-amber-400"
                  } outline-none bg-white transition-all`}
                />
                {errors.companyPhone && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.companyPhone}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Website & Social Links */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Website
                </label>
                <input
                  type="url"
                  value={form.companyWebsite}
                  onChange={(e) =>
                    setForm({ ...form, companyWebsite: e.target.value })
                  }
                  placeholder="https://www.yourcompany.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-amber-400 text-sm outline-none bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  LinkedIn Company Page
                </label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) =>
                    setForm({ ...form, linkedinUrl: e.target.value })
                  }
                  placeholder="https://linkedin.com/company/yourcompany"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-amber-400 text-sm outline-none bg-white transition-all"
                />
              </div>
            </div>

            {/* More social links – collapsible or in grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  key: "facebookUrl",
                  label: "Facebook",
                  placeholder: "https://facebook.com/yourcompany",
                },
                {
                  key: "instagramUrl",
                  label: "Instagram",
                  placeholder: "https://instagram.com/yourcompany",
                },
                {
                  key: "twitterUrl",
                  label: "Twitter / X",
                  placeholder: "https://twitter.com/yourcompany",
                },
                {
                  key: "youtubeUrl",
                  label: "YouTube",
                  placeholder: "https://youtube.com/@yourcompany",
                },
                {
                  key: "githubUrl",
                  label: "GitHub",
                  placeholder: "https://github.com/yourcompany",
                },
                {
                  key: "whatsappNumber",
                  label: "WhatsApp",
                  placeholder: "919876543210",
                },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={key === "whatsappNumber" ? "tel" : "url"}
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-amber-400 text-sm outline-none bg-white transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Address Fields */}
            <div className="space-y-6 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Company Address
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={form.googleMapsUrl}
                    onChange={(e) =>
                      setForm({ ...form, googleMapsUrl: e.target.value })
                    }
                    placeholder="https://maps.app.goo.gl/xxxxxx"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-amber-400 text-sm outline-none bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    PIN Code
                  </label>
                  <input
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    placeholder="110001"
                    maxLength={6}
                    className={`w-full px-4 py-3.5 rounded-xl border text-sm ${
                      errors.pincode
                        ? "border-red-300 bg-red-50/40"
                        : "border-slate-200 focus:border-amber-400"
                    } outline-none bg-white transition-all`}
                  />
                  {errors.pincode && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.pincode}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Address
                </label>
                <textarea
                  value={form.fullAddress}
                  onChange={(e) =>
                    setForm({ ...form, fullAddress: e.target.value })
                  }
                  rows={2}
                  placeholder="Floor 5, Tower B, Tech Park, Whitefield, Bengaluru, Karnataka 560066"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-amber-400 text-sm outline-none bg-white resize-y min-h-[80px] transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-medium text-base transition-all duration-200 ${
                  loading
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-900 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "Updating profile..." : "Complete Company Profile →"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Step 2 of 2 • You can edit or skip these fields later in profile
            settings
          </p>
        </div>
      </div>
    </div>
  );
}
