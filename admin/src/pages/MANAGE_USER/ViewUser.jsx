import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserHook } from "../../hooks/useUserHook";
import {
    ArrowLeft, Edit3, User, Mail, Phone, FileText,
    Briefcase, GraduationCap, Award
} from "lucide-react";

const BASE_URL = "https://api.careerkendra.com";

const ViewUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: userData, loading } = useUserHook(id);

    const [imageError, setImageError] = useState(false);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                    <p className="mt-4 text-lg font-medium text-gray-600">Loading user profile...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                        <User className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">User Not Found</h2>
                    <p className="mt-2 text-gray-600">This user may have been deleted or does not exist.</p>
                    <button
                        onClick={() => navigate("/all-listed-users")}
                        className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    const basic = userData.user || userData;
    const profile = userData;

    const fullImageUrl = profile?.profileImage
        ? `${BASE_URL}${profile.profileImage}`
        : null;

    const cvUrl = basic?.uploadedCv
        ? `${BASE_URL}${basic.uploadedCv}`
        : null;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT PANEL */}
                <div className="lg:col-span-4 space-y-6">

                    {/* User Card */}
                    <div className="bg-white border rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            {fullImageUrl && !imageError ? (
                                <img
                                    src={fullImageUrl}
                                    alt="profile"
                                    className="h-16 w-16 rounded-lg object-cover border"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
                                    {basic.userName?.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {basic.userName}
                                </h2>
                                <p className="text-sm text-gray-500">{basic.emailAddress}</p>
                                <span
                                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${basic.accountActive
                                            ? "bg-green-100 text-green-600"
                                            : "bg-red-100 text-red-600"
                                        }`}
                                >
                                    {basic.accountActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-600 space-y-1">
                            <p>📞 {basic.contactNumber || "No phone"}</p>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Headline</h3>
                        <p className="text-sm text-gray-600">
                            {profile?.headline || "No headline added"}
                        </p>
                    </div>

                    {/* Skills */}
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Skills</h3>
                        {profile?.skills?.length ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No skills</p>
                        )}
                    </div>

                    {/* CV */}
                    <div className="bg-white border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Resume</h3>
                        {cvUrl ? (
                            <a
                                href={cvUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-indigo-600 hover:underline"
                            >
                                View CV
                            </a>
                        ) : (
                            <p className="text-sm text-gray-400">Not uploaded</p>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Experience */}
                    <div className="bg-white border rounded-xl p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">
                            Experience
                        </h3>

                        {profile?.experience?.length ? (
                            <div className="divide-y">
                                {profile.experience.map((exp, i) => (
                                    <div key={i} className="py-4 flex justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {exp.position}
                                            </p>
                                            <p className="text-sm text-gray-500">{exp.company}</p>
                                            {exp.description && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {exp.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right text-xs text-gray-500">
                                            <p>{exp.startDate} - {exp.endDate || "Present"}</p>
                                            {exp.salary && <p className="mt-1">₹ {exp.salary}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No experience</p>
                        )}
                    </div>

                    {/* Education */}
                    <div className="bg-white border rounded-xl p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">
                            Education
                        </h3>

                        {profile?.educations?.length ? (
                            <div className="divide-y">
                                {profile.educations.map((edu, i) => (
                                    <div key={i} className="py-4 flex justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {edu.degree}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {edu.institute}
                                            </p>
                                            {edu.description && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {edu.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right text-xs text-gray-500">
                                            <p>{edu.startYear} - {edu.endYear}</p>
                                            {edu.grade && (
                                                <p className="mt-1 text-green-600">
                                                    {edu.grade}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No education</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewUser;