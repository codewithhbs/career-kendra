"use client";

import { API_URL } from "@/constant/api";
import { JOB_CATEGORIES, INDUSTRIES } from "@/lib/industries";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import axios, { isAxiosError } from "axios";
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  X,
  Briefcase,
  MapPin,
  IndianRupee,
  Send,
  FileText,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Eye,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

axios.defaults.baseURL = API_URL;

const COMMON_BENEFITS = [
  "Health Insurance",
  "Paid Time Off",
  "Remote Work",
  "Flexible Hours",
  "Gym Membership",
  "Performance Bonus",
  "Stock Options",
  "Learning Budget",
  "Work From Home Allowance",
];

const EDUCATION_LEVELS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Any",
];

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const COMPANY_CATEGORIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Media & Entertainment",
  "Real Estate",
  "Consulting",
  "Other",
];

interface CompanyFormData {
  companyName: string;
  companyTagline: string;
  companyCategory: string;
  companySize: string;
  GST: string;
  PAN: string;
  foundedYear: string;
  country: string;
  state: string;
  city: string;
}

interface JobFormData {
  jobTitle: string;
  jobDescription: string;
  jobResponsibilities: string[];
  jobCategory: string;
  department: string;
  jobType: string;
  workMode: string;
  shiftType: string;
  country: string;
  state: string;
  city: string;
  locationText: string;
  salaryType: string;
  currency: string;
  salaryMin: string;
  salaryMax: string;
  salaryNegotiable: boolean;
  hideSalary: boolean;
  experienceMin: string;
  experienceMax: string;
  industry: string;
  openings: string;
  noticePeriod: string;
  education: string;
  expiryDate: string;
  benefits: string[];
  requiredSkills: string[];
  jobTags: string[];
  applyType: string;
  applyEmail: string;
  applyLink: string;
}

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Job Details" },
  { id: 3, label: "Candidate Info" },
  { id: 4, label: "Job Description" },
  { id: 5, label: "Confirmation" },
];

// ─── Preview Panel ─────────────────────────────────────────────────────────
function PreviewPanel({
  formData,
  companyData,
  existingCompany,
}: {
  formData: JobFormData;
  companyData: CompanyFormData;
  existingCompany: any;
}) {
  // Use existing company data if available, otherwise use form data
  const displayCompany = existingCompany
    ? {
        companyName: existingCompany.companyName,
        companyCategory: existingCompany.companyCategory,
        companySize: existingCompany.companySize,
        city: existingCompany.city,
        state: existingCompany.state,
        country: existingCompany.country,
      }
    : {
        companyName: companyData.companyName,
        companyCategory: companyData.companyCategory,
        companySize: companyData.companySize,
        city: companyData.city,
        state: companyData.state,
        country: companyData.country,
      };

  const salaryDisplay = () => {
    if (formData.hideSalary) return "Hidden";
    if (formData.salaryNegotiable) return "Negotiable / Competitive";
    if (formData.salaryMin || formData.salaryMax)
      return `${formData.currency} ${formData.salaryMin || "–"} – ${formData.salaryMax || "–"} / ${formData.salaryType}`;
    return <span className="text-gray-400 text-sm">Not set</span>;
  };

  const empty = (val: string) =>
    !val ? <span className="text-gray-400 text-sm">Not set yet</span> : val;

  return (
    <div className="h-full overflow-y-auto px-4 py-5 space-y-5 text-sm">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1">
        <p className="text-xs font-medium text-[#F54A00] uppercase tracking-wider">
          Job Preview
        </p>
        <h2 className="text-lg font-bold text-gray-900 leading-tight">
          {formData.jobTitle || (
            <span className="text-gray-400 font-normal">Job title…</span>
          )}
        </h2>
        {displayCompany.companyName && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {displayCompany.companyName}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {formData.jobType && (
            <Badge variant="secondary" className="text-xs">
              {formData.jobType}
            </Badge>
          )}
          {formData.workMode && (
            <Badge variant="secondary" className="text-xs">
              {formData.workMode}
            </Badge>
          )}
          {formData.shiftType && (
            <Badge variant="outline" className="text-xs">
              {formData.shiftType} shift
            </Badge>
          )}
        </div>
      </div>

      {/* Company Info */}
      {(displayCompany.companyName || displayCompany.companyCategory) && (
        <PreviewSection title="Company">
          {displayCompany.companyName && (
            <PreviewRow label="Name" value={displayCompany.companyName} />
          )}
          {displayCompany.companyCategory && (
            <PreviewRow label="Sector" value={displayCompany.companyCategory} />
          )}
          {displayCompany.companySize && (
            <PreviewRow
              label="Size"
              value={`${displayCompany.companySize} employees`}
            />
          )}
          {displayCompany.city && (
            <PreviewRow
              label="HQ"
              value={[
                displayCompany.city,
                displayCompany.state,
                displayCompany.country,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          )}
        </PreviewSection>
      )}

      {/* Basic */}
      <PreviewSection title="Basic Info">
        <PreviewRow label="Category" value={empty(formData.jobCategory)} />
        <PreviewRow label="Industry" value={empty(formData.industry)} />
        <PreviewRow label="Department" value={empty(formData.department)} />
        <PreviewRow label="Openings" value={empty(formData.openings)} />
      </PreviewSection>

      {/* Location */}
      <PreviewSection title="Job Location">
        <PreviewRow label="City" value={empty(formData.city)} />
        <PreviewRow label="State" value={empty(formData.state)} />
        <PreviewRow label="Country" value={empty(formData.country)} />
        {formData.locationText && (
          <PreviewRow label="Display" value={formData.locationText} />
        )}
      </PreviewSection>

      {/* Compensation */}
      <PreviewSection title="Compensation">
        <PreviewRow label="Salary" value={salaryDisplay()} />
      </PreviewSection>

      {/* Candidate */}
      <PreviewSection title="Candidate Requirements">
        <PreviewRow
          label="Experience"
          value={
            formData.experienceMin || formData.experienceMax ? (
              `${formData.experienceMin || 0} – ${formData.experienceMax || "?"} yrs`
            ) : (
              <span className="text-gray-400 text-sm">Not set</span>
            )
          }
        />
        <PreviewRow label="Education" value={empty(formData.education)} />
        <PreviewRow
          label="Notice Period"
          value={empty(formData.noticePeriod)}
        />
        <PreviewRow label="Expiry Date" value={empty(formData.expiryDate)} />
      </PreviewSection>

      {/* Skills */}
      {formData.requiredSkills.length > 0 && (
        <PreviewSection title="Required Skills">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {formData.requiredSkills.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Responsibilities */}
      {formData.jobResponsibilities.length > 0 && (
        <PreviewSection title="Responsibilities">
          <ul className="space-y-1 mt-1">
            {formData.jobResponsibilities.map((r, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-[#F54A00] mt-0.5">•</span>
                {r}
              </li>
            ))}
          </ul>
        </PreviewSection>
      )}

      {/* Description */}
      {formData.jobDescription && (
        <PreviewSection title="Description">
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
            {formData.jobDescription}
          </p>
        </PreviewSection>
      )}

      {/* Benefits */}
      {formData.benefits.length > 0 && (
        <PreviewSection title="Benefits">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {formData.benefits.map((b) => (
              <Badge key={b} variant="outline" className="text-xs">
                {b}
              </Badge>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Tags */}
      {formData.jobTags.length > 0 && (
        <PreviewSection title="Tags">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {formData.jobTags.map((t) => (
              <span key={t} className="text-xs text-[#F54A00]">
                #{t}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Apply type */}
      <PreviewSection title="Application Method">
        <PreviewRow
          label="Type"
          value={
            formData.applyType === "easy-apply"
              ? "Easy Apply (on platform)"
              : formData.applyType === "external-link"
                ? "External Link"
                : "Email"
          }
        />
        {formData.applyType === "email" && formData.applyEmail && (
          <PreviewRow label="Email" value={formData.applyEmail} />
        )}
        {formData.applyType === "external-link" && formData.applyLink && (
          <PreviewRow label="Link" value={formData.applyLink} />
        )}
      </PreviewSection>
    </div>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </p>
      {children}
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 text-xs shrink-0">{label}</span>
      <span className="text-gray-800 text-xs font-medium text-right">
        {value}
      </span>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <button
            onClick={() => onStepClick(step.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-semibold transition-all",
                currentStep === step.id
                  ? "bg-[#F54A00] border-[#F54A00] text-white"
                  : currentStep > step.id
                    ? "bg-green-50 border-green-500 text-green-600"
                    : "bg-white border-gray-300 text-gray-400",
              )}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                step.id
              )}
            </div>
            <div className="text-center">
              <p
                className={cn(
                  "text-xs font-medium whitespace-nowrap hidden sm:block",
                  currentStep === step.id
                    ? "text-[#F54A00]"
                    : currentStep > step.id
                      ? "text-green-600"
                      : "text-gray-400",
                )}
              >
                Step {step.id}
              </p>
              <p
                className={cn(
                  "text-xs whitespace-nowrap hidden md:block",
                  currentStep === step.id
                    ? "text-[#F54A00] font-semibold"
                    : currentStep > step.id
                      ? "text-green-600"
                      : "text-gray-400",
                )}
              >
                {step.label}
              </p>
            </div>
          </button>
          {idx < STEPS.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2 mt-[-18px]",
                currentStep > step.id ? "bg-green-400" : "bg-gray-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
const page = () => {
  const { token, isAuthenticated, fetchCompanyProfile, company } =
    useEmployerAuthStore();
  const navigate = useRouter();

  const isCompany = company?.id ? company : null;

  const [currentStep, setCurrentStep] = useState(1);
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdCompanyId, setCreatedCompanyId] = useState<number | null>(null);

  // ── Company form data — only used when company is null ──
  const [companyData, setCompanyData] = useState<CompanyFormData>({
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

  const [formData, setFormData] = useState<JobFormData>({
    jobTitle: "",
    jobDescription: "",
    jobResponsibilities: [],
    jobCategory: "",
    industry: "",
    department: "",
    jobType: "full-time",
    workMode: "onsite",
    shiftType: "day",
    country: "India",
    state: "",
    city: "",
    locationText: "",
    salaryType: "monthly",
    currency: "INR",
    salaryMin: "",
    salaryMax: "",
    salaryNegotiable: false,
    hideSalary: false,
    experienceMin: "0",
    experienceMax: "5",
    openings: "1",
    noticePeriod: "",
    education: "",
    expiryDate: "",
    benefits: [],
    requiredSkills: [],
    jobTags: [],
    applyType: "easy-apply",
    applyEmail: "",
    applyLink: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [useDemoData, setUseDemoData] = useState(false);

  const resetForm = useCallback(() => {
    setCompanyData({
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
    setFormData({
      jobTitle: "",
      jobDescription: "",
      jobResponsibilities: [],
      jobCategory: "",
      industry: "",
      department: "",
      jobType: "full-time",
      workMode: "onsite",
      shiftType: "day",
      country: "India",
      state: "",
      city: "",
      locationText: "",
      salaryType: "monthly",
      currency: "INR",
      salaryMin: "",
      salaryMax: "",
      salaryNegotiable: false,
      hideSalary: false,
      experienceMin: "0",
      experienceMax: "5",
      openings: "1",
      noticePeriod: "",
      education: "",
      expiryDate: "",
      benefits: [],
      requiredSkills: [],
      jobTags: [],
      applyType: "easy-apply",
      applyEmail: "",
      applyLink: "",
    });
    setSkillInput("");
    setTagInput("");
    setBenefitInput("");
    setCurrentStep(1);
    setCreatedCompanyId(null);
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCompanyProfile();
    }
  }, [isAuthenticated, token, fetchCompanyProfile]);

  useEffect(() => {
    if (!useDemoData) return;
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Only fill company demo data if no existing company
    if (!isCompany) {
      setCompanyData({
        companyName: "TechVenture Pvt. Ltd.",
        companyTagline: "Building tomorrow's software, today",
        companyCategory: "Technology",
        companySize: "51-200",
        GST: "29ABCDE1234F1Z5",
        PAN: "ABCDE1234F",
        foundedYear: "2018",
        country: "India",
        state: "Karnataka",
        city: "Bengaluru",
      });
    }

    setFormData({
      jobTitle: "Senior Full-Stack Developer (MERN / Next.js)",
      jobDescription:
        "We are seeking a talented Full-Stack Developer to join our fast-growing product team...",
      jobResponsibilities: [
        "Design & develop scalable features",
        "Code reviews and mentoring juniors",
      ],
      jobCategory: "Software Development",
      industry: "IT",
      department: "Engineering",
      jobType: "full-time",
      workMode: "hybrid",
      shiftType: "day",
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      locationText: "Bengaluru, Karnataka (Koramangala)",
      salaryType: "monthly",
      currency: "INR",
      salaryMin: "140000",
      salaryMax: "240000",
      salaryNegotiable: false,
      hideSalary: false,
      experienceMin: "4",
      experienceMax: "9",
      openings: "2",
      noticePeriod: "30-45 days",
      education: "Bachelor's Degree",
      expiryDate: thirtyDaysLater,
      benefits: [
        "Health Insurance",
        "Flexible Hours",
        "Performance Bonus",
        "Learning Budget",
      ],
      requiredSkills: [
        "React",
        "Next.js",
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "AWS",
        "Git",
      ],
      jobTags: ["mern", "fullstack", "remote-friendly", "startup"],
      applyType: "easy-apply",
      applyEmail: "",
      applyLink: "",
    });
    setUseDemoData(false);
  }, [useDemoData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanySelectChange = (name: string) => (value: string) => {
    setCompanyData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = (
    field: "requiredSkills" | "jobTags" | "benefits",
    value: string,
    setter: (value: string) => void,
  ) => {
    const trimmed = value.trim();
    if (!trimmed || formData[field].includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }));
    setter("");
  };

  const addResponsibility = () => {
    const trimmed = responsibilityInput.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      const existing = Array.isArray(prev.jobResponsibilities)
        ? prev.jobResponsibilities
        : [];
      if (existing.includes(trimmed)) return prev;
      return { ...prev, jobResponsibilities: [...existing, trimmed] };
    });
    setResponsibilityInput("");
  };

  const removeResponsibility = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      jobResponsibilities: prev.jobResponsibilities.filter((i) => i !== item),
    }));
  };

  const removeItem = (
    field: "requiredSkills" | "jobTags" | "benefits",
    item: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
    }));
  };

  const validateStep = (step: number): string | null => {
    if (step === 1) {
      if (!formData.jobTitle.trim()) return "Job title is required";
      // Only validate company form fields if no existing company in store
      if (!isCompany && !companyData.companyName.trim())
        return "Company name is required";
    }
    if (step === 2) {
      if (!formData.hideSalary && !formData.salaryNegotiable) {
        if (!formData.salaryMin || !formData.salaryMax)
          return "Salary range required (or check Hide/Negotiable)";
        if (Number(formData.salaryMax) < Number(formData.salaryMin))
          return "Max salary must be ≥ Min salary";
      }
      if (Number(formData.openings) < 1) return "At least 1 opening required";
    }
    if (step === 3) {
      if (formData.requiredSkills.length === 0)
        return "At least one skill required";
    }
    if (step === 4) {
      if (formData.jobDescription.length < 120)
        return "Description too short (min 120 characters)";
      if (formData.jobResponsibilities.length === 0)
        return "At least one responsibility is required";
      if (formData.applyType === "email" && !formData.applyEmail.trim())
        return "Email required for email apply";
      if (formData.applyType === "external-link" && !formData.applyLink.trim())
        return "Link required for external apply";
    }
    return null;
  };

  const validateForm = () => {
    for (let s = 1; s <= 4; s++) {
      const err = validateStep(s);
      if (err) return err;
    }
    return null;
  };

  const handleNext = async () => {
    const err = validateStep(currentStep);
    if (err) {
      await Swal.fire({
        title: "Validation Error",
        text: err,
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate.push("/employer/profile");
    } else {
      setCurrentStep((s) => Math.max(s - 1, 1));
    }
  };

  // ── Create company first (only if needed), then post the job ──
  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      await Swal.fire({
        title: "Validation Error",
        text: error,
        icon: "warning",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);

    try {
      // Step A: Determine companyId
      // Priority: existing company from store → already created in this session → create new
      let companyId: number | null = company?.id ?? createdCompanyId ?? null;

      if (!companyId) {
        // No existing company — create one using the form data
        const companyRes = await axios.post(
          "/company/create-step1",
          {
            companyName: companyData.companyName,
            companyTagline: companyData.companyTagline,
            companyCategory: companyData.companyCategory,
            companySize: companyData.companySize,
            GST: companyData.GST || undefined,
            PAN: companyData.PAN || undefined,
            foundedYear: companyData.foundedYear
              ? Number(companyData.foundedYear)
              : undefined,
            country: companyData.country,
            state: companyData.state,
            city: companyData.city,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const createdCompany = companyRes.data?.data || companyRes.data;
        companyId = createdCompany?.id;

        if (!companyId)
          throw new Error("Company creation failed — no ID returned");
        setCreatedCompanyId(companyId);
      }

      // Step B: Post the job with the resolved companyId
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        jobResponsibilities: formData.jobResponsibilities,
        experienceMin: Number(formData.experienceMin) || 0,
        experienceMax: formData.experienceMax
          ? Number(formData.experienceMax)
          : undefined,
        openings: Number(formData.openings) || 1,
        companyId,
      };

      await axios.post("/jobs", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await Swal.fire({
        icon: "success",
        title: "Job Posted!",
        text: "Your job has been created successfully.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      resetForm();
    } catch (err) {
      let msg = "Failed to post job. Please try again.";

      if (isAxiosError(err) && err.response?.data) {
        const apiErr = err.response.data;
        if (Array.isArray(apiErr.error)) {
          msg = apiErr.error
            .map((e: any) => `• ${e.field}: ${e.message}`)
            .join("\n");
        } else {
          msg = apiErr.message || apiErr.error || msg;
        }
      }

      await Swal.fire({
        title: "Error",
        html: msg.replace(/\n/g, "<br/>"),
        icon: "error",
        timer: 2500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Only verified employers can post jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Step Content ────────────────────────────────────────────────────────

  // Step 1: Basic Info + Company (show form if no company, read-only card if exists)
  const renderStep1 = () => (
    <div className="space-y-10">
      {/* ── Job Info ── */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-3 h-3 bg-[#F54A00] rounded-full"></span>
          Basic Job Information
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-3">
            <Label className="flex items-center gap-1 text-gray-700 font-medium">
              Job Title <span className="text-red-600 text-base">*</span>
            </Label>
            <Input
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder="e.g. Senior Product Designer, Backend Engineer (Golang)"
              className="h-12 text-base border-gray-300 focus:border-[#F54A00] placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 pl-1">
              Be specific. Include role level and key technologies for better
              reach.
            </p>
          </div>

          <div className="space-y-2 w-full">
            <Label className="text-gray-700 font-medium">Job Category</Label>
            <Select
              value={formData.jobCategory}
              onValueChange={handleSelectChange("jobCategory")}
            >
              <SelectTrigger className="w-full h-12 border-gray-300">
                <SelectValue placeholder="Select job category" />
              </SelectTrigger>
              <SelectContent>
                {JOB_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full">
            <Label className="text-gray-700 font-medium">Industry of Job</Label>
            <Select
              value={formData.industry}
              onValueChange={handleSelectChange("industry")}
            >
              <SelectTrigger className="w-full h-12 border-gray-300">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 w-full">
            <Label className="text-gray-700 font-medium">Department</Label>
            <Input
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g. Engineering, Marketing"
              className="h-12 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* ── Company Section ── */}
      <div className="border-t border-gray-100 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#F54A00]" />
          Your Company
        </h3>

        {/* CASE 1: Existing company found in store → show read-only info card */}
        {isCompany ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-semibold text-gray-800">{company.companyName}</p>
              <p className="text-sm text-gray-500">
                {[company.companyCategory, company.companySize && `${company.companySize} employees`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="text-sm text-gray-500">
                {[company.city, company.state, company.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {company.companyTagline && (
                <p className="text-xs text-gray-400 mt-1 italic">
                  "{company.companyTagline}"
                </p>
              )}
            </div>
          </div>
        ) : (
          /* CASE 2: No company → show form to create one */
          <>
            <p className="text-sm text-gray-500 mb-6">
              Tell candidates a bit about the company behind this role.
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 lg:col-span-2">
                <Label className="flex items-center gap-1 text-gray-700 font-medium">
                  Company Name <span className="text-red-600 text-base">*</span>
                </Label>
                <Input
                  name="companyName"
                  value={companyData.companyName}
                  onChange={handleCompanyInputChange}
                  placeholder="e.g. Acme Technologies Pvt. Ltd."
                  className="h-12 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Company Size
                </Label>
                <Select
                  value={companyData.companySize}
                  onValueChange={handleCompanySelectChange("companySize")}
                >
                  <SelectTrigger className="h-12 w-full border-gray-300">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 lg:col-span-3">
                <Label className="text-gray-700 font-medium">
                  Company Tagline
                </Label>
                <Input
                  name="companyTagline"
                  value={companyData.companyTagline}
                  onChange={handleCompanyInputChange}
                  placeholder="e.g. Building tomorrow's software, today"
                  className="h-12 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Company Sector
                </Label>
                <Select
                  value={companyData.companyCategory}
                  onValueChange={handleCompanySelectChange("companyCategory")}
                >
                  <SelectTrigger className="h-12 w-full border-gray-300">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Founded Year
                </Label>
                <Input
                  name="foundedYear"
                  value={companyData.foundedYear}
                  onChange={handleCompanyInputChange}
                  placeholder="e.g. 2015"
                  className="h-12 border-gray-300"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Step 2: Job Details + Company HQ (only if no existing company)
  const renderStep2 = () => (
    <div className="space-y-10">
      {/* Job Type / Mode / Shift / Openings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[#F54A00]" />
          Work Type & Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Job Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.jobType}
              onValueChange={handleSelectChange("jobType")}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-Time</SelectItem>
                <SelectItem value="part-time">Part-Time</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Work Mode <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.workMode}
              onValueChange={handleSelectChange("workMode")}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onsite">On-site</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Shift Type</Label>
            <Select
              value={formData.shiftType}
              onValueChange={handleSelectChange("shiftType")}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Select shift type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="rotational">Rotational</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Number of Openings <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              name="openings"
              value={formData.openings}
              onChange={handleInputChange}
              className="h-11 w-full"
              placeholder="Enter openings"
            />
          </div>
        </div>
      </div>

      {/* Job Location */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Job Location</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              name="country"
              value={formData.country}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label>State / Province</Label>
            <Input
              name="state"
              value={formData.state}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Exact / Display Location</Label>
            <Input
              name="locationText"
              value={formData.locationText}
              onChange={handleInputChange}
              placeholder="e.g. Koramangala, Bengaluru"
            />
          </div>
        </div>
      </div>

      {/* Company HQ — only show if no existing company */}
      {!isCompany && (
        <div className="border border-gray-100 rounded-2xl p-6 space-y-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#F54A00]" />
            <h3 className="text-base font-medium text-gray-800">
              Company Headquarters
            </h3>
            <span className="text-xs text-gray-400 ml-1">
              (where your company is registered / based)
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                name="country"
                value={companyData.country}
                onChange={handleCompanyInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                name="state"
                value={companyData.state}
                onChange={handleCompanyInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                name="city"
                value={companyData.city}
                onChange={handleCompanyInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input
                name="GST"
                value={companyData.GST}
                onChange={handleCompanyInputChange}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label>PAN Number</Label>
              <Input
                name="PAN"
                value={companyData.PAN}
                onChange={handleCompanyInputChange}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>
      )}

      {/* Compensation */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Compensation</h3>
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="hideSalary"
              checked={formData.hideSalary}
              onCheckedChange={(c) =>
                setFormData((p) => ({
                  ...p,
                  hideSalary: !!c,
                  salaryNegotiable: false,
                }))
              }
            />
            <Label htmlFor="hideSalary">Hide salary range</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="negotiable"
              checked={formData.salaryNegotiable}
              onCheckedChange={(c) =>
                setFormData((p) => ({
                  ...p,
                  salaryNegotiable: !!c,
                  hideSalary: false,
                }))
              }
              disabled={formData.hideSalary}
            />
            <Label htmlFor="negotiable">Negotiable / Competitive</Label>
          </div>
        </div>

        {!formData.hideSalary && !formData.salaryNegotiable && (
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={handleSelectChange("currency")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR ₹</SelectItem>
                  <SelectItem value="USD">USD $</SelectItem>
                  <SelectItem value="EUR">EUR €</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Min</Label>
              <Input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                placeholder="e.g. 120000"
              />
            </div>
            <div className="space-y-2">
              <Label>Max</Label>
              <Input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                placeholder="e.g. 220000"
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select
                value={formData.salaryType}
                onValueChange={handleSelectChange("salaryType")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Application Expiry */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Application Expiry Date</Label>
          <Input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );

  // Step 3: Candidate Info
  const renderStep3 = () => (
    <div className="space-y-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Min Experience (years)</Label>
          <Input
            type="number"
            min={0}
            name="experienceMin"
            value={formData.experienceMin}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label>Max Experience (years)</Label>
          <Input
            type="number"
            min={0}
            name="experienceMax"
            value={formData.experienceMax}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label>Notice Period</Label>
          <Input
            name="noticePeriod"
            value={formData.noticePeriod}
            onChange={handleInputChange}
            placeholder="e.g. 30 days / Immediate"
          />
        </div>
        <div className="space-y-2">
          <Label>Education Level</Label>
          <Select
            value={formData.education}
            onValueChange={handleSelectChange("education")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {lvl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-1">
          <Label className="text-base font-semibold">
            Required Skills & Technologies
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Press Enter or click Add
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Type skill e.g. React, Node.js"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem("requiredSkills", skillInput, setSkillInput);
              }
            }}
            className="flex-1 h-11"
          />
          <Button
            type="button"
            onClick={() => addItem("requiredSkills", skillInput, setSkillInput)}
            className="h-11 px-5"
          >
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {formData.requiredSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            >
              {skill}
              <button
                onClick={() => removeItem("requiredSkills", skill)}
                className="rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900 transition"
              >
                <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Benefits & Perks</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_BENEFITS.map((b) => (
            <Badge
              key={b}
              variant={formData.benefits.includes(b) ? "default" : "outline"}
              className="cursor-pointer text-sm px-3 py-1.5"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  benefits: prev.benefits.includes(b)
                    ? prev.benefits.filter((x) => x !== b)
                    : [...prev.benefits, b],
                }))
              }
            >
              {b}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 max-w-md">
          <Input
            value={benefitInput}
            onChange={(e) => setBenefitInput(e.target.value)}
            placeholder="Custom benefit (e.g. Stock Options)"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem("benefits", benefitInput, setBenefitInput);
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => addItem("benefits", benefitInput, setBenefitInput)}
          >
            Add
          </Button>
        </div>
        {formData.benefits.filter((b) => !COMMON_BENEFITS.includes(b)).length >
          0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.benefits
              .filter((b) => !COMMON_BENEFITS.includes(b))
              .map((b) => (
                <Badge key={b} variant="secondary" className="gap-1 px-3 py-1">
                  {b}
                  <button onClick={() => removeItem("benefits", b)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label>Job Tags / Keywords (helps in search)</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g. startup, equity, ai, python"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem("jobTags", tagInput, setTagInput);
              }
            }}
          />
          <Button
            variant="secondary"
            onClick={() => addItem("jobTags", tagInput, setTagInput)}
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.jobTags.map((tag) => (
            <Badge key={tag} variant="outline" className="px-3 py-1 gap-1">
              #{tag}
              <button onClick={() => removeItem("jobTags", tag)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4: Job Description & Responsibilities & Apply type
  const renderStep4 = () => (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-1">
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            Job Description <span className="text-red-600">*</span>
            <span className="text-xs text-muted-foreground ml-2">
              (min 120 characters)
            </span>
          </Label>
          <Textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleInputChange}
            placeholder="Tell candidates about the role, team, goals, tech stack, culture..."
            className="min-h-[180px] resize-y"
          />
          <p className="text-xs text-gray-500">
            {formData.jobDescription.length} / 120 min characters
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-1">
          <Label className="text-base font-semibold flex items-center gap-2">
            Key Responsibilities <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">
            Add responsibilities one by one
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            value={responsibilityInput}
            onChange={(e) => setResponsibilityInput(e.target.value)}
            placeholder="e.g. Design & develop scalable features"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addResponsibility();
              }
            }}
            className="flex-1 h-11"
          />
          <Button
            type="button"
            onClick={addResponsibility}
            disabled={!responsibilityInput.trim()}
            className="h-11 px-5"
          >
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          {(Array.isArray(formData.jobResponsibilities)
            ? formData.jobResponsibilities
            : []
          ).map((resp, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            >
              <span className="text-primary">•</span>
              {resp}
              <button
                onClick={() => removeResponsibility(resp)}
                className="ml-1 rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900 transition"
              >
                <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">
          How candidates should apply
        </Label>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { id: "easy-apply", label: "Easy Apply (on platform)", icon: Send },
            { id: "external-link", label: "External Link", icon: FileText },
            { id: "email", label: "Email Application", icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className={cn(
                "border rounded-xl p-5 cursor-pointer transition-all hover:border-primary/60",
                formData.applyType === id &&
                  "border-primary bg-primary/5 shadow-sm",
              )}
              onClick={() => setFormData((p) => ({ ...p, applyType: id }))}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <div className="font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {formData.applyType === "external-link" && (
          <div className="max-w-xl">
            <Label>External Application Link</Label>
            <Input
              name="applyLink"
              value={formData.applyLink}
              onChange={handleInputChange}
              placeholder="https://your-company.com/careers/apply/..."
            />
          </div>
        )}

        {formData.applyType === "email" && (
          <div className="max-w-xl">
            <Label>Application Email Address</Label>
            <Input
              name="applyEmail"
              value={formData.applyEmail}
              onChange={handleInputChange}
              placeholder="careers@yourcompany.com"
            />
          </div>
        )}
      </div>
    </div>
  );

  // Step 5: Confirmation / Summary
  // Company summary uses store data if available, otherwise companyData form state
  const renderStep5 = () => {
    const summaryCompany = company
      ? {
          name: company.companyName,
          category: company.companyCategory,
          size: company.companySize,
          hq: [company.city, company.state, company.country]
            .filter(Boolean)
            .join(", "),
        }
      : {
          name: companyData.companyName,
          category: companyData.companyCategory,
          size: companyData.companySize,
          hq: [companyData.city, companyData.state, companyData.country]
            .filter(Boolean)
            .join(", "),
        };

    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Review & Publish</h2>
          <p className="text-muted-foreground">
            Please review all details before publishing. You can go back to edit
            any section.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SummaryCard title="Company">
            <SummaryRow label="Name" value={summaryCompany.name} />
            <SummaryRow label="Sector" value={summaryCompany.category} />
            <SummaryRow label="Size" value={summaryCompany.size} />
            <SummaryRow label="HQ" value={summaryCompany.hq} />
          </SummaryCard>

          <SummaryCard title="Basic Info">
            <SummaryRow label="Job Title" value={formData.jobTitle} />
            <SummaryRow label="Category" value={formData.jobCategory} />
            <SummaryRow label="Industry" value={formData.industry} />
            <SummaryRow label="Department" value={formData.department} />
          </SummaryCard>

          <SummaryCard title="Job Details">
            <SummaryRow label="Type" value={formData.jobType} />
            <SummaryRow label="Work Mode" value={formData.workMode} />
            <SummaryRow label="Shift" value={formData.shiftType} />
            <SummaryRow label="Openings" value={formData.openings} />
            <SummaryRow
              label="Location"
              value={[formData.city, formData.state, formData.country]
                .filter(Boolean)
                .join(", ")}
            />
          </SummaryCard>

          <SummaryCard title="Compensation">
            <SummaryRow
              label="Salary"
              value={
                formData.hideSalary
                  ? "Hidden"
                  : formData.salaryNegotiable
                    ? "Negotiable"
                    : `${formData.currency} ${formData.salaryMin}–${formData.salaryMax} / ${formData.salaryType}`
              }
            />
            <SummaryRow label="Expiry" value={formData.expiryDate} />
          </SummaryCard>

          <SummaryCard title="Candidate Requirements">
            <SummaryRow
              label="Experience"
              value={`${formData.experienceMin}–${formData.experienceMax} yrs`}
            />
            <SummaryRow label="Education" value={formData.education} />
            <SummaryRow label="Notice Period" value={formData.noticePeriod} />
          </SummaryCard>

          <SummaryCard title="Skills">
            <div className="flex flex-wrap gap-1.5 mt-1">
              {formData.requiredSkills.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </SummaryCard>

          <SummaryCard title="Application Method">
            <SummaryRow label="Apply via" value={formData.applyType} />
            {formData.applyType === "email" && (
              <SummaryRow label="Email" value={formData.applyEmail} />
            )}
            {formData.applyType === "external-link" && (
              <SummaryRow label="Link" value={formData.applyLink} />
            )}
          </SummaryCard>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  // ─── Main Layout ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 py-3 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            Post a Job
          </h1>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Checkbox
              id="demo"
              checked={useDemoData}
              onCheckedChange={(checked) => setUseDemoData(!!checked)}
            />
            <Label htmlFor="demo" className="cursor-pointer text-sm">
              Load Demo
            </Label>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10 py-3 border-t border-gray-100">
          <StepIndicator
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) setCurrentStep(step);
            }}
          />
        </div>
      </div>

      {/* Body: Form + Preview */}
      <div className="mx-auto max-w-screen-2xl px-2 md:px-4 py-6 flex gap-4">
        {/* Form Area */}
        <div className="flex-1 min-w-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Briefcase className="h-5 w-5 text-[#F54A00]" />
                {STEPS[currentStep - 1]?.label}
              </CardTitle>
              <CardDescription>
                Step {currentStep} of {STEPS.length}
              </CardDescription>
            </CardHeader>

            <CardContent className="py-8">{renderCurrentStep()}</CardContent>
          </Card>

          {/* Bottom Navigation */}
          <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
            <div className="text-xs text-gray-400">
              Draft saved automatically
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? "Home" : "Back"}
              </Button>

              {currentStep < 5 ? (
                <Button onClick={handleNext} className="gap-2 min-w-36">
                  Save & Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2 min-w-44"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0">
          <div className="sticky top-[120px] bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden max-h-[calc(100vh-140px)]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">
                Job Preview
              </span>
              <Badge variant="outline" className="ml-auto text-xs">
                Live
              </Badge>
            </div>
            <PreviewPanel
              formData={formData}
              companyData={companyData}
              existingCompany={company}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

// ─── Summary helpers for Step 5 ──────────────────────────────────────────────
function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-3 bg-white">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </p>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">
        {value || <span className="text-gray-400">—</span>}
      </span>
    </div>
  );
}