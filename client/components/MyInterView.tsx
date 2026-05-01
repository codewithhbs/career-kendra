"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
    Calendar, Building2, Video, User, CheckCircle, Clock,
    Filter, Search, X, FileText
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

interface Interview {
    id: number;
    round: number;
    interviewType: string;
    scheduledAt: string;
    meetingLink?: string;
    location?: string;
    jobId: number;
    meetingPerson: string;
    status: string;
    result?: string;
    feedback?: string;
    completedAt?: string;
    jobTitle: string;
    companyName: string;
    applicationStatus: string;
    applicationId: number;
}

const MyInterView = () => {
    const { token } = useAuthStore();
    const router = useRouter();

    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 6;

    // Filters
    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        interviewType: "all",
        dateFrom: "",
        dateTo: "",
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile filter drawer

    const fetchInterviews = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const res = await axios.get("https://api.careerkendra.com/api/v1/auth/my-interviews", {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit },
            });

            if (res.data?.success) {
                const apiData = res.data.data.data || [];
                console.log("apiData",apiData)

                const flattened: Interview[] = apiData.flatMap((app: any) =>
                    (app.interviews || []).map((interview: any) => ({
                        ...interview,
                        jobId: app.job?.id || 0,
                        documentUploaded: app.documentUploaded || false,
                        jobTitle: app.job?.jobTitle || "",
                        companyName: app.job?.company?.companyName || "",
                        applicationStatus: app.status || "",
                        applicationId: app.id,
                    }))
                );

                setInterviews(flattened);
                setTotalPages(res.data.data.totalPages || 1);
                setTotalItems(res.data.data.total || 0);
            }
        } catch (error) {
            console.error("Fetch interviews error:", error);
        } finally {
            setLoading(false);
        }
    }, [token, limit]);

    useEffect(() => {
        if (token) fetchInterviews(currentPage);
    }, [token, currentPage, fetchInterviews]);

    // Frontend Filtering
    const filteredInterviews = useMemo(() => {
        return interviews.filter((interview) => {
            const matchesSearch =
                !filters.search ||
                interview.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
                interview.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
                interview.meetingPerson.toLowerCase().includes(filters.search.toLowerCase());

            const matchesStatus = filters.status === "all" || interview.status === filters.status;
            const matchesType = filters.interviewType === "all" || interview.interviewType === filters.interviewType;

            const interviewDate = new Date(interview.scheduledAt);
            const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

            const matchesDate =
                (!fromDate || interviewDate >= fromDate) &&
                (!toDate || interviewDate <= toDate);

            return matchesSearch && matchesStatus && matchesType && matchesDate;
        });
    }, [interviews, filters]);

    const getMeetingStatus = (scheduledAt: string) => {
        const now = new Date();
        const interviewTime = new Date(scheduledAt);
        const fiveMinBefore = new Date(interviewTime.getTime() - 5 * 60 * 1000);

        const timeLeft = interviewTime.getTime() - now.getTime();
        const isJoinable = now >= fiveMinBefore && now <= interviewTime;
        const isUpcoming = now < fiveMinBefore;

        return {
            isJoinable,
            isUpcoming,
            timeLeftMs: Math.max(0, timeLeft),
            minutesLeft: Math.ceil(timeLeft / (1000 * 60)),
        };
    };

    const formatCountdown = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: "",
            status: "all",
            interviewType: "all",
            dateFrom: "",
            dateTo: "",
        });
        setCurrentPage(1);
        setIsFilterOpen(false);
    };

    const applyFilters = () => {
        setCurrentPage(1);
        setIsFilterOpen(false);
    };

    // Check if we should show "Submit Documents" button
    const shouldShowSubmitDocuments = (interview: Interview) => {
        return interview.round === 2 && interview.result === "pass" && interview.status === "completed";
    };

    if (loading && interviews.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                Loading interviews...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Interviews</h1>
                <p className="text-gray-500 text-sm md:text-base">
                    Total: {totalItems} interviews
                </p>
            </div>

            {/* Filter Button (Mobile Only) */}
            <div className=" z-[99] relative flex md:hidden mb-6">
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 bg-white border px-5 py-3 rounded-xl shadow-sm text-gray-700 font-medium"
                >
                    <Filter size={20} />
                    Filters
                </button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden z-[999] relative md:block bg-white p-5 rounded-2xl border mb-8 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
                    <Filter size={20} />
                    Filters
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search job, company..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            className="w-full pl-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        className="py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        value={filters.interviewType}
                        onChange={(e) => handleFilterChange("interviewType", e.target.value)}
                        className="py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                    </select>

                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                        className="py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />

                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                        className="py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

                <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Clear all filters
                </button>
            </div>

            {/* Mobile Filter Drawer */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[99] bg-black/50 md:hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[95vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Job, company or interviewer"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange("search", e.target.value)}
                                        className="w-full pl-10 py-3 border rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange("status", e.target.value)}
                                    className="w-full py-3 px-4 border rounded-xl text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Interview Type</label>
                                <select
                                    value={filters.interviewType}
                                    onChange={(e) => handleFilterChange("interviewType", e.target.value)}
                                    className="w-full py-3 px-4 border rounded-xl text-sm"
                                >
                                    <option value="all">All Types</option>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">From Date</label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                                        className="w-full py-3 px-4 border rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600 mb-1 block">To Date</label>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                                        className="w-full py-3 px-4 border rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={clearFilters}
                                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium"
                            >
                                Clear
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview List */}
            {filteredInterviews.length === 0 ? (
                <div className="text-center py-20 bg-white border rounded-2xl">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">No interviews found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredInterviews.map((interview) => {
                        const { isJoinable, isUpcoming, timeLeftMs } = getMeetingStatus(interview.scheduledAt);
                        const isCompleted = interview.status === "completed";
                        const showSubmitDocs = shouldShowSubmitDocuments(interview);

                        return (
                            <div
                                key={interview.id}
                                className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="p-5 md:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                        {/* Main Info */}
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                                                    {interview.jobTitle}
                                                </h3>
                                                <p className="text-gray-600 flex items-center gap-2 mt-1 text-sm md:text-base">
                                                    <Building2 size={18} /> {interview.companyName}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Round • Type</p>
                                                    <p className="font-medium">
                                                        Round {interview.round} • {interview.interviewType.toUpperCase()}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-gray-500">Interviewer</p>
                                                    <p className="font-medium flex items-center gap-2">
                                                        <User size={16} /> {interview.meetingPerson}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-gray-500">Scheduled</p>
                                                    <p className="font-medium text-sm md:text-base">
                                                        {new Date(interview.scheduledAt).toLocaleString("en-IN", {
                                                            dateStyle: "medium",
                                                            timeStyle: "short",
                                                        })}
                                                    </p>
                                                </div>

                                                {interview.location && (
                                                    <div>
                                                    <p className="text-gray-500">Location</p>
                                                    <p className="font-medium flex items-center gap-2">
                                                        <User size={16} /> {interview.location}
                                                    </p>
                                                </div>
                                                )}

                                                <div>
                                                    <p className="text-gray-500">Status</p>
                                                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-medium ${isCompleted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                                        {interview.status.toUpperCase()}
                                                    </span>
                                                    {interview.result && (
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            Result: <span className="font-medium capitalize">{interview.result}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Section */}
                                        <div className="lg:w-80 flex-shrink-0 space-y-4">
                                            {interview.meetingLink && !isCompleted && (
                                                <div className="bg-gray-50 border rounded-xl p-5">
                                                    {isJoinable ? (
                                                        <a
                                                            href={interview.meetingLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-center py-4 rounded-xl transition-all active:scale-95"
                                                        >
                                                            <Video className="inline mr-2" size={22} />
                                                            JOIN MEETING
                                                        </a>
                                                    ) : isUpcoming ? (
                                                        <div className="text-center">
                                                            <p className="text-blue-600 font-medium mb-2">Starts in</p>
                                                            <div className="text-3xl md:text-4xl font-mono font-bold text-blue-700 tabular-nums">
                                                                {formatCountdown(timeLeftMs)}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-2">You can join 5 mins early</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-red-500 text-center font-medium">Meeting time has passed</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Submit Documents Button - Round 2 + Pass */}
                                            {showSubmitDocs && (
                                                <button
                                                    onClick={() => {
                                                        if (interview.documentUploaded) {
                                                            router.push(
                                                                `/upload-documents?jobId=${interview.jobId}&applicationId=${interview.applicationId}&type=status`
                                                            );
                                                        } else {
                                                            router.push(
                                                                `/upload-documents?jobId=${interview.jobId}&applicationId=${interview.applicationId}&type=initial`
                                                            );
                                                        }
                                                    }}
                                                    className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-all active:scale-95 ${interview.documentUploaded
                                                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                                        }`}
                                                >
                                                    <FileText size={20} />

                                                    {interview.documentUploaded
                                                        ? "CHECK DOCUMENT STATUS"
                                                        : "SUBMIT DOCUMENTS"}
                                                </button>
                                            )}

                                            {/* Completed with Result */}
                                            {isCompleted && interview.result && (
                                                <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
                                                    <CheckCircle className="text-green-600 mt-0.5" size={24} />
                                                    <div>
                                                        <p className="font-semibold text-green-700">Interview Completed</p>
                                                        <p className="text-sm text-green-600 mt-1">
                                                            Result: <span className="font-medium capitalize">{interview.result}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Completed with Result */}
                                            {interview.holdReason && (
                                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-start gap-3">
                                                    <CheckCircle className="text-orange-600 mt-0.5" size={24} />
                                                    <div>
                                                        <p className="font-semibold text-orange-700">Interview Hold</p>
                                                        <p className="text-sm text-orange-600 mt-1">
                                                            Reason: <span className="font-medium capitalize">{interview.holdReason}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-6 py-2 font-medium text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyInterView;