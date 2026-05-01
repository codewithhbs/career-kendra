import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import {
  UploadCloud, Trash2, Calendar, CheckCircle, XCircle, UserCheck,
  Eye, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X,
  ClipboardList, Video, MapPin, Edit2, Clock, ThumbsUp, ThumbsDown,
  RefreshCw, User, AlertTriangle, RotateCcw, Phone,
} from "lucide-react";
import Modal from "../../components/Model";

const APPLICATION_STATUSES = [
  { value: "applied",         label: "Applied" },
  { value: "under_review",    label: "Under Review" },
  { value: "shortlisted",     label: "Shortlisted" },
  { value: "interview_stage", label: "Interview Stage" },
  { value: "final_shortlist", label: "Final Shortlist" },
  { value: "selected",        label: "Selected" },
  { value: "rejected",        label: "Rejected" },
];

const STATUS_STYLES = {
  applied:         "bg-blue-50   text-blue-700   ring-blue-200",
  under_review:    "bg-amber-50  text-amber-700  ring-amber-200",
  shortlisted:     "bg-teal-50   text-teal-700   ring-teal-200",
  interview_stage: "bg-violet-50 text-violet-700 ring-violet-200",
  final_shortlist: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  selected:        "bg-green-50  text-green-700  ring-green-200",
  rejected:        "bg-red-50    text-red-700    ring-red-200",
};

const INTERVIEW_STATUS_STYLES = {
  scheduled:   "bg-blue-50   text-blue-700   ring-blue-100",
  in_progress: "bg-amber-50  text-amber-700  ring-amber-100",
  completed:   "bg-green-50  text-green-700  ring-green-100",
  cancelled:   "bg-red-50    text-red-700    ring-red-100",
  rescheduled: "bg-orange-50 text-orange-700 ring-orange-100",
  no_show:     "bg-gray-50   text-gray-600   ring-gray-100",
};

const RESULT_STYLES = {
  pass:    "bg-green-50 text-green-700 ring-green-200",
  fail:    "bg-red-50   text-red-700   ring-red-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
};

const StatusBadge = ({ status, styleMap = STATUS_STYLES, label: customLabel }) => {
  const label =
    customLabel ||
    APPLICATION_STATUSES.find((s) => s.value === status)?.label ||
    status?.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 capitalize ${styleMap[status] || "bg-gray-50 text-gray-700 ring-gray-200"}`}>
      {label}
    </span>
  );
};

const Avatar = ({ name = "?" }) => {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const palette = [
    "bg-violet-100 text-violet-700", "bg-teal-100 text-teal-700",
    "bg-amber-100 text-amber-700",   "bg-blue-100 text-blue-700",
    "bg-pink-100 text-pink-700",     "bg-indigo-100 text-indigo-700",
  ];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${palette[name.charCodeAt(0) % palette.length]}`}>
      {initials}
    </div>
  );
};

const FormField = ({ label, required, children }) => (
  <div>
    <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white";
const textareaCls = `${inputCls} resize-none`;

const InterviewTypeIcon = ({ type, size = 11, className = "text-violet-400" }) => {
  if (type === "online")  return <Video  size={size} className={className} />;
  if (type === "phone")   return <Phone  size={size} className={className} />;
  return                         <MapPin size={size} className={className} />;
};

const CheckApplies = () => {
  const { id: jobId } = useParams();

  const [applications, setApplications]         = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [totalPages, setTotalPages]             = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);

  const [page, setPage]       = useState(1);
  const [limit]               = useState(10);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter]                 = useState("");
  const [showFilters, setShowFilters]                   = useState(false);
  const [dateRange, setDateRange]                       = useState({ from: "", to: "" });
  const [quickRange, setQuickRange]                     = useState("all");
  const [interviewStatusFilter, setInterviewStatusFilter] = useState("");
  const [interviewResultFilter, setInterviewResultFilter] = useState("");
  const [candidateLocation, setCandidateLocation]       = useState("");
  const [candidateArea, setCandidateArea]               = useState("");

  const [modalOpen, setModalOpen]       = useState(false);
  const [modalMode, setModalMode]       = useState("status");
  const [selectedApp, setSelectedApp]   = useState(null);
  const [newStatus, setNewStatus]       = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const [screeningApp, setScreeningApp]   = useState(null);
  const [screeningOpen, setScreeningOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    scheduledAt: "", interviewType: "online",
    meetingLink: "", location: "", meetingPerson: "", round: "1", notes: "",
  });

  const [updateForm, setUpdateForm] = useState({
    interviewId: null, status: "scheduled", feedback: "",
    result: "pending", cancelReason: "", rescheduleReason: "", scheduledAt: "",
  });

  const parseScreeningAnswers = (raw) => {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) return [];
      return Object.values(parsed);
    } catch { return []; }
  };

  const fetchApplies = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/get-all-applications/${jobId}`, {
        params: {
          page, limit,
          status:           statusFilter         || undefined,
          search:           search               || undefined,
          dateFrom:         dateRange.from        || undefined,
          dateTo:           dateRange.to          || undefined,
          interviewStatus:  interviewStatusFilter || undefined,
          interviewResult:  interviewResultFilter || undefined,
          candidateLocation: candidateLocation   || undefined,
          candidateArea:    candidateArea         || undefined,
        },
      });
      setApplications(res.data.applications || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalApplications(res.data.totalApplications || 0);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplies();
  }, [jobId, page, statusFilter, search, dateRange, interviewStatusFilter, interviewResultFilter, candidateLocation, candidateArea]);

  useEffect(() => { setPage(1); }, [statusFilter, search, interviewStatusFilter, interviewResultFilter, candidateLocation, candidateArea, dateRange]);

  const applyQuickRange = (range) => {
    setQuickRange(range);
    const now = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];
    const map = {
      all:     { from: "", to: "" },
      today:   { from: fmt(now), to: fmt(now) },
      week:    { from: fmt(new Date(now - 7 * 864e5)), to: fmt(now) },
      month:   { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(now) },
      last30:  { from: fmt(new Date(now - 30 * 864e5)), to: fmt(now) },
      quarter: { from: fmt(new Date(now - 90 * 864e5)), to: fmt(now) },
      year:    { from: fmt(new Date(now.getFullYear(), 0, 1)), to: fmt(now) },
    };
    setDateRange(map[range] || { from: "", to: "" });
  };

  const clearAllFilters = () => {
    setSearch(""); setStatusFilter(""); setInterviewStatusFilter("");
    setInterviewResultFilter(""); setDateRange({ from: "", to: "" });
    setQuickRange("all"); setCandidateLocation(""); setCandidateArea("");
    setPage(1);
  };

  const hasActiveFilter = !!(
    search || statusFilter || interviewStatusFilter ||
    interviewResultFilter || dateRange.from || candidateLocation || candidateArea
  );

  const getLatestInterview = (app) =>
    app.interviews?.length ? app.interviews[app.interviews.length - 1] : null;

  const getAvailableActions = (app) => {
    const s = app.status;
    if (["selected", "rejected"].includes(s)) return [];
    const actions = [];
    if (s === "applied") {
      actions.push({ label: "Under Review",  next: "under_review",    icon: Eye });
      actions.push({ label: "Reject",        next: "rejected",         icon: XCircle,  isReject: true });
    } else if (s === "under_review") {
      actions.push({ label: "Shortlist",     next: "shortlisted",      icon: UserCheck });
      actions.push({ label: "Reject",        next: "rejected",         icon: XCircle,  isReject: true });
    } else if (s === "shortlisted") {
      actions.push({ label: "Schedule Interview", next: "interview_stage", icon: Calendar, isInterviewCreate: true });
      actions.push({ label: "Reject",        next: "rejected",         icon: XCircle,  isReject: true });
    } else if (s === "interview_stage") {
      actions.push({ label: "Update Interview", next: "interview_stage", icon: Edit2,  isInterviewUpdate: true });
      actions.push({ label: "Final Shortlist",  next: "final_shortlist", icon: CheckCircle });
      actions.push({ label: "Reject",           next: "rejected",        icon: XCircle, isReject: true });
    } else if (s === "final_shortlist") {
      actions.push({ label: "Select", next: "selected", icon: CheckCircle });
      actions.push({ label: "Reject", next: "rejected", icon: XCircle, isReject: true });
    }
    return actions;
  };

  const handleAction = async (app, action) => {
    if (action.isReject) {
      const { value: reason } = await Swal.fire({
        title: "Reject Candidate", input: "textarea",
        inputLabel: "Rejection Reason (required)",
        inputPlaceholder: "Why is this candidate being rejected?",
        showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Reject",
      });
      if (!reason?.trim()) return;
      try {
        await api.put(`/applications/${app.id}/status`, { status: "rejected", rejectionReason: reason.trim() });
        Swal.fire("Done", "Candidate rejected.", "success");
        fetchApplies();
      } catch { Swal.fire("Error", "Failed to reject candidate", "error"); }
      return;
    }
    if (action.isInterviewCreate) {
      setSelectedApp(app); setModalMode("interview_create");
      setCreateForm({ scheduledAt: "", interviewType: "online", meetingLink: "", location: "", meetingPerson: "", round: "1", notes: "" });
      setModalOpen(true); return;
    }
    if (action.isInterviewUpdate) {
      const interview = getLatestInterview(app);
      setSelectedApp(app); setModalMode("interview_update");
      setUpdateForm({ interviewId: interview?.id || null, status: interview?.status || "scheduled", feedback: interview?.feedback || "", result: interview?.result || "pending", cancelReason: "", rescheduleReason: "", scheduledAt: "" });
      setModalOpen(true); return;
    }
    setSelectedApp(app); setModalMode("status"); setNewStatus(action.next); setModalOpen(true);
  };

  const submitModal = async () => {
    if (!selectedApp) return;
    setModalLoading(true);
    try {
      if (modalMode === "interview_create") {
        await api.post(`/applications/create-interview/${selectedApp.id}`, {
          round: parseInt(createForm.round), interviewType: createForm.interviewType,
          scheduledAt: createForm.scheduledAt,
          meetingLink:   createForm.interviewType === "online"  ? createForm.meetingLink : null,
          location:      createForm.interviewType === "offline" ? createForm.location    : null,
          meetingPerson: createForm.meetingPerson, notes: createForm.notes,
        });
      } else if (modalMode === "interview_update") {
        const payload = { status: updateForm.status, feedback: updateForm.feedback };
        if (updateForm.status === "cancelled")   payload.cancelReason     = updateForm.cancelReason;
        else if (updateForm.status === "rescheduled") { payload.rescheduleReason = updateForm.rescheduleReason; payload.scheduledAt = updateForm.scheduledAt; }
        else payload.result = updateForm.result;
        await api.put(`/applications/update-interview/${updateForm.interviewId}`, payload);
      } else {
        await api.put(`/applications/${selectedApp.id}/status`, { status: newStatus });
      }
      Swal.fire("Success", "Updated successfully!", "success");
      setModalOpen(false); fetchApplies();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Operation failed", "error");
    } finally { setModalLoading(false); }
  };

  const handleDelete = async (appId, candidateName) => {
    const confirmed = await Swal.fire({
      title: `Delete ${candidateName}'s application?`, text: "This cannot be undone.",
      icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Delete",
    });
    if (!confirmed.isConfirmed) return;
    try {
      await api.delete(`/applications/delete/${appId}`);
      Swal.fire("Deleted!", "Application removed.", "success"); fetchApplies();
    } catch { Swal.fire("Error", "Failed to delete application", "error"); }
  };

  const startItem   = Math.min((page - 1) * limit + 1, totalApplications);
  const endItem     = Math.min(page * limit, totalApplications);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p); return acc;
    }, []);

  const stats = {
    total:          applications.length,
    selected:       applications.filter((a) => a.status === "selected" || a.isSelected).length,
    rejected:       applications.filter((a) => a.status === "rejected").length,
    shortlisted:    applications.filter((a) => a.status === "shortlisted").length,
    interview:      applications.filter((a) => a.status === "interview_stage").length,
    finalShortlist: applications.filter((a) => a.status === "final_shortlist").length,
    hold:           applications.filter((a) => a.interviews?.some((i) => i.status === "hold")).length,
    offerSent:      applications.filter((a) => a.offerEmailSent).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applications</h1>
            <p className="mt-1 text-sm text-gray-400">
              {totalApplications} total &middot; page {page} of {totalPages}
            </p>
          </div>
          <button onClick={fetchApplies} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Filter Panel */}
        <div className="mb-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
              <input
                type="text" placeholder="Search by name, email or phone…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors whitespace-nowrap ${showFilters ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
            >
              <SlidersHorizontal size={13} />
              Filters
              {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
            </button>

            {hasActiveFilter && (
              <button onClick={clearAllFilters} className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors whitespace-nowrap">
                <X size={13} /> Clear all
              </button>
            )}
          </div>

          {showFilters && (
            <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/50 space-y-5">

              {/* Time range */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Time range (applied date)</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    { key: "all",     label: "All time" },
                    { key: "today",   label: "Today" },
                    { key: "week",    label: "Last 7 days" },
                    { key: "month",   label: "This month" },
                    { key: "last30",  label: "Last 30 days" },
                    { key: "quarter", label: "Last 3 months" },
                    { key: "year",    label: "This year" },
                  ].map(({ key, label }) => (
                    <button key={key} onClick={() => applyQuickRange(key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${quickRange === key ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="date" value={dateRange.from}
                    onChange={(e) => { setQuickRange("custom"); setDateRange((p) => ({ ...p, from: e.target.value })); }}
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  />
                  <span className="text-xs text-gray-400">to</span>
                  <input type="date" value={dateRange.to}
                    onChange={(e) => { setQuickRange("custom"); setDateRange((p) => ({ ...p, to: e.target.value })); }}
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  />
                </div>
              </div>

              {/* Application status */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Application status</p>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setStatusFilter("")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${!statusFilter ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                    All
                  </button>
                  {APPLICATION_STATUSES.map((s) => (
                    <button key={s.value} onClick={() => setStatusFilter(s.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${statusFilter === s.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview status */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Interview status</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "",            label: "All" },
                    { value: "scheduled",   label: "Scheduled" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "completed",   label: "Completed" },
                    { value: "hold",        label: "On Hold" },
                    { value: "cancelled",   label: "Cancelled" },
                    { value: "rescheduled", label: "Rescheduled" },
                    { value: "no_show",     label: "No Show" },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setInterviewStatusFilter(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${interviewStatusFilter === opt.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview result */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Interview result</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "",           label: "All" },
                    { value: "pass",       label: "Pass" },
                    { value: "fail",       label: "Fail" },
                    { value: "next_round", label: "Next Round" },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setInterviewResultFilter(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${interviewResultFilter === opt.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidate location & area */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Candidate location</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="City (e.g. Delhi)" value={candidateLocation}
                    onChange={(e) => { setCandidateLocation(e.target.value); setPage(1); }}
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  />
                  <input type="text" placeholder="Area (e.g. Sector 15)" value={candidateArea}
                    onChange={(e) => { setCandidateArea(e.target.value); setPage(1); }}
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Stats */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
            {[
              { label: "Total",      value: stats.total,          color: "text-gray-700" },
              { label: "Selected",   value: stats.selected,       color: "text-green-700" },
              { label: "Rejected",   value: stats.rejected,       color: "text-red-600" },
              { label: "Shortlisted",value: stats.shortlisted,    color: "text-teal-700" },
              { label: "Interview",  value: stats.interview,      color: "text-violet-700" },
              { label: "Final List", value: stats.finalShortlist, color: "text-indigo-700" },
              { label: "On Hold",    value: stats.hold,           color: "text-amber-700" },
              { label: "Offer Sent", value: stats.offerSent,      color: "text-blue-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 text-center">
                <p className={`text-xl font-semibold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading applications…</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <ClipboardList size={38} className="mb-3 opacity-25" />
              <p className="text-sm font-medium text-gray-500">No applications found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {["Candidate", "Contact & Location", "Resume", "Status", "Interview", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app) => {
                    const actions   = getAvailableActions(app);
                    const interview = getLatestInterview(app);
                    return (
                      <tr key={app.id} className="hover:bg-gray-50/40 transition-colors group">

                        {/* Candidate */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={app.candidate?.userName || "?"} />
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight">{app.candidate?.userName || "—"}</p>
                              <p className="text-xs text-gray-400 mt-0.5">ID #{app.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Location */}
                        <td className="px-5 py-4">
                          <p className="text-gray-700">{app.candidate?.emailAddress || "—"}</p>
                          {app.candidate?.contactNumber && (
                            <p className="text-xs text-gray-400 mt-0.5">{app.candidate.contactNumber}</p>
                          )}
                          {app.candidate?.location && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <MapPin size={10} />
                              {app.candidate.location}
                              {app.candidate?.area ? `, ${app.candidate.area}` : ""}
                            </p>
                          )}
                        </td>

                        {/* Resume */}
                        <td className="px-5 py-4">
                          {app.resume ? (
                            <a href={`https://api.careerkendra.com${app.resume}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors">
                              <UploadCloud size={12} /> View Resume
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Not uploaded</span>
                          )}
                        </td>

                        {/* App Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={app.status} />
                          {app.status === "rejected" && app.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1.5 line-clamp-2 max-w-[140px]">{app.rejectionReason}</p>
                          )}
                        </td>

                        {/* Interview */}
                        <td className="px-5 py-4">
                          {interview ? (
                            <div className="space-y-1.5 min-w-[160px]">
                              <StatusBadge status={interview.status} styleMap={INTERVIEW_STATUS_STYLES} label={interview.status?.replace(/_/g, " ")} />
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <InterviewTypeIcon type={interview.interviewType} />
                                Round {interview.round} &middot; {interview.interviewType}
                              </div>
                              {interview.scheduledAt && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                  <Clock size={11} className="text-violet-400 shrink-0" />
                                  {new Date(interview.scheduledAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </div>
                              )}
                              {interview.meetingPerson && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <User size={11} className="text-violet-400" /> {interview.meetingPerson}
                                </div>
                              )}
                              {interview.interviewType === "online" && interview.meetingLink && (
                                <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-violet-600 hover:underline block truncate max-w-[160px]">
                                  Join Meeting →
                                </a>
                              )}
                              {interview.interviewType === "offline" && interview.location && (
                                <p className="text-xs text-gray-500 truncate max-w-[160px]" title={interview.location}>
                                  📍 {interview.location}
                                </p>
                              )}
                              {interview.result && (
                                <StatusBadge status={interview.result} styleMap={RESULT_STYLES} label={interview.result} />
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {actions.map((action, idx) => (
                              <button key={idx} onClick={() => handleAction(app, action)} title={action.label}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                                  action.isReject
                                    ? "text-red-600 border-red-100 bg-red-50 hover:bg-red-100"
                                    : action.isInterviewCreate || action.isInterviewUpdate
                                    ? "text-violet-700 border-violet-100 bg-violet-50 hover:bg-violet-100"
                                    : "text-gray-700 border-gray-200 bg-white hover:bg-gray-50"
                                }`}>
                                <action.icon size={12} /> {action.label}
                              </button>
                            ))}

                            <button
                              onClick={() => (window.location.href = `/check-applies/candidates/${app?.id}`)}
                              className="p-1.5 text-gray-300 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="View Details">
                              <Eye size={13} />
                            </button>

                            {(() => {
                              const answers = parseScreeningAnswers(app.screeningAnswers);
                              return answers.length > 0 ? (
                                <button onClick={() => { setScreeningApp(app); setScreeningOpen(true); }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap">
                                  <ClipboardList size={12} /> Questions
                                </button>
                              ) : null;
                            })()}

                            <button onClick={() => handleDelete(app.id, app.candidate?.userName)}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Application">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalApplications > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/30">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600">{startItem}–{endItem}</span> of{" "}
                <span className="font-semibold text-gray-600">{totalApplications}</span>
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={13} /> Prev
                </button>
                {pageNumbers.map((item, idx) =>
                  item === "..." ? (
                    <span key={`dot-${idx}`} className="px-1 text-gray-300 text-xs">…</span>
                  ) : (
                    <button key={item} onClick={() => setPage(item)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${page === item ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                      {item}
                    </button>
                  )
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Modal */}
      <Modal
        open={modalOpen} close={() => setModalOpen(false)}
        title={modalMode === "interview_create" ? "Schedule Interview" : modalMode === "interview_update" ? "Update Interview" : "Update Status"}
        onSubmit={submitModal} submitText={modalLoading ? "Saving…" : "Save Changes"} loading={modalLoading}
      >
        {selectedApp && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <Avatar name={selectedApp.candidate?.userName || "?"} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedApp.candidate?.userName}</p>
                <p className="text-xs text-gray-500 truncate">{selectedApp.candidate?.emailAddress}</p>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            {modalMode === "interview_create" && (
              <div className="space-y-4">
                <FormField label="Date & Time" required>
                  <input type="datetime-local" value={createForm.scheduledAt}
                    onChange={(e) => setCreateForm({ ...createForm, scheduledAt: e.target.value })} className={inputCls} />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Type">
                    <select value={createForm.interviewType}
                      onChange={(e) => setCreateForm({ ...createForm, interviewType: e.target.value, meetingLink: "", location: "" })}
                      className={inputCls}>
                      <option value="online">🎥 Online</option>
                      <option value="offline">📍 Offline</option>
                      <option value="phone">📞 Phone</option>
                    </select>
                  </FormField>
                  <FormField label="Round">
                    <input type="number" min="1" value={createForm.round}
                      onChange={(e) => setCreateForm({ ...createForm, round: e.target.value })} className={inputCls} />
                  </FormField>
                </div>
                {createForm.interviewType === "online" && (
                  <FormField label="Meeting Link">
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="text" value={createForm.meetingLink} placeholder="https://meet.google.com/…"
                        onChange={(e) => setCreateForm({ ...createForm, meetingLink: e.target.value })} className={`${inputCls} pl-9`} />
                    </div>
                  </FormField>
                )}
                {createForm.interviewType === "offline" && (
                  <FormField label="Location">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input type="text" value={createForm.location} placeholder="Office address or room"
                        onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} className={`${inputCls} pl-9`} />
                    </div>
                  </FormField>
                )}
                {createForm.interviewType === "phone" && (
                  <div className="flex items-center gap-2 px-3.5 py-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                    <Phone size={14} className="shrink-0" /> Phone interview — no meeting link or location required.
                  </div>
                )}
                <FormField label="Interviewer / Meeting Person">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="text" value={createForm.meetingPerson} placeholder="e.g. Rahul Sharma (HR Manager)"
                      onChange={(e) => setCreateForm({ ...createForm, meetingPerson: e.target.value })} className={`${inputCls} pl-9`} />
                  </div>
                </FormField>
                <FormField label="Notes">
                  <textarea value={createForm.notes} rows={3} placeholder="Topics to cover, documents to bring…"
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} className={textareaCls} />
                </FormField>
              </div>
            )}

            {modalMode === "interview_update" && (
              <div className="space-y-4">
                <FormField label="Interview Status">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "scheduled",   label: "Scheduled",   selectedCls: "border-blue-500 bg-blue-50 text-blue-700" },
                      { value: "in_progress", label: "In Progress", selectedCls: "border-amber-500 bg-amber-50 text-amber-700" },
                      { value: "completed",   label: "Completed",   selectedCls: "border-green-500 bg-green-50 text-green-700" },
                      { value: "cancelled",   label: "Cancelled",   selectedCls: "border-red-500 bg-red-50 text-red-700" },
                      { value: "rescheduled", label: "Reschedule",  selectedCls: "border-orange-500 bg-orange-50 text-orange-700" },
                      { value: "no_show",     label: "No Show",     selectedCls: "border-gray-500 bg-gray-100 text-gray-700" },
                    ].map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => setUpdateForm({ ...updateForm, status: opt.value, cancelReason: "", rescheduleReason: "", scheduledAt: "" })}
                        className={`py-2 px-1 rounded-xl border-2 text-xs font-semibold transition-all text-center ${updateForm.status === opt.value ? opt.selectedCls : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                {updateForm.status === "cancelled" && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wider">
                      <AlertTriangle size={13} /> Cancel Details
                    </div>
                    <FormField label="Cancel Reason" required>
                      <textarea value={updateForm.cancelReason} rows={2} placeholder="Why is this interview being cancelled?"
                        onChange={(e) => setUpdateForm({ ...updateForm, cancelReason: e.target.value })} className={textareaCls} />
                    </FormField>
                  </div>
                )}

                {updateForm.status === "rescheduled" && (
                  <div className="p-3.5 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-orange-700 uppercase tracking-wider">
                      <RotateCcw size={13} /> Reschedule Details
                    </div>
                    <FormField label="New Date & Time" required>
                      <input type="datetime-local" value={updateForm.scheduledAt}
                        onChange={(e) => setUpdateForm({ ...updateForm, scheduledAt: e.target.value })} className={inputCls} />
                    </FormField>
                    <FormField label="Reason for Rescheduling" required>
                      <textarea value={updateForm.rescheduleReason} rows={2} placeholder="Why is this interview being rescheduled?"
                        onChange={(e) => setUpdateForm({ ...updateForm, rescheduleReason: e.target.value })} className={textareaCls} />
                    </FormField>
                  </div>
                )}

                {!["cancelled", "rescheduled"].includes(updateForm.status) && (
                  <FormField label="Result">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "pending", label: "Pending", icon: Clock,      cls: "border-amber-400 bg-amber-50 text-amber-700" },
                        { value: "pass",    label: "Pass",    icon: ThumbsUp,   cls: "border-green-400 bg-green-50 text-green-700" },
                        { value: "fail",    label: "Fail",    icon: ThumbsDown, cls: "border-red-400 bg-red-50 text-red-700" },
                      ].map((opt) => (
                        <button key={opt.value} type="button" onClick={() => setUpdateForm({ ...updateForm, result: opt.value })}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${updateForm.result === opt.value ? opt.cls : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}>
                          <opt.icon size={15} /> {opt.label}
                        </button>
                      ))}
                    </div>
                    {updateForm.result === "pass" && (
                      <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        ✓ Application will advance to <strong>Final Shortlist</strong>
                      </p>
                    )}
                    {updateForm.result === "fail" && (
                      <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        ✗ Application will be marked as <strong>Rejected</strong>
                      </p>
                    )}
                  </FormField>
                )}

                <FormField label="Feedback / Notes">
                  <textarea value={updateForm.feedback} rows={3} placeholder="Interview notes, strengths, concerns…"
                    onChange={(e) => setUpdateForm({ ...updateForm, feedback: e.target.value })} className={textareaCls} />
                </FormField>
              </div>
            )}

            {modalMode === "status" && (
              <FormField label="New Status">
                <div className="grid grid-cols-2 gap-2">
                  {APPLICATION_STATUSES.map((s) => (
                    <button key={s.value} type="button" onClick={() => setNewStatus(s.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${newStatus === s.value ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${newStatus === s.value ? "bg-white opacity-70" : "bg-gray-300"}`} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </FormField>
            )}
          </div>
        )}
      </Modal>

      {/* Screening Answers Modal */}
      <Modal open={screeningOpen} close={() => setScreeningOpen(false)} title="Screening Answers"
        onSubmit={() => setScreeningOpen(false)} submitText="Close" loading={false}>
        {screeningApp && (() => {
          const answers = parseScreeningAnswers(screeningApp.screeningAnswers);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <Avatar name={screeningApp.candidate?.userName || "?"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{screeningApp.candidate?.userName}</p>
                  <p className="text-xs text-gray-500 truncate">{screeningApp.candidate?.emailAddress}</p>
                </div>
                <StatusBadge status={screeningApp.status} />
              </div>
              {answers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <ClipboardList size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No screening answers submitted</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {answers.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-800 leading-snug">Q{idx + 1}. {item.question}</p>
                        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 capitalize ${
                          item.type === "boolean" ? "bg-blue-50 text-blue-600 ring-blue-200"
                          : item.type === "multiple-choice" ? "bg-violet-50 text-violet-600 ring-violet-200"
                          : "bg-gray-100 text-gray-500 ring-gray-200"}`}>
                          {item.type}
                        </span>
                      </div>
                      {item.options?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {item.options.map((opt, oIdx) => (
                            <span key={oIdx} className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${opt === item.answer ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-500 border-gray-200"}`}>
                              {opt === item.answer && <span className="mr-1">✓</span>}{opt}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.type === "text" && (
                        <div className="mt-1 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700">
                          {item.answer || <span className="italic text-gray-300">No answer</span>}
                        </div>
                      )}
                      {item.type !== "text" && (
                        <p className="text-xs text-gray-400 mt-1">
                          Answer: <span className={`font-semibold ${item.answer === "Yes" ? "text-green-600" : item.answer === "No" ? "text-red-500" : "text-gray-700"}`}>
                            {item.answer}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default CheckApplies;