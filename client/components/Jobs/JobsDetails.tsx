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

// ────────────────────────────────────────────────
// Share Button Component
// ────────────────────────────────────────────────

// Social SVG Icons
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

function ShareButton({ jobTitle, slug }: { jobTitle: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const jobUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/jobs/${slug}`
      : `/jobs/${slug}`;

  const encodedTitle = encodeURIComponent(jobTitle);
  const encodedUrl = encodeURIComponent(jobUrl);

  const shareOptions = [
  {
    name: "WhatsApp",
    icon: <WhatsAppIcon />,
    url: `https://wa.me/?text=${encodedTitle}%0A${encodedUrl}`,
    bg: "#25D366",
    hover: "#1ebe57",
  },
  {
    name: "LinkedIn",
    icon: <LinkedInIcon />,
    url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    bg: "#0A66C2",
    hover: "#0958a8",
  },
  {
    name: "Twitter",
    icon: <TwitterXIcon />,
    url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    bg: "#000000",
    hover: "#27272a",
  },
  {
    name: "Facebook",
    icon: <FacebookIcon />,
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    bg: "#1877F2",
    hover: "#0c6de0",
  },
];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted-foreground">Share this job</p>

      <div className="flex flex-wrap gap-2">
        {shareOptions.map((option) => (
  <a
    key={option.name}
    href={option.url}
    target="_blank"
    rel="noopener noreferrer"
    style={{ backgroundColor: option.bg }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = option.hover)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = option.bg)}
    className="flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-white text-xs font-medium transition-all active:scale-95"
  >
    {option.icon}
    <span>{option.name}</span>
  </a>
))}

        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          className={`flex-1 min-w-[70px] flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
            copied
              ? "border-green-500 text-green-600 bg-green-50"
              : "border-dashed border-muted-foreground/50 hover:border-primary hover:text-primary"
          }`}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
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

            {/* ←←← NEW: Share Card →→→ */}
            <Card className="border shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Share Job</CardTitle>
              </CardHeader>
              <CardContent>
                <ShareButton jobTitle={job.jobTitle} slug={job.slug} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg md:hidden">
        <div className="container px-4 py-4 flex items-center gap-3">
          <Button className="flex-1 h-11 text-base" asChild>
            <Link href={`/jobs/${job.slug}/apply-for-this-job`}>
  Apply Now
</Link>
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
        <p className="font-medium capitalize">{value}</p>
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
