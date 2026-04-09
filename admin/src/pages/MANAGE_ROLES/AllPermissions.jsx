import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";

const PermissionModal = ({ isOpen, onClose, permission = null, onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission) {
      setName(permission.name);
    } else {
      setName("");
    }
  }, [permission]);

  const handleSave = async () => {
    if (!name.trim()) {
      return Swal.fire("Error", "Permission name is required", "error");
    }

    setLoading(true);
    try {
      if (permission) {
        await api.put(`/ad/update-permission/${permission.id}`, { name: name.trim() });
        Swal.fire("Success", "Permission updated successfully", "success");
      } else {
        await api.post("/ad/create-permission", { name: name.trim() });
        Swal.fire("Success", "Permission created successfully", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || "Action failed";
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {permission ? "Edit Permission" : "Create New Permission"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permission Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. user.create, role.manage"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !name.trim()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition"
            >
              {loading ? "Saving..." : permission ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editPermission, setEditPermission] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8); // Default items per page

  const totalPages = Math.ceil(filtered.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPermissions = filtered.slice(startIndex, endIndex);

  // Fetch Permissions
  const fetchPermissions = async () => {
    try {
      const res = await api.get("/ad/all-permissions");
      setPermissions(res.data.data || []);
      console.log("Fetched permissions:", res.data.data);
      setFiltered(res.data.data || []);
      setCurrentPage(1); // Reset to first page on refresh
    } catch (err) {
      Swal.fire("Error", "Failed to fetch permissions", "error");
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // Search Filter + Reset Page
  useEffect(() => {
    const filteredList = permissions.filter((p) =>
      p.name?.toLowerCase().includes(search?.toLowerCase())
    );
    setFiltered(filteredList);
    setCurrentPage(1); // Reset to page 1 when search changes
  }, [search, permissions]);

  // Modal Handlers
  const openCreate = () => {
    setEditPermission(null);
    setModalOpen(true);
  };

  const openEdit = (perm) => {
    setEditPermission(perm);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchPermissions();
  };

  // Delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This permission will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/ad/delete-permission/${id}`);
        Swal.fire("Deleted!", "Permission has been deleted.", "success");
        fetchPermissions();
      } catch (err) {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  // Pagination Handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Permissions Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage system permissions</p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition shadow-sm"
        >
          <Plus size={20} />
          Create Permission
        </button>
      </div>

      {/* Search & Limit Selector */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search permissions..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Show</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={8}>8</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Permission Name</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedPermissions.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-20 text-gray-500 dark:text-gray-400">
                    No permissions found
                  </td>
                </tr>
              ) : (
                paginatedPermissions.map((perm, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                    <td className="px-6 py-5 text-gray-500 dark:text-gray-400">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">{perm.name}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={() => openEdit(perm)}
                          className="text-emerald-600 hover:text-emerald-700 transition"
                          title="Edit"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(perm.id)}
                          className="text-red-600 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-900/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft size={18} /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <PermissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        permission={editPermission}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default AllPermissions;