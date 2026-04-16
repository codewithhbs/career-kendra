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
  CartesianGrid,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { 
  Users, Building2, Briefcase, FileText, 
  UserCheck, Award, TrendingUp, Clock 
} from "lucide-react";

const API_URL = "https://api.careerkendra.com//api/v1/ad/admin-dashboard";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(API_URL, { credentials: "include" });
        
        if (!res.ok) throw new Error("Failed to load admin dashboard");

        const result = await res.json();
        if (result.success) {
          setData(result);
        } else {
          throw new Error("API response unsuccessful");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-red-600 text-center py-12 text-xl">
        Error: {error || "No data available"}
      </div>
    );
  }

  const stats = data.stats;

  // KPI Cards Data
  const kpiCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "indigo" },
    { label: "Employers", value: stats.totalEmployers, icon: Building2, color: "teal" },
    { label: "Companies", value: stats.totalCompanies, icon: Briefcase, color: "cyan" },
    { label: "Active Jobs", value: stats.totalJobs, icon: FileText, color: "violet" },
    { label: "Applications", value: stats.totalApplications, icon: FileText, color: "emerald" },
    { label: "Interviews", value: stats.totalInterviews, icon: UserCheck, color: "indigo" },
  ];

  // Application Status Pie Data
  const applicationPieData = data.applicationStatusStats.map((item, index) => ({
    name: item.status.replace("_", " ").toUpperCase(),
    value: item.count,
    fill: ["#6366f1", "#14b8a6", "#22d3ee", "#a855f7", "#10b981"][index % 5],
  }));

  // Job Assignment Bar Data
  const assignmentData = [
    { name: "Assigned", value: data.jobAssignmentStats.assigned, fill: "#6366f1" },
    { name: "In Progress", value: data.jobAssignmentStats.inProgress, fill: "#14b8a6" },
    { name: "Completed", value: data.jobAssignmentStats.completed, fill: "#10b981" },
    { name: "On Hold", value: data.jobAssignmentStats.onHold, fill: "#eab308" },
    { name: "Rejected", value: data.jobAssignmentStats.rejected, fill: "#ef4444" },
  ];

  return (
    <div className="space-y-10 p-6 max-w-screen-2xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-teal-600 rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <p className="uppercase tracking-[3px] text-indigo-200 text-sm font-medium">Platform Overview</p>
          <h1 className="text-5xl font-bold tracking-tighter mt-2">Super Admin Dashboard</h1>
          <p className="mt-3 text-indigo-100 text-lg max-w-md">
            Monitor the entire platform — users, companies, jobs, and hiring activity.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const colorClasses = {
            indigo: "bg-indigo-100 text-indigo-600",
            teal: "bg-teal-100 text-teal-600",
            cyan: "bg-cyan-100 text-cyan-600",
            violet: "bg-violet-100 text-violet-600",
            emerald: "bg-emerald-100 text-emerald-600",
          };

          return (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-5xl font-semibold text-gray-900 mt-4 tracking-tighter">
                    {card.value}
                  </p>
                </div>
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colorClasses[card.color]}`}>
                  <Icon className="h-7 w-7" />
                </div>
              </div>
              <div className="mt-6 text-emerald-600 flex items-center gap-1 text-sm font-medium">
                <TrendingUp className="h-4 w-4" /> Healthy growth
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Application Status Pie Chart */}
        <div className="xl:col-span-5 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-semibold mb-8">Application Status Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={applicationPieData}
                cx="50%"
                cy="50%"
                innerRadius={90}
                outerRadius={140}
                dataKey="value"
                paddingAngle={6}
              >
                {applicationPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Job Assignment Bar Chart */}
        <div className="xl:col-span-7 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-semibold mb-8">Job Assignment Status</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={assignmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Applied & Most Saved Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Applied Jobs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-indigo-600" />
            Most Applied Jobs
          </h3>
          <div className="space-y-5">
            {data.mostAppliedJobs.map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-gray-900">{item.job.jobTitle}</p>
                  <p className="text-sm text-gray-500">Job ID: #{item.jobId}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">{item.applyCount}</div>
                  <div className="text-xs text-gray-500">Applications</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Saved Jobs */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Clock className="h-6 w-6 text-teal-600" />
            Most Saved Jobs
          </h3>
          <div className="space-y-5">
            {data.mostSavedJobs && data.mostSavedJobs.length > 0 ? (
              data.mostSavedJobs.map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-gray-900">{item.job.jobTitle}</p>
                    <p className="text-sm text-gray-500">Job ID: #{item.jobId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-600">{item.saveCount}</div>
                    <div className="text-xs text-gray-500">Saved by candidates</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 py-8 text-center">No saved jobs data available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Extra Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{stats.totalRoles}</p>
          <p className="text-sm text-gray-500 mt-2">Total Roles</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{stats.totalPermissions}</p>
          <p className="text-sm text-gray-500 mt-2">Total Permissions</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{stats.totalAdminEmployees}</p>
          <p className="text-sm text-gray-500 mt-2">Admin Employees</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{stats.totalDocumentsUploaded}</p>
          <p className="text-sm text-gray-500 mt-2">Documents Uploaded</p>
        </div>
      </div>
    </div>
  );
}