import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import api from "../../utils/api";
import Swal from "sweetalert2";

const CreateAndEditPages = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [pageData, setPageData] = useState({
        title: "",
        slug: "",
        content: "",
        pageType: "custom",
        status: "published",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        canonicalUrl: "",
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Auto-generate slug from title
    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    };

    const handleTitleChange = (e) => {
        const value = e.target.value;
        setPageData((prev) => ({
            ...prev,
            title: value,
            slug: generateSlug(value),
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPageData((prev) => ({ ...prev, [name]: value }));
    };

    // Fetch page for editing
    useEffect(() => {
        if (!id) return;

        const fetchPage = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/pages/${id}`);
                const data = res.data.data || res.data;

                setPageData({
                    title: data.title || "",
                    slug: data.slug || "",
                    content: data.content || "",
                    pageType: data.pageType || "custom",
                    status: data.status || "published",
                    metaTitle: data.metaTitle || "",
                    metaDescription: data.metaDescription || "",
                    metaKeywords: data.metaKeywords || "",
                    ogTitle: data.ogTitle || "",
                    ogDescription: data.ogDescription || "",
                    ogImage: data.ogImage || "",
                    canonicalUrl: data.canonicalUrl || "",
                });
            } catch (err) {
                Swal.fire("Error", "Failed to load page data", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [id]);

    // Save / Update Page
    const savePage = async () => {
        if (!pageData.title || !pageData.slug) {
            Swal.fire("Warning", "Title and Slug are required", "warning");
            return;
        }

        try {
            setSaving(true);

            if (id) {
                // Update
                await api.put(`/pages/${id}`, pageData);
                Swal.fire("Success", "Page updated successfully!", "success");
            } else {
                // Create
                await api.post("/pages", pageData);
                Swal.fire("Success", "Page created successfully!", "success");
            }

            navigate("/cms/pages");
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.message || "Failed to save page",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center">Loading page data...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">
                    {id ? "Edit Page" : "Create New Page"}
                </h2>
                <button
                    onClick={() => navigate("/cms/pages")}
                    className="text-gray-600 hover:text-black"
                >
                    ← Back to Pages
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Title & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium mb-2">Page Title</label>
                            <input
                                name="title"
                                value={pageData.title}
                                onChange={handleTitleChange}
                                className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:border-black"
                                placeholder="e.g. Privacy Policy"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-2">Slug</label>
                            <input
                                name="slug"
                                value={pageData.slug}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl p-4 font-mono"
                                placeholder="privacy-policy"
                            />
                        </div>
                    </div>

                    {/* Page Type & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium mb-2">Page Type</label>
                            <select
                                name="pageType"
                                value={pageData.pageType}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl p-4"
                            >
                                <option value="terms">Terms & Conditions</option>
                                <option value="privacy">Privacy Policy</option>
                                <option value="disclaimer">Disclaimer</option>
                                <option value="about">About Us</option>
                                <option value="contact">Contact</option>
                                <option value="custom">Custom Page</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Status</label>
                            <select
                                name="status"
                                value={pageData.status}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl p-4"
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

               
                    {/* Content Editor */}
                    <div>
                        <label className="block font-medium mb-2">Page Content</label>

                        <div className="border border-gray-300 rounded-2xl overflow-hidden">
                            <JoditEditor
                                value={pageData.content}
                                onBlur={(newContent) =>
                                    setPageData((prev) => ({ ...prev, content: newContent }))
                                }
                                config={{
                                    height: 500,
                                    placeholder: "Write your page content here...",

                                    askBeforePasteHTML: false,
                                    askBeforePasteFromWord: false,

                                    pasteHTMLActionList: [
                                        { value: "insert_clear_html", text: "Keep Clean HTML" },
                                        { value: "insert_as_html", text: "Keep HTML" }
                                    ],

                                    defaultActionOnPaste: "insert_as_html",

                                    cleanHTML: {
                                        removeEmptyElements: false
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* SEO Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <h3 className="font-semibold mb-6 text-lg">SEO Settings</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Meta Title</label>
                                <input
                                    name="metaTitle"
                                    value={pageData.metaTitle}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3"
                                    placeholder="Meta Title for SEO"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Meta Description</label>
                                <textarea
                                    name="metaDescription"
                                    value={pageData.metaDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-xl p-3"
                                    placeholder="Short description for search engines"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Meta Keywords</label>
                                <input
                                    name="metaKeywords"
                                    value={pageData.metaKeywords}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3"
                                    placeholder="keyword1, keyword2, keyword3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">OG Title</label>
                                <input
                                    name="ogTitle"
                                    value={pageData.ogTitle}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">OG Description</label>
                                <textarea
                                    name="ogDescription"
                                    value={pageData.ogDescription}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-xl p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">OG Image URL</label>
                                <input
                                    name="ogImage"
                                    value={pageData.ogImage}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3"
                                    placeholder="/uploads/seo/image.png"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Canonical URL</label>
                                <input
                                    name="canonicalUrl"
                                    value={pageData.canonicalUrl}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl p-3"
                                    placeholder="https://yoursite.com/page-slug"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-12 flex justify-end">
                <button
                    onClick={savePage}
                    disabled={saving}
                    className="bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white px-12 py-4 rounded-2xl text-lg font-semibold transition"
                >
                    {saving ? "Saving..." : id ? "Update Page" : "Create Page"}
                </button>
            </div>
        </div>
    );
};

export default CreateAndEditPages;