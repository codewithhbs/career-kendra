import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import { ArrowLeft, Upload, Save } from "lucide-react";

const EditCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get(`/ad/company/${id}`);
        const data = res.data?.data || res.data;
        setForm(data);
        if (data.companyLogo) setLogoPreview(data.companyLogo);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load company",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (form[key] !== undefined && key !== "companyLogo") {
        formData.append(key, form[key]);
      }
    });

    if (logoFile) {
      formData.append("companyLogo", logoFile);
    }

    try {
      await api.put(`/ad/company/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Company updated successfully",
        timer: 2000,
      });
      navigate("/clients");
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Update failed",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => navigate("/clients")} className="hover:text-gray-800 transition flex items-center gap-1">
            <ArrowLeft size={13} /> Companies
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{form.companyName || "Edit Company"}</span>
          <span>/</span>
          <span className="text-gray-400">Edit</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition"
          >
            <Save size={13} /> Save changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 pt-6 space-y-4">

        <div className="mb-2">
          <h1 className="text-lg font-medium text-gray-900">Edit Company</h1>
          <p className="text-sm text-gray-400 mt-0.5">Update company profile and details</p>
        </div>

        {/* Logo + Basic */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Identity</p>
          <div className="flex items-start gap-5 mb-4">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={18} className="text-gray-300" />
                )}
              </div>
              <label className="mt-2 block text-xs text-center text-blue-500 cursor-pointer hover:text-blue-700">
                Change
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Company name</label>
                <input name="companyName" value={form.companyName || ""} onChange={handleChange} placeholder="Acme Inc." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tagline</label>
                <input name="companyTagline" value={form.companyTagline || ""} onChange={handleChange} placeholder="Your tagline here" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                <input name="companyCategory" value={form.companyCategory || ""} onChange={handleChange} placeholder="IT Services" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Founded year</label>
                <input type="number" name="foundedYear" value={form.foundedYear || ""} onChange={handleChange} placeholder="2020" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Company size</label>
                <select name="companySize" value={form.companySize || ""} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition">
                  <option value="">Select size</option>
                  {["1-10","11-50","51-200","201-500","501-1000","1000+"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Website</label>
                <input name="companyWebsite" value={form.companyWebsite || ""} onChange={handleChange} placeholder="https://example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea name="description" value={form.description || ""} onChange={handleChange} rows={3} placeholder="Tell us about the company..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition resize-none" />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Contact</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input type="email" name="companyEmail" value={form.companyEmail || ""} onChange={handleChange} placeholder="company@email.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phone</label>
              <input name="companyPhone" value={form.companyPhone || ""} onChange={handleChange} placeholder="+91 9999999999" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">WhatsApp</label>
              <input name="whatsappNumber" value={form.whatsappNumber || ""} onChange={handleChange} placeholder="+91 9999999999" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Address</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Full address</label>
              <textarea name="fullAddress" value={form.fullAddress || ""} onChange={handleChange} rows={2} placeholder="Street, building, area" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">City</label>
              <input name="city" value={form.city || ""} onChange={handleChange} placeholder="New Delhi" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">State</label>
              <input name="state" value={form.state || ""} onChange={handleChange} placeholder="Delhi" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Country</label>
              <input name="country" value={form.country || ""} onChange={handleChange} placeholder="India" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pincode</label>
              <input name="pincode" value={form.pincode || ""} onChange={handleChange} placeholder="110001" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Google Maps URL</label>
              <input name="googleMapsUrl" value={form.googleMapsUrl || ""} onChange={handleChange} placeholder="https://maps.google.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Legal</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">GST number</label>
              <input name="GST" value={form.GST || ""} onChange={handleChange} placeholder="27ABCDE1234F2Z5" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">PAN number</label>
              <input name="PAN" value={form.PAN || ""} onChange={handleChange} placeholder="ABCDE1234F" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition" />
            </div>
          </div>
        </div>

        {/* Social Links */}

<div className="bg-white border border-gray-200 rounded-xl p-5">
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
    Social Links
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {[
      { label: "LinkedIn", name: "linkedinUrl" },
      { label: "Facebook", name: "facebookUrl" },
      { label: "Instagram", name: "instagramUrl" },
      { label: "Twitter / X", name: "twitterUrl" },
      { label: "YouTube", name: "youtubeUrl" },
      { label: "GitHub", name: "githubUrl" },
    ].map(({ label, name }) => (
      <div key={name}>
        <label className="block text-xs text-gray-400 mb-1">
          {label}
        </label>

        <input
          name={name}
          value={
            form[name] && form[name] !== "null"
              ? form[name]
              : ""
          }
          onChange={handleChange}
          placeholder="https://"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 transition"
        />
      </div>
    ))}
  </div>
</div>

        {/* Employer — read only */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Employer <span className="normal-case font-normal text-gray-300 ml-1">(read only)</span></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Name</p>
              <p className="text-sm text-gray-700 mt-0.5">{form?.employer?.employerName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm text-gray-700 mt-0.5">{form?.employer?.employerEmail || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm text-gray-700 mt-0.5">{form?.employer?.employerContactNumber || "—"}</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-2 pt-2 pb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm px-5 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition"
          >
            <Save size={13} /> Save changes
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditCompany;