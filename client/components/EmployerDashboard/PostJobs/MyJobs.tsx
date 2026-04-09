"use client";

import { API_URL, IMAGE_URL } from "@/constant/api";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Briefcase,
  IndianRupee,
  Users,
  CalendarDays,
  Clock,
  Building2,
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

  const fetchJobs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data?.data?.jobs || res.data?.jobs || res.data?.data || []);
    } catch (err) {
      const message = isAxiosError(err) && err.response?.data?.message
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
      Swal.fire({ title: "Deleted", text: "Job removed successfully", icon: "success", timer: 2200 });
    } catch {
      Swal.fire({ title: "Error", text: "Failed to delete job", icon: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const formatSalary = (job: Job) => {
    if (job.hideSalary) return "Confidential";
    if (!job.salaryMin && !job.salaryMax) return "Not disclosed";

    const min = job.salaryMin?.toLocaleString("en-IN") ?? "";
    const max = job.salaryMax?.toLocaleString("en-IN") ?? "";

    let range = min && max ? `${min} – ${max}` : min ? `From ${min}` : `Up to ${max}`;
    const period = job.salaryType === "monthly" ? "/mo" : job.salaryType === "yearly" ? "/yr" : "";

    return `${job.currency} ${range}${period}`;
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      published:        { label: "Active",      variant: "default" },
      active:           { label: "Active",      variant: "default" },
      "under-verification": { label: "Under Review", variant: "secondary" },
      pending:          { label: "Pending",     variant: "secondary" },
      expired:          { label: "Expired",     variant: "outline" },
      rejected:         { label: "Rejected",    variant: "destructive" },
    };
    return config[status] || { label: status.charAt(0).toUpperCase() + status.slice(1), variant: "secondary" as const };
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Job Postings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all your active listings</p>
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
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/70" strokeWidth={1.4} />
            <h3 className="text-xl font-medium">No jobs posted yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Start attracting great candidates by creating your first job posting.
            </p>
            <Button onClick={() => router.push("/employer/profile?tab=post-jobs")}>
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
                  status.variant === "default" && "border-l-4 border-l-green-500/70",
                  status.variant === "destructive" && "border-l-4 border-l-red-500/70",
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
                              onError={(e) => (e.currentTarget.style.display = "none")}
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
                        <Badge variant={status.variant} className="text-xs font-medium px-2.5 py-0.5">
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
                              onClick={() => router.push(`/employer/profile?tab=post-jobs&edit=${job.id}`)}
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
                              onClick={() => router.push(`/jobs/${job.slug || job.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View public listing</TooltipContent>
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
                            <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
                            <AlertDialogDescription>
                              <span className="font-medium">“{job.jobTitle}”</span> will be permanently removed.
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
                        Posted {new Date(job.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {job.expiryDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Expires {new Date(job.expiryDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
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
                        {job.experienceMin || 0} – {job.experienceMax || "Any"} yrs
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="px-4 sm:px-5 py-2.5 bg-muted/50 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
                  <div className="flex items-center gap-1.5 max-w-full truncate">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {job.locationText || [job.city, job.state].filter(Boolean).join(", ") || "Remote / Not specified"}
                    </span>
                  </div>
                  <span className="text-muted-foreground/80">Job ID: {job.id}</span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}