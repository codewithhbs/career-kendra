"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Briefcase,
  Clock,
  CalendarDays,
  IndianRupee,
  Building2,
  Phone,
  ArrowLeft,
  ArrowRight,
  Loader2,
  BookmarkCheck,
  Bookmark,
} from "lucide-react";

import { API_URL, IMAGE_URL } from "@/constant/api";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { useJob } from "@/hooks/useJobs";

axios.defaults.baseURL = API_URL;

interface Job {
  id: number;
  jobTitle: string;
  slug: string;
  jobCategory: string;
  jobDescription: string;
  jobResponsibilities: string; // JSON string
  requiredSkills: string; // JSON string of array
  jobType: string;
  workMode: string;
  locationText: string;
  city: string;
  state: string;
  salaryMin?: number;
  salaryMax?: number;
  hideSalary: boolean;
  currency: string;
  salaryType: string;
  experienceMin: number;
  experienceMax: number;
  openings: number;
  status: string;
  isFeatured: boolean;
  expiryDate: string;
  createdAt: string;
  company: {
    companyName: string;
    companyLogo?: string;
    companyTagline?: string;
    companyCategory?: string;
    companySize?: string;
    companyWebsite?: string;
    companyPhone?: string;
  };
  gender: string;
  workingDays: string[]; // JSON string of array
  jobTiming: string;
  isIncentive: boolean;
}

export default function JobDetails() {
  const { company, fetchCompanyProfile } = useEmployerAuthStore();
  const { saveJob, removeSavedJob, checkAlreadySaved, isAlreadySaved } =
    useJob();
  const { id: slug } = useParams<{ id: string }>();
  const router = useRouter();
  const [saveLoading, setSaveLoading] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchCompanyProfile();
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/jobs/job-via/${slug}`);
        if (res.data?.success && res.data?.data) {
          setJob(res.data.data);
          await checkAlreadySaved(res.data.data.id);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        setError("Failed to load job details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug]);

  if (loading) {
    return <JobDetailsSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">
          {error || "Job not found"}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The job posting might have expired, been removed, or the link is
          incorrect.
        </p>
        <Button asChild variant="outline">
          <Link href="/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Link>
        </Button>
      </div>
    );
  }

  // Parse JSON strings from API

  const skills = job.requiredSkills || [];
  const benefits = job.benefits || [];

  const formatSalary = () => {
    if (job.hideSalary) return "Confidential";
    if (!job.salaryMin && !job.salaryMax) return "Not disclosed";

    const min = job.salaryMin?.toLocaleString("en-IN") ?? "";
    const max = job.salaryMax?.toLocaleString("en-IN") ?? "";
    const range = min && max ? `${min} – ${max}` : min || max;
    const period = job.salaryType === "monthly" ? "/mo" : "/yr";

    return `${job.currency} ${range}${period}`;
  };

  const postedDate = format(new Date(job.createdAt), "MMM d, yyyy");
  const expiryDate = job.expiryDate
    ? format(new Date(job.expiryDate), "MMM d, yyyy")
    : null;

  const companyInitials = job.company.companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // console.log(company)

  const isEmployer = company !== null;
  const isActiveForUsers = job?.status === "active";

  const handleSaveToggle = async () => {
    if (!job) return;
    setSaveLoading(true);

    try {
      // Ensure at least 3 seconds loading
      await new Promise(async (resolve) => {
        if (isAlreadySaved) {
          await removeSavedJob(job.id);
        } else {
          await saveJob(job.id);
        }
        // Wait for remaining time if API was faster than 3 seconds
        setTimeout(resolve, 3000);
      });
      await checkAlreadySaved(job.id);
      // Note: checkAlreadySavedJobs is automatically refreshed via your hook
    } catch (err) {
      console.error("Save action failed:", err);
    } finally {
      setSaveLoading(false);
    }
  };
  // ─── Access Control ─────────────────────────────────────────────
  if (!isEmployer && !isActiveForUsers) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5 text-center">
        <div className="max-w-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-5">
            Job Not Available
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This position may be under review, expired, or visible only to
            employers.
          </p>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg"
            asChild
          >
            <Link href="/jobs">← Browse Other Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
        {/* Header + Action Bar (mobile) */}
        <div className="mb-6 lg:mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-3">
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to jobs
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 md:h-16 md:w-16 rounded-lg border">
                <AvatarImage
                  src={`${IMAGE_URL}${job.company.companyLogo}`}
                  alt={job.company.companyName}
                />
                <AvatarFallback className="bg-muted text-xl font-medium">
                  {companyInitials}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {job.jobTitle}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {job.company.companyName}
                  </span>
                  <span className="hidden sm:block">•</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {job.locationText ||
                        `${job.city ? job.city + ", " : ""}${job.state || ""}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              {job.isFeatured && (
                <Badge variant="secondary" className="px-3 py-1">
                  Featured
                </Badge>
              )}
              <Badge variant="outline">
                {job.status === "under-verification"
                  ? "Under Review"
                  : job.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <JobSection title="Job Overview">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoItem
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Job Type"
                  value={job.jobType}
                />
                <InfoItem
                  icon={<Clock className="h-4 w-4" />}
                  label="Experience"
                  value={`${job.experienceMin}-${job.experienceMax} years`}
                />
                <InfoItem
                  icon={<IndianRupee className="h-4 w-4" />}
                  label="Salary"
                  value={formatSalary()}
                />
                <InfoItem
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Posted"
                  value={postedDate}
                />

                {expiryDate && (
                  <InfoItem
                    icon={<Clock className="h-4 w-4" />}
                    label="Expires"
                    value={expiryDate}
                  />
                )}
              </div>
            </JobSection>

            <JobSection title="About the Role">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.jobDescription}
              </p>
            </JobSection>

            <JobSection title="Responsibilities">
              <ul className="space-y-2.5">
                {job?.jobResponsibilities.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <span className="text-primary mt-1.5 text-lg">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </JobSection>

            <JobSection title="Work Details">
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Working Days"
                  value={job.workingDays?.join(", ")}
                />

                <InfoItem
                  icon={<Clock className="h-4 w-4" />}
                  label="Job Timing"
                  value={job.jobTiming}
                />

                <InfoItem
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Gender"
                  value={job.gender}
                />

                <InfoItem
                  icon={<IndianRupee className="h-4 w-4" />}
                  label="Incentive"
                  value={job.isIncentive ? "Available" : "Not Available"}
                />
              </div>
            </JobSection>

            <JobSection title="Required Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-sm px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </JobSection>

            {benefits.length > 0 && (
              <JobSection title="Benefits & Perks">
                <ul className="space-y-2.5">
                  {benefits.map((item: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="text-primary mt-1.5 text-lg">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </JobSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ================= APPLY / EMPLOYER ACTION CARD ================= */}
            <Card className="border shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isEmployer ? "Employer Actions" : "Job Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEmployer ? (
                  <>
                    <Button
                      className="w-full h-12 text-base font-medium"
                      asChild
                    >
                      <Link href={`/jobs/${job.slug}/apply-for-this-job`}>
                        Apply with Easy Apply
                      </Link>
                    </Button>

                    <Button
                      variant={isAlreadySaved ? "default" : "outline"}
                      className="w-full h-12 text-base font-medium"
                      onClick={handleSaveToggle}
                      disabled={saveLoading}
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isAlreadySaved ? "Removing..." : "Saving..."}
                        </>
                      ) : isAlreadySaved ? (
                        <>
                          <BookmarkCheck className="mr-2 h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="mr-2 h-4 w-4" />
                          Save Job
                        </>
                      )}
                    </Button>

                    {job.company.companyWebsite && (
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <a
                          href={job.company.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Company Website
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full h-11" asChild>
                      <Link
                        href={`/employer/profile?tab=post-jobs&edit=${job.id}`}
                      >
                        Edit Job
                      </Link>
                    </Button>
                    <Button variant="secondary" className="w-full h-11" asChild>
                      <Link href={`/employer/jobs/${job.id}/applications`}>
                        View Applications
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ================= COMPANY CARD ================= */}
            <Card className="border shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Company</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{job.company.companyName}</p>

                    {job.company.companyTagline && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {job.company.companyTagline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-muted-foreground">
                  {job.company.companyCategory && (
                    <p>Category: {job.company.companyCategory}</p>
                  )}

                  {job.company.companySize && (
                    <p>Size: {job.company.companySize} employees</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg md:hidden">
        <div className="container px-4 py-4 flex items-center gap-3">
          <Button className="flex-1 h-11 text-base" asChild>
            <Link href={`/jobs/${job.slug}/apply-for-this-job`}>Apply Now</Link>
          </Button>
          {job.company.companyPhone && (
            <Button variant="outline" size="icon" className="h-11 w-11" asChild>
              <a href={`tel:${job.company.companyPhone}`}>
                <Phone className="h-5 w-5" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Reusable Components
// ────────────────────────────────────────────────

function JobSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-[-14]">{children}</CardContent>
    </Card>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function JobDetailsSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
