"use client"
import React, { useEffect, useState } from "react"
import api from "../../utils/api"
import Swal from "sweetalert2"

const WebSettings = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [logoPreview, setLogoPreview] = useState(null)
  const [faviconPreview, setFaviconPreview] = useState(null)

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await api.get("/ad/get-web-settings")
      const data = res.data.data || {}

      setSettings(data)

      // Set initial previews
      if (data.siteLogo) setLogoPreview(data.siteLogo)
      if (data.siteFavicon) setFaviconPreview(data.siteFavicon)
    } catch (error) {
      console.error("Error fetching settings:", error)
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not load website settings"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Handle text, number, email, time inputs
  const handleChange = e => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  // Handle checkbox
  const handleCheckboxChange = e => {
    const { name, checked } = e.target
    setSettings(prev => ({ ...prev, [name]: checked }))
  }

  // Handle file upload (Logo & Favicon)
  const handleFileChange = e => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]
      const previewUrl = URL.createObjectURL(file)

      setSettings(prev => ({
        ...prev,
        [name]: file // Store actual File object for upload
      }))

      if (name === "siteLogo") setLogoPreview(previewUrl)
      if (name === "siteFavicon") setFaviconPreview(previewUrl)
    }
  }

  // Update settings - Only send changed/new files
  const updateSettings = async () => {
    try {
      setSaving(true)
      const formData = new FormData()

      Object.keys(settings).forEach(key => {
        const value = settings[key]

        if (value === null || value === undefined) return

        // Only append files if a new File was selected
        if (value instanceof File) {
          formData.append(key, value)
        }
        // Skip preview keys and old string URLs (we only send new files)
        else if (!key.endsWith("Preview") && typeof value !== "object") {
          formData.append(key, String(value))
        }
      })

      await api.put("/ad/update-web-settings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Website settings updated successfully!"
      })

      // Refresh to get latest URLs from backend
      fetchSettings()

      // Clear previews if needed (optional)
      // setLogoPreview(null); setFaviconPreview(null);
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update settings"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-lg">Loading website settings...</div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900">Website Settings</h2>
        <button
          onClick={updateSettings}
          disabled={saving}
          className="bg-black hover:bg-gray-800 text-white px-10 py-3.5 rounded-2xl font-semibold disabled:opacity-50 transition-all"
        >
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">
            Basic Information
          </h3>

          <div>
            <label className="block text-sm font-medium mb-1">Site Name</label>
            <input
              name="siteName"
              value={settings.siteName || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Site Tagline
            </label>
            <input
              name="siteTagline"
              value={settings.siteTagline || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Support Email
            </label>
            <input
              type="email"
              name="supportEmail"
              value={settings.supportEmail || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={settings.contactEmail || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>
        </div>

        {/* Contact & Location */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 border-b pb-3">
            Contact & Location
          </h3>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Phone
            </label>
            <input
              name="contactPhone"
              value={settings.contactPhone || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Number
            </label>
            <input
              name="whatsappNumber"
              value={settings.whatsappNumber || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Full Address
            </label>
            <textarea
              name="address"
              value={settings.address || ""}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                name="country"
                value={settings.country || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                name="city"
                value={settings.city || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                name="state"
                value={settings.state || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input
                name="pincode"
                value={settings.pincode || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-semibold mb-6">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Site Logo */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Site Logo
              </label>
              <div className="flex items-center gap-6">
                {(logoPreview || settings.siteLogo) && (
                  <img
                    src={logoPreview || settings.siteLogo}
                    alt="Logo Preview"
                    className="h-24 w-auto border border-gray-200 rounded-2xl object-contain bg-white p-3 shadow-sm"
                  />
                )}
                <input
                  type="file"
                  name="siteLogo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Recommended size: 200 × 60 px (PNG/SVG)
              </p>
            </div>

            {/* Site Favicon */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Site Favicon
              </label>
              <div className="flex items-center gap-6">
                {(faviconPreview || settings.siteFavicon) && (
                  <img
                    src={faviconPreview || settings.siteFavicon}
                    alt="Favicon Preview"
                    className="h-16 w-16 border border-gray-200 rounded-xl object-contain bg-white p-2 shadow-sm"
                  />
                )}
                <input
                  type="file"
                  name="siteFavicon"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Recommended: 32×32 or 512×512 px (ICO/PNG)
              </p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold border-b pb-3">
            Social Media Links
          </h3>
          {[
            "facebookUrl",
            "twitterUrl",
            "linkedinUrl",
            "instagramUrl",
            "youtubeUrl"
          ].map(field => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field.replace("Url", "")} URL
              </label>
              <input
                name={field}
                value={settings[field] || ""}
                onChange={handleChange}
                placeholder={`https://www.${field.replace("Url", "")}.com/...`}
                className="w-full border border-gray-300 rounded-xl p-4"
              />
            </div>
          ))}
        </div>

        {/* SEO Settings */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold border-b pb-3">SEO Settings</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title</label>
            <input
              name="metaTitle"
              value={settings.metaTitle || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={settings.metaDescription || ""}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Meta Keywords
            </label>
            <input
              name="metaKeywords"
              value={settings.metaKeywords || ""}
              onChange={handleChange}
              placeholder="jobs, hiring, recruitment, career"
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>
        </div>

        {/* Footer & Maintenance */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">
              Footer Text
            </label>
            <textarea
              name="footerText"
              value={settings.footerText || ""}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-2xl p-4"
            />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center gap-4 bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode || false}
              onChange={handleCheckboxChange}
              className="w-6 h-6 accent-black"
            />
            <div>
              <p className="font-semibold text-lg">Maintenance Mode</p>
              <p className="text-gray-600">
                When enabled, visitors will see a maintenance page instead of
                the website.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <button
          onClick={updateSettings}
          disabled={saving}
          className="bg-black text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:bg-gray-800 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}

export default WebSettings
