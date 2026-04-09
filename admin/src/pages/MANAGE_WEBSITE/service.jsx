import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import { Search, Edit2, Trash2, Plus, Star, ChevronLeft, ChevronRight } from "lucide-react";

const Services = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 10; // Increased from 5 for better UX

  // Fetch all services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/services");
      setServices(res.data.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      Swal.fire("Error", "Failed to load services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services based on search
  const filteredServices = services.filter((service) =>
    service.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / limit);
  const start = (page - 1) * limit;
  const paginatedServices = filteredServices.slice(start, start + limit);

  // Delete service
  const deleteService = async (id, title) => {
    const result = await Swal.fire({
      title: `Delete "${title}"?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/services/${id}`);
      Swal.fire("Deleted!", "Service has been deleted.", "success");
      fetchServices(); // Refresh list
    } catch (err) {
      Swal.fire("Error", "Failed to delete service", "error");
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Services</h2>
          <p className="text-gray-600 mt-1">Manage your services and offerings</p>
        </div>

        <button
          onClick={() => navigate("/cms/services/create")}
          className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          <Plus size={20} />
          Add New Service
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search services by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-black text-lg"
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Image</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Title</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-600">Rating</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedServices.length > 0 ? (
                  paginatedServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-16 h-16 object-cover rounded-xl border"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/64?text=No+Image";
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{service.title}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-4 py-1.5 text-xs font-medium rounded-full ${
                            service.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500 fill-yellow-500" size={18} />
                          <span className="font-semibold">
                            {service.reviews?.averageRating || 0}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({service.reviews?.totalReviews || 0})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => navigate(`/cms/services/edit/${service.slug || service.id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => deleteService(service.id, service.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                      No services found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 px-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-2 px-5 py-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <span className="text-gray-600 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-5 py-2 border rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Services;