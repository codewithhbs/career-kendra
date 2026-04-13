import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  DollarSign,
  Briefcase,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  Layers,
  TrendingUp,
  X,
  ArrowUpDown,
  BadgeCheck,
  AlertCircle,
  Timer,
  Apple,
  UploadCloudIcon,
} from "lucide-react";
import Modal from "../../components/Model";
import { getUserRole } from "../../utils/getRole";
import useAuthStore from "../../store/useAuthStore";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "under-verification": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    reject: "bg-red-50 text-red-700 ring-1 ring-red-200",
    closed: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  };
  const icons = {
    active: <BadgeCheck size={12} />,
    "under-verification": <Timer size={12} />,
    rejected: <AlertCircle size={12} />,
    closed: <XCircle size={12} />,
  };
  return (
    <span
      className={`inline-flex capitalize items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}
    >
      {icons[status]}
      {status?.replace(/-/g, " ")}
    </span>
  );
};

// ─── View Drawer ──────────────────────────────────────────────────────────────
const JobDrawer = ({ job, onClose }) => {
  if (!job) return null;

  // Calculate days left until expiry
  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft(job.expiryDate);
  const isExpiringSoon = daysLeft <= 7;
  const isExpired = daysLeft <= 0;

  const getDaysColor = () => {
    if (isExpired) return "text-red-600 bg-red-50 border-red-200";
    if (isExpiringSoon) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 py-6 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-slate-400 text-xs font-medium tracking-widest mb-1">
                JOB DETAILS
              </p>
              <h2 className="text-2xl font-semibold tracking-tight truncate">
                {job.jobTitle}
              </h2>
              <p className="text-slate-300 text-sm mt-2 flex items-center gap-2">
                <Building2 size={16} />
                {job.company?.companyName || "N/A"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* Status & Tags */}
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge status={job.status} />
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium">
              <Layers size={13} /> {job.jobType}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium">
              <Briefcase size={13} /> {job.workMode}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium">
              <Clock size={13} /> {job.shiftType}
            </span>
          </div>

          {/* Days Left - Prominent */}
          <div
            className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-medium ${getDaysColor()}`}
          >
            {isExpired ? (
              "Expired"
            ) : (
              <>
                <span>{daysLeft}</span>
                <span className="text-xs opacity-75">days left</span>
              </>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 text-sm">
          {/* Quick Stats - Compact Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs">
                <DollarSign size={14} /> Salary
              </div>
              <p className="font-semibold text-slate-900">
                ₹{job.salaryMin?.toLocaleString()} – ₹
                {job.salaryMax?.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{job.salaryType}</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs">
                <TrendingUp size={14} /> Experience
              </div>
              <p className="font-semibold text-slate-900">
                {job.experienceMin}–{job.experienceMax} years
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {job.openings} opening{job.openings > 1 ? "s" : ""}
              </p>
            </div>

            <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs">
                <MapPin size={14} /> Location
              </div>
              <p className="font-medium text-slate-900">
                {job.locationText || `${job.city}, ${job.state}`}
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-slate-700 font-semibold mb-3 text-sm tracking-tight">
              Job Description
            </h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[13px]">
              {job.jobDescription}
            </p>
          </div>

          <div>
            <h3 className="text-slate-700 font-semibold mb-3 text-sm tracking-tight">
              Work Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <p className="text-xs text-slate-500">Working Days</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {job.workingDays?.join(", ") || "N/A"}
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <p className="text-xs text-slate-500">Job Timing</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {job.jobTiming || "N/A"}
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <p className="text-xs text-slate-500">Gender</p>
                <p className="font-medium text-slate-800 mt-0.5 capitalize">
                  {job.gender || "Any"}
                </p>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4">
                <p className="text-xs text-slate-500">Incentive</p>
                <p className="font-medium text-slate-800 mt-0.5">
                  {job.isIncentive ? "Available" : "Not Available"}
                </p>
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          {job.jobResponsibilities?.length > 0 && (
            <div>
              <h3 className="text-slate-700 font-semibold mb-3 text-sm tracking-tight">
                Key Responsibilities
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-[13px]">
                {job.jobResponsibilities.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Info - 2-column grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <p className="text-xs text-slate-500">Education</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {job.education || "Not specified"}
              </p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <p className="text-xs text-slate-500">Notice Period</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {job.noticePeriod || "N/A"}
              </p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <p className="text-xs text-slate-500">Category</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {job.jobCategory}
              </p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <p className="text-xs text-slate-500">Openings</p>
              <p className="font-medium text-slate-800 mt-0.5">
                {job.openings}
              </p>
            </div>
          </div>

          {/* Apply Details */}
          <div>
            <h3 className="text-slate-700 font-semibold mb-3 text-sm tracking-tight">
              How to Apply
            </h3>
            <div className="bg-slate-50 rounded-2xl p-5 space-y-3 text-[13px]">
              <p>
                <span className="font-medium text-slate-500">Apply Type:</span>{" "}
                {job.applyType}
              </p>
              {job.applyEmail && (
                <p>
                  <span className="font-medium text-slate-500">Email:</span>{" "}
                  {job.applyEmail}
                </p>
              )}
              {job.applyLink && (
                <p>
                  <span className="font-medium text-slate-500">Link:</span>{" "}
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Apply Now →
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Skills & Benefits */}
          {job.requiredSkills?.length > 0 && (
            <div>
              <h3 className="text-slate-700 font-semibold mb-3 text-sm tracking-tight">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full ring-1 ring-blue-100/70"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.screeningQuestions?.length > 0 && (
            <div>
              <h3 className="text-slate-700 font-semibold mb-3 text-sm tracking-tight">
                Screening Questions
              </h3>

              <div className="space-y-3">
                {job.screeningQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4"
                  >
                    <p className="font-medium text-slate-800 text-sm">
                      {i + 1}. {q.question}
                    </p>

                    {q.options?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {q.options.map((opt, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* <p className="text-xs text-slate-400 mt-2">
                      Type: {q.type}
                    </p> */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {job.benefits?.length > 0 && (
            <div>
              <h3 className="text-slate-700 font-semibold mb-3 text-sm tracking-tight">
                Benefits
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((b, i) => (
                  <span
                    key={i}
                    className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full ring-1 ring-emerald-100/70"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {job?.reasonToReject && (
            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-2xl">
              <div className="flex gap-3">
                <div className="text-red-500 text-2xl mt-0.5">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-700 text-sm">
                    Reason for Rejection
                  </h3>
                  <p className="text-red-600 text-[13px] mt-1 whitespace-pre-wrap">
                    {job.reasonToReject}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Company Info */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-slate-700 font-semibold mb-4 text-sm tracking-tight">
              About the Company
            </h3>
            <div className="text-[13px] text-slate-600 space-y-2">
              <p>
                <span className="text-slate-500">Name:</span>{" "}
                {job.company?.companyName}
              </p>
              <p>
                <span className="text-slate-500">Category:</span>{" "}
                {job.company?.companyCategory}
              </p>
              <p>
                <span className="text-slate-500">Size:</span>{" "}
                {job.company?.companySize}
              </p>
              <p>
                <span className="text-slate-500">Location:</span>{" "}
                {job.company?.fullAddress}
              </p>
              {job.company?.companyWebsite && (
                <a
                  href={job.company.companyWebsite}
                  target="_blank"
                  className="text-blue-600 hover:underline inline-block mt-1"
                >
                  Visit Company Website →
                </a>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
            <p>
              Posted on{" "}
              {new Date(job.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p>
              Expires on{" "}
              {new Date(job.expiryDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  );
};
// ─── Main Component ───────────────────────────────────────────────────────────
export const AllJobs = () => {
  const { status } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRole = getUserRole();
  const isAdmin = userRole.toLowerCase().includes("admin");
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [city, setCity] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("DESC");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/jobs/for-user", {
        params: {
          admin: true,
          ...(!isAdmin && { employeeId: user?.id }),
          page,
          limit,
          search,
          ...(status && { status }),
          jobType,
          workMode,
          shiftType,
          city,
          minSalary,
          maxSalary,
          minExperience,
          maxExperience,
          sortBy,
          order,
        },
      });
      setJobs(res.data.jobs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [
    page,
    limit,
    search,
    status,
    jobType,
    workMode,
    shiftType,
    city,
    minSalary,
    maxSalary,
    minExperience,
    maxExperience,
    sortBy,
    order,
  ]);

  const handle = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleVerify = async (id) => {
    const result = await Swal.fire({
      title: "Verify this job?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Yes, Verify",
    });
    if (!result.isConfirmed) return;
    try {
      await api.put(`/jobs/admin/change-status/${id}`, { status: "active" });
      Swal.fire("Verified!", "Job verified successfully", "success");
      fetchJobs();
    } catch {
      Swal.fire("Error", "Failed to verify job", "error");
    }
  };

  const handleReject = async (id) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Job",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter detailed reason...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#ef4444",
    });

    if (!reason?.trim()) return;

    try {
      await api.put(`/jobs/admin/change-status/${id}`, {
        status: "reject",
        reason: reason.trim(),
      });
      Swal.fire("Rejected", "Job has been rejected", "success");
      fetchJobs();
    } catch {
      Swal.fire("Error", "Failed to reject job", "error");
    }
  };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: `Delete "${title}"?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/jobs/admin/${id}/admin`);
      Swal.fire("Deleted!", "Job has been deleted.", "success");
      fetchJobs();
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "Failed to delete job", "error");
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ad/employees");
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load employees",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (openAssign) fetchEmployees();
  }, [openAssign]);

  const activeFiltersCount = [
    jobType,
    workMode,
    shiftType,
    city,
    minSalary,
    maxSalary,
    minExperience,
    maxExperience,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setJobType("");
    setWorkMode("");
    setShiftType("");
    setCity("");
    setMinSalary("");
    setMaxSalary("");
    setMinExperience("");
    setMaxExperience("");
    setPage(1);
  };

  const handleAssignOpenEmployee = (job) => {
    setSelectedUser(null);
    setOpenAssign(true);
    setSelectedJob(job);
  };
  const handleAssignEmployee = async () => {
    console.log("Assigning job:", selectedJob, "to employee ID:", selectedUser);
    try {
      const res = await api.post(`/job-assign/${selectedJob.id}`, {
        adminEmployeId: selectedUser,
        priority: "medium",
        remarks: "Assigned via admin panel",
      });
      console.log(res);
      Swal.fire("Success", "Job assigned successfully", "success");
      setOpenAssign(false);
      setSelectedUser(null);
      fetchJobs();
    } catch (error) {
      console.error("Failed to assign job:", error);
      Swal.fire("Error", "Failed to assign job", "error");
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Page Header ── */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Admin Panel
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl capitalize font-bold text-slate-900 tracking-tight">
              {status ? `${status.replace(/-/g, " ")} Jobs` : "All Jobs"}
            </h1>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-sm border border-slate-200 bg-white rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Search + Filter Bar ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-4 p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by title, company, city…"
              value={search}
              onChange={handle(setSearch)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <ArrowUpDown
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none cursor-pointer"
              >
                <option value="createdAt">Date</option>
                <option value="jobTitle">Title</option>
                <option value="salaryMin">Salary</option>
              </select>
            </div>
            <select
              value={order}
              onChange={(e) => {
                setOrder(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 appearance-none cursor-pointer"
            >
              <option value="DESC">Newest</option>
              <option value="ASC">Oldest</option>
            </select>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                showFilters || activeFiltersCount > 0
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-white text-slate-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Expanded Filters ── */}
        {showFilters && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-4 p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[
              {
                label: "Job Type",
                value: jobType,
                setter: setJobType,
                options: [
                  ["", "All Types"],
                  ["full-time", "Full Time"],
                  ["part-time", "Part Time"],
                  ["contract", "Contract"],
                  ["internship", "Internship"],
                ],
              },
              {
                label: "Work Mode",
                value: workMode,
                setter: setWorkMode,
                options: [
                  ["", "All Modes"],
                  ["remote", "Remote"],
                  ["hybrid", "Hybrid"],
                  ["onsite", "On-site"],
                ],
              },
              {
                label: "Shift",
                value: shiftType,
                setter: setShiftType,
                options: [
                  ["", "All Shifts"],
                  ["day", "Day"],
                  ["night", "Night"],
                ],
              },
            ].map(({ label, value, setter, options }) => (
              <div key={label}>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  {label}
                </label>
                <select
                  value={value}
                  onChange={handle(setter)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  {options.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={handle(setCity)}
                className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Salary Range (₹)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minSalary}
                  onChange={handle(setMinSalary)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxSalary}
                  onChange={handle(setMaxSalary)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                Experience (yrs)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minExperience}
                  onChange={handle(setMinExperience)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxExperience}
                  onChange={handle(setMaxExperience)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition"
                >
                  <X size={14} /> Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    "Job",
                    "Company",
                    "Location",
                    "Salary",
                    "Exp",
                    "Type",
                    "Status",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/70 ${i === 7 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div
                            className="h-4 bg-slate-100 rounded-lg animate-pulse"
                            style={{ width: `${60 + ((j * 7) % 40)}%` }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-20">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Briefcase size={36} strokeWidth={1.2} />
                        <p className="text-base font-medium">No jobs found</p>
                        <p className="text-sm">
                          Try adjusting your filters or search query
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Job */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {job.jobTitle}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {job.openings} opening{job.openings > 1 ? "s" : ""} ·{" "}
                          {new Date(job.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-slate-500" />
                          </div>
                          <span className="text-sm text-slate-700 font-medium whitespace-nowrap">
                            {job.company?.companyName || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 flex items-center gap-1 whitespace-nowrap">
                          <MapPin size={13} className="text-slate-400" />
                          {job.locationText || job.city}
                        </span>
                      </td>

                      {/* Salary */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-700 whitespace-nowrap">
                          ₹{job.salaryMin?.toLocaleString()} – ₹
                          {job.salaryMax?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">
                          {job.salaryType}
                        </p>
                      </td>

                      {/* Experience */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 whitespace-nowrap">
                          {job.experienceMin}–{job.experienceMax} yrs
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600 capitalize">
                          {job.jobType}
                        </p>
                        <p className="text-xs text-slate-400">{job.workMode}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} />
                      </td>

                      {/* Assigned To */}
                      {/* Assigned To */}
                      {/* <td className="px-4 py-3">
                        {job.assignment ? (
                          <div className="text-sm text-slate-600">
                            <p className="font-medium">{job.assignment.employee?.name}</p>
                            <p className="text-xs text-slate-400">{job.assignment.status}</p>

                            {isAdmin && (
                              <button
                                onClick={() => handleAssignOpenEmployee(job)}
                                className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                              >
                                Change
                              </button>
                            )}
                          </div>
                        ) : (
                          isAdmin && (
                            <button
                              onClick={() => handleAssignOpenEmployee(job)}
                              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                            >
                              Do Assign
                            </button>
                          )
                        )}
                      </td> */}
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewJob(job)}
                            title="View Details"
                            className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => navigate(`/jobs/edit/${job.id}`)}
                            title="Edit Job"
                            className="p-2 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          {job.status === "active" && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(`/jobs/check-applies/${job.id}`)
                                }
                                title="Verify"
                                className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                              >
                                <UploadCloudIcon size={15} />
                              </button>
                            </>
                          )}

                          {job.status === "under-verification" && (
                            <>
                              <button
                                onClick={() => handleVerify(job.id)}
                                title="Verify"
                                className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                onClick={() => handleReject(job.id)}
                                title="Reject"
                                className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(job.id, job.jobTitle)}
                            title="Delete"
                            className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between mt-5 px-1">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={15} /> Prev
            </button>

            <div className="flex gap-1">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition ${
                      page === p
                        ? "bg-slate-800 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Job Detail Drawer ── */}
      <JobDrawer job={viewJob} onClose={() => setViewJob(null)} />
      <Modal
        open={openAssign}
        close={() => {
          setOpenAssign(false);
          setSelectedUser(null);
        }}
        title="Assign Employee To Job"
        items={employees.map((emp) => ({
          label: `${emp.name} ${emp.email ? `(${emp.email})` : ""}`,
          value: emp.id,
        }))}
        selectedValue={selectedUser}
        onSelect={(selectedItem) => {
          setSelectedUser(selectedItem.value);
        }}
        onSubmit={handleAssignEmployee}
        submitText="Assign Job"
        loading={loading}
      />
    </div>
  );
};
