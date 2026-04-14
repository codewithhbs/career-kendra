import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  Send,
  FileText,
  Clock,
  Plus,
  X,
  Loader2,
} from "lucide-react";

import {
  JOB_CATEGORIES,
  TIMINGS,
  COMMON_BENEFITS,
  EDUCATION_LEVELS,
} from "../../utils/industries";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [jobId, setJobId] = useState(null);

  // Dynamic input states
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  // Existing states ke saath add karo
  const [sqInput, setSqInput] = useState("");
  const [optionInput, setOptionInput] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("boolean");
  const [newQuestionOptions, setNewQuestionOptions] = useState(["Yes", "No"]);

  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    jobResponsibilities: [],
    jobCategory: "",
    department: "",
    jobType: "full-time",
    workMode: "hybrid",
    shiftType: "day",
    country: "India",
    state: "",
    city: "",
    locationText: "",
    salaryType: "monthly",
    currency: "INR",
    salaryMin: "",
    salaryMax: "",
    salaryNegotiable: false,
    hideSalary: false,
    experienceMin: "0",
    experienceMax: "5",
    openings: "1",
    noticePeriod: "",
    education: "",
    expiryDate: "",
    benefits: [],
    requiredSkills: [],
    jobTags: [],
    applyType: "easy-apply",
    applyEmail: "",
    applyLink: "",
    // New fields
    gender: "any",
    isIncentive: false,
    jobTiming: "",
    workingDays: [],
    screeningQuestions: [],
  });

  // Load Job Data
  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;

      setFetchingJob(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        const job = res.data?.data || res.data;

        if (!job) throw new Error("Job not found");

        setJobId(job.id);

        setFormData({
          jobTitle: job.jobTitle || "",
          jobDescription: job.jobDescription || "",
          jobResponsibilities: Array.isArray(job.jobResponsibilities)
            ? job.jobResponsibilities
            : [],
          jobCategory: job.jobCategory || "",
          department: job.department || "",
          jobType: job.jobType || "full-time",
          workMode: job.workMode || "hybrid",
          shiftType: job.shiftType || "day",
          country: job.country || "India",
          state: job.state || "",
          city: job.city || "",
          locationText: job.locationText || "",
          salaryType: job.salaryType || "monthly",
          currency: job.currency || "INR",
          salaryMin: job.salaryMin ? String(job.salaryMin) : "",
          salaryMax: job.salaryMax ? String(job.salaryMax) : "",
          hideSalary: !!job.hideSalary,
          salaryNegotiable: !!job.salaryNegotiable,
          experienceMin: job.experienceMin ? String(job.experienceMin) : "0",
          experienceMax: job.experienceMax ? String(job.experienceMax) : "5",
          openings: job.openings ? String(job.openings) : "1",
          noticePeriod: job.noticePeriod || "",
          education: job.education || "",
          expiryDate: job.expiryDate ? job.expiryDate.split("T")[0] : "",
          benefits: Array.isArray(job.benefits) ? job.benefits : [],
          requiredSkills: Array.isArray(job.requiredSkills)
            ? job.requiredSkills
            : [],
          jobTags: Array.isArray(job.jobTags) ? job.jobTags : [],
          applyType: job.applyType || "easy-apply",
          applyEmail: job.applyEmail || "",
          applyLink: job.applyLink || "",
          // New fields
          gender: job.gender || "any",
          isIncentive: !!job.isIncentive,
          jobTiming: job.jobTiming || "",
          workingDays: Array.isArray(job.workingDays)
            ? job.workingDays
            : typeof job.workingDays === "string"
              ? JSON.parse(job.workingDays)
              : [],
          screeningQuestions: Array.isArray(job.screeningQuestions)
            ? job.screeningQuestions
            : typeof job.screeningQuestions === "string"
              ? JSON.parse(job.screeningQuestions)
              : [],
        });
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Could not load job details.",
          icon: "error",
        });
        navigate(-1);
      } finally {
        setFetchingJob(false);
      }
    };

    loadJob();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = (field, value, setter) => {
    const trimmed = value.trim();
    if (!trimmed || formData[field].includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }));
    setter("");
  };

  const addResponsibility = () => {
    const trimmed = responsibilityInput.trim();
    if (!trimmed) return;
    setFormData((prev) => ({
      ...prev,
      jobResponsibilities: [...prev.jobResponsibilities, trimmed],
    }));
    setResponsibilityInput("");
  };

  const removeResponsibility = (item) => {
    setFormData((prev) => ({
      ...prev,
      jobResponsibilities: prev.jobResponsibilities.filter((i) => i !== item),
    }));
  };

  const removeItem = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
    }));
  };

  const toggleBenefit = (benefit) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter((b) => b !== benefit)
        : [...prev.benefits, benefit],
    }));
  };

  const toggleWorkingDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const addOption = () => {
    const trimmed = optionInput.trim();
    if (!trimmed || newQuestionOptions.includes(trimmed)) return;

    setNewQuestionOptions((prev) => [...prev, trimmed]);
    setOptionInput("");
  };

  const removeOption = (index) => {
    setNewQuestionOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const addScreeningQuestion = () => {
    const trimmed = sqInput.trim();
    if (!trimmed) return;

    let options = undefined;
    if (
      newQuestionType === "boolean" ||
      newQuestionType === "multiple-choice"
    ) {
      options = [...newQuestionOptions];
    }

    const newQ = {
      id: `q_${Date.now()}`,
      question: trimmed,
      type: newQuestionType,
      options: options,
      required: true,
    };

    setFormData((prev) => ({
      ...prev,
      screeningQuestions: [...prev.screeningQuestions, newQ],
    }));

    // Reset
    setSqInput("");
    setOptionInput("");
    setNewQuestionOptions(["Yes", "No"]);
    setNewQuestionType("boolean");
  };
  const removeScreeningQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.jobTitle.trim()) return "Job title is required";
    if (formData.jobDescription.length < 120)
      return "Description must be at least 120 characters";
    if (formData.requiredSkills.length === 0)
      return "At least one skill is required";
    if (formData.jobResponsibilities.length === 0)
      return "At least one responsibility is required";
    if (Number(formData.openings) < 1) return "At least 1 opening is required";

    if (!formData.hideSalary && !formData.salaryNegotiable) {
      if (!formData.salaryMin || !formData.salaryMax)
        return "Salary range is required";
      if (Number(formData.salaryMax) < Number(formData.salaryMin))
        return "Max salary cannot be less than min";
    }

    if (formData.applyType === "email" && !formData.applyEmail)
      return "Email is required";
    if (formData.applyType === "external-link" && !formData.applyLink)
      return "Link is required";

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Swal.fire({
        title: "Validation Error",
        text: error,
        icon: "warning",
        timer: 2000,
      });
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
      experienceMin: Number(formData.experienceMin) || 0,
      experienceMax: formData.experienceMax
        ? Number(formData.experienceMax)
        : undefined,
      openings: Number(formData.openings) || 1,
      screeningQuestions: formData.screeningQuestions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || undefined,
        required: q.required !== false,
    })),
    };

    try {
      const res = await api.patch(`/jobs/admin-change/${id}/admin`, payload);
      const data = res.data?.data || res.data;

      setJobId(data?.id || Number(id));

      const otpSend = !!data?.isOtpSend || !!res.data?.isOtpSend;

      if (otpSend) {
        Swal.fire({
          icon: "success",
          title: "Job Updated",
          text: "OTP sent to your registered email. Please verify to publish.",
          timer: 2500,
          timerProgressBar: true,
        });
        setShowOtpModal(true);
      } else {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Job updated successfully.",
          timer: 2000,
        });
        navigate(-1);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update job.";
      Swal.fire({ title: "Error", text: msg, icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!jobId || otp.length !== 6) return;
    setOtpLoading(true);
    try {
      await api.post("/jobs/verify-otp", { jobId, otp });
      Swal.fire(
        "Success!",
        "Job updated and published successfully.",
        "success",
      );
      setShowOtpModal(false);
      setOtp("");
      navigate(-1);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Invalid OTP", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!jobId) return;
    setResendLoading(true);
    try {
      await api.post("/jobs/resend-otp", { jobId });
      Swal.fire("Success", "New OTP sent to your email.", "success");
    } catch {
      Swal.fire("Error", "Failed to resend OTP.", "error");
    } finally {
      setResendLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
            <Briefcase className="h-10 w-10 text-blue-600" />
            Edit Job Posting
          </h1>
          <p className="text-gray-600 mt-2">
            Update the details below and save changes
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-10 space-y-12">
          {/* Basic Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Senior MERN Stack Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Job Category
              </label>
              <select
                value={formData.jobCategory}
                onChange={(e) =>
                  handleSelectChange("jobCategory")(e.target.value)
                }
                className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              rows={7}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 resize-y min-h-[180px]"
              placeholder="Describe the role, responsibilities, team, growth opportunities..."
            />
          </div>

          {/* Responsibilities & Skills */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Responsibilities */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                Key Responsibilities <span className="text-red-500">*</span>
              </h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={responsibilityInput}
                  onChange={(e) => setResponsibilityInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addResponsibility()}
                  placeholder="Add a responsibility..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl"
                />
                <button
                  onClick={addResponsibility}
                  disabled={!responsibilityInput.trim()}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.jobResponsibilities.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white px-4 py-2 rounded-full flex items-center gap-2 border text-sm"
                  >
                    {item}
                    <button
                      onClick={() => removeResponsibility(item)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Skills */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-semibold text-lg mb-4">
                Required Skills <span className="text-red-500">*</span>
              </h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    addItem("requiredSkills", skillInput, setSkillInput)
                  }
                  placeholder="e.g. React, Node.js"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl"
                />
                <button
                  onClick={() =>
                    addItem("requiredSkills", skillInput, setSkillInput)
                  }
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.requiredSkills.map((skill) => (
                  <div
                    key={skill}
                    className="bg-white px-4 py-2 rounded-full flex items-center gap-2 border text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => removeItem("requiredSkills", skill)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => handleSelectChange("jobType")(e.target.value)}
                className="w-full px-5 py-3.5 border rounded-2xl"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Work Mode
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => handleSelectChange("workMode")(e.target.value)}
                className="w-full px-5 py-3.5 border rounded-2xl"
              >
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Shift Type
              </label>
              <select
                value={formData.shiftType}
                onChange={(e) =>
                  handleSelectChange("shiftType")(e.target.value)
                }
                className="w-full px-5 py-3.5 border rounded-2xl"
              >
                {TIMINGS.map((t) => (
                  <option key={t} value={t.toLowerCase().replace(" ", "-")}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                No. of Openings <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="openings"
                value={formData.openings}
                onChange={handleInputChange}
                min="1"
                className="w-full px-5 py-3.5 border rounded-2xl"
              />
            </div>
          </div>

          {/* Job Timing + Gender */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Job Timing
              </label>
              <input
                type="text"
                name="jobTiming"
                value={formData.jobTiming}
                onChange={handleInputChange}
                placeholder="e.g. 9:00 AM - 6:00 PM"
                className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Gender Preference
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleSelectChange("gender")(e.target.value)}
                className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Working Days */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Working Days</h3>
            <div className="flex flex-wrap gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWorkingDay(day)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.workingDays.includes(day)
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            {formData.workingDays.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Selected: {formData.workingDays.join(", ")}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-gray-500" />
              <h3 className="font-semibold text-lg">Location</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm mb-2">Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 border rounded-2xl"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">State</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 border rounded-2xl"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 border rounded-2xl"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Display Location</label>
                <input
                  name="locationText"
                  value={formData.locationText}
                  onChange={handleInputChange}
                  placeholder="e.g. Koramangala, Bengaluru"
                  className="w-full px-5 py-3.5 border rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* Salary Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee className="text-gray-500" />
              <h3 className="font-semibold text-lg">Compensation</h3>
            </div>

            <div className="flex flex-wrap gap-6 mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hideSalary}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      hideSalary: e.target.checked,
                      salaryNegotiable: false,
                    }))
                  }
                />
                Hide Salary Range
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.salaryNegotiable}
                  disabled={formData.hideSalary}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      salaryNegotiable: e.target.checked,
                      hideSalary: false,
                    }))
                  }
                />
                Negotiable / Competitive
              </label>
              {/* isIncentive */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isIncentive}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      isIncentive: e.target.checked,
                    }))
                  }
                />
                Includes Incentive / Variable Pay
              </label>
            </div>

            {!formData.hideSalary && !formData.salaryNegotiable && (
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm mb-2">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      handleSelectChange("currency")(e.target.value)
                    }
                    className="w-full px-5 py-3.5 border rounded-2xl"
                  >
                    <option value="INR">INR ₹</option>
                    <option value="USD">USD $</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Min Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Max Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 border rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Salary Type</label>
                  <select
                    value={formData.salaryType}
                    onChange={(e) =>
                      handleSelectChange("salaryType")(e.target.value)
                    }
                    className="w-full px-5 py-3.5 border rounded-2xl"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Experience, Notice, Education, Expiry */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm mb-2">
                Min Experience (years)
              </label>
              <input
                type="number"
                name="experienceMin"
                value={formData.experienceMin}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 border rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">
                Max Experience (years)
              </label>
              <input
                type="number"
                name="experienceMax"
                value={formData.experienceMax}
                onChange={handleInputChange}
                className="w-full px-5 py-3.5 border rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Notice Period</label>
              <input
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleInputChange}
                placeholder="30 days / Immediate"
                className="w-full px-5 py-3.5 border rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Education</label>
              <select
                value={formData.education}
                onChange={(e) =>
                  handleSelectChange("education")(e.target.value)
                }
                className="w-full px-5 py-3.5 border rounded-2xl"
              >
                <option value="">Select Education</option>
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Benefits & Perks</h3>
            <div className="flex flex-wrap gap-3">
              {COMMON_BENEFITS.map((benefit) => (
                <button
                  key={benefit}
                  type="button"
                  onClick={() => toggleBenefit(benefit)}
                  className={`px-5 py-2 rounded-full text-sm transition-all ${
                    formData.benefits.includes(benefit)
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                  }`}
                >
                  {benefit}
                </button>
              ))}
            </div>
          </div>

          {/* ==================== ADVANCED SCREENING QUESTIONS ==================== */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="font-semibold text-lg mb-1">Screening Questions</h3>
            <p className="text-sm text-gray-500 mb-5">
              Add questions to filter candidates. Support for Yes/No, Multiple
              Choice & Long Answer.
            </p>

            {/* Add New Question Form */}
            <div className="bg-white p-5 rounded-xl border mb-6">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-7">
                  <label className="block text-sm font-medium mb-2">
                    Question
                  </label>
                  <input
                    type="text"
                    value={sqInput}
                    onChange={(e) => setSqInput(e.target.value)}
                    placeholder="e.g. Do you have experience with React.js?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option value="boolean">Yes / No</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="text">Long Answer (Text)</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={addScreeningQuestion}
                    disabled={!sqInput.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>
              </div>

              {/* Options Input - Only for Boolean & Multiple Choice */}
              {(newQuestionType === "boolean" ||
                newQuestionType === "multiple-choice") && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Options
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addOption()}
                      placeholder="Add option (e.g. Yes, No, 1-2 years)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl"
                    />
                    <button
                      onClick={addOption}
                      className="px-6 bg-gray-700 hover:bg-gray-800 text-white rounded-xl"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {newQuestionOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm flex items-center gap-2"
                      >
                        {opt}
                        <button
                          onClick={() => removeOption(idx)}
                          className="text-blue-600 hover:text-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Added Questions List */}
            {formData.screeningQuestions.length > 0 && (
              <div className="space-y-4">
                {formData.screeningQuestions.map((q, i) => (
                  <div
                    key={q.id || i}
                    className="bg-white p-5 rounded-xl border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            Q{i + 1}
                          </span>
                          <p className="font-medium text-gray-800">
                            {q.question}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: <span className="capitalize">{q.type}</span>
                          {q.required && (
                            <span className="text-red-500 ml-2">
                              • Required
                            </span>
                          )}
                        </p>

                        {q.options && q.options.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {q.options.map((opt, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-100 px-3 py-1 rounded-full"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeScreeningQuestion(i)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Apply Type */}
          <div>
            <h3 className="font-semibold text-lg mb-4">
              How Candidates Should Apply
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  id: "easy-apply",
                  label: "Easy Apply (on platform)",
                  icon: Send,
                },
                // { id: "external-link", label: "External Link", icon: FileText },
                // { id: "email", label: "Email Application", icon: Clock },
              ].map(({ id, label, icon: Icon }) => (
                <div
                  key={id}
                  onClick={() => setFormData((p) => ({ ...p, applyType: id }))}
                  className={`border-2 p-5 rounded-2xl cursor-pointer transition-all ${formData.applyType === id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <Icon className="h-6 w-6 mb-3 text-blue-600" />
                  <div className="font-medium">{label}</div>
                </div>
              ))}
            </div>

            {formData.applyType === "external-link" && (
              <div className="mt-6">
                <label className="block text-sm mb-2">
                  External Application Link
                </label>
                <input
                  name="applyLink"
                  value={formData.applyLink}
                  onChange={handleInputChange}
                  placeholder="https://"
                  className="w-full px-5 py-3.5 border rounded-2xl"
                />
              </div>
            )}

            {formData.applyType === "email" && (
              <div className="mt-6">
                <label className="block text-sm mb-2">Application Email</label>
                <input
                  name="applyEmail"
                  value={formData.applyEmail}
                  onChange={handleInputChange}
                  placeholder="careers@company.com"
                  className="w-full px-5 py-3.5 border rounded-2xl"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-8 border-t">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-2xl flex items-center gap-3 text-lg shadow-lg shadow-blue-200"
            >
              {loading && <Loader2 className="animate-spin" />}
              Update Job
            </button>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">Verify Job Update</h2>
            <p className="text-gray-600 mb-8">
              Enter the 6-digit OTP sent to your registered email
            </p>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center text-4xl tracking-[12px] font-mono border-2 border-gray-300 rounded-2xl py-5 focus:outline-none focus:border-blue-600"
              placeholder="______"
            />

            <div className="flex gap-4 mt-10">
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="flex-1 py-4 border border-gray-300 rounded-2xl hover:bg-gray-50 font-medium"
              >
                Resend OTP
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length !== 6}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-70 font-medium"
              >
                {otpLoading ? "Verifying..." : "Verify & Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditJob;
