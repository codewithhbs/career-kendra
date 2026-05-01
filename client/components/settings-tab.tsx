"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Briefcase,
  Save,
  X,
  AlertTriangle,
  Plus,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  Eye,
  Upload,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { API_URL, IMAGE_URL } from "@/constant/api";
import { useAuthStore } from "@/store/auth.store";
import Swal from "sweetalert2";

interface ExperienceEntry {
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  salary?: string;
  description?: string;
}

interface EducationEntry {
  degree: string;
  institute: string;
  startYear: string;
  endYear: string;
  grade?: string;
  description?: string;
}

interface ProfessionalFormData {
  headline: string;
  noExperience: boolean;
  skills: string[];
  experience: ExperienceEntry[];
  educations: EducationEntry[];
}

const safeArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function ProfileSettings() {
  const { token, profile, getProfile } = useAuthStore();

  const [basic, setBasic] = useState({
    userName: "",
    emailAddress: "",
    contactNumber: "",
    area: "", // add this
    location: "", // add this
  });

  const [pro, setPro] = useState<ProfessionalFormData>({
    headline: "",
    noExperience: false,
    skills: [],
    experience: [],
    educations: [],
  });

  const [completion, setCompletion] = useState(20);
  const [saving, setSaving] = useState(false);

  // Profile Image
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // CV Upload
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [cvUploading, setCvUploading] = useState(false);

  // Accordion states
  const [isBasicOpen, setIsBasicOpen] = useState(true);
  const [isCoreProOpen, setIsCoreProOpen] = useState(true);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setBasic({
      userName: profile.user?.userName || "",
      emailAddress: profile.user?.emailAddress || "",
      contactNumber: profile.user?.contactNumber || "",
      area: profile.user?.area || "", // add this
      location: profile.user?.location || "", // add this
    });

    if (profile?.profileImage) {
      setProfileImagePreview(`${IMAGE_URL}${profile.profileImage}`);
    }

    setPro({
      headline: profile.headline || "",
      noExperience: profile.noExperince === 1,
      skills: safeArray(profile.skills),
      experience: safeArray(profile.experience),
      educations: safeArray(profile.educations),
    });

    setCompletion(profile.percentageOfAccountComplete ?? 20);
  }, [profile]);

  // ─── Handlers ────────────────────────────────────────
  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasic((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Profile Image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire("Invalid", "Please select an image file", "warning");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Too large", "Image must be under 2MB", "warning");
      return;
    }
    setSelectedImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const uploadProfileImage = async () => {
    if (!selectedImageFile || !token) return;
    setSaving(true);
    const formData = new FormData();
    formData.append("profileImage", selectedImageFile);

    try {
      await axios.put(`${API_URL}/auth/update-profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Success", "Profile photo updated", "success", { timer: 1800 });
      setSelectedImageFile(null);
      getProfile(); // refresh profile
    } catch {
      Swal.fire("Error", "Failed to upload photo", "error");
    } finally {
      setSaving(false);
    }
  };

  // CV Upload
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      Swal.fire("Invalid", "Please select a PDF file", "warning");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Too large", "CV must be under 5MB", "warning");
      return;
    }
    setSelectedCvFile(file);
  };

  const uploadCv = async () => {
    if (!selectedCvFile || !token) return;
    setCvUploading(true);
    const formData = new FormData();
    formData.append("cv", selectedCvFile);

    try {
      await axios.put(`${API_URL}/auth/update-cv`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Success", "CV uploaded successfully", "success", {
        timer: 1800,
      });
      setSelectedCvFile(null);
      getProfile(); // refresh to show new uploadedCv
    } catch {
      Swal.fire("Error", "Failed to upload CV", "error");
    } finally {
      setCvUploading(false);
    }
  };

  const viewCv = () => {
    if (profile?.user?.uploadedCv) {
      window.open(`${IMAGE_URL}${profile.user.uploadedCv}`, "_blank");
    }
  };

  // Other handlers (experience, education, etc.) remain unchanged...
  // ────────────────────────────────────────────────────────────────
  const handleProChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPro((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleFresher = () => {
    setPro((prev) => ({
      ...prev,
      noExperience: !prev.noExperience,
      experience: prev.noExperience ? prev.experience : [],
    }));
  };

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !e.currentTarget.value.trim()) return;
    const skill = e.currentTarget.value.trim();
    if (pro.skills.includes(skill) || pro.skills.length >= 50) return;
    setPro((p) => ({ ...p, skills: [...p.skills, skill] }));
    e.currentTarget.value = "";
  };

  const removeSkill = (skill: string) => {
    setPro((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  };

  const addExperience = () => {
    setPro((p) => ({
      ...p,
      experience: [
        ...p.experience,
        { position: "", company: "", startDate: "", endDate: "" },
      ],
    }));
    setIsExperienceOpen(true);
  };

  const updateExp = (idx: number, field: keyof ExperienceEntry, val: string) =>
    setPro((p) => {
      const list = [...p.experience];
      list[idx] = { ...list[idx], [field]: val };
      return { ...p, experience: list };
    });

  const removeExp = (idx: number) =>
    setPro((p) => ({
      ...p,
      experience: p.experience.filter((_, i) => i !== idx),
    }));

  const addEducation = () => {
    setPro((p) => ({
      ...p,
      educations: [
        ...p.educations,
        { degree: "", institute: "", startYear: "", endYear: "" },
      ],
    }));
    setIsEducationOpen(true);
  };

  const updateEdu = (idx: number, field: keyof EducationEntry, val: string) =>
    setPro((p) => {
      const list = [...p.educations];
      list[idx] = { ...list[idx], [field]: val };
      return { ...p, educations: list };
    });

  const removeEdu = (idx: number) =>
    setPro((p) => ({
      ...p,
      educations: p.educations.filter((_, i) => i !== idx),
    }));

  const saveBasic = async () => {
    if (!token || !basic.userName.trim() || !basic.emailAddress.trim()) {
      Swal.fire("Required", "Name & Email are required", "warning");
      return;
    }
    setSaving(true);
    // console.log("basic",basic)
    try {
      await axios.put(`${API_URL}/auth/update-details`, basic, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        title: "Saved",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });
      getProfile();
    } catch {
      Swal.fire("Error", "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveProfessional = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        headline: pro.headline.trim(),
        skills: pro.skills,
        experience: pro.noExperience ? [] : pro.experience,
        educations: pro.educations,
        noExperience: pro.noExperience ? 1 : 0,
      };
      const res = await axios.put(
        `${API_URL}/auth/update-profile-details`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data?.data?.percentageOfAccountComplete !== undefined) {
        setCompletion(res.data.data.percentageOfAccountComplete);
      }
      Swal.fire({
        title: "Updated",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });
      getProfile();
    } catch {
      Swal.fire("Error", "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const triggerProfileImageInput = () => profileImageInputRef.current?.click();
  const triggerCvInput = () => cvInputRef.current?.click();

  return (
    <div className="w-full mx-auto py-3 px-4 sm:px-6 space-y-7">
      {/* Basic Information - Accordion */}
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <button
          onClick={() => setIsBasicOpen(!isBasicOpen)}
          className="w-full flex justify-between items-center px-5 py-3.5 bg-gray-50 hover:bg-gray-100 text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <User size={20} className="text-amber-600" />
            <span className="font-semibold text-gray-800">
              Basic Information
            </span>
          </div>
          {isBasicOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isBasicOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-5 sm:p-6 pt-2 space-y-7">
            {/* Profile Photo + CV Upload Row */}
            <div className="grid sm:grid-cols-2 gap-6 pb-6 border-b">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 shadow-sm">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera size={32} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={triggerProfileImageInput}
                      className="absolute -bottom-1 -right-1 bg-amber-600 text-white p-2 rounded-full shadow-lg hover:bg-amber-700 ring-2 ring-white"
                      disabled={saving}
                    >
                      <Camera size={16} />
                    </button>
                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      JPG, PNG or WebP • Max 2 MB
                    </p>
                    {selectedImageFile && (
                      <button
                        onClick={uploadProfileImage}
                        disabled={saving}
                        className="mt-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md flex items-center gap-2 disabled:opacity-60"
                      >
                        <Save size={14} />
                        Upload Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CV Upload */}
              {/* CV Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Resume / CV
                </label>
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <FileText className="w-8 h-8 text-amber-600" />
                  </div>

                  <div className="flex-1">
                    {profile?.user?.uploadedCv ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle2 size={18} />
                            <span className="font-medium">CV Uploaded</span>
                          </div>
                          <button
                            onClick={viewCv}
                            className="text-amber-600 hover:text-amber-800 text-sm flex items-center gap-1"
                          >
                            <Eye size={16} />
                            View CV
                          </button>
                        </div>

                        {/* Update CV option */}
                        <button
                          onClick={triggerCvInput}
                          disabled={saving || cvUploading}
                          className="text-sm text-amber-700 hover:text-amber-900 flex items-center gap-1.5"
                        >
                          <Upload size={14} />
                          Update / Replace CV
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Upload PDF • Max 5MB
                      </p>
                    )}

                    <input
                      ref={cvInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleCvChange}
                      className="hidden"
                    />

                    {selectedCvFile && (
                      <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
                        <span className="text-sm text-gray-700 truncate max-w-[220px]">
                          {selectedCvFile.name}
                        </span>
                        <button
                          onClick={uploadCv}
                          disabled={cvUploading || saving}
                          className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md flex items-center gap-2 disabled:opacity-60"
                        >
                          <Upload size={14} />
                          {cvUploading ? "Uploading..." : "Upload CV"}
                        </button>
                      </div>
                    )}

                    {!profile?.user?.uploadedCv && !selectedCvFile && (
                      <button
                        onClick={triggerCvInput}
                        disabled={saving || cvUploading}
                        className="mt-3 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-md flex items-center gap-2 disabled:opacity-60"
                      >
                        <Upload size={14} />
                        Upload CV
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Name, Email, Phone */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Full Name *
                </label>
                <input
                  name="userName"
                  value={basic.userName}
                  onChange={handleBasicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="emailAddress"
                  value={basic.emailAddress}
                  onChange={handleBasicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={basic.contactNumber}
                  onChange={handleBasicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="+91 99999 99999"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Area
                </label>
                <input
                  name="area"
                  value={basic.area}
                  onChange={handleBasicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g. Connaught Place, Dwarka"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Location
                </label>
                <input
                  name="location"
                  value={basic.location}
                  onChange={handleBasicChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g. New Delhi, Mumbai"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveBasic}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-60 transition-colors"
              >
                <Save size={16} />
                Save Basic Info
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Professional Details - Main Container */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2.5 text-gray-800">
            <Briefcase size={20} className="text-amber-600" />
            Professional Details
          </h2>
        </div>

        {/* Core Professional (Headline + Fresher + Skills) - Accordion */}
        <div className="border-b">
          <button
            onClick={() => setIsCoreProOpen(!isCoreProOpen)}
            className="w-full flex justify-between items-center px-5 py-3.5 hover:bg-gray-50 text-left transition-colors"
          >
            <span className="font-medium text-gray-800">Core Profile Info</span>
            {isCoreProOpen ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isCoreProOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-5 sm:p-6 space-y-7">
              {/* Headline */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Professional Headline
                </label>
                <input
                  name="headline"
                  value={pro.headline}
                  onChange={handleProChange}
                  maxLength={220}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
                  placeholder="e.g. Full Stack Developer | React • Node.js • Next.js"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {pro.headline.length}/220
                </p>
              </div>

              {/* Fresher Toggle */}
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 border rounded-md">
                <div>
                  <p className="text-sm font-medium">I am a Fresher</p>
                  <p className="text-xs text-gray-500">
                    No professional work experience yet
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pro.noExperience}
                    onChange={toggleFresher}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-amber-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Skills (press Enter to add)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {pro.skills.map((s) => (
                    <div
                      key={s}
                      className="bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      {s}
                      <X
                        size={13}
                        className="cursor-pointer"
                        onClick={() => removeSkill(s)}
                      />
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="React, TypeScript, AWS, Python..."
                  onKeyDown={addSkill}
                  disabled={pro.skills.length >= 50 || saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-amber-400 disabled:opacity-60"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  {pro.skills.length} / 50
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Accordion */}
        {!pro.noExperience && (
          <div className="border-b">
            <button
              onClick={() => setIsExperienceOpen(!isExperienceOpen)}
              className="w-full flex justify-between items-center px-5 py-3.5 hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase size={18} className="text-amber-600" />
                <span className="font-medium text-gray-800">
                  Experience{" "}
                  {pro.experience.length > 0 && `(${pro.experience.length})`}
                </span>
              </div>
              {isExperienceOpen ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>

            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isExperienceOpen
                  ? "max-h-[3000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-5 sm:p-6 pt-2">
                <div className="flex justify-end mb-5">
                  <button
                    onClick={addExperience}
                    disabled={saving}
                    className="text-sm flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-800 rounded-md hover:bg-amber-100 disabled:opacity-60"
                  >
                    <Plus size={16} /> Add Experience
                  </button>
                </div>

                {pro.experience.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8 italic">
                    No experience entries yet
                  </p>
                ) : (
                  pro.experience.map((exp, i) => (
                    <div
                      key={i}
                      className="border rounded-md p-5 mb-6 bg-gray-50 relative"
                    >
                      <button
                        onClick={() => removeExp(i)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
                        disabled={saving}
                      >
                        <X size={18} />
                      </button>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5">
                            Position *
                          </label>
                          <input
                            value={exp.position}
                            onChange={(e) =>
                              updateExp(i, "position", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5">
                            Company *
                          </label>
                          <input
                            value={exp.company}
                            onChange={(e) =>
                              updateExp(i, "company", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            placeholder="Tech Solutions"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5">
                            Start Date *
                          </label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) =>
                              updateExp(i, "startDate", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={exp.endDate === "Present" ? "" : exp.endDate}
                            onChange={(e) =>
                              updateExp(
                                i,
                                "endDate",
                                e.target.value || "Present",
                              )
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs text-gray-600 mb-1.5">
                            Salary (optional)
                          </label>
                          <input
                            value={exp.salary || ""}
                            onChange={(e) =>
                              updateExp(i, "salary", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            placeholder="12 LPA / ₹15,00,000"
                          />
                        </div>
                      </div>

                      <div className="mt-5">
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Description
                        </label>
                        <textarea
                          value={exp.description || ""}
                          onChange={(e) =>
                            updateExp(i, "description", e.target.value)
                          }
                          rows={3}
                          className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                          placeholder="Key responsibilities, achievements..."
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Education Accordion */}
        <div>
          <button
            onClick={() => setIsEducationOpen(!isEducationOpen)}
            className="w-full flex justify-between items-center px-5 py-3.5 hover:bg-gray-50 text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen size={18} className="text-amber-600" />
              <span className="font-medium text-gray-800">
                Education{" "}
                {pro.educations.length > 0 && `(${pro.educations.length})`}
              </span>
            </div>
            {isEducationOpen ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isEducationOpen
                ? "max-h-[3000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-5 sm:p-6 pt-2">
              <div className="flex justify-end mb-5">
                <button
                  onClick={addEducation}
                  disabled={saving}
                  className="text-sm flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-800 rounded-md hover:bg-amber-100 disabled:opacity-60"
                >
                  <Plus size={16} /> Add Education
                </button>
              </div>

              {pro.educations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8 italic">
                  No education entries yet
                </p>
              ) : (
                pro.educations.map((edu, i) => (
                  <div
                    key={i}
                    className="border rounded-md p-5 mb-6 bg-gray-50 relative"
                  >
                    <button
                      onClick={() => removeEdu(i)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
                      disabled={saving}
                    >
                      <X size={18} />
                    </button>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Degree / Course *
                        </label>
                        <input
                          value={edu.degree}
                          onChange={(e) =>
                            updateEdu(i, "degree", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="B.Tech Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Institute *
                        </label>
                        <input
                          value={edu.institute}
                          onChange={(e) =>
                            updateEdu(i, "institute", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="Delhi Technological University"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Start Year *
                        </label>
                        <input
                          type="number"
                          value={edu.startYear}
                          onChange={(e) =>
                            updateEdu(i, "startYear", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="2019"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Passing Year *
                        </label>
                        <input
                          type="number"
                          value={edu.endYear}
                          onChange={(e) =>
                            updateEdu(i, "endYear", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="2023"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Grade / CGPA / Percentage (optional)
                        </label>
                        <input
                          value={edu.grade || ""}
                          onChange={(e) =>
                            updateEdu(i, "grade", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="8.7 CGPA / 87%"
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="block text-xs text-gray-600 mb-1.5">
                        Description / Projects
                      </label>
                      <textarea
                        value={edu.description || ""}
                        onChange={(e) =>
                          updateEdu(i, "description", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                        placeholder="Relevant projects, thesis, achievements..."
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Save Professional */}
        <div className="p-5 sm:p-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={saveProfessional}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 disabled:opacity-60 transition-colors"
          >
            <Save size={16} />
            Save Professional Details
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/60 border border-red-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-red-900 mb-1">
              Delete Account
            </h3>
            <p className="text-sm text-red-800 mb-4">
              This action is permanent and cannot be undone.
            </p>
            <button className="px-5 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors">
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
