"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import Image from "next/image";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { IMAGE_URL } from "@/constant/api";
import { isAxiosError } from "axios";
import { INDUSTRIES } from "@/lib/industries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── tiny helpers ─────────────────────────────────────────── */
const InputField = ({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="group flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold uppercase tracking-widest text-black group-focus-within:text-[#f54600] transition-colors">
      {label}
      {required && <span className="ml-0.5 text-[#f54600]">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-[11px] text-black0">{hint}</p>}
    {error && <p className="text-[11px] text-red-400">{error}</p>}
  </div>
);

const inputCls = (err?: string) =>
  `w-full px-4 py-3 rounded-xl border bg-white text-sm text-black placeholder-zinc-600 outline-none transition-all focus:ring-2 ${
    err
      ? "border-red-500/60 focus:ring-red-500/20"
      : "border-zinc-700/60 focus:border-[#f54600]/70 focus:ring-[#f54600]/10"
  }`;

/* ─── step dots ─────────────────────────────────────────────── */
const StepDot = ({ n, active, done }: { n: number; active: boolean; done: boolean }) => (
  <div
    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
      done
        ? "bg-[#f54600] text-black scale-90"
        : active
        ? "bg-[#f54600] text-black ring-4 ring-[#f54600]/20"
        : "bg-[#f54600] text-black0"
    }`}
  >
    {done ? "✓" : n}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const CreateCompany = () => {
  const router = useRouter();
  const {
    createCompanyStep1,
    updateCompanyStep2,
    loading,
    isAuthenticated,
    EmployerInitAuth,
    fetchCompanyProfile,
    company,
  } = useEmployerAuthStore();

  const [step, setStep] = useState<1 | 2>(1);

  const [id, setCompanyId] = useState<number | null>(null);

  /* ── Step 1 form ── */
  const [form1, setForm1] = useState({
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
  const [errors1, setErrors1] = useState<Partial<typeof form1>>({});

  /* ── Step 2 form ── */
  const [form2, setForm2] = useState({
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
    description: "",
  });
  const [errors2, setErrors2] = useState<Partial<typeof form2>>({});

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [locationInput, setLocationInput] = useState("");

  /* ── auth + prefill ── */
  useEffect(() => {
    EmployerInitAuth();
  }, [EmployerInitAuth]);

  useEffect(() => {
    if (step === 2) {
      fetchCompanyProfile();
    }
  }, [step, fetchCompanyProfile]);

  useEffect(() => {
    if (!company) return;
    setForm2((prev) => ({
      ...prev,
      companyEmail: company.companyEmail || company?.employer?.employerEmail || "",
      companyPhone: company.companyPhone || company?.employer?.employerContactNumber || "",
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
      description: company.description || "",
    }));
    if (company.companyLogo) {
      setLogoPreview(`${IMAGE_URL}${company.companyLogo}`);
    }
  }, [company]);

  /* ── logo dropzone ── */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Only images allowed");
    if (file.size > 2 * 1024 * 1024) return toast.error("Image must be under 2MB");
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    multiple: false,
  });

  if (!isAuthenticated) return null;

  /* ── validation step 1 ── */
  const validateStep1 = () => {
    const e: Partial<typeof form1> = {};
    if (!form1.companyName.trim()) e.companyName = "Company name is required";
    if (form1.GST.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form1.GST.trim().toUpperCase()))
      e.GST = "Invalid GSTIN format";
    if (form1.PAN.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form1.PAN.trim().toUpperCase()))
      e.PAN = "Invalid PAN format";
    if (form1.foundedYear.trim() && !/^(19|20)\d{2}$/.test(form1.foundedYear))
      e.foundedYear = "Valid year required (1900–2099)";
    setErrors1(e);
    return Object.keys(e).length === 0;
  };

  /* ── validation step 2 ── */
  const validateStep2 = () => {
    const e: Partial<typeof form2> = {};
    if (form2.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form2.companyEmail))
      e.companyEmail = "Invalid email format";
    if (form2.companyPhone && !/^[6-9]\d{9}$/.test(form2.companyPhone))
      e.companyPhone = "Enter valid 10-digit Indian number";
    if (form2.pincode && !/^\d{6}$/.test(form2.pincode))
      e.pincode = "PIN code must be 6 digits";
    if (form2.description.trim() && form2.description.trim().length < 30)
      e.description = "Min 30 characters if filled";
    setErrors2(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit step 1 ── */
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return toast.error("Please fix the errors");
    try {
      const res = await createCompanyStep1({
        companyName: form1.companyName.trim(),
        companyTagline: form1.companyTagline.trim() || undefined,
        companyCategory: form1.companyCategory || undefined,
        companySize: form1.companySize || undefined,
        GST: form1.GST.trim().toUpperCase() || undefined,
        PAN: form1.PAN.trim().toUpperCase() || undefined,
        foundedYear: form1.foundedYear.trim() || undefined,
        country: form1.country.trim() || undefined,
        state: form1.state.trim() || undefined,
        city: form1.city.trim() || undefined,
      });
    //   console.log("res.data",res.data)
      setCompanyId(res.data.id);
      toast.success("Basic info saved!");
      setStep(2);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save company info");
    }
  };

  /* ── submit step 2 ── */
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return toast.error("Please fix the errors");

    const companyId = id || company?.id;

    const payload: Record<string, any> = {
      ...Object.fromEntries(
        Object.entries(form2).map(([k, v]) => [k, v.trim() || undefined])
      ),
      ...(companyId ? { companyId } : {}),
    };

    // companyId

    try {
      if (logoFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => v && fd.append(k, v));
        fd.append("companyLogo", logoFile);
        await updateCompanyStep2(fd);
      } else {
        await updateCompanyStep2(payload);
      }
      toast.success("Company profile completed! 🎉");
      router.push("/employer/profile");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          return router.replace("/auth/login-employers");
        }
        toast.error(err.response?.data?.message || "Failed to update profile", { duration: 5000 });
      } else {
        toast.error("Something went wrong", { duration: 5000 });
      }
    }
  };

  /* ══════ RENDER ══════ */
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* ── decorative background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#f54600]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d97706 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 border-b border-[#f54600]/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#f54600] flex items-center justify-center">
            <span className="text-black font-black text-sm">H</span>
          </div>
          <span className="font-bold text-black tracking-tight">HireBoard</span>
        </div>
        <div className="flex items-center gap-3">
          <StepDot n={1} active={step === 1} done={step === 2} />
          <div className={`h-px w-10 transition-all duration-500 ${step === 2 ? "bg-[#f54600]" : "bg-zinc-700"}`} />
          <StepDot n={2} active={step === 2} done={false} />
        </div>
      </header>

      {/* ── main ── */}
      <main className="relative z-10 flex flex-1 items-start justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-2xl">

          {/* ════ STEP 1 ════ */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <div className="mb-10">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#f54600] mb-3">
                  Step 1 of 2 — Basic Information
                </p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black leading-tight">
                  Tell us about<br />
                  <span className="text-[#f54600]">your company.</span>
                </h1>
                <p className="mt-3 text-sm text-black">
                  Only company name is required — everything else can be added later.
                </p>
              </div>

              <form onSubmit={handleStep1} className="space-y-6">
                {/* Name + Tagline */}
                <div className="grid md:grid-cols-2 gap-5">
                  <InputField label="Company Name" required error={errors1.companyName}>
                    <input
                      required
                      value={form1.companyName}
                      onChange={(e) => setForm1({ ...form1, companyName: e.target.value })}
                      placeholder="Acme Innovations Pvt Ltd"
                      className={inputCls(errors1.companyName)}
                    />
                  </InputField>

                  <InputField label="Tagline / Slogan" hint={`${form1.companyTagline.length}/100`}>
                    <input
                      value={form1.companyTagline}
                      onChange={(e) => setForm1({ ...form1, companyTagline: e.target.value })}
                      placeholder="Innovating the Future of Work"
                      maxLength={100}
                      className={inputCls()}
                    />
                  </InputField>
                </div>

                {/* Category + Size */}
                <div className="grid md:grid-cols-2 gap-5">
                  <InputField label="Industry / Category">
                    <Select
                      value={form1.companyCategory}
                      onValueChange={(v) => setForm1({ ...form1, companyCategory: v })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-zinc-700/60 bg-white text-sm text-black focus:ring-[#f54600]/20 focus:border-[#f54600]/70">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-zinc-700 text-black max-h-72 rounded-xl">
                        {INDUSTRIES.map((i) => (
                          <SelectItem key={i} value={i} className="text-sm py-2.5 focus:bg-[#f54600]">
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </InputField>

                  <InputField label="Company Size">
                    <Select
                      value={form1.companySize}
                      onValueChange={(v) => setForm1({ ...form1, companySize: v })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-zinc-700/60 bg-white text-sm text-black focus:ring-[#f54600]/20 focus:border-[#f54600]/70">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-zinc-700 text-black rounded-xl">
                        {["1-10","11-50","51-200","201-500","501-1000","1001+"].map((s) => (
                          <SelectItem key={s} value={s} className="text-sm py-2.5 focus:bg-[#f54600]">
                            {s} employees
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </InputField>
                </div>

                {/* GST + PAN */}
                <div className="grid md:grid-cols-2 gap-5">
                  <InputField label="GSTIN" hint="Optional" error={errors1.GST}>
                    <input
                      value={form1.GST}
                      onChange={(e) => setForm1({ ...form1, GST: e.target.value.toUpperCase() })}
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                      className={`${inputCls(errors1.GST)} uppercase tracking-widest`}
                    />
                  </InputField>

                  <InputField label="PAN" hint="Optional" error={errors1.PAN}>
                    <input
                      value={form1.PAN}
                      onChange={(e) => setForm1({ ...form1, PAN: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className={`${inputCls(errors1.PAN)} uppercase tracking-widest`}
                    />
                  </InputField>
                </div>

                {/* Founded + Location */}
                <div className="grid md:grid-cols-3 gap-5">
                  <InputField label="Founded Year" error={errors1.foundedYear}>
                    <input
                      type="number"
                      value={form1.foundedYear}
                      onChange={(e) => setForm1({ ...form1, foundedYear: e.target.value })}
                      placeholder="2018"
                      min="1900"
                      max={new Date().getFullYear()}
                      className={inputCls(errors1.foundedYear)}
                    />
                  </InputField>

                  <InputField label="Country">
                    <input
                      value={form1.country}
                      onChange={(e) => setForm1({ ...form1, country: e.target.value })}
                      placeholder="India"
                      className={inputCls()}
                    />
                  </InputField>

                  <InputField label="State, City" hint="e.g. Delhi, New Delhi">
                    <input
                      value={locationInput}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setLocationInput(raw);
                        const [s = "", c = ""] = raw.split(",").map((p) => p.trim());
                        setForm1({ ...form1, state: s, city: c });
                      }}
                      placeholder="Delhi, New Delhi"
                      className={inputCls()}
                    />
                  </InputField>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm bg-[#f54600] text-black hover:bg-[#f54600] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#f54600]/20"
                >
                  {loading ? "Saving…" : "Continue to Company Details →"}
                </button>
              </form>
            </div>
          )}

          {/* ════ STEP 2 ════ */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <div className="mb-10">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#f54600] mb-3">
                  Step 2 of 2 — Company Details
                </p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black leading-tight">
                  Complete your<br />
                  <span className="text-[#f54600]">company profile.</span>
                </h1>
                <p className="mt-3 text-sm text-black">
                  Add contact info, social links & address to help candidates find you.
                </p>
              </div>

              <form onSubmit={handleStep2} className="space-y-8">

                {/* Logo Upload */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-black mb-3">
                    Company Logo <span className="text-zinc-600 normal-case tracking-normal">(recommended)</span>
                  </p>
                  <div
                    {...getRootProps()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                      isDragActive
                        ? "border-[#f54600] bg-[#f54600]/5"
                        : "border-zinc-700 hover:border-[#f54600]/50 hover:bg-white/80"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {logoPreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-zinc-700 bg-[#f54600]">
                          <Image src={logoPreview} alt="Logo" fill className="object-contain p-2" />
                        </div>
                        <p className="text-xs text-black0">Click or drag to replace</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f54600] text-2xl text-[#f54600] mb-1">
                          ↑
                        </div>
                        <p className="text-sm font-semibold text-zinc-300">Drop your logo here</p>
                        <p className="text-xs text-zinc-600">PNG, JPG, WebP · Max 2MB · 512×512 recommended</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* About */}
                <InputField label="About the Company" error={errors2.description} hint="Min 30 chars if filled">
                  <textarea
                    value={form2.description}
                    onChange={(e) => setForm2({ ...form2, description: e.target.value })}
                    rows={4}
                    placeholder="Tell candidates what your company does, culture, values..."
                    className={`${inputCls(errors2.description)} resize-y min-h-[100px]`}
                  />
                </InputField>

                {/* Contact */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-black0 mb-4">Contact Info</p>
                  <div className="grid md:grid-cols-2 gap-5">
                    <InputField label="Company Email" error={errors2.companyEmail}>
                      <input
                        type="email"
                        value={form2.companyEmail}
                        onChange={(e) => setForm2({ ...form2, companyEmail: e.target.value })}
                        placeholder="hr@yourcompany.com"
                        className={inputCls(errors2.companyEmail)}
                      />
                    </InputField>
                    <InputField label="Company Phone" error={errors2.companyPhone}>
                      <input
                        type="tel"
                        value={form2.companyPhone}
                        onChange={(e) =>
                          setForm2({ ...form2, companyPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                        }
                        placeholder="9876543210"
                        maxLength={10}
                        className={inputCls(errors2.companyPhone)}
                      />
                    </InputField>
                  </div>
                </div>

                {/* Website + LinkedIn */}
                <div className="grid md:grid-cols-2 gap-5">
                  <InputField label="Company Website">
                    <input
                      type="url"
                      value={form2.companyWebsite}
                      onChange={(e) => setForm2({ ...form2, companyWebsite: e.target.value })}
                      placeholder="https://www.yourcompany.com"
                      className={inputCls()}
                    />
                  </InputField>
                  <InputField label="LinkedIn Page">
                    <input
                      type="url"
                      value={form2.linkedinUrl}
                      onChange={(e) => setForm2({ ...form2, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className={inputCls()}
                    />
                  </InputField>
                </div>

                {/* Other socials */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-black0 mb-4">Social Links</p>
                  <div className="grid md:grid-cols-3 gap-5">
                    {[
                      { key: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/yourcompany" },
                      { key: "instagramUrl", label: "Instagram", placeholder: "https://instagram.com/yourcompany" },
                      { key: "twitterUrl", label: "Twitter / X", placeholder: "https://twitter.com/yourcompany" },
                      { key: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/@yourcompany" },
                      { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/yourcompany" },
                      { key: "whatsappNumber", label: "WhatsApp", placeholder: "919876543210" },
                    ].map(({ key, label, placeholder }) => (
                      <InputField key={key} label={label}>
                        <input
                          type={key === "whatsappNumber" ? "tel" : "url"}
                          value={form2[key as keyof typeof form2]}
                          onChange={(e) => setForm2({ ...form2, [key]: e.target.value })}
                          placeholder={placeholder}
                          className={inputCls()}
                        />
                      </InputField>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-black0 mb-4">Company Address</p>
                  <div className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <InputField label="Google Maps Link">
                        <input
                          type="url"
                          value={form2.googleMapsUrl}
                          onChange={(e) => setForm2({ ...form2, googleMapsUrl: e.target.value })}
                          placeholder="https://maps.app.goo.gl/xxxxxx"
                          className={inputCls()}
                        />
                      </InputField>
                      <InputField label="PIN Code" error={errors2.pincode}>
                        <input
                          value={form2.pincode}
                          onChange={(e) =>
                            setForm2({ ...form2, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                          }
                          placeholder="110001"
                          maxLength={6}
                          className={inputCls(errors2.pincode)}
                        />
                      </InputField>
                    </div>
                    <InputField label="Full Address">
                      <textarea
                        value={form2.fullAddress}
                        onChange={(e) => setForm2({ ...form2, fullAddress: e.target.value })}
                        rows={2}
                        placeholder="Floor 5, Tower B, Tech Park, Whitefield, Bengaluru, Karnataka 560066"
                        className={`${inputCls()} resize-y min-h-[72px]`}
                      />
                    </InputField>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3.5 rounded-xl font-semibold text-sm border border-zinc-700 text-black hover:border-black0 hover:text-zinc-200 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#f54600] text-black hover:bg-[#f54600] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#f54600]/20"
                  >
                    {loading ? "Saving…" : "Complete Company Profile →"}
                  </button>
                </div>
              </form>

              <p className="mt-8 text-center text-xs text-zinc-600">
                All fields on this step are optional — you can edit them later in profile settings.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateCompany;