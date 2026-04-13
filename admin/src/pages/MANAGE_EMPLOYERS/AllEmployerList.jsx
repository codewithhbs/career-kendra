import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Search,
  Eye,
  Star,
} from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const AllEmployerList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    limit: 10,
    page: 1,
    accountStatus: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search,
        limit: filters.limit,
        page: filters.page,
        accountStatus: filters.accountStatus || undefined,
      };

      const res = await api.get("/auth-employer/get-all-employers", { params });

      if (res.data.success) {
        setUsers(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalUsers(res.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load users",
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const confirmToggleSpecialAccess = (user) => {
    const newAccess = !user.specialAccess;
    const action = newAccess ? "grant" : "remove";
    const actionPast = newAccess ? "granted" : "removed";

    Swal.fire({
      title: "Are you sure?",
      text: `You want to ${action} special access for ${user.userName}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newAccess ? "#6366f1" : "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${action}!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post("/auth-employer/update-basic", {
            userId: user.id,
            specialAccess: newAccess,
          });

          Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Special access ${actionPast}.`,
            timer: 2000,
          });

          fetchUsers();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update special access",
          });
        }
      }
    });
  };

  return (
    <div className="p-6 max-w-[1500px] mx-auto">
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-gray-600">
            Manage all registered users, including deleted ones
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name, email..."
              className="pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-72 shadow-sm transition-all"
            />
          </div>

          <select
            name="accountStatus"
            value={filters.accountStatus}
            onChange={handleFilterChange}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          >
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>

          <select
            name="limit"
            value={filters.limit}
            onChange={handleFilterChange}
            className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
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
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm text-gray-600 text-lg font-medium">
          No users found matching your filters
        </div>
      ) : (
        <>
          <div className="bg-white  overflow-hidden ">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Employer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Employer Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.employerName}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {user.employerEmail}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.employerContactNumber || "—"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              user.accountStatus === "active"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : user.accountStatus ===
                                    "company-details-pending"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {user.accountStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end gap-2">
                            {/* View */}
                            <Link to={`/view-employer/${user.id}`}>
                              <button className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition">
                                <Eye size={18} />
                              </button>
                            </Link>

                            {/* ⭐ Special Access (IMPORTANT - kept) */}
                            <button
                              onClick={() => confirmToggleSpecialAccess(user)}
                              title={
                                user.specialAccess
                                  ? "Remove Special Access"
                                  : "Grant Special Access"
                              }
                              className={`p-2 rounded-lg transition ${
                                user.specialAccess
                                  ? "text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <Star
                                size={18}
                                fill={
                                  user.specialAccess ? "currentColor" : "none"
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-5 px-1">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {(filters.page - 1) * filters.limit + 1}
              </span>{" "}
              –{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(filters.page * filters.limit, totalUsers)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">{totalUsers}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
                className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition shadow-sm"
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

export default AllEmployerList;
