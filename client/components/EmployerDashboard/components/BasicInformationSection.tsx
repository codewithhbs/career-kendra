"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Calendar, Users, Building2 } from "lucide-react";

type Props = {
  isEditMode: boolean;
  form: any;
  setForm: (f: any) => void;
  errors: Record<string, string>;
  industries: string[];
};

export default function BasicInformationSection({
  isEditMode,
  form,
  setForm,
  errors,
  industries,
}: Props) {
  if (!isEditMode) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 text-sm">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
          <FileText size={18} className="text-amber-600" />
          Basic Information
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText size={16} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Company Name</p>
              <p className="font-medium text-gray-800">{form.companyName || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText size={16} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Tagline</p>
              <p className="text-gray-700">{form.companyTagline || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 size={16} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Industry</p>
              <p className="font-medium text-gray-800">{form.companyCategory || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users size={16} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Company Size</p>
              <p className="font-medium text-gray-800">{form.companySize || "—"}</p>
            </div>
          </div>

          {form.foundedYear && (
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Founded Year</p>
                <p className="font-medium text-gray-800">{form.foundedYear}</p>
              </div>
            </div>
          )}

          {(form.GST || form.PAN) && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100">
              {form.GST && (
                <div>
                  <p className="text-xs text-gray-500">GSTIN</p>
                  <p className="font-medium text-gray-800 uppercase">{form.GST}</p>
                </div>
              )}
              {form.PAN && (
                <div>
                  <p className="text-xs text-gray-500">PAN</p>
                  <p className="font-medium text-gray-800 uppercase">{form.PAN}</p>
                </div>
              )}
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
        <FileText size={18} className="text-amber-600" />
        Basic Information
      </h2>

      <div className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm
              ${errors.companyName ? "border-red-400" : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"}`}
            placeholder="Your company name"
          />
          {errors.companyName && <p className="text-red-600 text-xs mt-1">{errors.companyName}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Tagline</label>
          <input
            value={form.companyTagline}
            onChange={(e) => setForm({ ...form, companyTagline: e.target.value })}
            maxLength={120}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            placeholder="Short catchy description"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Industry</label>
            <Select
              value={form.companyCategory}
              onValueChange={(v) => setForm({ ...form, companyCategory: v })}
            >
              <SelectTrigger className="h-10 rounded-lg text-sm">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Company Size</label>
            <Select
              value={form.companySize}
              onValueChange={(v) => setForm({ ...form, companySize: v })}
            >
              <SelectTrigger className="h-10 rounded-lg text-sm">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1–10 employees</SelectItem>
                <SelectItem value="11-50">11–50 employees</SelectItem>
                <SelectItem value="51-200">51–200 employees</SelectItem>
                <SelectItem value="201-500">201–500 employees</SelectItem>
                <SelectItem value="501-1000">501–1,000 employees</SelectItem>
                <SelectItem value="1001+">1,001+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">GSTIN</label>
            <input
              value={form.GST}
              onChange={(e) => setForm({ ...form, GST: e.target.value.toUpperCase() })}
              className={`w-full px-3.5 py-2.5 rounded-lg border uppercase text-sm
                ${errors.GST ? "border-red-400" : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"}`}
              placeholder="22AAAAA0000A1Z5"
            />
            {errors.GST && <p className="text-red-600 text-xs mt-1">{errors.GST}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">PAN</label>
            <input
              value={form.PAN}
              onChange={(e) => setForm({ ...form, PAN: e.target.value.toUpperCase() })}
              className={`w-full px-3.5 py-2.5 rounded-lg border uppercase text-sm
                ${errors.PAN ? "border-red-400" : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"}`}
              placeholder="ABCDE1234F"
            />
            {errors.PAN && <p className="text-red-600 text-xs mt-1">{errors.PAN}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Founded Year</label>
            <input
              type="number"
              value={form.foundedYear}
              onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm
                ${errors.foundedYear ? "border-red-400" : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"}`}
              placeholder="2018"
            />
            {errors.foundedYear && <p className="text-red-600 text-xs mt-1">{errors.foundedYear}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}