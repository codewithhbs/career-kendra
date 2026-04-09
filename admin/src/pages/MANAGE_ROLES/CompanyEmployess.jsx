import React, { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
} from "lucide-react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const CompanyEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Increased to 10 for better UX

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // For specific actions (delete, toggle, etc.)

  // Fetch Employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ad/employees");
      setEmployees(res.data.data || []);
      setFilteredEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load employees",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Search & Filter
  const filteredAndSearched = useMemo(() => {
    return employees.filter((emp) =>
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.role?.roleName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSearched.length / limit);
  const paginatedData = useMemo(() => {
    return filteredAndSearched.slice(
      (page - 1) * limit,
      page * limit
    );
  }, [filteredAndSearched, page, limit]);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Delete Employee
  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete ${name}?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    setActionLoading(id);
    try {
      await api.delete(`/ad/employee/${id}`);
      Swal.fire("Deleted!", `${name} has been deleted.`, "success");
      fetchEmployees();
    } catch (err) {
      Swal.fire("Error!", "Failed to delete employee", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Status
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setActionLoading(id);
    try {
      await api.put(`/ad/employee/status/${id}`);
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Employee is now ${newStatus}`,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchEmployees();
    } catch (err) {
      Swal.fire("Error!", "Failed to update status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Change Password
  const changePassword = async (id, name) => {
    const { value: newPassword } = await Swal.fire({
      title: `Change Password for ${name}`,
      input: "password",
      inputLabel: "New Password",
      inputPlaceholder: "Enter new password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Update Password",
      inputValidator: (value) => {
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return null;
      },
    });

    if (!newPassword) return;

    setActionLoading(id);
    try {
      await api.put("/ad/employee/change-password", { id, password: newPassword });
      Swal.fire("Success!", "Password updated successfully", "success");
    } catch (err) {
      Swal.fire("Error!", "Failed to change password", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Company Employees</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your team members and their access
          </p>
        </div>

        <Link to={"/active/new-employee"}>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 flex items-center gap-2 rounded-lg transition-all shadow-sm">
            <Plus size={18} />
            Add New Employee
          </button>
        </Link>

      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search by name, email or role..."
          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-gray-500 mt-3">Loading employees...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-gray-600">Name</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-600">Email</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-600">Role</th>
                    <th className="px-6 py-4 text-center font-medium text-gray-600">Status</th>
                    <th className="px-6 py-4 text-center font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-800">{emp.name}</td>
                        <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {emp.role?.roleName || "No Role"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleStatus(emp.id, emp.status)}
                            disabled={actionLoading === emp.id}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${emp.status === "ACTIVE"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                          >
                            {actionLoading === emp.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              emp.status
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                          <Link to={"/active/give-permission"}>
                            <button
                              className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-all"
                              title="Give Permission"
                            >
                             Permissions
                            </button>
                          </Link>

                            <button
                              onClick={() => changePassword(emp.id, emp.name)}
                              disabled={actionLoading === emp.id}
                              className="text-amber-600 hover:text-amber-700 p-2 hover:bg-amber-50 rounded-lg transition-all"
                              title="Change Password"
                            >
                              {actionLoading === emp.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                "🔑"
                              )}
                            </button>

                            <button
                              onClick={() => handleDelete(emp.id, emp.name)}
                              disabled={actionLoading === emp.id}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Employee"
                            >
                              {actionLoading === emp.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                        {search ? "No employees match your search." : "No employees found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} /> Previous
                </button>

                <div className="text-sm text-gray-600">
                  Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
                  {totalPages}
                </div>

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {paginatedData.length} of {filteredAndSearched.length} employees
      </div>
    </div>
  );
};

export default CompanyEmployees;