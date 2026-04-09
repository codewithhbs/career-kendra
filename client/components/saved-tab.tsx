"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BookmarkMinus, MapPin, Clock, IndianRupee, Briefcase } from "lucide-react";

import { useJob } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function SavedTab() {
  const { savedJobs, loading, fetchSavedJobs, removeSavedJob } = useJob();

  useEffect(() => {
    // Make sure saved jobs are fresh when tab is viewed
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleRemove = async (jobId: number) => {
    try {
      await removeSavedJob(jobId);
    } catch (err) {
      console.error("Failed to remove saved job:", err);
      // Optionally show toast/notification here
    }
  };

  const formatSalary = (min?: number, max?: number, currency = "INR", type = "monthly") => {
    if (!min && !max) return "Not disclosed";
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)} ${type === "monthly" ? "/mo" : "/yr"}`;
    }
    return min ? formatter.format(min) : formatter.format(max!);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-5 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-dashed p-10 text-center">
        <BookmarkMinus className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No saved jobs yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Jobs you save will appear here for easy access later.
        </p>
        <Button asChild className="mt-6">
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900">
          Saved Jobs <span className="text-gray-500 font-normal">({savedJobs.length})</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Jobs you've bookmarked for future applications
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {savedJobs.map((saved) => {
          const job = saved.job;

          return (
            <div
              key={saved.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate text-lg">
                      {job.jobTitle}
                    </h4>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {job.company?.companyName || "Company Name"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(job.id)}
                    className="text-red-600 hover:text-red-700 transition-colors p-1 -mt-1 -mr-1"
                    title="Remove from saved"
                  >
                    <BookmarkMinus size={20} />
                  </button>
                </div>

                {/* Quick info chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    <Briefcase size={14} className="mr-1" />
                    {job.jobType.replace("-", " ")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <MapPin size={14} className="mr-1" />
                    {job.locationText || job.city}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock size={14} className="mr-1" />
                    {job.workMode}
                  </Badge>
                </div>

                {/* Salary & Experience */}
                <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <IndianRupee size={16} className="text-gray-500" />
                    <span>
                      {formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} className="text-gray-500" />
                    <span>
                      {job.experienceMin}-{job.experienceMax} yrs
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Saved {new Date(saved.savedAt).toLocaleDateString("en-IN")}
                  </span>

                  <Button size="sm" asChild>
                    <Link href={`/jobs/${job.slug}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}