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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plus,
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Send,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

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

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface ScreeningQuestion {
  id: string; // ← Must have
  question: string;
  type: "boolean" | "multiple-choice" | "text";
  options?: string[];
  required: boolean;
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
  // New fields
  gender: string;
  isIncentive: boolean;
  jobTiming: string;
  workingDays: string[];
  screeningQuestions: ScreeningQuestion[];
}

export default function PostJob() {
  const {
    token,
    isAuthenticated,
    fetchCompanyProfile,
    company,
    fetchCompanyList,
    user
  } = useEmployerAuthStore();
  const role = user?.role || "employer";
  // console.log("role",role)
  const searchParams = useSearchParams();
  const navigate = useRouter();
  // 👇 Admin ke liye company list
  const [companyList, setCompanyList] = useState<
    { id: number; companyName: string }[]
  >([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );

  const editId = searchParams.get("edit");

  const [mode, setMode] = useState<"create" | "edit">(
    editId ? "edit" : "create",
  );

  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [jobId, setJobId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Screening question input state
  const [sqInput, setSqInput] = useState("");
  const [sqOptions] = useState(["Yes", "No"]);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "boolean" as "boolean" | "multiple-choice" | "text",
    options: ["Yes", "No"] as string[],
    required: true,
  });

  const [optionInput, setOptionInput] = useState("");

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
    // New fields
    gender: "any",
    isIncentive: false,
    jobTiming: "",
    workingDays: [],
    screeningQuestions: [],
  });

  const [skillInput, setSkillInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [useDemoData, setUseDemoData] = useState(false);

  const resetForm = useCallback(() => {
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
      // New fields
      gender: "any",
      isIncentive: false,
      jobTiming: "",
      workingDays: [],
      screeningQuestions: [],
    });
    setSkillInput("");
    setTagInput("");
    setBenefitInput("");
    setSqInput("");
    setNewQuestion({
      question: "",
      type: "boolean",
      options: ["Yes", "No"],
      required: true,
    });
    setOptionInput("");
  }, []);

  const fetchCompanies = useCallback(async () => {
    if (role !== "employer-admin") return;

    try {
      const res = await fetchCompanyList();
      console.log("fetchCompanyList response:", res);

      // Important: Yeh check karo ki response kaisa aa raha hai
      if (res && Array.isArray(res)) {
        setCompanyList(res);
      } else if (res?.data && Array.isArray(res.data)) {
        setCompanyList(res.data);
      } else {
        console.warn("Unexpected response format from fetchCompanyList", res);
        setCompanyList([]);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      setCompanyList([]);
    }
  }, [role, fetchCompanyList]); // ← fetchCompanyList bhi dependency mein add karo

  // 👇 Single useEffect for fetching companies + profile (Better)
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    fetchCompanyProfile();

    // Admin ke liye company list fetch karo
    if (role === "employer-admin") {
      fetchCompanies();
    }
  }, [isAuthenticated, token, role, fetchCompanyProfile, fetchCompanies]);

  // Edit mode mein company select karne ke liye
  useEffect(() => {
    if (mode === "edit" && role === "employer-admin") {
      // Wait until companyList is loaded
      if (companyList.length > 0 && company?.id) {
        const companyExists = companyList.some((c) => c.id === company.id);

        if (companyExists) {
          setSelectedCompanyId(company.id);
        } else {
          console.warn("Company from profile not found in companyList");
          // Optional: Agar company list mein nahi hai toh bhi set kar do
          setSelectedCompanyId(company.id);
        }
      }
    }
  }, [mode, role, companyList, company?.id]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCompanyProfile();
    }
  }, [isAuthenticated, token, fetchCompanyProfile]);

  useEffect(() => {
    if (!token) return;

    const loadJob = async () => {
      if (!editId) {
        setMode("create");
        resetForm();
        return;
      }

      setFetchingJob(true);
      setMode("edit");

      try {
        const res = await axios.get(`/jobs/${editId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const job = res.data?.data || res.data;

        if (!job) throw new Error("Job not found");

        setJobId(job.id);

        setFormData({
          jobTitle: job.jobTitle || "",
          jobDescription: job.jobDescription || "",
          industry: job.industry || "",
          jobResponsibilities: (() => {
            const resp = job.jobResponsibilities;

            if (Array.isArray(resp)) {
              return resp;
            }

            if (typeof resp === "string") {
              try {
                const parsed = JSON.parse(resp);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            }

            return [];
          })(),
          jobCategory: job.jobCategory || "",
          department: job.department || "",
          jobType: job.jobType || "full-time",
          workMode: job.workMode || "onsite",
          shiftType: job.shiftType || "day",
          country: job.country || "India",
          state: job.state || "",
          city: job.city || "",
          locationText: job.locationText || "",
          salaryType: job.salaryType || "monthly",
          currency: job.currency || "INR",
          salaryMin: job.salaryMin ? String(job.salaryMin) : "",
          salaryMax: job.salaryMax ? String(job.salaryMax) : "",
          hideSalary: !!job.hideSalary,
          salaryNegotiable: !!job.salaryNegotiable,
          experienceMin: job.experienceMin ? String(job.experienceMin) : "0",
          experienceMax: job.experienceMax ? String(job.experienceMax) : "5",
          openings: job.openings ? String(job.openings) : "1",
          noticePeriod: job.noticePeriod || "",
          education: job.education || "",
          expiryDate: job.expiryDate ? job.expiryDate.split("T")[0] : "",
          benefits: Array.isArray(job.benefits)
            ? job.benefits
            : typeof job.benefits === "string"
              ? JSON.parse(job.benefits)
              : [],
          requiredSkills: Array.isArray(job.requiredSkills)
            ? job.requiredSkills
            : typeof job.requiredSkills === "string"
              ? JSON.parse(job.requiredSkills)
              : [],
          jobTags: Array.isArray(job.jobTags)
            ? job.jobTags
            : typeof job.jobTags === "string"
              ? JSON.parse(job.jobTags)
              : [],
          applyType: job.applyType || "easy-apply",
          applyEmail: job.applyEmail || "",
          applyLink: job.applyLink || "",
          // New fields
          gender: job.gender || "any",
          isIncentive: !!job.isIncentive,
          jobTiming: job.jobTiming || "",
          workingDays: Array.isArray(job.workingDays)
            ? job.workingDays
            : typeof job.workingDays === "string"
              ? JSON.parse(job.workingDays)
              : [],
          screeningQuestions: Array.isArray(job.screeningQuestions)
            ? job.screeningQuestions
            : typeof job.screeningQuestions === "string"
              ? JSON.parse(job.screeningQuestions)
              : [],
        });
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Could not load job details.",
          icon: "error",
        });
        // navigate.push("/employer/jobs");
      } finally {
        setFetchingJob(false);
      }
    };

    loadJob();
  }, [editId, token, resetForm, navigate]);

  useEffect(() => {
    if (!useDemoData) return;

    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setFormData({
      jobTitle: "Senior Full-Stack Developer (MERN / Next.js)",
      jobDescription:
        "We are seeking a talented Full-Stack Developer to join our fast-growing product team...",
      jobResponsibilities: ["One", "Two"],
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
      // New fields
      gender: "any",
      isIncentive: true,
      jobTiming: "9:00 AM - 6:00 PM",
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      screeningQuestions: [
        {
          question: "Do you have experience with React?",
          type: "boolean",
          options: ["Yes", "No"],
        },
      ],
    });

    setUseDemoData(false);
  }, [useDemoData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      return {
        ...prev,
        jobResponsibilities: [...existing, trimmed],
      };
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

  // console.log("companyList",companyList)

  const toggleWorkingDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const addScreeningQuestion = () => {
    const trimmed = newQuestion.question.trim();
    if (!trimmed) return;

    let finalOptions: string[] | undefined = undefined;

    if (
      newQuestion.type === "boolean" ||
      newQuestion.type === "multiple-choice"
    ) {
      finalOptions = newQuestion.options
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

      if (finalOptions.length < 2) {
        Swal.fire({
          title: "Invalid Options",
          text: "At least 2 options are required for Yes/No or Multiple Choice questions.",
          icon: "warning",
        });
        return;
      }
    }

    const newQ: ScreeningQuestion = {
      id: `q_${Date.now()}`, // ← Important
      question: trimmed,
      type: newQuestion.type,
      options: finalOptions,
      required: newQuestion.required,
    };

    setFormData((prev) => ({
      ...prev,
      screeningQuestions: [...prev.screeningQuestions, newQ],
    }));

    // Reset
    setNewQuestion({
      question: "",
      type: "boolean",
      options: ["Yes", "No"],
      required: true,
    });
    setOptionInput("");
  };

  const removeScreeningQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.jobTitle.trim()) return "Job title is required";
    if (formData.jobDescription.length < 120)
      return "Description too short (min 120 chars)";
    if (formData.requiredSkills.length === 0)
      return "At least one skill required";
    if (Number(formData.openings) < 1) return "At least 1 opening required";

    if (!formData.hideSalary && !formData.salaryNegotiable) {
      if (!formData.salaryMin || !formData.salaryMax)
        return "Salary range required";
      if (Number(formData.salaryMax) < Number(formData.salaryMin))
        return "Max ≤ Min salary";
    }
    if (formData.jobResponsibilities.length === 0) {
      return "At least one responsibility is required";
    }

    if (formData.applyType === "email" && !formData.applyEmail.trim())
      return "Email required for email apply";
    if (formData.applyType === "external-link" && !formData.applyLink.trim())
      return "Link required for external apply";

    return null;
  };

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

    if (!company?.id) {
      await Swal.fire({
        title: "Error",
        text: "Company profile missing",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);

    // Admin ke liye selectedCompanyId, employer ke liye company?.id
    const resolvedCompanyId =
      role === "employer-admin" ? selectedCompanyId : company?.id;

    if (!resolvedCompanyId) {
      await Swal.fire({
        title: "Error",
        text:
          role === "employer-admin"
            ? "Please select a company"
            : "Company profile missing",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);

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
      companyId: resolvedCompanyId,
      // Clean screening questions before sending
      screeningQuestions: formData.screeningQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || undefined,
        required: q.required,
      })),
    };

    try {
      let res;
      let otpSend = false;

      if (mode === "edit" && editId) {
        res = await axios.patch(`/jobs/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post("/jobs", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      console.log(res.data);
      const data = res.data?.data || res.data;
      const returnedJobId = data?.id || Number(editId);

      if (!returnedJobId) throw new Error("No job ID received");

      setJobId(returnedJobId);

      otpSend = !!data?.isOtpSend || !!res.data?.isOtpSend;

      if (mode === "create" || (mode === "edit" && otpSend)) {
        await Swal.fire({
          icon: "success",
          title: mode === "create" ? "Job Posted!" : "Job Updated",
          text: "Your job has been created successfully.",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // setShowOtpModal(true);
      } else {
        await Swal.fire({
          icon: "success",
          title: "Job Updated",
          text: "Changes saved successfully.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        navigate.refresh();
      }
    } catch (err) {
      let msg =
        mode === "edit" ? "Failed to update job." : "Failed to create job.";

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

  const handleVerifyOtp = async () => {
    if (!jobId || otp.length !== 6) return;

    setOtpLoading(true);

    try {
      await axios.post(
        "/jobs/verify-otp",
        { jobId, otp },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text:
          mode === "edit"
            ? "Job updated & published."
            : "Job published successfully.",
      });

      setShowOtpModal(false);
      setOtp("");
      setJobId(null);

      if (mode === "edit") {
        navigate.push("/employer/jobs");
      } else {
        resetForm();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired OTP";
      Swal.fire("Error", msg, "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!jobId) return;
    setResendLoading(true);
    try {
      await axios.post(
        "/jobs/resend-otp",
        { jobId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      Swal.fire("Success", "New OTP sent.", "success");
    } catch {
      Swal.fire("Error", "Failed to resend OTP.", "error");
    } finally {
      setResendLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Only verified employers can post or edit jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchingJob) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-10 px-2 md:px-4">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "edit" ? "Edit Job" : "Post a New Job"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === "edit"
              ? "Update job details and re-verify to publish changes"
              : "Attract top talent with detailed information"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="demo"
              checked={useDemoData}
              onCheckedChange={(checked) => setUseDemoData(!!checked)}
            />
            <Label htmlFor="demo" className="cursor-pointer">
              Load Demo
            </Label>
          </div>

          {mode === "edit" && (
            <Button
              variant="outline"
              onClick={() => navigate.push("/employer/profile?tab=post-jobs")}
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm ">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Briefcase className="h-6 w-6" />
            {mode === "edit" ? "Edit Job Details" : "Job Details"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-10">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                Basic Job Information
              </h3>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Job Title - Full Width on md */}
                <div className="space-y-2 lg:col-span-3">
                  <Label className="flex items-center gap-1 text-gray-700 font-medium">
                    Job Title
                    <span className="text-red-600 text-base">*</span>
                  </Label>
                  <Input
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Product Designer, Backend Engineer (Golang), Growth Marketing Lead"
                    className="h-12 text-base border-gray-300 focus:border-blue-600 focus:ring-blue-600 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 pl-1">
                    Be specific. Include role level and key technologies for
                    better reach.
                  </p>
                </div>

                {/* Job Category */}
                <div className="space-y-2 w-full">
                  <Label className="text-gray-700 font-medium">
                    Job Category
                  </Label>
                  <Select
                    value={formData.jobCategory}
                    onValueChange={handleSelectChange("jobCategory")}
                  >
                    <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                      <SelectValue placeholder="Select job category" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {JOB_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Industry */}
                <div className="space-y-2 w-full">
                  <Label className="text-gray-700 font-medium">
                    Industry of Job
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={handleSelectChange("industry")}
                  >
                    <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="w-full">
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {role === "employer-admin" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-2">
                    <Label className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Select Company
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-amber-700">
                      You are posting as admin. Choose which company this job
                      belongs to.
                    </p>
                    <Select
                      value={selectedCompanyId ? String(selectedCompanyId) : ""}
                      onValueChange={(val) => setSelectedCompanyId(Number(val))}
                    >
                      <SelectTrigger className="h-11 w-full max-w-md bg-white border-amber-300 focus:border-amber-500">
                        <SelectValue placeholder="Select a company..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companyList.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ================= RESPONSIBILITIES ================= */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="space-y-1">
                <Label className="text-base font-semibold flex items-center gap-2">
                  Key Responsibilities
                  <span className="text-red-500">*</span>
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
                  <Plus className="h-4 w-4 mr-2" />
                  Add
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

            {/* ================= SKILLS ================= */}
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
                  onClick={() =>
                    addItem("requiredSkills", skillInput, setSkillInput)
                  }
                  className="h-11 px-5"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
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
          </div>

          <div
            className="bg-white dark:bg-gray-900 border border-gray-200 
                dark:border-gray-800 rounded-2xl  p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* ================= JOB TYPE ================= */}
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

              {/* ================= WORK MODE ================= */}
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

              {/* ================= SHIFT TYPE ================= */}
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

              {/* ================= OPENINGS ================= */}
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

            {/* ================= JOB TIMING + GENDER ================= */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Timing</Label>
                <Input
                  name="jobTiming"
                  value={formData.jobTiming}
                  onChange={handleInputChange}
                  placeholder="e.g. 9:00 AM - 6:00 PM"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Gender Preference</Label>
                <Select
                  value={formData.gender}
                  onValueChange={handleSelectChange("gender")}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ================= WORKING DAYS ================= */}
            <div className="mt-6 space-y-3">
              <Label className="text-sm font-medium">Working Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Badge
                    key={day}
                    variant={
                      formData.workingDays.includes(day) ? "default" : "outline"
                    }
                    className="cursor-pointer text-sm px-3 py-1.5 select-none"
                    onClick={() => toggleWorkingDay(day)}
                  >
                    {day.slice(0, 3)}
                  </Badge>
                ))}
              </div>
              {formData.workingDays.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: {formData.workingDays.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">Location</h3>
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
              <div className="space-y-2 lg:col-span-1">
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

              {/* ================= IS INCENTIVE ================= */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isIncentive"
                  checked={formData.isIncentive}
                  onCheckedChange={(c) =>
                    setFormData((p) => ({ ...p, isIncentive: !!c }))
                  }
                />
                <Label htmlFor="isIncentive">
                  Includes Incentive / Variable Pay
                </Label>
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

          <div className="space-y-4">
            <Label>Benefits & Perks</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_BENEFITS.map((b) => (
                <Badge
                  key={b}
                  variant={
                    formData.benefits.includes(b) ? "default" : "outline"
                  }
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
                onClick={() =>
                  addItem("benefits", benefitInput, setBenefitInput)
                }
              >
                Add
              </Button>
            </div>
            {formData.benefits.length > COMMON_BENEFITS.length && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.benefits
                  .filter((b) => !COMMON_BENEFITS.includes(b))
                  .map((b) => (
                    <Badge
                      key={b}
                      variant="secondary"
                      className="gap-1 px-3 py-1"
                    >
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

          {/* ================= SCREENING QUESTIONS ================= */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <Label className="text-base font-semibold">
                Screening Questions
              </Label>
              <p className="text-xs text-muted-foreground">
                Filter candidates with Yes/No, Multiple Choice, or Text
                questions
              </p>
            </div>

            {/* Add New Question Form */}
            <div className="border border-dashed border-gray-300 rounded-xl p-5 space-y-4 bg-gray-50">
              <Input
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    question: e.target.value,
                  }))
                }
                placeholder="Enter your screening question"
                className="h-11"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Question Type</Label>
                  <Select
                    value={newQuestion.type}
                    onValueChange={(
                      value: "boolean" | "multiple-choice" | "text",
                    ) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        type: value,
                        options:
                          value === "text"
                            ? []
                            : value === "boolean"
                              ? ["Yes", "No"]
                              : prev.options,
                      }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Yes / No</SelectItem>
                      <SelectItem value="multiple-choice">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="text">
                        Text Input (Long Answer)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id="req"
                    checked={newQuestion.required}
                    onCheckedChange={(checked) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        required: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="req" className="cursor-pointer">
                    Required Question
                  </Label>
                </div>
              </div>

              {/* Options Input */}
              {(newQuestion.type === "boolean" ||
                newQuestion.type === "multiple-choice") && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Add an option"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const trimmed = optionInput.trim();
                          if (
                            trimmed &&
                            !newQuestion.options.includes(trimmed)
                          ) {
                            setNewQuestion((prev) => ({
                              ...prev,
                              options: [...prev.options, trimmed],
                            }));
                            setOptionInput("");
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const trimmed = optionInput.trim();
                        if (trimmed && !newQuestion.options.includes(trimmed)) {
                          setNewQuestion((prev) => ({
                            ...prev,
                            options: [...prev.options, trimmed],
                          }));
                          setOptionInput("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {newQuestion.options.map((opt, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {opt}
                        <button
                          onClick={() =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              options: prev.options.filter((_, i) => i !== idx),
                            }))
                          }
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={addScreeningQuestion}
                disabled={!newQuestion.question.trim()}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Screening Question
              </Button>
            </div>

            {/* List of Added Questions */}
            {formData.screeningQuestions.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Added Questions ({formData.screeningQuestions.length})
                </Label>
                {formData.screeningQuestions.map((q, i) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">Q{i + 1}</span>
                        <span className="font-medium">{q.question}</span>
                        {q.required && (
                          <Badge variant="destructive" className="text-xs ml-2">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Type:{" "}
                        {q.type === "boolean"
                          ? "Yes/No"
                          : q.type === "multiple-choice"
                            ? "Multiple Choice"
                            : "Text Answer"}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {q.options.map((opt, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {opt}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeScreeningQuestion(i)}
                      className="text-red-500 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">
              How candidates should apply
            </Label>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  id: "easy-apply",
                  label: "Easy Apply (on platform)",
                  icon: Send,
                },
                // { id: "external-link", label: "External Link", icon: FileText },
                // { id: "email", label: "Email Application", icon: Clock },
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

          <Separator className="my-10" />

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
              className="min-w-56 h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : mode === "edit" ? (
                "Update Job"
              ) : (
                "Create Job"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "Verify Job Update" : "Verify Job Posting"}
            </DialogTitle>
            <DialogDescription>
              We sent a 6-digit OTP to your registered email.
              <br />
              Enter it to{" "}
              {mode === "edit" ? "publish the updated job" : "publish the job"}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-8">
            <Label htmlFor="otp" className="text-lg">
              OTP Code
            </Label>
            <Input
              id="otp"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="______"
              className="text-center text-3xl tracking-[1em] font-mono mt-3 h-14"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-4 sm:justify-between">
            <Button
              variant="outline"
              onClick={handleResendOtp}
              disabled={resendLoading}
            >
              {resendLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Resend OTP
            </Button>

            <Button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.length !== 6}
            >
              {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & {mode === "edit" ? "Update" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
