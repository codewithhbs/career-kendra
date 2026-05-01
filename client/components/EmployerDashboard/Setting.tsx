"use client";

import { useState, useEffect } from "react";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { API_URL } from "@/constant/api";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Mail, Phone, Pencil, X, Check, Loader2 } from "lucide-react";

export default function EmployerProfileUpdate() {
  const { user, token } = useEmployerAuthStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    employerName: "",
    employerEmail: "",
    employerContactNumber: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      employerName: user.employerName || "",
      employerEmail: user.employerEmail || "",
      employerContactNumber: user.employerContactNumber || "",
    });
  }, [user]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.employerName.trim()) errs.employerName = "Name is required";
    if (form.employerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.employerEmail))
      errs.employerEmail = "Invalid email";
    if (form.employerContactNumber && !/^[6-9]\d{9}$/.test(form.employerContactNumber))
      errs.employerContactNumber = "Valid 10-digit Indian number required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user?.id) return;
    setIsSaving(true);
    try {
      await axios.put(
        `${API_URL}/auth-employer/update/${user.id}`,
        {
          employerName: form.employerName.trim(),
          employerEmail: form.employerEmail.trim(),
          employerContactNumber: form.employerContactNumber.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated successfully!");
      setIsEditMode(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setForm({
      employerName: user.employerName || "",
      employerEmail: user.employerEmail || "",
      employerContactNumber: user.employerContactNumber || "",
    });
    setErrors({});
    setIsEditMode(false);
  };

  const fields = [
    { key: "employerName",         label: "Full Name",       icon: User,  type: "text",  placeholder: "Rajesh Kumar" },
    { key: "employerEmail",        label: "Email Address",   icon: Mail,  type: "email", placeholder: "rajesh@company.com" },
    { key: "employerContactNumber",label: "Contact Number",  icon: Phone, type: "tel",   placeholder: "9876543210" },
  ] as const;

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Personal Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your basic employer information</p>
          </div>
          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition-colors"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 px-6 py-5 bg-gray-50/50 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
            {form.employerName?.charAt(0)?.toUpperCase() || "E"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{form.employerName || "—"}</p>
            <p className="text-sm text-gray-500">{user?.role || "employer"}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-5">
          {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <Icon size={12} /> {label}
              </label>

              {isEditMode ? (
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, [key]: e.target.value }));
                    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
                  }}
                  placeholder={placeholder}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white ${
                    errors[key] ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
              ) : (
                <p className="text-sm text-gray-800 py-2.5 px-3.5 bg-gray-50 rounded-xl">
                  {form[key] || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              )}

              {errors[key] && (
                <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}