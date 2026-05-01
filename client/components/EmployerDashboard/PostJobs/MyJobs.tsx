"use client";

import { API_URL, IMAGE_URL } from "@/constant/api";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Pencil, Trash2, Eye, MapPin, Briefcase, IndianRupee,
  Users, CalendarDays, Clock, Building2,
  X,  // ✅ add karo
} from "lucide-react";
import { cn } from "@/lib/utils";

axios.defaults.baseURL = API_URL;

interface Job {
  id: number;
  jobTitle: string;
  slug?: string;
  jobCategory: string;
  jobType: string;
  workMode: string;
  locationText?: string;
  city?: string;
  state?: string;
  salaryMin?: number;
  salaryMax?: number;
  hideSalary: boolean;
  currency: string;
  salaryType: string;
  experienceMin: number;
  experienceMax: number;
  openings: number;
  status: string;
  createdAt: string;
  expiryDate?: string;
  company: {
    companyName: string;
    companyLogo?: string;
  };
}

export default function MyJobs() {
  const { token } = useEmployerAuthStore();
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [quickApplyData, setQuickApplyData] = useState({
    userName: "",
    contactNumber: "",
    emailAddress: "",
    totalExperience: "",
    lastSalary: "",
    location: "",
    locationCustom: "",
    area: "",
  });

  const [cvFile, setCvFile] = useState(null);
  const [applying, setApplying] = useState(false);

  const fetchJobs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data?.data?.jobs || res.data?.jobs || res.data?.data || []);
    } catch (err) {
      const message =
        isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Could not load your jobs.";
      Swal.fire({ title: "Error", text: message, icon: "error", timer: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const handleDelete = async (jobId: number) => {
    setDeletingId(jobId);
    try {
      await axios.delete(`/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      Swal.fire({
        title: "Deleted",
        text: "Job removed successfully",
        icon: "success",
        timer: 2200,
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "Failed to delete job",
        icon: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatSalary = (job: Job) => {
    if (job.hideSalary) return "Confidential";
    if (!job.salaryMin && !job.salaryMax) return "Not disclosed";

    const min = job.salaryMin?.toLocaleString("en-IN") ?? "";
    const max = job.salaryMax?.toLocaleString("en-IN") ?? "";

    let range =
      min && max ? `${min} – ${max}` : min ? `From ${min}` : `Up to ${max}`;
    const period =
      job.salaryType === "monthly"
        ? "/mo"
        : job.salaryType === "yearly"
          ? "/yr"
          : "";

    return `${job.currency} ${range}${period}`;
  };

  const getStatusConfig = (status: string) => {
    const config: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "outline" | "destructive";
      }
    > = {
      published: { label: "Active", variant: "default" },
      active: { label: "Active", variant: "default" },
      "under-verification": { label: "Under Review", variant: "secondary" },
      pending: { label: "Pending", variant: "secondary" },
      expired: { label: "Expired", variant: "outline" },
      rejected: { label: "Rejected", variant: "destructive" },
    };
    return (
      config[status] || {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        variant: "secondary" as const,
      }
    );
  };

  const handleQuickApplyInput = (e) => {
    const { name, value } = e.target;
    setQuickApplyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCvSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleQuickApplyOpen = (job) => {
    setSelectedJobForApply(job);
    setQuickApplyData({
      userName: "",
      contactNumber: "",
      emailAddress: "",
      totalExperience: "",
      lastSalary: "",
      location: "",
      locationCustom: "", // ✅ add karo
      area: "",
    });
    setCvFile(null);
    setShowQuickApplyModal(true);
  };

  const handleSubmitQuickApply = async () => {
    if (!selectedJobForApply) return;

    // Basic Validation
    if (
      !quickApplyData.userName ||
      !quickApplyData.contactNumber ||
      !quickApplyData.emailAddress ||
      !cvFile
    ) {
      Swal.fire(
        "Missing Fields",
        "Please fill all required fields and upload CV",
        "warning",
      );
      return;
    }

    setApplying(true);

    const formData = new FormData();
    formData.append("userName", quickApplyData.userName.trim());
    formData.append("contactNumber", quickApplyData.contactNumber);
    formData.append("emailAddress", quickApplyData.emailAddress.trim());
    formData.append("totalExperience", quickApplyData.totalExperience);
    formData.append("lastSalary", quickApplyData.lastSalary);
    const finalLocation =
      quickApplyData.location === "Other"
        ? quickApplyData.locationCustom // custom text bhejo
        : quickApplyData.location;
    formData.append("location", finalLocation);
    formData.append("area", quickApplyData.area);
    formData.append("cv", cvFile); // multer ke hisaab se "cv" name

    try {
      const res = await axios.post(
        `${API_URL}/applications/apply-job-admin/${selectedJobForApply.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: res.data.message || "Application submitted successfully",
        timer: 2500,
      });

      setShowQuickApplyModal(false);
      fetchJobs(); // table refresh
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: isAxiosError(error)
  ? error.response?.data?.message || error.message
  : "Something went wrong while applying",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            My Job Postings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all your active listings
          </p>
        </div>
        <Button
          onClick={() => router.push("/employer/profile?tab=post-jobs")}
          className="w-full sm:w-auto"
        >
          + Post New Job
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/5" />
                  <Skeleton className="h-4 w-2/5" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12 md:py-16 border-dashed">
          <CardContent className="pt-6 space-y-4">
            <Briefcase
              className="mx-auto h-12 w-12 text-muted-foreground/70"
              strokeWidth={1.4}
            />
            <h3 className="text-xl font-medium">No jobs posted yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Start attracting great candidates by creating your first job
              posting.
            </p>
            <Button
              onClick={() => router.push("/employer/profile?tab=post-jobs")}
            >
              Create First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 md:space-y-5">
          {jobs.map((job) => {
            const status = getStatusConfig(job.status);

            return (
              <Card
                key={job.id}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  "hover:shadow-md hover:border-border/80",
                  status.variant === "default" &&
                    "border-l-4 border-l-green-500/70",
                  status.variant === "destructive" &&
                    "border-l-4 border-l-red-500/70",
                )}
              >
                <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left – main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {job.company?.companyLogo ? (
                          <div className="shrink-0">
                            <img
                              src={`${IMAGE_URL}${job.company.companyLogo}`}
                              alt={job.company.companyName}
                              className="h-10 w-10 rounded-md object-contain border bg-white"
                              onError={(e) =>
                                (e.currentTarget.style.display = "none")
                              }
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg leading-tight truncate">
                            {job.jobTitle}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {job.company?.companyName || "Your Company"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <Badge
                          variant={status.variant}
                          className="text-xs font-medium px-2.5 py-0.5"
                        >
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.jobType}
                        </Badge>
                        <Badge variant="outline" className="text-xs gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.workMode}
                        </Badge>
                      </div>
                    </div>

                    {/* Right – actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <TooltipProvider delayDuration={400}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() =>
                                router.push(
                                  `/employer/profile?tab=post-jobs&edit=${job.id}`,
                                )
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit job</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider delayDuration={400}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() =>
                                router.push(`/jobs/${job.slug || job.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View public listing</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* ✅ Quick Apply Button — yahan add karo */}
  <TooltipProvider delayDuration={400}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
          onClick={() => handleQuickApplyOpen(job)}
        >
          <Users className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Quick Apply (HR)</TooltipContent>
    </Tooltip>
  </TooltipProvider>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Job Posting?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <span className="font-medium">
                                “{job.jobTitle}”
                              </span>{" "}
                              will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-3 sm:gap-2">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(job.id)}
                              disabled={deletingId === job.id}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              {deletingId === job.id ? (
                                <>
                                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting…
                                </>
                              ) : (
                                "Delete Job"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="p-4 sm:p-5 text-sm space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatSalary(job)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {job.openings} opening{job.openings !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Posted{" "}
                        {new Date(job.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {job.expiryDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Expires{" "}
                          {new Date(job.expiryDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {job.jobCategory}
                    </Badge>
                    {(job.experienceMin > 0 || job.experienceMax > 0) && (
                      <Badge variant="secondary" className="text-xs">
                        {job.experienceMin || 0} – {job.experienceMax || "Any"}{" "}
                        yrs
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="px-4 sm:px-5 py-2.5 bg-muted/50 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
                  <div className="flex items-center gap-1.5 max-w-full truncate">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {job.locationText ||
                        [job.city, job.state].filter(Boolean).join(", ") ||
                        "Remote / Not specified"}
                    </span>
                  </div>
                  <span className="text-muted-foreground/80">
                    Job ID: {job.id}
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      {/* Quick Apply by Admin Modal */}
      {showQuickApplyModal && selectedJobForApply && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-linear-to-r from-purple-700 to-indigo-700 text-white px-6 py-5 flex justify-between items-center flex-shrink-0">
              <div>
                <p className="text-xs opacity-75">QUICK APPLY</p>
                <h3 className="font-semibold text-lg">
                  Apply for: {selectedJobForApply.jobTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowQuickApplyModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl"
              >
                <X size={22} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="userName"
                  value={quickApplyData.userName}
                  onChange={handleQuickApplyInput}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter candidate name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={quickApplyData.contactNumber}
                    onChange={handleQuickApplyInput}
                    maxLength={10}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="98765xxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={quickApplyData.emailAddress}
                    onChange={handleQuickApplyInput}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="candidate@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Total Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="totalExperience"
                    value={quickApplyData.totalExperience}
                    onChange={handleQuickApplyInput}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Salary (₹)
                  </label>
                  <input
                    type="number"
                    name="lastSalary"
                    value={quickApplyData.lastSalary}
                    onChange={handleQuickApplyInput}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="450000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Area (e.g. Rohini, Dwarka, etc.)
                </label>
                <input
                  type="text"
                  name="area"
                  value={quickApplyData.area}
                  onChange={handleQuickApplyInput}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Rohini, Dwarka, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current / Preferred Location *
                </label>
                <select
                  name="location"
                  value={quickApplyData.location}
                  onChange={handleQuickApplyInput}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">Select Location</option>

                  {/* Delhi NCR - Most Relevant */}
                  <optgroup label="Delhi NCR">
                    <option value="Faridabad">Faridabad</option>
                    <option value="Gurgaon">Gurgaon (Gurugram)</option>
                    <option value="Noida">Noida</option>
                    <option value="Greater Noida">Greater Noida</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Ghaziabad">Ghaziabad</option>
                    <option value="Sonipat">Sonipat</option>
                    <option value="Manesar">Manesar</option>
                  </optgroup>

                  {/* Major Metro Cities */}
                  <optgroup label="Major Cities">
                    <option value="Bangalore">Bangalore (Bengaluru)</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Indore">Indore</option>
                    <option value="Coimbatore">Coimbatore</option>
                  </optgroup>

                  {/* Other Popular Cities */}
                  <optgroup label="Other Cities">
                    <option value="Surat">Surat</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Kochi">Kochi</option>
                    <option value="Bhubaneswar">Bhubaneswar</option>
                  </optgroup>

                  {/* <option value="Remote">Remote / Work From Home</option>
                        <option value="Other">Other (Please specify below)</option> */}
                </select>
              </div>

              {/* Optional: Show text input when "Other" is selected */}
              {quickApplyData.location === "Other" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Please specify location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={quickApplyData.locationCustom || ""}
                    onChange={(e) =>
                      setQuickApplyData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter city name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Upload CV (PDF) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvSelect}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {cvFile && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ {cvFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t px-6 py-4 flex gap-3 bg-slate-50">
              <button
                onClick={() => setShowQuickApplyModal(false)}
                className="flex-1 py-3 text-slate-600 font-medium rounded-2xl border border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuickApply}
                disabled={applying}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-2xl transition flex items-center justify-center gap-2"
              >
                {applying ? "Applying..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
