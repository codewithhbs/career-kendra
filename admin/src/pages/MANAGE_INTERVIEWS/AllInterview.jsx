import React, { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import Swal from "sweetalert2";
import {
  Calendar as CalendarIcon, Clock, MapPin, Video, User,
  Edit2, Search, LayoutList, ChevronLeft, ChevronRight,
  RefreshCw, X, ThumbsUp, ThumbsDown, AlertTriangle,
  RotateCcw, Briefcase, Hash, ClipboardList,
} from "lucide-react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Modal from "../../components/Model";
import useAuthStore from "../../store/useAuthStore";
import { getUserRole } from "../../utils/getRole";

// ─── Calendar setup ───────────────────────────────────────────────────────────

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVIEW_STATUS_STYLES = {
  scheduled: "bg-blue-50   text-blue-700   ring-blue-200",
  completed: "bg-green-50  text-green-700  ring-green-200",
  cancelled: "bg-red-50    text-red-700    ring-red-200",
  rescheduled: "bg-orange-50 text-orange-700 ring-orange-200",
  in_progress: "bg-amber-50  text-amber-700  ring-amber-200",
  no_show: "bg-gray-50   text-gray-600   ring-gray-200",
};

const RESULT_STYLES = {
  pass: "bg-green-50  text-green-700  ring-green-200",
  fail: "bg-red-50    text-red-700    ring-red-200",
};

const CALENDAR_EVENT_COLORS = {
  scheduled: "#6366f1",
  completed: "#10b981",
  cancelled: "#ef4444",
  rescheduled: "#f97316",
  in_progress: "#f59e0b",
  no_show: "#9ca3af",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StatusBadge = ({ status, styleMap = INTERVIEW_STATUS_STYLES }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 capitalize ${styleMap[status] || "bg-gray-50 text-gray-600 ring-gray-200"}`}>
    {status?.replace(/_/g, " ")}
  </span>
);

const Avatar = ({ name = "?" }) => {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const palette = [
    "bg-violet-100 text-violet-700", "bg-teal-100 text-teal-700",
    "bg-amber-100 text-amber-700", "bg-blue-100 text-blue-700",
    "bg-pink-100 text-pink-700", "bg-indigo-100 text-indigo-700",
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
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition bg-white";
const textareaCls = `${inputCls} resize-none`;

// ─── Main Component ────────────────────────────────────────────────────────────

const AllInterview = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInterviews, setTotalInterviews] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "calendar"

  const [showModal, setShowModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [formData, setFormData] = useState({
    round: 1, interviewType: "offline", scheduledAt: "",
    meetingLink: "", location: "", meetingPerson: "",
    status: "scheduled", feedback: "", result: "",
    rescheduleReason: "", cancelReason: "",
  });

  const { user } = useAuthStore()
  const userRole = getUserRole();
  const isAdmin = userRole.toLowerCase().includes("admin")

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications/get-all-interviews", {
        params: {
          page,
          ...(!isAdmin && { employeeId: user?.id }),

          limit, search: search || undefined
        },
      });
      setInterviews(res.data.interviews || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalInterviews(res.data.totalInterviews || 0);
    } catch {
      Swal.fire("Error", "Failed to fetch interviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterviews(); }, [page, search]);

  // ── Calendar events ───────────────────────────────────────────────────────

  const calendarEvents = useMemo(() =>
    interviews.filter((i) => i.scheduledAt).map((interview) => ({
      id: interview.id,
      title: `${interview.application?.candidate?.userName} — R${interview.round}`,
      start: new Date(interview.scheduledAt),
      end: new Date(new Date(interview.scheduledAt).getTime() + 60 * 60 * 1000),
      resource: interview,
      allDay: false,
    })),
    [interviews]);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: CALENDAR_EVENT_COLORS[event.resource?.status] || "#6366f1",
      borderRadius: "8px",
      border: "none",
      color: "white",
      fontSize: "12px",
      fontWeight: 600,
      padding: "2px 6px",
    },
  });

  // ── Modal ─────────────────────────────────────────────────────────────────

  const openModal = (interview) => {
    setSelectedInterview(interview);
    setFormData({
      round: interview.round || 1,
      interviewType: interview.interviewType || "offline",
      scheduledAt: interview.scheduledAt ? interview.scheduledAt.slice(0, 16) : "",
      meetingLink: interview.meetingLink || "",
      location: interview.location || "",
      meetingPerson: interview.meetingPerson || "",
      status: interview.status || "scheduled",
      feedback: interview.feedback || "",
      result: interview.result || "",
      rescheduleReason: interview.rescheduleReason || "",
      cancelReason: "",
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedInterview) return;
    setUpdateLoading(true);
    try {
      const payload = {
        round: Number(formData.round),
        interviewType: formData.interviewType,
        scheduledAt: formData.scheduledAt || null,
        meetingLink: formData.meetingLink,
        location: formData.location,
        meetingPerson: formData.meetingPerson,
        status: formData.status,
        feedback: formData.feedback,
        result: formData.result || null,
      };
      if (formData.status === "cancelled") payload.cancelReason = formData.cancelReason;
      if (formData.status === "rescheduled") payload.rescheduleReason = formData.rescheduleReason;

      await api.put(`/applications/update-interview/${selectedInterview.id}`, payload);
      Swal.fire("Success", "Interview updated successfully!", "success");
      setShowModal(false);
      fetchInterviews();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update interview", "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ── Pagination ────────────────────────────────────────────────────────────

  const startItem = Math.min((page - 1) * limit + 1, totalInterviews);
  const endItem = Math.min(page * limit, totalInterviews);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const patch = (key, val) => setFormData((f) => ({ ...f, [key]: val }));
  const resetStatusExtras = (status) =>
    setFormData((f) => ({ ...f, status, cancelReason: "", rescheduleReason: "" }));

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Interviews</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              {totalInterviews} total &middot; page {page} of {totalPages}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "table" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <LayoutList size={13} /> Table
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "calendar" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <CalendarIcon size={13} /> Calendar
              </button>
            </div>

            <button
              onClick={fetchInterviews}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input
              type="text"
              placeholder="Search by candidate name or job title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-11 py-3 text-sm rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin mb-3" />
                <p className="text-sm">Loading interviews…</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <ClipboardList size={38} className="mb-3 opacity-25" />
                <p className="text-sm font-medium text-gray-500">No interviews found</p>
                <p className="text-xs mt-1">Try a different search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      {["Candidate", "Job", "Round", "Scheduled At", "Location / Link", "Status", "Result", ""].map((h, i) => (
                        <th key={i} className={`px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider ${i === 7 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {interviews.map((interview) => (
                      <tr key={interview.id} className="hover:bg-gray-50/40 transition-colors group">

                        {/* Candidate */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={interview.application?.candidate?.userName || "?"} />
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight">
                                {interview.application?.candidate?.userName || "—"}
                              </p>
                              {interview.meetingPerson && (
                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                  <User size={10} /> {interview.meetingPerson}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Job */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                            <Briefcase size={12} className="text-gray-400 shrink-0" />
                            <span className="line-clamp-1">{interview.application?.job?.jobTitle || "—"}</span>
                          </div>
                        </td>

                        {/* Round */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-lg ring-1 ring-violet-100">
                              <Hash size={10} /> {interview.round}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              {interview.interviewType === "online" ? <Video size={11} /> : <MapPin size={11} />}
                              {interview.interviewType}
                            </span>
                          </div>
                        </td>

                        {/* Time */}
                        <td className="px-5 py-4">
                          {interview.scheduledAt ? (
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {new Date(interview.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <Clock size={10} />
                                {new Date(interview.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 italic">Not scheduled</span>
                          )}
                        </td>

                        {/* Location / Link */}
                        <td className="px-5 py-4 max-w-[160px]">
                          {interview.interviewType === "online" && interview.meetingLink ? (
                            <a
                              href={interview.meetingLink}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 rounded-lg hover:bg-violet-100 transition-colors"
                            >
                              <Video size={11} /> Join Meeting
                            </a>
                          ) : interview.location ? (
                            <p className="text-xs text-gray-600 flex items-start gap-1.5 line-clamp-2">
                              <MapPin size={11} className="text-gray-400 shrink-0 mt-0.5" />
                              {interview.location}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={interview.status} />
                        </td>

                        {/* Result */}
                        <td className="px-5 py-4">
                          {interview.result ? (
                            <StatusBadge status={interview.result} styleMap={RESULT_STYLES} />
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => openModal(interview)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalInterviews > 0 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/30">
                <p className="text-xs text-gray-400">
                  Showing <span className="font-semibold text-gray-600">{startItem}–{endItem}</span> of{" "}
                  <span className="font-semibold text-gray-600">{totalInterviews}</span>
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
                      <span key={`dot-${idx}`} className="px-1 text-gray-300 text-xs">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${page === item ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                      >{item}</button>
                    )
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
        )}

        {/* ── CALENDAR VIEW ── */}
        {viewMode === "calendar" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 overflow-hidden" style={{ height: "720px" }}>
            <style>{`
              .rbc-toolbar { margin-bottom: 16px; }
              .rbc-toolbar button {
                font-size: 12px; font-weight: 600; color: #6b7280;
                border: 1px solid #e5e7eb; border-radius: 8px;
                padding: 6px 12px; transition: all 0.15s;
              }
              .rbc-toolbar button:hover { background: #f9fafb; color: #111827; }
              .rbc-toolbar button.rbc-active { background: #111827 !important; color: white !important; border-color: #111827; }
              .rbc-toolbar-label { font-size: 16px; font-weight: 700; color: #111827; }
              .rbc-header { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 0; }
              .rbc-today { background: #faf5ff !important; }
              .rbc-event { border-radius: 6px !important; font-size: 11px !important; font-weight: 600 !important; }
              .rbc-event:focus { outline: none; }
              .rbc-month-view, .rbc-time-view { border: none !important; }
              .rbc-agenda-view table { border: none; }
              .rbc-off-range-bg { background: #f9fafb; }
              .rbc-date-cell { font-size: 12px; font-weight: 500; padding: 4px 8px; }
              .rbc-current .rbc-button-link { color: #7c3aed; font-weight: 700; }
            `}</style>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => openModal(event.resource)}
              tooltipAccessor={(event) =>
                `${event.resource?.application?.candidate?.userName}\nRound ${event.resource?.round} · ${event.resource?.interviewType}\n${event.resource?.status}`
              }
            />
          </div>
        )}
      </div>

      {/* ── Update Modal ───────────────────────────────────────────────────── */}
      <Modal
        open={showModal}
        close={() => setShowModal(false)}
        title="Update Interview"
        onSubmit={handleUpdate}
        submitText={updateLoading ? "Saving…" : "Save Changes"}
        loading={updateLoading}
      >
        {selectedInterview && (
          <div className="space-y-5">

            {/* Candidate card */}
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <Avatar name={selectedInterview.application?.candidate?.userName || "?"} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {selectedInterview.application?.candidate?.userName}
                </p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                  <Briefcase size={10} />
                  {selectedInterview.application?.job?.jobTitle || "—"}
                </p>
              </div>
              <StatusBadge status={selectedInterview.status} />
            </div>

            {/* Round + Meeting Person */}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Round">
                <input
                  type="number" min="1"
                  value={formData.round}
                  onChange={(e) => patch("round", e.target.value)}
                  className={inputCls}
                />
              </FormField>
              <FormField label="Interviewer">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                  <input
                    type="text"
                    value={formData.meetingPerson}
                    onChange={(e) => patch("meetingPerson", e.target.value)}
                    placeholder="Name"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </FormField>
            </div>

            {/* Type + Date */}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Type">
                <select value={formData.interviewType} onChange={(e) => patch("interviewType", e.target.value)} className={inputCls}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </FormField>
              <FormField label="Scheduled At">
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => patch("scheduledAt", e.target.value)}
                  className={inputCls}
                />
              </FormField>
            </div>

            {/* Meeting Link / Location */}
            <FormField label={formData.interviewType === "online" ? "Meeting Link" : "Location"}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {formData.interviewType === "online" ? <Video size={13} /> : <MapPin size={13} />}
                </span>
                {formData.interviewType === "online" ? (
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => patch("meetingLink", e.target.value)}
                    placeholder="https://meet.google.com/…"
                    className={`${inputCls} pl-9`}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => patch("location", e.target.value)}
                    placeholder="Office address or room"
                    className={`${inputCls} pl-9`}
                  />
                )}
              </div>
            </FormField>

            {/* Interview Status */}
            <FormField label="Interview Status">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "scheduled", label: "Scheduled", cls: "border-blue-500   bg-blue-50   text-blue-700" },
                  { value: "in_progress", label: "In Progress", cls: "border-amber-500  bg-amber-50  text-amber-700" },
                  { value: "completed", label: "Completed", cls: "border-green-500  bg-green-50  text-green-700" },
                  { value: "cancelled", label: "Cancelled", cls: "border-red-500    bg-red-50    text-red-700" },
                  { value: "rescheduled", label: "Reschedule", cls: "border-orange-500 bg-orange-50 text-orange-700" },
                  { value: "no_show", label: "No Show", cls: "border-gray-500   bg-gray-100  text-gray-700" },
                ].map((opt) => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => resetStatusExtras(opt.value)}
                    className={`py-2 px-1 rounded-xl border-2 text-xs font-semibold transition-all text-center ${formData.status === opt.value ? opt.cls : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Cancel reason */}
            {formData.status === "cancelled" && (
              <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl space-y-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-red-700 uppercase tracking-wider">
                  <AlertTriangle size={12} /> Cancel Details
                </p>
                <FormField label="Cancel Reason" required>
                  <textarea
                    value={formData.cancelReason}
                    onChange={(e) => patch("cancelReason", e.target.value)}
                    rows={2} placeholder="Why is this interview being cancelled?"
                    className={textareaCls}
                  />
                </FormField>
              </div>
            )}

            {/* Reschedule fields */}
            {formData.status === "rescheduled" && (
              <div className="p-3.5 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-orange-700 uppercase tracking-wider">
                  <RotateCcw size={12} /> Reschedule Details
                </p>
                <FormField label="New Date & Time" required>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => patch("scheduledAt", e.target.value)}
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Reason for Rescheduling" required>
                  <textarea
                    value={formData.rescheduleReason}
                    onChange={(e) => patch("rescheduleReason", e.target.value)}
                    rows={2} placeholder="Why is this interview being rescheduled?"
                    className={textareaCls}
                  />
                </FormField>
              </div>
            )}

            {/* Result — hidden for cancel/reschedule */}
            {!["cancelled", "rescheduled"].includes(formData.status) && (
              <FormField label="Result">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "", label: "Pending", icon: null, cls: "border-gray-400  bg-gray-50   text-gray-700" },
                    { value: "pass", label: "Pass", icon: ThumbsUp, cls: "border-green-400 bg-green-50  text-green-700" },
                    { value: "fail", label: "Fail", icon: ThumbsDown, cls: "border-red-400   bg-red-50    text-red-700" },
                  ].map((opt) => (
                    <button
                      key={opt.value} type="button"
                      onClick={() => patch("result", opt.value)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all ${formData.result === opt.value ? opt.cls : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                        }`}
                    >
                      {opt.icon && <opt.icon size={14} />}
                      {opt.label}
                    </button>
                  ))}
                </div>
                {formData.result === "pass" && (
                  <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    ✓ Application will advance to <strong>Final Shortlist</strong>
                  </p>
                )}
                {formData.result === "fail" && (
                  <p className="mt-2 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    ✗ Application will be marked as <strong>Rejected</strong>
                  </p>
                )}
              </FormField>
            )}

            {/* Feedback */}
            <FormField label="Feedback / Notes">
              <textarea
                value={formData.feedback}
                onChange={(e) => patch("feedback", e.target.value)}
                rows={3} placeholder="Interview notes, strengths, concerns…"
                className={textareaCls}
              />
            </FormField>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllInterview;