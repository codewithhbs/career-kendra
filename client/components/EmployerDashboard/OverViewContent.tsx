"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { 
  Users, Briefcase, Calendar, Clock, 
  TrendingUp, Award, MessageSquare, 
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const API_URL = "https://api.careerkendra.com/api/v1/auth-employer/dashboard";

interface DashboardData {
  stats: {
    jobsPosted: number;
    applicationsReceived: number;
    round2PendingInterviews: number;
    totalInterviewsScheduled: number;
    documentsUploaded: number;
  };
  recentJobs: Array<{
    id: number;
    jobTitle: string;
    createdAt: string;
  }>;
  recentInterviews: Array<{
    id: number;
    round: number;
    interviewType: string;
    scheduledAt: string;
    status: string;
    application: {
      id: number;
      candidate: { id: number; userName: string };
      job: { jobTitle: string };
    };
  }>;
  recentMessages: Array<{
    id: number;
    content: string;
    sentAt: string;
    isRead: boolean;
    applicationId?: number;
  }>;
  tips: string[];
}

const CHART_COLORS = ["#6366f1", "#14b8a6", "#22d3ee", "#a855f7", "#10b981"];

export default function OverviewContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(API_URL, { credentials: "include" });

        if (!res.ok) throw new Error("Failed to fetch dashboard data");

        const result = await res.json();
        if (result.success) {
          setData(result);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-red-600">
        Error loading dashboard: {error || "No data available"}
      </div>
    );
  }

  const stats = data.stats;

  const kpiData = [
    { 
      name: "Jobs Posted", 
      value: stats.jobsPosted, 
      icon: Briefcase, 
      color: "indigo" 
    },
    { 
      name: "Applications", 
      value: stats.applicationsReceived, 
      icon: Users, 
      color: "teal" 
    },
    { 
      name: "Total Interviews", 
      value: stats.totalInterviewsScheduled, 
      icon: Calendar, 
      color: "cyan" 
    },
    { 
      name: "Pending Round 2", 
      value: stats.round2PendingInterviews, 
      icon: Clock, 
      color: "violet" 
    },
  ];

  // Trend Data (you can later replace with real historical data from API)
  const trendData = [
    { month: "Feb", applications: 18, interviews: 7 },
    { month: "Mar", applications: 34, interviews: 19 },
    { month: "Apr", applications: stats.applicationsReceived, interviews: stats.totalInterviewsScheduled },
  ];

  const interviewStatusData = [
    { 
      name: "Scheduled", 
      value: stats.totalInterviewsScheduled - stats.round2PendingInterviews, 
      fill: "#6366f1" 
    },
    { 
      name: "Pending Round 2", 
      value: stats.round2PendingInterviews, 
      fill: "#14b8a6" 
    },
  ];

  return (
    <div className="space-y-10 p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tighter">
          Dashboard Overview
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Welcome back! Here’s a clear view of your hiring progress.
        </p>
      </div>

      {/* KPI Cards - Bright & Modern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((item, idx) => {
          const Icon = item.icon;
          const colorClass = 
            item.color === "indigo" ? "text-indigo-600 bg-indigo-100" :
            item.color === "teal" ? "text-teal-600 bg-teal-100" :
            item.color === "cyan" ? "text-cyan-600 bg-cyan-100" : 
            "text-violet-600 bg-violet-100";

          return (
            <div
              key={idx}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{item.name}</p>
                  <p className="text-5xl font-semibold text-gray-900 mt-4 tracking-tighter">
                    {item.value}
                  </p>
                </div>
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>↑ Growing steadily</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Hiring Trend - Line Chart */}
        <div className="xl:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-gray-900">Hiring Activity Trend</h3>
            <div className="text-sm text-gray-500">Last 3 months</div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line
                type="natural"
                dataKey="applications"
                stroke="#6366f1"
                strokeWidth={5}
                dot={{ fill: "#6366f1", r: 7, strokeWidth: 3, stroke: "#fff" }}
                name="Applications"
              />
              <Line
                type="natural"
                dataKey="interviews"
                stroke="#14b8a6"
                strokeWidth={4}
                dot={{ fill: "#14b8a6", r: 6, strokeWidth: 3, stroke: "#fff" }}
                name="Interviews"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interview Breakdown - Pie Chart */}
        <div className="xl:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">Interview Status</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={interviewStatusData}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={130}
                dataKey="value"
                paddingAngle={8}
              >
                {interviewStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-6">
            {interviewStatusData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-lg" 
                  style={{ backgroundColor: item.fill }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                  <p className="text-xl font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold flex items-center gap-3 text-gray-900">
              <Briefcase className="h-6 w-6 text-indigo-600" />
              Recent Jobs
            </h3>
            <Link href="/employer/profile?tab=my-jobs" passHref>
<span className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer text-sm font-medium transition">
  View all jobs
  <ArrowRight size={16} />
</span>
            </Link>
          </div>

          <div className="space-y-6">
            {data.recentJobs.map((job) => (
              <div key={job.id} className="flex justify-between items-center border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{job.jobTitle}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted {format(new Date(job.createdAt), "dd MMMM yyyy")}
                  </p>
                </div>
                <div className="px-5 py-2 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                  Active
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold flex items-center gap-3 text-gray-900">
              <Calendar className="h-6 w-6 text-teal-600" />
              Recent Interviews
            </h3>
          </div>

          <div className="overflow-auto max-h-[420px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                  <th className="pb-4 font-medium">Candidate</th>
                  <th className="pb-4 font-medium">Job Title</th>
                  <th className="pb-4 font-medium">Round</th>
                  <th className="pb-4 font-medium">Date & Time</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.recentInterviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-5 font-medium text-gray-900">
                      {interview.application?.candidate?.userName}
                    </td>
                    <td className="py-5 text-gray-600">
                      {interview.application?.job?.jobTitle}
                    </td>
                    <td className="py-5 font-medium">Round {interview.round}</td>
                    <td className="py-5 text-gray-500">
                      {format(new Date(interview.scheduledAt), "dd MMM, HH:mm")}
                    </td>
                    <td className="py-5">
                      <span
                        className={`inline-flex px-4 py-1.5 text-xs font-semibold rounded-2xl ${
                          interview.status === "scheduled"
                            ? "bg-teal-100 text-teal-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {interview.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hiring Tips - Fresh Look */}
      <div className="bg-gradient-to-br from-indigo-50 via-sky-50 to-teal-50 border border-indigo-100 rounded-3xl p-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="text-4xl">✦</div>
          <h3 className="text-3xl font-bold text-gray-900">Hiring Tips</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.tips.map((tip, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl p-7 shadow-sm flex gap-5 hover:shadow-md transition-all"
            >
              <div className="text-3xl text-indigo-500 mt-1"><ArrowRight size={18}/></div>
              <p className="text-gray-700 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}