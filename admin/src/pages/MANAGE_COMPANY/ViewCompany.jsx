import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import {
    ArrowLeft, Edit3, Building2, Mail, Phone, Globe, MapPin,
    Users, Calendar, Trash2, ExternalLink, Briefcase, Hash
} from "lucide-react";

const ViewCompany = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await api.get(`/ad/company/${id}`);
                setCompany(res.data?.data);
            } catch {
                Swal.fire({ icon: "error", title: "Error", text: "Failed to load company details" });
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        if (company.companyStatus === newStatus) return;
        try {
            setStatusLoading(true);
            await api.put(`/ad/company/${id}/status`, { companyStatus: newStatus });
            setCompany((prev) => ({ ...prev, companyStatus: newStatus }));
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Failed to update status" });
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Delete company?",
            text: `This will permanently remove ${company?.companyName}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete",
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/ad/company/${id}`);
            navigate("/companies");
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Failed to delete company" });
        }
    };

    const statusConfig = {
        pending:   { cls: "bg-yellow-50 text-yellow-700 border-yellow-200",   dot: "bg-yellow-400" },
        submitted: { cls: "bg-blue-50 text-blue-700 border-blue-200",         dot: "bg-blue-400" },
        approved:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
        rejected:  { cls: "bg-red-50 text-red-700 border-red-200",            dot: "bg-red-400" },
    };

    const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:border-gray-400";

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-800 border-t-transparent" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Company not found</p>
                    <button onClick={() => navigate("/clients")} className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg">
                        Back to Companies
                    </button>
                </div>
            </div>
        );
    }

    const sc = statusConfig[company.companyStatus] || { cls: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" };
    const socialLinks = [
        { label: "LinkedIn",  url: company.linkedinUrl },
        { label: "Facebook",  url: company.facebookUrl },
        { label: "Instagram", url: company.instagramUrl },
        { label: "Twitter",   url: company.twitterUrl },
        { label: "YouTube",   url: company.youtubeUrl },
        { label: "GitHub",    url: company.githubUrl },
    ].filter((s) => s.url);

    return (
        <div className="min-h-screen bg-gray-50 pb-16">

            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={() => navigate("/clients")} className="hover:text-gray-800 transition flex items-center gap-1">
                        <ArrowLeft size={13} /> Companies
                    </button>
                    <span>/</span>
                    <span className="text-gray-800 font-medium truncate max-w-[180px]">{company.companyName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to={`/clients/edit/${id}`}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        <Edit3 size={13} /> Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition"
                    >
                        <Trash2 size={13} /> Delete
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 pt-6 space-y-4">

                {/* Identity Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        {company.companyLogo ? (
                            <img src={company.companyLogo} alt={company.companyName} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 size={22} className="text-gray-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-base font-medium text-gray-900">{company.companyName}</h1>
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium ${sc.cls}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                                {company.companyStatus}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">{company.companyTagline || "—"}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Mail size={11} /> {company.companyEmail}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone size={11} /> {company.companyPhone}
                            </span>
                            {company.companyWebsite && (
                                <a href={company.companyWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                                    <Globe size={11} /> Website <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Two Column */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

                    {/* Left */}
                    <div className="space-y-4">

                        {/* Status Control */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Change Status</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {["pending", "submitted", "approved", "rejected"].map((s) => {
                                    const cfg = statusConfig[s];
                                    const active = company.companyStatus === s;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusChange(s)}
                                            disabled={statusLoading}
                                            className={`text-xs px-3 py-2 rounded-lg border font-medium capitalize transition ${
                                                active ? cfg.cls : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Employer */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Employer</p>
                            <div className="space-y-2.5">
                                <div>
                                    <p className="text-xs text-gray-400">Name</p>
                                    <p className="text-sm text-gray-800 font-medium">{company.employer?.employerName || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="text-sm text-gray-700">{company.employer?.employerEmail || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Phone</p>
                                    <p className="text-sm text-gray-700">{company.employer?.employerContactNumber || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Role</p>
                                    <p className="text-sm text-gray-700 capitalize">{company.employerRole || "—"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Job Stats */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Jobs</p>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                                    <Briefcase size={16} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xl font-medium text-gray-900">{company.jobCount ?? 0}</p>
                                    <p className="text-xs text-gray-400">Jobs posted</p>
                                </div>
                            </div>
                            {company.lastJobPostedAt && (
                                <p className="text-xs text-gray-400">
                                    Last posted: {new Date(company.lastJobPostedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                            )}
                            <button
                                onClick={() => navigate(`/companies/${id}/jobs`)}
                                className="mt-3 w-full text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1"
                            >
                                <Briefcase size={12} /> View all jobs
                            </button>
                        </div>

                        {/* Legal */}
                        {(company.GST || company.PAN) && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Legal</p>
                                <div className="space-y-2.5">
                                    {company.GST && (
                                        <div>
                                            <p className="text-xs text-gray-400">GST</p>
                                            <p className="text-sm font-mono text-gray-700">{company.GST}</p>
                                        </div>
                                    )}
                                    {company.PAN && (
                                        <div>
                                            <p className="text-xs text-gray-400">PAN</p>
                                            <p className="text-sm font-mono text-gray-700">{company.PAN}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* About */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">About</p>
                          <p className="text-sm text-gray-600 break-words">
  {company.description || company.companyAbout || (
    <span className="italic text-gray-400">No description provided</span>
  )}
</p>
                        </div>

                        {/* Company Info Grid */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Company Info</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Building2 size={10} /> Category</p>
                                    <p className="text-sm text-gray-800 mt-0.5">{company.companyCategory || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Users size={10} /> Size</p>
                                    <p className="text-sm text-gray-800 mt-0.5">{company.companySize || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} /> Founded</p>
                                    <p className="text-sm text-gray-800 mt-0.5">{company.foundedYear || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Hash size={10} /> ID</p>
                                    <p className="text-sm text-gray-800 mt-0.5">{company.id}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-400 flex items-center gap-1"><Globe size={10} /> Website</p>
                                    {company.companyWebsite ? (
                                        <a href={company.companyWebsite} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline mt-0.5 inline-flex items-center gap-1">
                                            {company.companyWebsite} <ExternalLink size={10} />
                                        </a>
                                    ) : <p className="text-sm text-gray-800 mt-0.5">—</p>}
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Address & Contact</p>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-700">{company.fullAddress || "—"}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {[company.city, company.state, company.country, company.pincode].filter(Boolean).join(", ") || "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Phone size={13} className="text-gray-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-700">{company.companyPhone || "—"}</p>
                                        {company.whatsappNumber && (
                                            <p className="text-xs text-gray-400">WhatsApp: {company.whatsappNumber}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Mail size={13} className="text-gray-400 flex-shrink-0" />
                                    <p className="text-sm text-gray-700">{company.companyEmail || "—"}</p>
                                </div>
                                {company.googleMapsUrl && (
                                        <a
                                        href={company.googleMapsUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                    >
                                        <MapPin size={11} /> View on Google Maps <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        {socialLinks.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Social Links</p>
                                <div className="flex flex-wrap gap-2">
                                    {socialLinks.map(({ label, url }) => (
                                            <a
                                            key={label}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                                        >
                                            {label} <ExternalLink size={10} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Meta */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Timestamps</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-400">Created</p>
                                    <p className="text-sm text-gray-700">
                                        {new Date(company.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Last updated</p>
                                    <p className="text-sm text-gray-700">
                                        {new Date(company.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewCompany;