"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, Filter, Briefcase, MapPin, Calendar, IndianRupee, X, ChevronRight, Trash2, AlertCircle } from "lucide-react";
import { API_URL, IMAGE_URL } from "@/constant/api";
import { useAuthStore } from "@/store/auth.store";

const BASE = API_URL + '/applications/get-my-applications-for-job';

type Application = {
  id: number;
  status: string;
  appliedAt: string;
  resume: string | null;
  job: {
    jobTitle: string;
    jobType: string;
    locationText: string;
    salaryMin: number;
    salaryMax: number;
    currency: string;
    company: {
      companyName: string;
      companyLogo: string | null;
    };
  };
  daysSinceApplied: number;
  canWithdraw: boolean;
};

export default function ApplicationsTab() {
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
   

    if (!token) {
      setError(null);
      setLoading(true);
      return;
    }

    const controller = new AbortController();

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Actually fetching applications with token:", token.substring(0, 15) + "...");

        const res = await axios.get(BASE, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (res.data?.success) {
          setApplications(res.data.data.applications ?? []);
        } else {
          setError(res.data?.message || "Failed to load applications");
        }
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        
        console.error("Applications fetch failed:", err);
        console.log("Full error response:", err.response);

        const msg = err.response?.data?.message 
          || err.response?.statusText 
          || err.message 
          || "Could not load your applications";

        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    return () => controller.abort();
  }, [token]);

  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(applications.map(app => app.status)));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchTerm === "" || 
        app.job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.locationText.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = selectedFilters.size === 0 || 
        selectedFilters.has(app.status);

      return matchesSearch && matchesFilter;
    });
  }, [applications, searchTerm, selectedFilters]);

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return "Not disclosed";
    const format = (num: number) => num.toLocaleString("en-IN");
    return `${currency} ${format(min)} – ${format(max)} /mo`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("interview")) {
      return { bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100" };
    }
    if (lowerStatus.includes("reject")) {
      return { bg: "bg-rose-50", text: "text-rose-700", badge: "bg-rose-100" };
    }
    if (status === "applied") {
      return { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100" };
    }
    return { bg: "bg-slate-50", text: "text-slate-700", badge: "bg-slate-100" };
  };

  const toggleFilter = (filterValue: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filterValue)) {
      newFilters.delete(filterValue);
    } else {
      newFilters.add(filterValue);
    }
    setSelectedFilters(newFilters);
  };

  const handleWithdraw = (appId: number) => {
    alert("Withdraw functionality coming soon");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-spin" style={{ borderRadius: '50%', maskImage: 'conic-gradient(transparent 25%, black)' }}></div>
            <div className="absolute inset-1 bg-white rounded-full"></div>
          </div>
          <p className="text-slate-500 font-medium">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-100 rounded-full mb-4">
          <AlertCircle className="text-rose-600" size={24} />
        </div>
        <p className="text-rose-700 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Applications</h2>
            <p className="text-slate-500 text-sm mt-1">Track and manage your job applications</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              {filteredApplications.length}
            </div>
            <p className="text-xs text-slate-500">Applications</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3">
          <div className="relative group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company, or location..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium text-sm ${
                showFilters 
                  ? "bg-amber-50 border-amber-300 text-amber-700" 
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <Filter size={16} />
              Filters
            </button>

            {selectedFilters.size > 0 && (
              <button
                onClick={() => setSelectedFilters(new Set())}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
              >
                Clear all
              </button>
            )}

            {showFilters && (
              <div className="w-full flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                {uniqueStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedFilters.has(status)
                        ? `${getStatusColor(status).badge} ${getStatusColor(status).text}`
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4">
            <Briefcase size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {applications.length === 0 ? "No applications yet" : "No matching applications"}
          </h3>
          <p className="text-slate-500 text-sm">
            {applications.length === 0 
              ? "Start applying to jobs to see them here" 
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app, index) => {
            const colors = getStatusColor(app.status);
            return (
              <div
                key={app.id}
                className="group bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 p-5 overflow-hidden relative"
                style={{
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${
                  app.status.toLowerCase().includes('interview') ? 'from-emerald-400 to-emerald-600' :
                  app.status.toLowerCase().includes('reject') ? 'from-rose-400 to-rose-600' :
                  'from-amber-400 to-orange-500'
                }`}></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Left Column - Job Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        {app.job.company.companyLogo && (
                          <img
                            src={`${IMAGE_URL}${app.job.company.companyLogo}`}
                            alt={app.job.company.companyName}
                            className="h-10 w-10 object-contain rounded-lg bg-slate-50 p-1 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 leading-tight">
                            {app.job.jobTitle}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {app.job.company.companyName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold tracking-wide">
                        {app.job.jobType.replace("-", " ")}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${colors.badge} ${colors.text}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>

                    {/* Details Row */}
                    <div className="flex flex-wrap gap-4 text-sm pt-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin size={14} className="text-amber-600 flex-shrink-0" />
                        <span>{app.job.locationText || "Remote"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="text-amber-600 flex-shrink-0" />
                        <span>Applied {formatDate(app.appliedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Salary & Action */}
                  <div className="md:col-span-1 flex flex-col justify-between">
                    {/* Salary */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                      <p className="text-xs text-slate-600 font-medium mb-1">Monthly Salary</p>
                      <p className="text-xl font-bold text-amber-700 flex items-baseline gap-1">
                        {formatSalary(app.job.salaryMin, app.job.salaryMax, app.job.currency)}
                      </p>
                    </div>

                    {/* Actions */}
                    {app.canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 hover:border-rose-300"
                      >
                        <Trash2 size={14} />
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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