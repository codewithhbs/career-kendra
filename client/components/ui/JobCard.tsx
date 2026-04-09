"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { IMAGE_URL } from "@/constant/api";

interface JobCardProps {
  job: any;
  formatSalary: (job: any) => string;
  getInitials: (name: string) => string;
}

export default function JobCard({
  job,
  formatSalary,
  getInitials,
}: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block h-full">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">

        {/* ============ TOP SECTION ============ */}
        <div className="p-8 space-y-2">

          {/* Company Row */}
          <div className="flex items-start justify-between">

            {/* Left Side (Logo + Company + Location) */}
            <div className="flex items-start w-full justify-between gap-4">

              <Avatar className="h-12 w-22 border-none rounded-none ">
                <AvatarImage
                  src={`${IMAGE_URL}${job.company?.companyLogo}`}
                  alt={job.company?.companyName}
                  className="object-contain w-full h-full px-2"

                />
                <AvatarFallback className="bg-amber-100 text-amber-800 font-semibold text-lg">
                  {getInitials(job.company?.companyName || "Co")}
                </AvatarFallback>
              </Avatar>

              <div className="ml-3 space-y-1">
                <h4 className="text-base font-semibold text-gray-900">
                  {job.company?.companyName || "Company"}
                </h4>

                <p className="text-xs text-gray-500">
                  {job.locationText ||`${job.city || ""},${job.state || ""}`}
                </p>
              </div>
            </div>
          </div>

          {/* Job Title */}
          <h3 className="text-2xl font-bold text-gray-900 leading-snug">
            {job.jobTitle}
          </h3>

          {/* Job Type & Experience */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="px-4 py-1 text-gray-600">
              {job.jobType}
            </Badge>

            <Badge variant="outline" className="px-4 py-1 text-gray-600">
              {job.experienceMin}-{job.experienceMax} yrs
            </Badge>
          </div>

          {/* Meta Info */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              {job.locationText || job.city}
            </div>

            <div className="font-semibold text-gray-800">
              {formatSalary(job)}
            </div>

            <div className="text-xs text-gray-500">
              Posted: {format(new Date(job.createdAt), "MMM d, yyyy")}
            </div>
          </div>
        </div>

        {/* ============ BUTTON ============ */}
        <div className="px-8 pb-8 mt-auto">
          <Button className="w-full py-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-base font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
            View Details
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </Link>
  );
}