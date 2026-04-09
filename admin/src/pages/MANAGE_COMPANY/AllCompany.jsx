import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Search, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const AllCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    limit: 10,
    page: 1,
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search,
        limit: filters.limit,
        page: filters.page,
      };
      const res = await api.get("/ad/get-all-compnay", { params });

      if (res.data.success) {
        setCompanies(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCompanies(res.data.total || 0);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load companies",
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === "limit" || name === "search" ? 1 : prev.page,
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Delete company?",
      text: `This will permanently remove ${name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete!",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/ad/company/${id}`);
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Company deleted successfully",
        timer: 2200,
      });
      fetchCompanies();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete company",
      });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/ad/company/${id}/status`, { companyStatus: status });
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Status updated",
        timer: 2000,
      });
      fetchCompanies();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status",
      });
    }
  };

  const handleRestore = async (id, name) => {
    const result = await Swal.fire({
      title: "Restore company?",
      text: `Make ${name} active again`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      confirmButtonText: "Yes, restore!",
    });

    if (!result.isConfirmed) return;

    try {
    await api.delete(`/ad/company/${id}`);
      Swal.fire({
        icon: "success",
        title: "Restored!",
        text: "Company restored successfully",
        timer: 2200,
      });
      fetchCompanies();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to restore company",
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search company..."
              className="pl-10 pr-4 py-2.5 w-72 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <select
            name="limit"
            value={filters.limit}
            onChange={handleFilterChange}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm text-gray-600 text-lg">
          No companies found
        </div>
      ) : (
        <>
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Logo</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {companies.map((item) => {
                    const isDeleted = !!item.isDeleted;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors ${isDeleted ? "bg-red-50/30 opacity-75" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-10 h-10 rounded-2xl overflow-hidden border bg-gray-100">
                            {item.companyLogo ? (
                              <img
                                src={item.companyLogo}
                                alt={item.companyName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-gray-400">No logo</div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">{item.companyName}</td>
                        <td className="px-6 py-4 text-gray-600">{item.companyEmail}</td>
                        <td className="px-6 py-4 text-gray-600">{item.companyPhone || "—"}</td>

                        <td className="px-6 py-4">
                          {isDeleted ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Deleted</span>
                          ) : (
                            <select
                              value={item.companyStatus}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="submitted">Submitted</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/clients/${item.id}`}>
                              <button
                                title="View"
                                className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 rounded-lg transition"
                              >
                                <Eye size={18} />
                              </button>
                            </Link>

                            {!isDeleted && (
                              <Link to={`/clients/edit/${item.id}`}>
                                <button
                                  title="Edit"
                                  className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition"
                                >
                                  <Edit size={18} />
                                </button>
                              </Link>
                            )}

                            {isDeleted ? (
                              <button
                                onClick={() => handleRestore(item.id, item.companyName)}
                                title="Restore"
                                className="p-2 text-green-600 hover:bg-green-50 hover:text-green-800 rounded-lg transition"
                              >
                                <RotateCcw size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDelete(item.id, item.companyName)}
                                title="Delete"
                                className="p-2 text-red-600 hover:bg-red-50 hover:text-red-800 rounded-lg transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-5 text-sm">
            <div className="text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {(filters.page - 1) * filters.limit + 1}
              </span>{" "}
              –{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(filters.page * filters.limit, totalCompanies)}
              </span>{" "}
              of <span className="font-semibold text-gray-900">{totalCompanies}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
                className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllCompany;