import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import Swal from "sweetalert2";
import { Search, Edit2, Trash2, Plus, Eye } from "lucide-react";

const Organization = () => {
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [formData, setFormData] = useState({
    id: null,
    position: "",
    status: "active",
    image: null,
    imagePreview: null,
  });

  // Fetch all data (Pagination & Filter on frontend)
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/organization-logo");
      setOrganizations(res.data.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load organizations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter on frontend
  const filteredData = organizations
    .filter((item) =>
      item.position?.toString().includes(search) ||
      (item.status && item.status.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  // Auto assign next position for new entry
  const getNextPosition = () => {
    if (filteredData.length === 0) return 1;
    const maxPos = Math.max(...filteredData.map((item) => item.position || 0));
    return maxPos + 1;
  };

  // Open Create Modal
  const openCreate = () => {
    setModalMode("create");
    setFormData({
      id: null,
      position: getNextPosition(),
      status: "active",
      image: null,
      imagePreview: null,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const openEdit = (item) => {
    const cleanImage = item.image?.replace("https://api.careerkendra.com/https://", "https://") || "";

    setModalMode("edit");
    setFormData({
      id: item.id,
      position: item.position || "",
      status: item.status || "active",
      image: null,
      imagePreview: cleanImage,
    });
    setShowModal(true);
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Save / Update
  const handleSave = async () => {
    if (!formData.position) {
      Swal.fire("Warning", "Position is required", "warning");
      return;
    }

    try {
      const form = new FormData();
      form.append("position", formData.position);
      form.append("status", formData.status);

      if (formData.image) {
        form.append("image", formData.image);
      }

      if (modalMode === "edit" && formData.id) {
        await api.put(`/organization-logo/${formData.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Organization logo updated successfully", "success");
      } else {
        await api.post("/organization-logo", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Organization logo created successfully", "success");
      }

      setShowModal(false);
      fetchData();
    } catch (error) {
      Swal.fire("Error", "Operation failed", "error");
    }
  };

  // Delete
  const handleDelete = async (id, position) => {
    const result = await Swal.fire({
      title: `Delete Position ${position}?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/organization-logo/${id}`);
      Swal.fire("Deleted!", "Logo deleted successfully", "success");
      fetchData();
    } catch (error) {
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  // Toggle Status
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      await api.put(`/organization-logo/${id}`, { status: newStatus });
      Swal.fire("Updated", `Status changed to ${newStatus}`, "success");
      fetchData();
    } catch (error) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Organization Logos</h1>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          <Plus size={20} />
          Add New Logo
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by position or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-black"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left font-medium text-gray-600">Image</th>
              <th className="px-6 py-4 text-left font-medium text-gray-600">Position</th>
              <th className="px-6 py-4 text-center font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 text-center font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => {
                const cleanImage = item.image?.replace("https://api.careerkendra.com/https://", "https://") || "";

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <img
                        src={cleanImage}
                        alt={`Position ${item.position}`}
                        className="w-20 h-20 object-cover rounded-xl border"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/80?text=No+Image")}
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-lg">{item.position}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(item.id, item.status)}
                        className={`px-5 py-1.5 rounded-full text-sm font-medium transition ${
                          item.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {item.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.position)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="py-20 text-center text-gray-500">
                  No organization logos found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
              {modalMode === "create" ? "Add New Logo" : "Edit Logo"}
            </h2>

            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block font-medium mb-2">Logo Image</label>
                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-2xl border mb-4"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block font-medium mb-2">Position</label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: parseInt(e.target.value) })
                  }
                  className="w-full border border-gray-300 rounded-xl p-4"
                  min="1"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl p-4"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-900"
              >
                {modalMode === "create" ? "Create" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organization;