import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import Swal from "sweetalert2";
import {
  Briefcase, Users, UserCheck, TrendingUp, TrendingDown,
  Download, Filter, RefreshCw, ChevronDown, ChevronUp,
  Building2, Mail, Phone, Calendar, Clock, X,
  ThumbsUp, ThumbsDown, Award, BarChart3, Search,
  ArrowUpRight, CheckCircle2, XCircle, AlertCircle,
  Eye, SlidersHorizontal, Layers
} from "lucide-react";

/* ═══════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════ */
const PERIOD_OPTIONS = [
  { label: "Last 15 Days",  value: "15days"   },
  { label: "Last Month",    value: "1month"   },
  { label: "Last 3 Months", value: "3months"  },
  { label: "Last 6 Months", value: "6months"  },
  { label: "Last Year",     value: "1year"    },
  { label: "All Time",      value: ""         },
];

const JOB_STATUSES   = ["", "active", "closed", "draft", "paused", "under-verification", "reject"];
const APP_STATUSES   = ["", "applied", "under_review", "shortlisted", "interview_stage", "final_shortlist", "selected", "joined", "not_joined", "rejected", "withdrawn"];
const WORK_MODES     = ["", "onsite", "remote", "hybrid"];
const JOB_TYPES      = ["", "full-time", "part-time", "internship", "contract", "freelance"];
const IV_RESULTS     = ["", "pass", "fail", "next_round"];
const IV_STATUSES    = ["", "scheduled", "completed", "cancelled", "rescheduled", "hold"];

const STATUS_COLORS = {
  joined:          { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  selected:        { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  not_joined:      { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  rejected:        { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  final_shortlist: { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  shortlisted:     { bg: "#EDE9FE", text: "#5B21B6", dot: "#8B5CF6" },
  interview_stage: { bg: "#E0F2FE", text: "#0C4A6E", dot: "#0EA5E9" },
  applied:         { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  withdrawn:       { bg: "#F9FAFB", text: "#6B7280", dot: "#9CA3AF" },
  under_review:    { bg: "#FFF7ED", text: "#9A3412", dot: "#F97316" },
  active:          { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  closed:          { bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  paused:          { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  draft:           { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
};

const getStatusStyle = (status) => STATUS_COLORS[status?.toLowerCase()] || STATUS_COLORS.applied;

/* ═══════════════════════════════════════════════
   SMALL COMPONENTS
═══════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const s = getStatusStyle(status);
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap">
      <span style={{ background: s.dot }} className="w-1.5 h-1.5 rounded-full" />
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, color = "#6366F1", trend }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
        <Icon size={20} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-800 font-mono">{value ?? "—"}</p>
    <p className="text-sm text-slate-500 mt-1">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const SelectFilter = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? (o === "" ? "All" : o.replace(/_/g, " ").replace(/-/g, " "))}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   EMPLOYER STATS ROW
═══════════════════════════════════════════════ */
const EmployerRow = ({ emp, idx }) => {
  const [open, setOpen] = useState(false);
  const joinRate = emp.stats.selected ? ((emp.stats.joined / emp.stats.selected) * 100).toFixed(0) : 0;
  const passRate = emp.totalInterviews ? ((emp.passedInterviews / emp.totalInterviews) * 100).toFixed(0) : 0;

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden mb-3 hover:border-indigo-200 transition-colors">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Rank */}
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
          #{idx + 1}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{emp.name}</p>
          <p className="text-xs text-slate-400">{emp.email}</p>
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-6 text-center">
          {[
            { label: "Jobs",     val: emp.jobs     },
            { label: "Apps",     val: emp.stats.total    },
            { label: "Selected", val: emp.stats.selected },
            { label: "Joined",   val: emp.stats.joined   },
          ].map(({ label, val }) => (
            <div key={label}>
              <p className="text-lg font-bold text-slate-700 font-mono">{val}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Rates */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: joinRate >= 50 ? "#10B981" : "#F59E0B" }}>{joinRate}%</div>
            <div className="text-xs text-slate-400">Join Rate</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: passRate >= 50 ? "#10B981" : "#F59E0B" }}>{passRate}%</div>
            <div className="text-xs text-slate-400">Pass Rate</div>
          </div>
        </div>

        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""} shrink-0`} />
      </div>

      {open && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
            {[
              { label: "Shortlisted",     val: emp.stats.shortlisted,  color: "#8B5CF6" },
              { label: "Interview Stage", val: emp.stats.interviewStage, color: "#0EA5E9" },
              { label: "Final Shortlist", val: emp.stats.finalShort,   color: "#F59E0B" },
              { label: "Selected",        val: emp.stats.selected,     color: "#3B82F6" },
              { label: "Joined",          val: emp.stats.joined,       color: "#10B981" },
              { label: "Not Joined",      val: emp.stats.notJoined,    color: "#EF4444" },
              { label: "Rejected",        val: emp.stats.rejected,     color: "#EF4444" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-white rounded-xl p-3 text-center border border-slate-100">
                <p className="text-xl font-bold font-mono" style={{ color }}>{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Jobs list */}
          {emp.jobList?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jobs Posted</p>
              {emp.jobList.map((job) => (
                <div key={job.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Briefcase size={14} className="text-indigo-400" />
                    <span className="text-sm font-medium text-slate-700">{job.jobTitle}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{job._stats?.total || 0} apps</span>
                    <span className="text-emerald-600 font-semibold">{job._stats?.joined || 0} joined</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   JOB ROW
═══════════════════════════════════════════════ */
const JobRow = ({ job, idx }) => {
  const [open, setOpen] = useState(false);
  const s = job._stats || {};

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden mb-3 hover:border-indigo-200 transition-colors">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
          {idx + 1}
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800">{job.employer?.employerName}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800">{job.jobTitle}</p>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{job.company?.companyName} · {job.city || "—"} · {job.workMode}</p>
        </div>
        <div className="hidden sm:flex items-center gap-5 text-center">
          {[
            { label: "Apps",     val: s.total    },
            { label: "Selected", val: s.selected },
            { label: "Joined",   val: s.joined, color: "#10B981" },
            { label: "Rejected", val: s.rejected, color: "#EF4444" },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <p className="text-base font-bold font-mono" style={{ color: color || "#1E293B" }}>{val ?? 0}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          {/* Stats grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
            {[
              { label: "Shortlisted",  val: s.shortlisted,   color: "#8B5CF6" },
              { label: "Final List",   val: s.finalShort,    color: "#F59E0B" },
              { label: "Interviews",   val: s.interviews?.total, color: "#0EA5E9" },
              { label: "IV Passed",    val: s.interviews?.passed, color: "#10B981" },
              { label: "IV Failed",    val: s.interviews?.failed, color: "#EF4444" },
              { label: "Offer Sent",   val: s.offerSent,     color: "#6366F1" },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-white rounded-xl p-3 text-center border border-slate-100">
                <p className="text-lg font-bold font-mono" style={{ color }}>{val ?? 0}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Applications list */}
          {job.applications?.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Applications ({job.applications.length})
              </p>
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {job.applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                        {app.candidate?.userName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{app.candidate?.userName}</p>
                        <p className="text-xs text-slate-400 truncate">{app.candidate?.emailAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400">{app.interviews?.length || 0} rounds</span>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center py-6 text-sm text-slate-400">No applications yet</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function AllJobsData() {
  const [data, setData]               = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [exporting, setExporting]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab]     = useState("jobs"); // jobs | employers
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    period:          "1month",
    fromDate:        "",
    toDate:          "",
    jobStatus:       "",
    appStatus:       "",
    employerId:      "",
    companyId:       "",
    jobType:         "",
    workMode:        "",
    city:            "",
    isSelected:      "",
    interviewResult: "",
    interviewStatus: "",
  });

  const setFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

  /* ── Build query string ── */
  const buildQuery = useCallback((f = filters) => {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v !== "") params.append(k, v); });
    return params.toString();
  }, [filters]);

  /* ── Fetch data ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/all-detail?${buildQuery()}`);
      setData(res.data?.data || []);
      console.log("res.data",res.data)
      setGlobalStats(res.data?.globalStats || null);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchData(); }, []);

  /* ── Export Excel ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/applications/export-excel?${buildQuery()}`, { responseType: "blob" });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `hiring-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      Swal.fire("Error", "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  /* ── Employer grouping ── */
  const employerMap = {};
  data.forEach((job) => {
    const eId   = job.employer?.id || "unknown";
    const eName = job.employer?.employerName || "Unknown";
    const eEmail = job.employer?.emailAddress || "";
    if (!employerMap[eId]) {
      employerMap[eId] = {
        id: eId, name: eName, email: eEmail,
        jobs: 0, jobList: [],
        stats: { total:0, selected:0, joined:0, notJoined:0, rejected:0, shortlisted:0, interviewStage:0, finalShort:0 },
        totalInterviews: 0, passedInterviews: 0,
      };
    }
    const e = employerMap[eId];
    e.jobs++;
    e.jobList.push(job);
    const apps = job.applications || [];
    apps.forEach((app) => {
      e.stats.total++;
      if (app.isSelected) e.stats.selected++;
      if (app.status === "joined")          e.stats.joined++;
      if (app.status === "not_joined")      e.stats.notJoined++;
      if (app.status === "rejected")        e.stats.rejected++;
      if (app.status === "shortlisted")     e.stats.shortlisted++;
      if (app.status === "interview_stage") e.stats.interviewStage++;
      if (app.status === "final_shortlist") e.stats.finalShort++;
      const ivs = app.interviews || [];
      e.totalInterviews  += ivs.length;
      e.passedInterviews += ivs.filter((i) => i.result === "pass").length;
    });
  });
  const employers = Object.values(employerMap).sort((a, b) => b.stats.joined - a.stats.joined);

  /* ── Search filter ── */
  const filteredJobs = data.filter((job) =>
    !searchQuery ||
    job.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.employer?.employerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmployers = employers.filter((e) =>
    !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gs = globalStats;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── TOPBAR ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-500" />
              Hiring Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Complete pipeline overview</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, employers..."
                className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 w-52"
              />
            </div>

            {/* Period quick select */}
            <div className="relative">
              <select
                value={filters.period}
                onChange={(e) => setFilter("period", e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-7 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                {PERIOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${showFilters ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-60 shadow-sm"
            >
              <Download size={14} className={exporting ? "animate-bounce" : ""} />
              {exporting ? "Exporting..." : "Export Excel"}
            </button>
          </div>
        </div>

        {/* ── FILTERS PANEL ── */}
        {showFilters && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
            <div className="max-w-screen-2xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                <SelectFilter label="Job Status"      value={filters.jobStatus}       onChange={(v) => setFilter("jobStatus", v)}       options={JOB_STATUSES} />
                <SelectFilter label="App Status"      value={filters.appStatus}       onChange={(v) => setFilter("appStatus", v)}       options={APP_STATUSES} />
                <SelectFilter label="Work Mode"       value={filters.workMode}        onChange={(v) => setFilter("workMode", v)}        options={WORK_MODES} />
                <SelectFilter label="Job Type"        value={filters.jobType}         onChange={(v) => setFilter("jobType", v)}         options={JOB_TYPES} />
                <SelectFilter label="Interview Result" value={filters.interviewResult} onChange={(v) => setFilter("interviewResult", v)} options={IV_RESULTS} />
                <SelectFilter label="Interview Status" value={filters.interviewStatus} onChange={(v) => setFilter("interviewStatus", v)} options={IV_STATUSES} />
                <SelectFilter label="Is Selected"     value={filters.isSelected}      onChange={(v) => setFilter("isSelected", v)}      options={[{ label: "All", value: "" }, { label: "Yes", value: "true" }, { label: "No", value: "false" }]} />
              </div>

              {/* Custom date range */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Date</label>
                  <input type="date" value={filters.fromDate} onChange={(e) => { setFilter("fromDate", e.target.value); setFilter("period", ""); }}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Date</label>
                  <input type="date" value={filters.toDate} onChange={(e) => { setFilter("toDate", e.target.value); setFilter("period", ""); }}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City</label>
                  <input type="text" value={filters.city} onChange={(e) => setFilter("city", e.target.value)}
                    placeholder="e.g. Delhi"
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="flex items-end gap-2 pb-0.5">
                  <button onClick={fetchData}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all">
                    Apply Filters
                  </button>
                  <button onClick={() => {
                    setFilters({ period: "1month", fromDate: "", toDate: "", jobStatus: "", appStatus: "", employerId: "", companyId: "", jobType: "", workMode: "", city: "", isSelected: "", interviewResult: "", interviewStatus: "" });
                  }} className="px-4 py-2 bg-white border border-slate-200 hover:border-red-300 text-slate-600 text-sm font-medium rounded-xl transition-all flex items-center gap-1">
                    <X size={13} /> Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">

        {/* ── GLOBAL STATS ── */}
        {gs && (
          <>
            {/* Application Stats */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Layers size={12} /> Application Overview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                <StatCard label="Total Applications"  value={gs.total}           icon={Users}       color="#6366F1" />
                <StatCard label="Shortlisted"         value={gs.shortlisted}     icon={Award}       color="#8B5CF6" />
                <StatCard label="Interview Stage"     value={gs.interviewStage}  icon={Clock}       color="#0EA5E9" />
                <StatCard label="Final Shortlist"     value={gs.finalShort}      icon={CheckCircle2} color="#F59E0B" />
                <StatCard label="Selected"            value={gs.selected}        icon={UserCheck}   color="#3B82F6" />
                <StatCard label="Joined"              value={gs.joined}          icon={ThumbsUp}    color="#10B981" />
                <StatCard label="Not Joined"          value={gs.notJoined}       icon={ThumbsDown}  color="#EF4444" />
                <StatCard label="Rejected"            value={gs.rejected}        icon={XCircle}     color="#EF4444" />
              </div>
            </div>

            {/* Interview + Job Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Interview */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar size={12} /> Interview Overview
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total",     val: gs.interviews.total,     color: "#6366F1" },
                    { label: "Scheduled", val: gs.interviews.scheduled, color: "#0EA5E9" },
                    { label: "Completed", val: gs.interviews.completed, color: "#10B981" },
                    { label: "Cancelled", val: gs.interviews.cancelled, color: "#EF4444" },
                    { label: "Passed",    val: gs.interviews.passed,    color: "#10B981" },
                    { label: "Failed",    val: gs.interviews.failed,    color: "#EF4444" },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="text-center p-3 rounded-xl bg-slate-50">
                      <p className="text-xl font-bold font-mono" style={{ color }}>{val}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                {gs.interviews.completed > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span>Pass Rate</span>
                      <span className="font-bold text-emerald-600">
                        {((gs.interviews.passed / gs.interviews.completed) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${(gs.interviews.passed / gs.interviews.completed) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Key metrics */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={12} /> Key Metrics
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: "Selection Rate",
                      val: gs.total ? ((gs.selected / gs.total) * 100).toFixed(1) : 0,
                      color: "#3B82F6",
                      denom: gs.total
                    },
                    {
                      label: "Join Rate (of Selected)",
                      val: gs.selected ? ((gs.joined / gs.selected) * 100).toFixed(1) : 0,
                      color: "#10B981",
                      denom: gs.selected
                    },
                    {
                      label: "Offer Email Sent",
                      val: gs.total ? ((gs.offerSent / gs.total) * 100).toFixed(1) : 0,
                      color: "#6366F1",
                      denom: gs.total
                    },
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-bold" style={{ color }}>{val}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(val, 100)}%`, background: color }} />
                      </div>
                    </div>
                  ))}

                  {gs.avgSalaryOffered && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Avg Salary Offered</span>
                      <span className="text-sm font-bold text-slate-700">
                        ₹{Number(gs.avgSalaryOffered).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Jobs</span>
                    <span className="text-sm font-bold text-slate-700">{data.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TABS ── */}
        <div className="flex items-center gap-1 border-b border-slate-100">
          {[
            { key: "jobs",      label: `Jobs (${filteredJobs.length})`,          icon: Briefcase },
            { key: "employers", label: `Employers (${filteredEmployers.length})`, icon: Building2 },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === key
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading data...</p>
          </div>
        ) : (
          <>
            {/* JOBS TAB */}
            {activeTab === "jobs" && (
              <div>
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No jobs found</p>
                  </div>
                ) : (
                  filteredJobs.map((job, idx) => <JobRow key={job.id} job={job} idx={idx} />)
                )}
              </div>
            )}

            {/* EMPLOYERS TAB */}
            {activeTab === "employers" && (
              <div>
                {/* Employer summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                  {filteredEmployers.slice(0, 4).map((emp) => {
                    const joinRate = emp.stats.selected
                      ? ((emp.stats.joined / emp.stats.selected) * 100).toFixed(0)
                      : 0;
                    return (
                      <div key={emp.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-base font-bold text-indigo-600 shrink-0">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate text-sm">{emp.name}</p>
                            <p className="text-xs text-slate-400 truncate">{emp.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: "Jobs", val: emp.jobs, color: "#6366F1" },
                            { label: "Joined", val: emp.stats.joined, color: "#10B981" },
                            { label: "Join%", val: `${joinRate}%`, color: joinRate >= 50 ? "#10B981" : "#F59E0B" },
                          ].map(({ label, val, color }) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-2">
                              <p className="text-base font-bold font-mono" style={{ color }}>{val}</p>
                              <p className="text-xs text-slate-400">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Employer detail rows */}
                {filteredEmployers.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No employers found</p>
                  </div>
                ) : (
                  filteredEmployers.map((emp, idx) => <EmployerRow key={emp.id} emp={emp} idx={idx} />)
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}