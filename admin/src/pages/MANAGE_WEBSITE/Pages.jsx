import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import { Search, Edit2, Trash2, Eye, Plus, ToggleLeft, ToggleRight } from "lucide-react";

const Pages = () => {
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch all pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pages"); // or "/api/v1/pages" if needed
      setPages(res.data.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load pages", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Filter pages
  const filteredPages = pages.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredPages.length / limit);
  const paginatedPages = filteredPages.slice((page - 1) * limit, page * limit);

  // Toggle Status (Published / Draft)
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";

    try {
      await api.put(`/pages/${id}`, { status: newStatus });

      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Page is now ${newStatus}`,
      });

      fetchPages();
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  // Delete Page
  const deletePage = async (id, title) => {
    const result = await Swal.fire({
      title: `Delete "${title}"?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/pages/${id}`);
      Swal.fire("Deleted!", "Page has been deleted successfully.", "success");
      fetchPages();
    } catch (err) {
      Swal.fire("Error", "Failed to delete page", "error");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Pages</h2>
          <p className="text-gray-600 mt-1">Manage static pages (Terms, Privacy, About, etc.)</p>
        </div>

        <button
          onClick={() => navigate("/cms/pages/create")}
          className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          <Plus size={20} />
          Create New Page
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by title or slug..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-black"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left font-medium text-gray-600">Title</th>
              <th className="px-6 py-4 text-left font-medium text-gray-600">Slug</th>
              <th className="px-6 py-4 text-left font-medium text-gray-600">Type</th>
              <th className="px-6 py-4 text-center font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 text-center font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
                </td>
              </tr>
            ) : paginatedPages.length > 0 ? (
              paginatedPages.map((pageItem) => (
                <tr key={pageItem.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-5 font-medium text-gray-800">{pageItem.title}</td>
                  <td className="px-6 py-5 text-gray-600 font-mono text-sm">{pageItem.slug}</td>
                  <td className="px-6 py-5">
                    <span className="capitalize px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {pageItem.pageType}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => toggleStatus(pageItem.id, pageItem.status)}
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        pageItem.status === "published"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      }`}
                    >
                      {pageItem.status === "published" ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      {pageItem.status}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => window.open(`/${pageItem.slug}`, "_blank")}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Page"
                      >
                        <Eye size={20} />
                      </button>

                      <button
                        onClick={() => navigate(`/cms/pages/edit/${pageItem.id}`)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Edit Page"
                      >
                        <Edit2 size={20} />
                      </button>

                      <button
                        onClick={() => deletePage(pageItem.id, pageItem.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Page"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-gray-500">
                  No pages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8 px-2">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-5 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-5 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Pages;