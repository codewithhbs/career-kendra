"use client";

import { API_URL } from "@/constant/api";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    addWeeks,
    subWeeks,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
} from "date-fns";
import {
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    MapPin,
    User,
    Mail,
    Phone,
    Video,
    Building2,
    Filter,
    Briefcase,
} from "lucide-react";

axios.defaults.baseURL = API_URL;

interface InterviewEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    status: string;
    interviewType: string;
    location?: string;
    meetingPerson?: string;
    meetingLink?: string;
    round: number;
    candidateName: string;
    jobTitle: string;
    email?: string;
    contact?: string;
    result?: string;
}

type ViewType = "month" | "week" | "day" | "agenda";

const STATUS_STYLES: Record<string, { dot: string; badge: string; event: string }> = {
    scheduled: {
        dot: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 border border-blue-200",
        event: "bg-blue-500 hover:bg-blue-600",
    },
    completed: {
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        event: "bg-emerald-500 hover:bg-emerald-600",
    },
    cancelled: {
        dot: "bg-red-500",
        badge: "bg-red-50 text-red-700 border border-red-200",
        event: "bg-red-400 hover:bg-red-500",
    },
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Custom Calendar ──────────────────────────────────────────────────────────

const MonthView = ({
    currentDate,
    events,
    onSelectEvent,
    onSelectDate,
}: {
    currentDate: Date;
    events: InterviewEvent[];
    onSelectEvent: (e: InterviewEvent) => void;
    onSelectDate: (d: Date) => void;
}) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const rows: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
        const week: Date[] = [];
        for (let i = 0; i < 7; i++) {
            week.push(day);
            day = addDays(day, 1);
        }
        rows.push(week);
    }

    const getEventsForDay = (d: Date) =>
        events.filter((e) => isSameDay(e.start, d));

    return (
        <div className="flex flex-col h-full">
            {/* Header row */}
            <div className="grid grid-cols-7 border-b border-slate-200">
                {WEEK_DAYS.map((d) => (
                    <div
                        key={d}
                        className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="flex-1 grid grid-rows-[repeat(auto-fill,minmax(0,1fr))]">
                {rows.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0">
                        {week.map((d, di) => {
                            const dayEvents = getEventsForDay(d);
                            const inMonth = isSameMonth(d, currentDate);
                            const todayFlag = isToday(d);
                            return (
                                <div
                                    key={di}
                                    onClick={() => onSelectDate(d)}
                                    className={`min-h-[90px] p-1.5 border-r border-slate-100 last:border-r-0 cursor-pointer transition-colors
                    ${!inMonth ? "bg-slate-50/60" : "bg-white hover:bg-slate-50"}
                    ${todayFlag ? "ring-inset ring-2 ring-indigo-400" : ""}
                  `}
                                >
                                    <div className="flex justify-end mb-1">
                                        <span
                                            className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                        ${todayFlag ? "bg-indigo-600 text-white" : !inMonth ? "text-slate-400" : "text-slate-700"}
                      `}
                                        >
                                            {format(d, "d")}
                                        </span>
                                    </div>

                                    <div className="space-y-0.5">
                                        {dayEvents.slice(0, 3).map((ev) => (
                                            <button
                                                key={ev.id}
                                                onClick={(e) => { e.stopPropagation(); onSelectEvent(ev); }}
                                                className={`w-full text-left text-[11px] font-medium text-white rounded px-1.5 py-0.5 truncate transition-colors
                          ${STATUS_STYLES[ev.status]?.event || "bg-slate-500 hover:bg-slate-600"}`}
                                            >
                                                {format(ev.start, "h:mm a")} · {ev.candidateName}
                                            </button>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <p className="text-[11px] text-slate-500 pl-1.5 font-medium">
                                                +{dayEvents.length - 3} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const WeekView = ({
    currentDate,
    events,
    onSelectEvent,
}: {
    currentDate: Date;
    events: InterviewEvent[];
    onSelectEvent: (e: InterviewEvent) => void;
}) => {
    const weekStart = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
        <div className="flex flex-col h-full overflow-auto">
            <div className="grid grid-cols-7 border-b border-slate-200 sticky top-0 bg-white z-10">
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`py-3 text-center border-r border-slate-100 last:border-r-0 ${isToday(d) ? "bg-indigo-50" : ""}`}
                    >
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {WEEK_DAYS[i]}
                        </p>
                        <p className={`text-lg font-bold mt-0.5 ${isToday(d) ? "text-indigo-600" : "text-slate-800"}`}>
                            {format(d, "d")}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 flex-1">
                {days.map((d, i) => {
                    const dayEvents = events.filter((e) => isSameDay(e.start, d));
                    return (
                        <div
                            key={i}
                            className={`min-h-[300px] p-2 border-r border-slate-100 last:border-r-0 space-y-1.5 ${isToday(d) ? "bg-indigo-50/40" : ""}`}
                        >
                            {dayEvents.length === 0 && (
                                <p className="text-xs text-slate-300 text-center mt-6">—</p>
                            )}
                            {dayEvents.map((ev) => (
                                <button
                                    key={ev.id}
                                    onClick={() => onSelectEvent(ev)}
                                    className={`w-full text-left rounded-lg p-2 text-white transition-all shadow-sm
                    ${STATUS_STYLES[ev.status]?.event || "bg-slate-500 hover:bg-slate-600"}`}
                                >
                                    <p className="text-[11px] font-semibold">{format(ev.start, "h:mm a")}</p>
                                    <p className="text-xs mt-0.5 font-medium truncate">{ev.candidateName}</p>
                                    <p className="text-[11px] opacity-80 truncate">{ev.jobTitle}</p>
                                </button>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DayView = ({
    currentDate,
    events,
    onSelectEvent,
}: {
    currentDate: Date;
    events: InterviewEvent[];
    onSelectEvent: (e: InterviewEvent) => void;
}) => {
    const dayEvents = events
        .filter((e) => isSameDay(e.start, currentDate))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl
          ${isToday(currentDate) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {format(currentDate, "d")}
                </div>
                <div>
                    <p className="font-bold text-slate-800 text-lg">{format(currentDate, "EEEE")}</p>
                    <p className="text-slate-500 text-sm">{format(currentDate, "MMMM yyyy")}</p>
                </div>
                <span className="ml-auto text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {dayEvents.length} interview{dayEvents.length !== 1 ? "s" : ""}
                </span>
            </div>

            {dayEvents.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <Calendar className="mx-auto mb-3 opacity-30" size={40} />
                    <p className="text-lg font-medium">No interviews scheduled</p>
                </div>
            ) : (
                dayEvents.map((ev) => (
                    <button
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        className="w-full text-left flex gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white group"
                    >
                        <div className={`w-1.5 rounded-full self-stretch ${STATUS_STYLES[ev.status]?.dot || "bg-slate-400"}`} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                        {ev.candidateName}
                                    </p>
                                    <p className="text-sm text-slate-500">{ev.jobTitle}</p>
                                </div>
                                <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[ev.status]?.badge}`}>
                                    {ev.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {format(ev.start, "h:mm a")} – {format(ev.end, "h:mm a")}
                                </span>
                                <span className="flex items-center gap-1">
                                    {ev.interviewType === "online" ? <Video size={12} /> : <Building2 size={12} />}
                                    {ev.interviewType}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Briefcase size={12} />
                                    Round {ev.round}
                                </span>
                            </div>
                        </div>
                    </button>
                ))
            )}
        </div>
    );
};

const AgendaView = ({
    currentDate,
    events,
    onSelectEvent,
}: {
    currentDate: Date;
    events: InterviewEvent[];
    onSelectEvent: (e: InterviewEvent) => void;
}) => {
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const upcoming = sorted.filter((e) => e.start >= new Date(new Date().setHours(0, 0, 0, 0)));

    const grouped: Record<string, InterviewEvent[]> = {};
    upcoming.forEach((ev) => {
        const key = format(ev.start, "yyyy-MM-dd");
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(ev);
    });

    return (
        <div className="p-4 md:p-6 space-y-6 overflow-auto max-h-[600px]">
            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <Calendar className="mx-auto mb-3 opacity-30" size={40} />
                    <p className="text-lg font-medium">No upcoming interviews</p>
                </div>
            ) : (
                Object.entries(grouped).map(([dateKey, evs]) => (
                    <div key={dateKey}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold leading-tight
                ${isToday(parseISO(dateKey)) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                                <span>{format(parseISO(dateKey), "d")}</span>
                                <span className="font-normal opacity-70">{format(parseISO(dateKey), "MMM")}</span>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-700">{format(parseISO(dateKey), "EEEE")}</p>
                                <p className="text-xs text-slate-400">{evs.length} interview{evs.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                        <div className="ml-13 space-y-2 pl-1 border-l-2 border-slate-100 ml-5">
                            {evs.map((ev) => (
                                <button
                                    key={ev.id}
                                    onClick={() => onSelectEvent(ev)}
                                    className="w-full text-left ml-4 flex gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                                >
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${STATUS_STYLES[ev.status]?.dot}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{ev.candidateName}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ml-2 ${STATUS_STYLES[ev.status]?.badge}`}>{ev.status}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{ev.jobTitle}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{format(ev.start, "h:mm a")} · Round {ev.round} · {ev.interviewType}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AllInterviews = () => {
    const { token } = useEmployerAuthStore();

    const [events, setEvents] = useState<InterviewEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewType>("month");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const fetchInterviews = async () => {
        try {
            const res = await axios.get("/applications/get-all-employer-interviews", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const interviews = res.data.interviews || [];
            const mapped: InterviewEvent[] = interviews.map((item: any) => ({
                id: item.id,
                title: `${item.application.candidate.userName} - ${item.application.job.jobTitle}`,
                start: new Date(item.scheduledAt),
                end: new Date(new Date(item.scheduledAt).getTime() + 60 * 60 * 1000),
                status: item.status,
                interviewType: item.interviewType,
                location: item.location,
                meetingPerson: item.meetingPerson,
                meetingLink: item.meetingLink,
                round: item.round,
                candidateName: item.application.candidate.userName,
                jobTitle: item.application.job.jobTitle,
                email: item.application.candidate.emailAddress,
                contact: item.application.candidate.contactNumber,
                result: item.result,
            }));
            setEvents(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInterviews(); }, [token]);

    const filteredEvents = useMemo(() =>
        events.filter((e) => {
            const s = searchTerm.toLowerCase();
            const matchSearch =
                e.candidateName.toLowerCase().includes(s) ||
                e.jobTitle.toLowerCase().includes(s) ||
                e.meetingPerson?.toLowerCase().includes(s);
            return matchSearch &&
                (statusFilter === "all" || e.status === statusFilter) &&
                (typeFilter === "all" || e.interviewType === typeFilter);
        }), [events, searchTerm, statusFilter, typeFilter]);

    // Navigation
    const navigate = (dir: 1 | -1) => {
        if (view === "month") setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        else if (view === "week") setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, dir));
    };

    const goToday = () => setCurrentDate(new Date());

    const getNavLabel = () => {
        if (view === "month") return format(currentDate, "MMMM yyyy");
        if (view === "week") {
            const ws = startOfWeek(currentDate);
            const we = endOfWeek(currentDate);
            return `${format(ws, "MMM d")} – ${format(we, "MMM d, yyyy")}`;
        }
        if (view === "day") return format(currentDate, "EEEE, MMMM d yyyy");
        return "Upcoming";
    };

    const VIEWS: { key: ViewType; label: string }[] = [
        { key: "month", label: "Month" },
        { key: "week", label: "Week" },
        { key: "day", label: "Day" },
        { key: "agenda", label: "Agenda" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-6">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                            Interview Calendar
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {filteredEvents.length} interview{filteredEvents.length !== 1 ? "s" : ""} found
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48 md:w-60"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                            <option value="all">All Types</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>

                        {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                            <button
                                onClick={() => { setSearchTerm(""); setStatusFilter("all"); setTypeFilter("all"); }}
                                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition shadow-sm"
                            >
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Calendar Card ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 bg-slate-50/80">
                        {/* Left: Today + Nav */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={goToday}
                                className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 transition"
                            >
                                Today
                            </button>

                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-l-lg border border-slate-200 bg-white hover:bg-slate-100 transition text-slate-600"
                                    aria-label="Previous"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-r-lg border-t border-r border-b border-slate-200 bg-white hover:bg-slate-100 transition text-slate-600"
                                    aria-label="Next"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <h2 className="text-base md:text-lg font-semibold text-slate-800 select-none min-w-[180px]">
                                {getNavLabel()}
                            </h2>
                        </div>

                        {/* Right: View switcher */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            {VIEWS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setView(key)}
                                    className={`px-3 md:px-4 py-1.5 text-sm font-medium transition
                    ${view === key
                                            ? "bg-indigo-600 text-white"
                                            : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calendar Body */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Loading interviews…</p>
                        </div>
                    ) : (
                        <div className="overflow-auto" style={{ minHeight: 520 }}>
                            {view === "month" && (
                                <MonthView
                                    currentDate={currentDate}
                                    events={filteredEvents}
                                    onSelectEvent={setSelectedEvent}
                                    onSelectDate={(d) => { setCurrentDate(d); setView("day"); }}
                                />
                            )}
                            {view === "week" && (
                                <WeekView
                                    currentDate={currentDate}
                                    events={filteredEvents}
                                    onSelectEvent={setSelectedEvent}
                                />
                            )}
                            {view === "day" && (
                                <DayView
                                    currentDate={currentDate}
                                    events={filteredEvents}
                                    onSelectEvent={setSelectedEvent}
                                />
                            )}
                            {view === "agenda" && (
                                <AgendaView
                                    currentDate={currentDate}
                                    events={filteredEvents}
                                    onSelectEvent={setSelectedEvent}
                                />
                            )}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-500">
                        {Object.entries(STATUS_STYLES).map(([s, v]) => (
                            <span key={s} className="flex items-center gap-1.5 capitalize">
                                <span className={`w-2.5 h-2.5 rounded-full ${v.dot}`} />
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`p-5 ${selectedEvent.status === "completed" ? "bg-emerald-500" : selectedEvent.status === "cancelled" ? "bg-red-400" : "bg-indigo-600"} text-white relative`}>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-lg font-bold"
                            >
                                ×
                            </button>
                            <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
                                Round {selectedEvent.round} · {selectedEvent.interviewType}
                            </p>
                            <h2 className="text-xl font-bold">{selectedEvent.candidateName}</h2>
                            <p className="text-sm opacity-90 mt-0.5">{selectedEvent.jobTitle}</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">

                            {/* Date/Time */}
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <Clock size={16} className="mt-0.5 text-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Date & Time</p>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {format(selectedEvent.start, "EEEE, dd MMMM yyyy")}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        {format(selectedEvent.start, "hh:mm a")} – {format(selectedEvent.end, "hh:mm a")}
                                    </p>
                                </div>
                            </div>

                            {/* Status & Type */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[selectedEvent.status]?.badge}`}>
                                        {selectedEvent.status}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-500 font-medium mb-1">Type</p>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize
                    ${selectedEvent.interviewType === "online"
                                            ? "bg-violet-50 text-violet-700 border border-violet-200"
                                            : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                                        {selectedEvent.interviewType}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2.5">
                                {selectedEvent.meetingPerson && (
                                    <InfoRow icon={<User size={14} />} label="Interviewer" value={selectedEvent.meetingPerson} />
                                )}
                                {selectedEvent.location && (
                                    <InfoRow icon={<MapPin size={14} />} label="Location" value={selectedEvent.location} />
                                )}
                                {selectedEvent.email && (
                                    <InfoRow icon={<Mail size={14} />} label="Email" value={selectedEvent.email} highlight />
                                )}
                                {selectedEvent.contact && (
                                    <InfoRow icon={<Phone size={14} />} label="Contact" value={selectedEvent.contact} />
                                )}
                                {selectedEvent.meetingLink && (
                                    <InfoRow icon={<Video size={14} />} label="Meeting Link" value={selectedEvent.meetingLink} highlight />
                                )}
                            </div>

                            {selectedEvent.result && (
                                <div className={`p-3 rounded-xl text-center font-bold text-lg
                  ${selectedEvent.result === "pass" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                                    Result: {selectedEvent.result.toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoRow = ({
    icon,
    label,
    value,
    highlight,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}) => (
    <div className="flex items-start gap-3">
        <span className="mt-0.5 text-slate-400 shrink-0">{icon}</span>
        <div className="min-w-0">
            <p className="text-xs text-slate-400 font-medium">{label}</p>
            <p className={`text-sm font-medium break-all ${highlight ? "text-indigo-600" : "text-slate-700"}`}>
                {value}
            </p>
        </div>
    </div>
);

export default AllInterviews;