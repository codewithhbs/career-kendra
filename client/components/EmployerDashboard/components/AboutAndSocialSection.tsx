"use client";

import { FileText } from "lucide-react";

type SocialLink = {
  key: string;
  label: string;
  prefix?: string;
};

type Props = {
  isEditMode: boolean;
  form: any;
  setForm: (f: any) => void;
  errors: Record<string, string>;
  socialLinks: SocialLink[];
  company: any;
};

export default function AboutAndSocialSection({
  isEditMode,
  form,
  setForm,
  errors,
  socialLinks,
  company,
}: Props) {
  if (!isEditMode) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6 text-sm">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
          <FileText size={18} className="text-amber-600" />
          About & Social Presence
        </h2>

        <div>
          <p className="text-xs text-gray-500 mb-2">About the Company</p>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {form.description || "No description added yet."}
          </p>
        </div>

        {socialLinks.some((s) => form[s.key]) && (
          <div>
            <p className="text-xs text-gray-500 mb-3">Social Links</p>
            <div className="flex flex-wrap gap-5">
              {socialLinks.map(({ key, label, prefix = "" }) => {
                const url = form[key];
                if (!url) return null;

                const href = key === "whatsappNumber" ? `https://wa.me/${url}` : (url.startsWith("http") ? url : `https://${url}`);

                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:underline text-sm font-medium"
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
        <FileText size={18} className="text-amber-600" />
        About & Social Presence
      </h2>

      <div className="space-y-5 text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">About Company</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder="Tell candidates about your company, culture, mission, values..."
            className={`w-full px-3.5 py-2.5 rounded-lg border resize-y text-sm
              ${errors.description ? "border-red-400" : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"}`}
          />
          {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
        </div>

        <div>
          <p className="text-xs font-medium text-gray-700 mb-3">Social Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialLinks.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={key === "whatsappNumber" ? "919876543210" : "https://..."}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}