"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  Bookmark,
  MessageSquare,
  Bell,
  CheckCircle2,
  Upload,
  FileText,
  X,
  TrendingUp,
  Calendar,
  Building2,
  ArrowRight,
  Zap,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import axios from "axios";
import { API_URL } from "@/constant/api";
import Swal from "sweetalert2";
import { useAuthStore } from "@/store/auth.store";
import { useJob } from "@/hooks/useJobs";

const APPLICATIONS_API = API_URL + '/applications/get-my-applications-for-job';

export default function OverviewTab() {
  const [uploading, setUploading] = useState(false);
  const [selectedCv, setSelectedCv] = useState<File | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const { savedJobs, fetchSavedJobs } = useJob()
  const [stats, setStats] = useState({
    totalApplications: 0,
    savedJobs:  0,
    interviews: 0,
    rejected: 0,
    recentApplications: [],
  });
  console.log("Saved Job",savedJobs.length)

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token, profile, getProfile } = useAuthStore();
  const isCvUploaded = !!profile?.user?.uploadedCv;
  const completion = Number(profile?.percentageOfAccountComplete || 0);
  const isProfileComplete = completion >= 80;

  useEffect(() => {
    getProfile();
  }, []);

useEffect(() => {
  if (!token) return;

  const fetchStats = async () => {
    try {
      setStatsLoading(true);

      // 1. Fetch saved jobs first and wait
      await fetchSavedJobs();

      // 2. Now savedJobs should be up-to-date
      const currentSavedCount = savedJobs.length;

      // 3. Fetch applications
      const appRes = await axios.get(APPLICATIONS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const applications = appRes.data?.data?.applications || [];

      const interviews = applications.filter(app =>
        app.status.toLowerCase().includes('interview')
      ).length;

      const rejected = applications.filter(app =>
        app.status.toLowerCase().includes('reject')
      ).length;

      const recentApplications = applications.slice(0, 5);

      setStats({
        totalApplications: applications.length,
        savedJobs: currentSavedCount,           // ← now correct
        interviews,
        rejected,
        recentApplications,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  fetchStats();
}, [token, savedJobs.length]);   // ← add savedJobs.length as dep (optional safety)

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      Swal.fire("Invalid file", "Please upload a PDF file only", "warning");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("File too large", "CV must be under 5MB", "warning");
      return;
    }

    setSelectedCv(file);
  };

  const uploadCv = async () => {
    if (!selectedCv) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("cv", selectedCv);

    try {
      await axios.put(`${API_URL}/auth/update-cv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        title: "Success",
        text: "CV uploaded successfully",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      setSelectedCv(null);
      getProfile();
    } catch (err) {
      Swal.fire("Error", "Failed to upload CV", "error");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getStatusColor = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes("interview")) return "bg-emerald-100 text-emerald-700";
    if (lower.includes("reject")) return "bg-rose-100 text-rose-700";
    if (lower === "applied") return "bg-blue-100 text-blue-700";
    return "bg-slate-100 text-slate-700";
  };

  const getStatusIcon = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes("interview")) return "🎯";
    if (lower.includes("reject")) return "❌";
    if (lower === "applied") return "📨";
    return "📋";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  console.log(stats)
  return (
    <div className="space-y-6 pb-12">


      {/* Profile Strength Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-2">
              Profile Strength
              <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-300 rounded-lg text-sm font-bold">
                {profile?.percentageOfAccountComplete || 78}%
              </span>
            </h3>
            <p className="text-slate-600">
              {profile?.percentageOfAccountComplete === 100
                ? "✨ Your profile is complete and fully visible to recruiters!"
                : "Complete your profile to boost visibility and match quality."}
            </p>
          </div>
          <Link href={!isProfileComplete ? "/auth/profile?tab=settings" : "#"}>
            <Button
              variant={isProfileComplete ? "secondary" : "default"}
              size="lg"
              disabled={isProfileComplete}
              className={isProfileComplete ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"}
            >
              {isProfileComplete ? "✓ Profile Complete" : "Complete Profile"}
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 transition-all duration-1000 ease-out"
              style={{ width: `${profile?.percentageOfAccountComplete || 78}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-right">
            {100 - (profile?.percentageOfAccountComplete || 78)}% to complete
          </p>
        </div>
      </div>

      {/* CV Upload Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">Resume / CV</h4>
              <p className="text-sm text-slate-600 mt-1">
                {isCvUploaded
                  ? "✅ Your CV is uploaded and ready"
                  : "Upload your latest CV to apply faster"}
              </p>
            </div>
          </div>

          {isCvUploaded ? (
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
              <CheckCircle2 size={18} />
              CV Uploaded
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleCvChange}
                className="hidden"
              />

              {selectedCv ? (
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <FileText size={18} className="text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700 truncate font-medium">
                    {selectedCv.name}
                  </span>
                  <button
                    onClick={() => setSelectedCv(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : null}

              <Button
                onClick={selectedCv ? uploadCv : triggerFileInput}
                disabled={uploading || !selectedCv}
                className={selectedCv ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 hover:bg-slate-900"}
              >
                <Upload size={16} className="mr-2" />
                {selectedCv ? (uploading ? "Uploading..." : "Upload CV") : "Choose PDF"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnhancedStatCard
          icon={<Briefcase className="w-6 h-6" />}
          title="Applications"
          value={stats.totalApplications}
          trend={`${stats.interviews} interviews`}
          color="from-blue-500 to-cyan-500"
          loading={statsLoading}
        />
        <EnhancedStatCard
          icon={<Bookmark className="w-6 h-6" />}
          title="Saved Jobs"
          value={stats.savedJobs}
          trend="Ready to apply"
          color="from-purple-500 to-pink-500"
          loading={statsLoading}
        />
        <EnhancedStatCard
          icon={<Zap className="w-6 h-6" />}
          title="Interviews"
          value={stats.interviews}
          trend="In progress"
          color="from-emerald-500 to-teal-500"
          loading={statsLoading}
          highlight
        />
        <EnhancedStatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Acceptance Rate"
          value={stats.totalApplications > 0 ? Math.round((stats.interviews / stats.totalApplications) * 100) : 0}
          trend="This month"
          color="from-orange-500 to-amber-500"
          loading={statsLoading}
          suffix="%"
        />
      </div>

      {/* Recent Activity */}
      {isProfileComplete && isCvUploaded ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
              <p className="text-sm text-slate-500 mt-1">Your latest applications and updates</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
              Last 5
            </span>
          </div>

          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : stats.recentApplications.length > 0 ? (
            <div className="space-y-3">
              {stats.recentApplications.map((app, idx) => (
                <div
                  key={app.id}
                  className="group flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-50 to-transparent hover:from-slate-100 transition-all border border-slate-200 hover:border-amber-300 rounded-xl p-4 md:p-5 cursor-pointer"
                  style={{
                    animation: `slideInUp 0.5s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl pt-1">{getStatusIcon(app.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {app.job.jobTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                        <Building2 size={14} />
                        <span className="truncate">{app.job.company.companyName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${getStatusColor(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
                      {formatDate(app.appliedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
              <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No applications yet</p>
              <p className="text-sm text-slate-500">Start applying to jobs to see them here</p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-8 md:p-10">
          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="hidden md:flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex-shrink-0">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-slate-900 mb-2">
                Unlock Full Dashboard
              </h4>
              <p className="text-slate-700 mb-4">
                {isCvUploaded
                  ? "Complete your profile to view recent activity, advanced analytics, and personalized job recommendations."
                  : "Upload your CV and complete your profile to unlock full dashboard features, faster applications, and better matches."}
              </p>
              <Link href="/auth/profile?tab=settings">
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                  Complete My Profile
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

interface EnhancedStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  trend: string;
  color: string;
  loading?: boolean;
  highlight?: boolean;
  suffix?: string;
}

function EnhancedStatCard({
  icon,
  title,
  value,
  trend,
  color,
  loading = false,
  highlight = false,
  suffix = "",
}: EnhancedStatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-32 animate-pulse">
        <div className="h-10 w-10 bg-slate-200 rounded-lg mb-3"></div>
        <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
        <div className="h-8 w-16 bg-slate-300 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`group relative rounded-xl border transition-all overflow-hidden ${highlight
      ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-md hover:shadow-lg"
      : "bg-white border-slate-200 shadow-sm hover:shadow-md"
      }`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      <div className="relative p-5 space-y-4">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${color} text-white shadow-lg`}>
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-bold text-slate-900 mt-1">
            {value}{suffix}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {trend}
          </p>
        </div>
      </div>
    </div>
  );
}