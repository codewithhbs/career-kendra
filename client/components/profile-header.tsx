"use client";

import { IMAGE_URL } from "@/constant/api";
import { Edit } from "lucide-react";

// Import shadcn/ui components (make sure you've added them via npx shadcn-ui@latest add avatar)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  onEditClick: () => void;
  profile?: any;
}

export default function ProfileHeader({
  onEditClick,
  profile,
}: ProfileHeaderProps) {
  let skills: string[] = [];
  try {
    const rawSkills = profile?.skills;
    if (typeof rawSkills === "string") {
      skills = JSON.parse(rawSkills);
    } else if (Array.isArray(rawSkills)) {
      skills = rawSkills;
    }
  } catch (e) {
    console.warn("Failed to parse skills:", e);
    skills = [];
  }

  // Clean image URL (undefined = use fallback)
  const profileImageSrc = profile?.profileImage
    ? `${IMAGE_URL.replace(/\/$/, "")}/${profile.profileImage.replace(/^\//, "")}`
    : undefined;

  // Generate initials (e.g. "Happy Singh" → "HS", "John" → "JO")
  const getInitials = () => {
    const name = (profile?.user?.userName || "User").trim();
    if (!name) return "US";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const experienceText = (() => {
    console.log(profile)
    if (!profile?.experience) return "Fresher";

    let experiences = [];

    try {
      experiences =
        typeof profile.experience === "string"
          ? JSON.parse(profile.experience)
          : profile.experience;
    } catch (err) {
      console.error("Invalid experience data:", profile.experience);
      return "Fresher";
    }

    if (!Array.isArray(experiences) || !experiences.length) return "Fresher";

    let totalMonths = 0;

    experiences.forEach((exp) => {
      if (!exp.startDate) return;

      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();

      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      totalMonths += months > 0 ? months : 0;
    });

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    if (years <= 0 && remainingMonths <= 0) return "Fresher";

    if (years > 0 && remainingMonths > 0)
      return `${years} ${years === 1 ? "year" : "years"} ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"
        } experience`;

    if (years > 0)
      return `${years} ${years === 1 ? "year" : "years"} experience`;

    return `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"
      } experience`;
  })();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
              {profileImageSrc && (
                <AvatarImage
                  src={profileImageSrc}
                  alt={`${profile?.user?.userName || "User"} profile`}
                />
              )}
              <AvatarFallback className="text-base sm:text-lg font-semibold bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Welcome back, {profile?.user?.userName || "User"} 👋
              </h1>

              <p className="text-sm text-gray-600 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                {skills.length > 0 && (
                  <>
                    <span className="font-medium text-gray-700">
                      {skills.join(" • ")}
                    </span>
                    <span className="text-gray-400">•</span>
                  </>
                )}
                <span>{experienceText}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onEditClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-sm w-full sm:w-auto"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Edit Profile</span>
            <span className="sm:hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
}