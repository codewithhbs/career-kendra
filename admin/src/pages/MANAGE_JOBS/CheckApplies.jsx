import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import {
  UploadCloud,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  UserCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
  ClipboardList,
  Video,
  MapPin,
  Edit2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  User,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Modal from "../../components/Model";

// ─── Constants ────────────────────────────────────────────────────────────────

const APPLICATION_STATUSES = [
  { value: "applied", label: "Applied", color: "blue" },
  { value: "under_review", label: "Under Review", color: "amber" },
  { value: "shortlisted", label: "Shortlisted", color: "teal" },
  { value: "interview_stage", label: "Interview Stage", color: "violet" },
  { value: "final_shortlist", label: "Final Shortlist", color: "indigo" },
  { value: "selected", label: "Selected", color: "green" },
  { value: "rejected", label: "Rejected", color: "red" },
];

const STATUS_STYLES = {
  applied: "bg-blue-50   text-blue-700   ring-blue-200",
  under_review: "bg-amber-50  text-amber-700  ring-amber-200",
  shortlisted: "bg-teal-50   text-teal-700   ring-teal-200",
  interview_stage: "bg-violet-50 text-violet-700 ring-violet-200",
  final_shortlist: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  selected: "bg-green-50  text-green-700  ring-green-200",
  rejected: "bg-red-50    text-red-700    ring-red-200",
};

const INTERVIEW_STATUS_STYLES = {
  scheduled: "bg-blue-50   text-blue-700   ring-blue-100",
  in_progress: "bg-amber-50  text-amber-700  ring-amber-100",
  completed: "bg-green-50  text-green-700  ring-green-100",
  cancelled: "bg-red-50    text-red-700    ring-red-100",
  rescheduled: "bg-orange-50 text-orange-700 ring-orange-100",
  no_show: "bg-gray-50   text-gray-600   ring-gray-100",
};

const RESULT_STYLES = {
  pass: "bg-green-50  text-green-700  ring-green-200",
  fail: "bg-red-50    text-red-700    ring-red-200",
  pending: "bg-amber-50  text-amber-700  ring-amber-200",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StatusBadge = ({
  status,
  styleMap = STATUS_STYLES,
  label: customLabel,
}) => {
  const label =
    customLabel ||
    APPLICATION_STATUSES.find((s) => s.value === status)?.label ||
    status?.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 capitalize ${
        styleMap[status] || "bg-gray-50 text-gray-700 ring-gray-200"
      }`}
    >
      {label}
    </span>
  );
};

const Avatar = ({ name = "?" }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const palette = [
    "bg-violet-100 text-violet-700",
    "bg-teal-100 text-teal-700",
    "bg-amber-100 text-amber-700",
    "bg-blue-100 text-blue-700",
    "bg-pink-100 text-pink-700",
    "bg-indigo-100 text-indigo-700",
  ];
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${palette[name.charCodeAt(0) % palette.length]}`}
    >
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

const inputCls =
  "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white";
const textareaCls = `${inputCls} resize-none`;

// ─── Main Component ────────────────────────────────────────────────────────────

const CheckApplies = () => {
  const { id: jobId } = useParams();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("status");
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // 1. State add karo (existing states ke saath)
  const [screeningApp, setScreeningApp] = useState(null);
  const [screeningOpen, setScreeningOpen] = useState(false);

  // 2. Helper function - screeningAnswers parse karne ke liye
  const parseScreeningAnswers = (raw) => {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) return []; // empty array case
      return Object.values(parsed);
    } catch {
      return [];
    }
  };

  const [createForm, setCreateForm] = useState({
    scheduledAt: "",
    interviewType: "online",
    meetingLink: "",
    location: "",
    meetingPerson: "",
    round: "1",
    notes: "",
  });

  const [updateForm, setUpdateForm] = useState({
    interviewId: null,
    status: "scheduled",
    feedback: "",
    result: "pending",
    cancelReason: "",
    rescheduleReason: "",
    scheduledAt: "",
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchApplies = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/get-all-applications/${jobId}`, {
        params: {
          page,
          limit,
          status: statusFilter || undefined,
          search: search || undefined,
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
  }, [jobId, page, statusFilter, search]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  // API returns interviews[] array — use the latest one
  const getLatestInterview = (app) =>
    app.interviews?.length ? app.interviews[app.interviews.length - 1] : null;

  const getAvailableActions = (app) => {
    const s = app.status;
    if (["selected", "rejected"].includes(s)) return [];
    const actions = [];
    if (s === "applied") {
      actions.push({ label: "Under Review", next: "under_review", icon: Eye });
      actions.push({
        label: "Reject",
        next: "rejected",
        icon: XCircle,
        isReject: true,
      });
    } else if (s === "under_review") {
      actions.push({
        label: "Shortlist",
        next: "shortlisted",
        icon: UserCheck,
      });
      actions.push({
        label: "Reject",
        next: "rejected",
        icon: XCircle,
        isReject: true,
      });
    } else if (s === "shortlisted") {
      actions.push({
        label: "Schedule Interview",
        next: "interview_stage",
        icon: Calendar,
        isInterviewCreate: true,
      });
      actions.push({
        label: "Reject",
        next: "rejected",
        icon: XCircle,
        isReject: true,
      });
    } else if (s === "interview_stage") {
      actions.push({
        label: "Update Interview",
        next: "interview_stage",
        icon: Edit2,
        isInterviewUpdate: true,
      });
      actions.push({
        label: "Final Shortlist",
        next: "final_shortlist",
        icon: CheckCircle,
      });
      actions.push({
        label: "Reject",
        next: "rejected",
        icon: XCircle,
        isReject: true,
      });
    } else if (s === "final_shortlist") {
      actions.push({ label: "Select", next: "selected", icon: CheckCircle });
      actions.push({
        label: "Reject",
        next: "rejected",
        icon: XCircle,
        isReject: true,
      });
    }
    return actions;
  };

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleAction = async (app, action) => {
    if (action.isReject) {
      const { value: reason } = await Swal.fire({
        title: "Reject Candidate",
        input: "textarea",
        inputLabel: "Rejection Reason (required)",
        inputPlaceholder: "Why is this candidate being rejected?",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Reject",
      });
      if (!reason?.trim()) return;
      try {
        await api.put(`/applications/${app.id}/status`, {
          status: "rejected",
          rejectionReason: reason.trim(),
        });
        Swal.fire("Done", "Candidate rejected.", "success");
        fetchApplies();
      } catch {
        Swal.fire("Error", "Failed to reject candidate", "error");
      }
      return;
    }

    if (action.isInterviewCreate) {
      setSelectedApp(app);
      setModalMode("interview_create");
      setCreateForm({
        scheduledAt: "",
        interviewType: "online",
        meetingLink: "",
        location: "",
        meetingPerson: "",
        round: "1",
        notes: "",
      });
      setModalOpen(true);
      return;
    }

    if (action.isInterviewUpdate) {
      const interview = getLatestInterview(app);
      setSelectedApp(app);
      setModalMode("interview_update");
      setUpdateForm({
        interviewId: interview?.id || null,
        status: interview?.status || "scheduled",
        feedback: interview?.feedback || "",
        result: interview?.result || "pending",
        cancelReason: "",
        rescheduleReason: "",
        scheduledAt: "",
      });
      setModalOpen(true);
      return;
    }

    setSelectedApp(app);
    setModalMode("status");
    setNewStatus(action.next);
    setModalOpen(true);
  };

  const submitModal = async () => {
    if (!selectedApp) return;
    setModalLoading(true);
    try {
      if (modalMode === "interview_create") {
        await api.post(`/applications/create-interview/${selectedApp.id}`, {
          round: parseInt(createForm.round),
          interviewType: createForm.interviewType,
          scheduledAt: createForm.scheduledAt,
          meetingLink: createForm.meetingLink,
          location: createForm.location,
          meetingPerson: createForm.meetingPerson,
          notes: createForm.notes,
        });
      } else if (modalMode === "interview_update") {
        const payload = {
          status: updateForm.status,
          feedback: updateForm.feedback,
        };
        if (updateForm.status === "cancelled") {
          payload.cancelReason = updateForm.cancelReason;
        } else if (updateForm.status === "rescheduled") {
          payload.rescheduleReason = updateForm.rescheduleReason;
          payload.scheduledAt = updateForm.scheduledAt;
        } else {
          payload.result = updateForm.result;
        }
        await api.put(
          `/applications/update-interview/${updateForm.interviewId}`,
          payload,
        );
      } else {
        await api.put(`/applications/${selectedApp.id}/status`, {
          status: newStatus,
        });
      }
      Swal.fire("Success", "Updated successfully!", "success");
      setModalOpen(false);
      fetchApplies();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Operation failed", "error");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (appId, candidateName) => {
    const confirmed = await Swal.fire({
      title: `Delete ${candidateName}'s application?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });
    if (!confirmed.isConfirmed) return;
    try {
      await api.delete(`/applications/delete/${appId}`);
      Swal.fire("Deleted!", "Application removed.", "success");
      fetchApplies();
    } catch {
      Swal.fire("Error", "Failed to delete application", "error");
    }
  };

  // ── Pagination ────────────────────────────────────────────────────────────

  const startItem = Math.min((page - 1) * limit + 1, totalApplications);
  const endItem = Math.min(page * limit, totalApplications);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Applications
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {totalApplications} total &middot; page {page} of {totalPages}
            </p>
          </div>
          <button
            onClick={fetchApplies}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mb-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={15}
              />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors whitespace-nowrap ${
                showFilters
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters
              {statusFilter && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              )}
            </button>

            {(search || statusFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors whitespace-nowrap"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setStatusFilter("")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${!statusFilter ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  All
                </button>
                {APPLICATION_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${statusFilter === s.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

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
              <p className="text-sm font-medium text-gray-500">
                No applications found
              </p>
              <p className="text-xs mt-1">
                Try adjusting your filters or search
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {[
                      "Candidate",
                      "Contact",
                      "Resume",
                      "Status",
                      "Interview",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider ${i === 5 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.map((app) => {
                    const actions = getAvailableActions(app);
                    const interview = getLatestInterview(app);

                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-gray-50/40 transition-colors group"
                      >
                        {/* Candidate */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={app.candidate?.userName || "?"} />
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight">
                                {app.candidate?.userName || "—"}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                ID #{app.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <p className="text-gray-700">
                            {app.candidate?.emailAddress || "—"}
                          </p>
                          {app.candidate?.contactNumber && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {app.candidate.contactNumber}
                            </p>
                          )}
                        </td>

                        {/* Resume */}
                        <td className="px-5 py-4">
                          {app.resume ? (
                            <a
                              href={`https://api.careerkendra.com/${app.resume}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors"
                            >
                              <UploadCloud size={12} /> View Resume
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300 italic">
                              Not uploaded
                            </span>
                          )}
                        </td>

                        {/* App Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={app.status} />
                          {app.status === "rejected" && app.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1.5 line-clamp-2 max-w-[140px]">
                              {app.rejectionReason}
                            </p>
                          )}
                        </td>

                        {/* Interview info — reads from app.interviews[] */}
                        <td className="px-5 py-4">
                          {interview ? (
                            <div className="space-y-1.5 min-w-[160px]">
                              <StatusBadge
                                status={interview.status}
                                styleMap={INTERVIEW_STATUS_STYLES}
                                label={interview.status?.replace(/_/g, " ")}
                              />

                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                {interview.interviewType === "online" ? (
                                  <Video
                                    size={11}
                                    className="text-violet-400"
                                  />
                                ) : (
                                  <MapPin
                                    size={11}
                                    className="text-violet-400"
                                  />
                                )}
                                Round {interview.round} &middot;{" "}
                                {interview.interviewType}
                              </div>

                              {interview.scheduledAt && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                  <Clock
                                    size={11}
                                    className="text-violet-400 shrink-0"
                                  />
                                  {new Date(
                                    interview.scheduledAt,
                                  ).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              )}

                              {interview.meetingPerson && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <User size={11} className="text-violet-400" />
                                  {interview.meetingPerson}
                                </div>
                              )}

                              {interview.interviewType === "online" &&
                                interview.meetingLink && (
                                  <a
                                    href={interview.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-violet-600 hover:underline block truncate max-w-[160px]"
                                  >
                                    Join Meeting →
                                  </a>
                                )}
                              {interview.interviewType === "offline" &&
                                interview.location && (
                                  <p
                                    className="text-xs text-gray-500 truncate max-w-[160px]"
                                    title={interview.location}
                                  >
                                    📍 {interview.location}
                                  </p>
                                )}

                              {interview.result && (
                                <StatusBadge
                                  status={interview.result}
                                  styleMap={RESULT_STYLES}
                                  label={interview.result}
                                />
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
                              <button
                                key={idx}
                                onClick={() => handleAction(app, action)}
                                title={action.label}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                                  action.isReject
                                    ? "text-red-600 border-red-100 bg-red-50 hover:bg-red-100"
                                    : action.isInterviewCreate ||
                                        action.isInterviewUpdate
                                      ? "text-violet-700 border-violet-100 bg-violet-50 hover:bg-violet-100"
                                      : "text-gray-700 border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                              >
                                <action.icon size={12} />
                                {action.label}
                              </button>
                            ))}
                            <button
                              onClick={() =>
                                (window.location.href = `/check-applies/candidates/${app?.id}`)
                              }
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Application"
                            >
                              <Eye size={13} />
                            </button>
                            {/* Actions cell mein, delete button se pehle */}
                            {(() => {
                              const answers = parseScreeningAnswers(
                                app.screeningAnswers,
                              );
                              return answers.length > 0 ? (
                                <button
                                  onClick={() => {
                                    setScreeningApp(app);
                                    setScreeningOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap"
                                  title="View Questions & Answers"
                                >
                                  <ClipboardList size={12} /> Questions
                                </button>
                              ) : null;
                            })()}
                            <button
                              onClick={() =>
                                handleDelete(app.id, app.candidate?.userName)
                              }
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Application"
                            >
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
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {startItem}–{endItem}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-600">
                  {totalApplications}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={13} /> Prev
                </button>

                {pageNumbers.map((item, idx) =>
                  item === "..." ? (
                    <span
                      key={`dot-${idx}`}
                      className="px-1 text-gray-300 text-xs"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                        page === item
                          ? "bg-gray-900 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Unified Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        close={() => setModalOpen(false)}
        title={
          modalMode === "interview_create"
            ? "Schedule Interview"
            : modalMode === "interview_update"
              ? "Update Interview"
              : "Update Status"
        }
        onSubmit={submitModal}
        submitText={modalLoading ? "Saving…" : "Save Changes"}
        loading={modalLoading}
      >
        {selectedApp && (
          <div className="space-y-5">
            {/* Candidate card */}
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <Avatar name={selectedApp.candidate?.userName || "?"} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {selectedApp.candidate?.userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {selectedApp.candidate?.emailAddress}
                </p>
              </div>
              <StatusBadge status={selectedApp.status} />
            </div>

            {/* ── Create Interview ── */}
            {modalMode === "interview_create" && (
              <div className="space-y-4">
                <FormField label="Date & Time" required>
                  <input
                    type="datetime-local"
                    value={createForm.scheduledAt}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        scheduledAt: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Type">
                    <select
                      value={createForm.interviewType}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          interviewType: e.target.value,
                        })
                      }
                      className={inputCls}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </FormField>
                  <FormField label="Round">
                    <input
                      type="number"
                      min="1"
                      value={createForm.round}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, round: e.target.value })
                      }
                      className={inputCls}
                    />
                  </FormField>
                </div>

                <FormField
                  label={
                    createForm.interviewType === "online"
                      ? "Meeting Link"
                      : "Location"
                  }
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {createForm.interviewType === "online" ? (
                        <Video size={14} />
                      ) : (
                        <MapPin size={14} />
                      )}
                    </span>
                    <input
                      type="text"
                      value={
                        createForm.interviewType === "online"
                          ? createForm.meetingLink
                          : createForm.location
                      }
                      onChange={(e) => {
                        const key =
                          createForm.interviewType === "online"
                            ? "meetingLink"
                            : "location";
                        setCreateForm({ ...createForm, [key]: e.target.value });
                      }}
                      placeholder={
                        createForm.interviewType === "online"
                          ? "https://meet.google.com/…"
                          : "Office address or room"
                      }
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </FormField>

                <FormField label="Interviewer / Meeting Person">
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                    <input
                      type="text"
                      value={createForm.meetingPerson}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          meetingPerson: e.target.value,
                        })
                      }
                      placeholder="e.g. Rahul Sharma (HR Manager)"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </FormField>

                <FormField label="Notes">
                  <textarea
                    value={createForm.notes}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Topics to cover, documents to bring…"
                    className={textareaCls}
                  />
                </FormField>
              </div>
            )}

            {/* ── Update Interview ── */}
            {modalMode === "interview_update" && (
              <div className="space-y-4">
                {/* Status selector */}
                <FormField label="Interview Status">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        value: "scheduled",
                        label: "Scheduled",
                        selectedCls:
                          "border-blue-500   bg-blue-50   text-blue-700",
                      },
                      {
                        value: "in_progress",
                        label: "In Progress",
                        selectedCls:
                          "border-amber-500  bg-amber-50  text-amber-700",
                      },
                      {
                        value: "completed",
                        label: "Completed",
                        selectedCls:
                          "border-green-500  bg-green-50  text-green-700",
                      },
                      {
                        value: "cancelled",
                        label: "Cancelled",
                        selectedCls:
                          "border-red-500    bg-red-50    text-red-700",
                      },
                      {
                        value: "rescheduled",
                        label: "Reschedule",
                        selectedCls:
                          "border-orange-500 bg-orange-50 text-orange-700",
                      },
                      {
                        value: "no_show",
                        label: "No Show",
                        selectedCls:
                          "border-gray-500   bg-gray-100  text-gray-700",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setUpdateForm({
                            ...updateForm,
                            status: opt.value,
                            cancelReason: "",
                            rescheduleReason: "",
                            scheduledAt: "",
                          })
                        }
                        className={`py-2 px-1 rounded-xl border-2 text-xs font-semibold transition-all text-center ${
                          updateForm.status === opt.value
                            ? opt.selectedCls
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FormField>

                {/* Cancel reason */}
                {updateForm.status === "cancelled" && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wider">
                      <AlertTriangle size={13} /> Cancel Details
                    </div>
                    <FormField label="Cancel Reason" required>
                      <textarea
                        value={updateForm.cancelReason}
                        onChange={(e) =>
                          setUpdateForm({
                            ...updateForm,
                            cancelReason: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="Why is this interview being cancelled?"
                        className={textareaCls}
                      />
                    </FormField>
                  </div>
                )}

                {/* Reschedule fields */}
                {updateForm.status === "rescheduled" && (
                  <div className="p-3.5 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-orange-700 uppercase tracking-wider">
                      <RotateCcw size={13} /> Reschedule Details
                    </div>
                    <FormField label="New Date & Time" required>
                      <input
                        type="datetime-local"
                        value={updateForm.scheduledAt}
                        onChange={(e) =>
                          setUpdateForm({
                            ...updateForm,
                            scheduledAt: e.target.value,
                          })
                        }
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label="Reason for Rescheduling" required>
                      <textarea
                        value={updateForm.rescheduleReason}
                        onChange={(e) =>
                          setUpdateForm({
                            ...updateForm,
                            rescheduleReason: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="Why is this interview being rescheduled?"
                        className={textareaCls}
                      />
                    </FormField>
                  </div>
                )}

                {/* Result — hidden for cancel / reschedule */}
                {!["cancelled", "rescheduled"].includes(updateForm.status) && (
                  <FormField label="Result">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          value: "pending",
                          label: "Pending",
                          icon: Clock,
                          cls: "border-amber-400 bg-amber-50 text-amber-700",
                        },
                        {
                          value: "pass",
                          label: "Pass",
                          icon: ThumbsUp,
                          cls: "border-green-400 bg-green-50 text-green-700",
                        },
                        {
                          value: "fail",
                          label: "Fail",
                          icon: ThumbsDown,
                          cls: "border-red-400   bg-red-50   text-red-700",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setUpdateForm({ ...updateForm, result: opt.value })
                          }
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                            updateForm.result === opt.value
                              ? opt.cls
                              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          <opt.icon size={15} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {updateForm.result === "pass" && (
                      <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        ✓ Application will advance to{" "}
                        <strong>Final Shortlist</strong>
                      </p>
                    )}
                    {updateForm.result === "fail" && (
                      <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        ✗ Application will be marked as{" "}
                        <strong>Rejected</strong>
                      </p>
                    )}
                  </FormField>
                )}

                <FormField label="Feedback / Notes">
                  <textarea
                    value={updateForm.feedback}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, feedback: e.target.value })
                    }
                    rows={3}
                    placeholder="Interview notes, strengths, concerns…"
                    className={textareaCls}
                  />
                </FormField>
              </div>
            )}

            {/* ── Status Change ── */}
            {modalMode === "status" && (
              <FormField label="New Status">
                <div className="grid grid-cols-2 gap-2">
                  {APPLICATION_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setNewStatus(s.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        newStatus === s.value
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${newStatus === s.value ? "bg-white opacity-70" : "bg-gray-300"}`}
                      />
                      {s.label}
                    </button>
                  ))}
                </div>
              </FormField>
            )}
          </div>
        )}
      </Modal>

      {/* ── Screening Answers Modal ───────────────────────────────────────── */}
      <Modal
        open={screeningOpen}
        close={() => setScreeningOpen(false)}
        title="Screening Answers"
        onSubmit={() => setScreeningOpen(false)}
        submitText="Close"
        loading={false}
      >
        {screeningApp &&
          (() => {
            const answers = parseScreeningAnswers(
              screeningApp.screeningAnswers,
            );
            return (
              <div className="space-y-4">
                {/* Candidate card */}
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <Avatar name={screeningApp.candidate?.userName || "?"} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {screeningApp.candidate?.userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {screeningApp.candidate?.emailAddress}
                    </p>
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
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-gray-800 leading-snug">
                            Q{idx + 1}. {item.question}
                          </p>
                          <span
                            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 capitalize
                    ${
                      item.type === "boolean"
                        ? "bg-blue-50 text-blue-600 ring-blue-200"
                        : item.type === "multiple-choice"
                          ? "bg-violet-50 text-violet-600 ring-violet-200"
                          : "bg-gray-100 text-gray-500 ring-gray-200"
                    }`}
                          >
                            {item.type}
                          </span>
                        </div>

                        {/* Options (for boolean / multiple-choice) */}
                        {item.options && item.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {item.options.map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors
                          ${
                            opt === item.answer
                              ? "bg-teal-600 text-white border-teal-600"
                              : "bg-white text-gray-500 border-gray-200"
                          }`}
                              >
                                {opt === item.answer && (
                                  <span className="mr-1">✓</span>
                                )}
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Text answer */}
                        {item.type === "text" && (
                          <div className="mt-1 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700">
                            {item.answer || (
                              <span className="italic text-gray-300">
                                No answer
                              </span>
                            )}
                          </div>
                        )}

                        {/* Answer label for non-text */}
                        {item.type !== "text" && (
                          <p className="text-xs text-gray-400 mt-1">
                            Answer:{" "}
                            <span
                              className={`font-semibold ${
                                item.answer === "Yes"
                                  ? "text-green-600"
                                  : item.answer === "No"
                                    ? "text-red-500"
                                    : "text-gray-700"
                              }`}
                            >
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
