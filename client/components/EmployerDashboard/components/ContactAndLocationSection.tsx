"use client";

import { Mail, Phone, Globe, MapPin, Link as LinkIcon } from "lucide-react";

type Props = {
  isEditMode: boolean;
  form: any;
  setForm: (f: any) => void;
  errors: Record<string, string>;
};

export default function ContactAndLocationSection({
  isEditMode,
  form,
  setForm,
  errors,
}: Props) {
  if (!isEditMode) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 text-sm">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
          <MapPin size={18} className="text-amber-600" />
          Contact & Location
        </h2>

        <div className="space-y-4">
          {form.companyEmail && (
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-gray-800 break-all">{form.companyEmail}</p>
              </div>
            </div>
          )}

          {form.companyPhone && (
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-gray-800">{form.companyPhone}</p>
              </div>
            </div>
          )}

          {form.companyWebsite && (
            <div className="flex items-start gap-3">
              <Globe size={16} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Website</p>
                <a
                  href={form.companyWebsite.startsWith("http") ? form.companyWebsite : `https://${form.companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:underline break-all"
                >
                  {form.companyWebsite}
                </a>
              </div>
            </div>
          )}

          {form.fullAddress && (
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-gray-800">{form.fullAddress}</p>
                {form.pincode && <p className="text-xs text-gray-600 mt-0.5">PIN: {form.pincode}</p>}
              </div>
            </div>
          )}

          {form.googleMapsUrl && (
            <div className="flex items-start gap-3">
              <LinkIcon size={16} className="text-amber-600 mt-0.5" />
              <a
                href={form.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline text-sm"
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
        <MapPin size={18} className="text-amber-600" />
        Contact & Location
      </h2>

      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Company Email</label>
            <input
              value={form.companyEmail}
              onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm
                ${errors.companyEmail ? "border-red-400" : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"}`}
              placeholder="contact@company.com"
            />
            {errors.companyEmail && <p className="text-red-600 text-xs mt-1">{errors.companyEmail}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Company Phone</label>
            <input
              value={form.companyPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm({ ...form, companyPhone: val });
              }}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm
                ${errors.companyPhone ? "border-red-400" : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"}`}
              placeholder="9876543210"
            />
            {errors.companyPhone && <p className="text-red-600 text-xs mt-1">{errors.companyPhone}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Website</label>
          <input
            value={form.companyWebsite}
            onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            placeholder="https://www.company.com"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Address</label>
            <textarea
              value={form.fullAddress}
              onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm resize-y"
              placeholder="Street, Area, Landmark..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">PIN Code</label>
              <input
                value={form.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setForm({ ...form, pincode: val });
                }}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm
                  ${errors.pincode ? "border-red-400" : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"}`}
                placeholder="110001"
              />
              {errors.pincode && <p className="text-red-600 text-xs mt-1">{errors.pincode}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Google Maps Link</label>
              <input
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}