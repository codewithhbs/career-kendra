import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import api from "../../utils/api";
import Swal from "sweetalert2";

const CreateAndEditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState({
    id: null,
    title: "",
    slug: "",
    shortDescription: "",
    longDescription: "",
    metaTitle: "",
    metaKeywords: "",
    status: "active",
    position: 1,
    tags: [],
    comments: [],
    reviews: {
      totalReviews: 0,
      averageRating: 0,
      items: [],
    },
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [newComment, setNewComment] = useState({
    message: "",
    commentedBy: "",
  });
  const [newReview, setNewReview] = useState({
    reviewer: "",
    rating: 5,
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch service
  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        const data = res.data.data || res.data;

        setService({
          id: data.id,
          title: data.title || "",
          slug: data.slug || "",
          shortDescription: data.shortDescription || "",
          longDescription: data.longDescription || "",
          metaTitle: data.metaTitle || "",
          metaKeywords: data.metaKeywords || "",
          status: data.status || "active",
          position: data.position || 1,
          tags:
            typeof data.tags === "string"
              ? JSON.parse(data.tags)
              : data.tags || [],

          comments:
            typeof data.comments === "string"
              ? JSON.parse(data.comments)
              : data.comments || [],

          reviews:
            typeof data.reviews === "string"
              ? JSON.parse(data.reviews)
              : data.reviews || {
                  totalReviews: 0,
                  averageRating: 0,
                  items: [],
                },
        });

        // Fix broken image URL
        if (data.image) {
          let cleanUrl = data.image;
          if (cleanUrl.includes("https://api.careerkendra.com/https://")) {
            cleanUrl = cleanUrl.replace("https://api.careerkendra.com/", "");
          }
          setImagePreview(cleanUrl);
        }
      } catch (err) {
        Swal.fire("Error", "Failed to load service data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setService((prev) => ({
      ...prev,
      title: value,
      slug: value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-"),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({ ...prev, [name]: value }));
  };

  // Tags Management
  const addTag = () => {
    if (newTag.trim() && !service.tags.includes(newTag.trim())) {
      setService((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tag) => {
    setService((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Image Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ==================== COMMENTS ====================
  const addNewComment = () => {
    if (!newComment.message || !newComment.commentedBy) {
      Swal.fire("Warning", "Please fill both comment fields", "warning");
      return;
    }

    const comment = {
      message: newComment.message,
      commentedBy: newComment.commentedBy,
      status: "published",
    };

    setService((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));

    setNewComment({ message: "", commentedBy: "" });
  };

  const updateCommentStatus = (index, newStatus) => {
    setService((prev) => {
      const updated = [...prev.comments];
      updated[index].status = newStatus;
      return { ...prev, comments: updated };
    });
  };

  const deleteComment = (index) => {
    Swal.fire({
      title: "Delete Comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setService((prev) => ({
          ...prev,
          comments: prev.comments.filter((_, i) => i !== index),
        }));
      }
    });
  };

  // ==================== REVIEWS ====================
  const addNewReview = () => {
    if (!newReview.reviewer || !newReview.comment) {
      Swal.fire("Warning", "Please fill reviewer name and comment", "warning");
      return;
    }

    const review = {
      reviewer: newReview.reviewer,
      rating: parseInt(newReview.rating),
      comment: newReview.comment,
    };

    setService((prev) => {
      const updatedItems = [...prev.reviews.items, review];
      const totalReviews = updatedItems.length;
      const averageRating =
        updatedItems.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      return {
        ...prev,
        reviews: {
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(1)),
          items: updatedItems,
        },
      };
    });

    setNewReview({ reviewer: "", rating: 5, comment: "" });
  };

  const updateReview = (index, field, value) => {
    setService((prev) => {
      const updatedItems = [...prev.reviews.items];
      updatedItems[index][field] = field === "rating" ? parseInt(value) : value;

      const totalReviews = updatedItems.length;
      const averageRating =
        updatedItems.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      return {
        ...prev,
        reviews: {
          totalReviews,
          averageRating: parseFloat(averageRating.toFixed(1)),
          items: updatedItems,
        },
      };
    });
  };

  const deleteReview = (index) => {
    Swal.fire({
      title: "Delete Review?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setService((prev) => {
          const updatedItems = prev.reviews.items.filter((_, i) => i !== index);
          const totalReviews = updatedItems.length;
          const averageRating =
            totalReviews > 0
              ? parseFloat(
                  (
                    updatedItems.reduce((sum, r) => sum + r.rating, 0) /
                    totalReviews
                  ).toFixed(1),
                )
              : 0;

          return {
            ...prev,
            reviews: { totalReviews, averageRating, items: updatedItems },
          };
        });
      }
    });
  };

  // Save Service
  const saveService = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      Object.keys(service).forEach((key) => {
        if (key === "tags" || key === "comments" || key === "reviews") {
          formData.append(key, JSON.stringify(service[key]));
        } else if (service[key] !== null && service[key] !== undefined) {
          formData.append(key, service[key]);
        }
      });

      if (image) formData.append("image", image);

      if (id) {
        await api.put(`/services/${service.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Service updated successfully!", "success");
      } else {
        await api.post(`/services`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Service created successfully!", "success");
      }

      navigate("/cms/services");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to save service",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-xl">Loading service data...</div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">
          {id ? "Edit Service" : "Create New Service"}
        </h2>
        <button
          onClick={() => navigate("/cms/services")}
          className="text-gray-600 hover:text-black"
        >
          ← Back
        </button>
      </div>

      {/* Main Form + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Title</label>
              <input
                value={service.title}
                onChange={handleTitleChange}
                className="w-full border border-gray-300 rounded-xl p-4"
                placeholder="Service Title"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Slug</label>
              <input
                name="slug"
                value={service.slug}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-4"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">Short Description</label>
            <textarea
              name="shortDescription"
              value={service.shortDescription}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-xl p-4"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Long Description</label>
            <JoditEditor
              value={service.longDescription}
              onBlur={(newContent) =>
                setService((prev) => ({ ...prev, longDescription: newContent }))
              }
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium mb-2">Tags</label>
            <div className="flex gap-3">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="flex-1 border border-gray-300 rounded-xl p-4"
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <button
                onClick={addTag}
                className="bg-black text-white px-8 rounded-xl"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {service.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-5 py-2 rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-red-600 text-xl"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <label className="block font-medium mb-3">Service Image</label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="w-full h-64 object-cover rounded-2xl border mb-4"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2">Meta Title</label>
              <input
                name="metaTitle"
                value={service.metaTitle}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-4"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Meta Keywords</label>
              <input
                name="metaKeywords"
                value={service.metaKeywords}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Position</label>
              <input
                type="number"
                name="position"
                value={service.position}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-4"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Status</label>
              <select
                name="status"
                value={service.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-4"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== COMMENTS SECTION ==================== */}
      {id && (
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6">Manage Comments</h3>

          {/* Add New Comment */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <h4 className="font-medium mb-4">Add New Comment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                placeholder="Comment Message"
                value={newComment.message}
                onChange={(e) =>
                  setNewComment({ ...newComment, message: e.target.value })
                }
                className="border p-4 rounded-xl"
              />
              <input
                placeholder="Commented By (Name)"
                value={newComment.commentedBy}
                onChange={(e) =>
                  setNewComment({ ...newComment, commentedBy: e.target.value })
                }
                className="border p-4 rounded-xl"
              />
            </div>
            <button
              onClick={addNewComment}
              className="bg-black text-white px-8 py-3 rounded-xl"
            >
              Add Comment
            </button>
          </div>

          {/* List of Comments */}
          <div className="space-y-6">
            {service.comments.map((comment, index) => (
              <div key={index} className="border rounded-2xl p-6 bg-white">
                <p className="italic text-lg">"{comment.message}"</p>
                <p className="mt-3 text-gray-600">— {comment.commentedBy}</p>

                <div className="flex items-center gap-4 mt-6">
                  <select
                    value={comment.status}
                    onChange={(e) => updateCommentStatus(index, e.target.value)}
                    className="border p-3 rounded-lg"
                  >
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                  <button
                    onClick={() => deleteComment(index)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== REVIEWS SECTION ==================== */}
      {id && (
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6">
            Manage Reviews ({service.reviews.averageRating} ★)
          </h3>

          {/* Add New Review */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <h4 className="font-medium mb-4">Add New Review</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Reviewer Name"
                value={newReview.reviewer}
                onChange={(e) =>
                  setNewReview({ ...newReview, reviewer: e.target.value })
                }
                className="border p-4 rounded-xl"
              />
              <select
                value={newReview.rating}
                onChange={(e) =>
                  setNewReview({ ...newReview, rating: e.target.value })
                }
                className="border p-4 rounded-xl"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} Stars
                  </option>
                ))}
              </select>
              <input
                placeholder="Review Comment"
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                className="border p-4 rounded-xl"
              />
            </div>
            <button
              onClick={addNewReview}
              className="mt-4 bg-black text-white px-8 py-3 rounded-xl"
            >
              Add Review
            </button>
          </div>

          {/* List of Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.reviews.items.map((review, index) => (
              <div key={index} className="border rounded-2xl p-6 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <select
                    value={review.rating}
                    onChange={(e) =>
                      updateReview(index, "rating", e.target.value)
                    }
                    className="border p-2 rounded-lg text-xl"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {"★".repeat(n)}
                      </option>
                    ))}
                  </select>
                  <input
                    value={review.reviewer}
                    onChange={(e) =>
                      updateReview(index, "reviewer", e.target.value)
                    }
                    className="flex-1 border p-3 rounded-lg"
                  />
                </div>
                <textarea
                  value={review.comment}
                  onChange={(e) =>
                    updateReview(index, "comment", e.target.value)
                  }
                  className="w-full border p-4 rounded-xl min-h-[100px]"
                />
                <button
                  onClick={() => deleteReview(index)}
                  className="mt-4 text-red-600 hover:text-red-700"
                >
                  Delete Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-16 flex justify-end">
        <button
          onClick={saveService}
          disabled={saving}
          className="bg-black hover:bg-gray-900 text-white px-12 py-4 rounded-2xl text-lg font-semibold disabled:opacity-70"
        >
          {saving
            ? "Saving Changes..."
            : id
              ? "Update Service"
              : "Create Service"}
        </button>
      </div>
    </div>
  );
};

export default CreateAndEditService;
