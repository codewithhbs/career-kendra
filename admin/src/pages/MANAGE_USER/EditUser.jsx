import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { useUserHook } from "../../hooks/useUserHook";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refetch, loading: userDetailsLoading } = useUserHook(id);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        userName: "",
        contactNumber: "",
        emailAddress: "",
        headline: "",
        noExperience: 0,
        skills: [],
        experience: [],
        educations: [],
    });

    useEffect(() => {
        if (user) {
            const basic = user.user || user;
            setForm({
                userName: basic.userName || "",
                contactNumber: basic.contactNumber || "",
                emailAddress: basic.emailAddress || "",
                headline: user.headline || "",
                noExperience: user.noExperince || 0,
                skills: user.skills || [],
                experience: user.experience || [],
                educations: user.educations || [],
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSkillsChange = (e) => {
        setForm((prev) => ({ ...prev, skills: e.target.value.split(",").map((s) => s.trim()) }));
    };

    // Experience handlers
    const handleExpChange = (index, field, value) => {
        const updated = [...form.experience];
        updated[index] = { ...updated[index], [field]: value };
        setForm((prev) => ({ ...prev, experience: updated }));
    };

    const addExperience = () => {
        setForm((prev) => ({
            ...prev,
            experience: [...prev.experience, { position: "", company: "", startDate: "", endDate: "", salary: "", description: "" }],
        }));
    };

    const removeExperience = (index) => {
        setForm((prev) => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
    };

    // Education handlers
    const handleEduChange = (index, field, value) => {
        const updated = [...form.educations];
        updated[index] = { ...updated[index], [field]: value };
        setForm((prev) => ({ ...prev, educations: updated }));
    };

    const addEducation = () => {
        setForm((prev) => ({
            ...prev,
            educations: [...prev.educations, { degree: "", institute: "", startYear: "", endYear: "", grade: "", description: "" }],
        }));
    };

    const removeEducation = (index) => {
        setForm((prev) => ({ ...prev, educations: prev.educations.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put(`/ad/update-details/${id}`, {
                userId: id,
                ...form,
                noExperience: Number(form.noExperience),
            });
            toast.success("User updated successfully");
            navigate(`/view-user/${id}`);
        } catch (err) {
            console.error(err);
            //   toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition";
    const labelCls = "block text-xs font-medium text-gray-500 mb-1";
    const sectionCls = "bg-white border border-gray-200 rounded-xl p-5";

    if (userDetailsLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-800 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">

            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={() => navigate("/all-listed-users")} className="hover:text-gray-800 transition">Users</button>
                    <span>/</span>
                    <button onClick={() => navigate(`/view-user/${id}`)} className="hover:text-gray-800 transition">{form.userName || "User"}</button>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">Edit</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(`/users`)}
                        className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="text-sm px-4 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 pt-6 space-y-4">

                {/* Page Title */}
                <div className="mb-2">
                    <h1 className="text-lg font-medium text-gray-900">Edit User</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Update profile information and details</p>
                </div>

                {/* Basic Info */}
                <div className={sectionCls}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Basic Info</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelCls}>Full name</label>
                            <input name="userName" value={form.userName} onChange={handleChange} placeholder="John Doe" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Email address</label>
                            <input name="emailAddress" value={form.emailAddress} onChange={handleChange} placeholder="john@example.com" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Contact number</label>
                            <input name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="+91 9999999999" className={inputCls} />
                        </div>
                    </div>
                </div>

                {/* Profile Info */}
                <div className={sectionCls}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Profile</p>
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Headline</label>
                            <input name="headline" value={form.headline} onChange={handleChange} placeholder="e.g. Full Stack Developer" className={inputCls} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Skills <span className="text-gray-400 font-normal">(comma separated)</span></label>
                                <input
                                    value={form.skills.join(", ")}
                                    onChange={handleSkillsChange}
                                    placeholder="React, Node.js, TypeScript"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Years of experience</label>
                                <input
                                    type="number"
                                    name="noExperience"
                                    value={form.noExperience}
                                    onChange={handleChange}
                                    min={0}
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Experience */}
                <div className={sectionCls}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Experience</p>
                        <button
                            type="button"
                            onClick={addExperience}
                            className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                        >
                            <Plus size={12} /> Add
                        </button>
                    </div>

                    {form.experience.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No experience added yet</p>
                    )}

                    <div className="space-y-4">
                        {form.experience.map((exp, i) => (
                            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative">
                                <button
                                    type="button"
                                    onClick={() => removeExperience(i)}
                                    className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className={labelCls}>Position</label>
                                        <input value={exp.position} onChange={(e) => handleExpChange(i, "position", e.target.value)} placeholder="Software Engineer" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Company</label>
                                        <input value={exp.company} onChange={(e) => handleExpChange(i, "company", e.target.value)} placeholder="Acme Corp" className={inputCls} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <label className={labelCls}>Start date</label>
                                        <input type="month" value={exp.startDate} onChange={(e) => handleExpChange(i, "startDate", e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>End date <span className="text-gray-400 font-normal">(leave blank if current)</span></label>
                                        <input type="month" value={exp.endDate} onChange={(e) => handleExpChange(i, "endDate", e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Salary</label>
                                        <input value={exp.salary} onChange={(e) => handleExpChange(i, "salary", e.target.value)} placeholder="12 LPA" className={inputCls} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Description</label>
                                    <textarea
                                        value={exp.description}
                                        onChange={(e) => handleExpChange(i, "description", e.target.value)}
                                        placeholder="Briefly describe your role..."
                                        rows={2}
                                        className={`${inputCls} resize-none`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education */}
                <div className={sectionCls}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Education</p>
                        <button
                            type="button"
                            onClick={addEducation}
                            className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                        >
                            <Plus size={12} /> Add
                        </button>
                    </div>

                    {form.educations.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No education added yet</p>
                    )}

                    <div className="space-y-4">
                        {form.educations.map((edu, i) => (
                            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50 relative">
                                <button
                                    type="button"
                                    onClick={() => removeEducation(i)}
                                    className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className={labelCls}>Degree</label>
                                        <input value={edu.degree} onChange={(e) => handleEduChange(i, "degree", e.target.value)} placeholder="B.Tech" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Institute</label>
                                        <input value={edu.institute} onChange={(e) => handleEduChange(i, "institute", e.target.value)} placeholder="Delhi Technological University" className={inputCls} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <label className={labelCls}>Start year</label>
                                        <input type="number" value={edu.startYear} onChange={(e) => handleEduChange(i, "startYear", e.target.value)} placeholder="2020" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>End year</label>
                                        <input type="number" value={edu.endYear} onChange={(e) => handleEduChange(i, "endYear", e.target.value)} placeholder="2024" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Grade / GPA</label>
                                        <input value={edu.grade} onChange={(e) => handleEduChange(i, "grade", e.target.value)} placeholder="8.7 CGPA" className={inputCls} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Description</label>
                                    <textarea
                                        value={edu.description}
                                        onChange={(e) => handleEduChange(i, "description", e.target.value)}
                                        placeholder="Any additional details..."
                                        rows={2}
                                        className={`${inputCls} resize-none`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Submit */}
                <div className="flex justify-end gap-2 pt-2 pb-8">
                    <button
                        type="button"
                        onClick={() => navigate(`/view-user/${id}`)}
                        className="text-sm px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="text-sm px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditUser;