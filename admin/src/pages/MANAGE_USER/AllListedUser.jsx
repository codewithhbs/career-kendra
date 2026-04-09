import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Search, UserX, UserCheck, Edit, Eye, Trash2, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import { Link } from 'react-router-dom'
const AllListedUsers = () => {
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

            const res = await api.get("/ad/listed-user", { params });

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

    const confirmToggleStatus = (user) => {
        if (user.isDeleted) return; // shouldn't happen but safety

        const newActive = !user.accountActive;
        const action = newActive ? "activate" : "deactivate";
        const actionPast = newActive ? "activated" : "deactivated";

        Swal.fire({
            title: "Are you sure?",
            text: `You want to ${action} ${user.userName}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: newActive ? "#10b981" : "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: `Yes, ${action}!`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.post("/ad/update-basic", {
                        userId: user.id,
                        accountStatus: newActive,
                    });
                    Swal.fire({
                        icon: "success",
                        title: "Success!",
                        text: `User has been ${actionPast}.`,
                        timer: 2200,
                    });
                    fetchUsers();
                } catch (err) {
                    Swal.fire({
                        icon: "error",
                        title: "Failed",
                        text: "Could not update user status",
                    });
                }
            }
        });
    };

    const confirmDelete = (user) => {
        Swal.fire({
            title: "Delete user?",
            text: `This will soft-delete ${user.userName}. Can be restored later.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.post("/ad/update-basic", {
                        userId: user.id,
                        isDeleted: true,
                    });
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "User has been soft-deleted.",
                        timer: 2200,
                    });
                    fetchUsers();
                } catch (err) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to delete user",
                    });
                }
            }
        });
    };

    const confirmRestore = (user) => {
        Swal.fire({
            title: "Restore user?",
            text: `This will restore ${user.userName} and make them visible again.`,
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, restore!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.post("/ad/update-basic", {
                        userId: user.id,
                        isDeleted: false,
                    });
                    Swal.fire({
                        icon: "success",
                        title: "Restored!",
                        text: "User has been restored.",
                        timer: 2200,
                    });
                    fetchUsers();
                } catch (err) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to restore user",
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
                    <p className="mt-1 text-gray-600">Manage all registered users, including deleted ones</p>
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
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Saved Jobs
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Applied Jobs
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Skills
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((user) => {
                                        const isDeleted = user.isDeleted;
                                        return (
                                            <tr
                                                key={user.id}
                                                className={`hover:bg-gray-50 transition-colors ${isDeleted ? "bg-red-50/30 opacity-80" : ""}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">

                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {user.userName}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {user.emailAddress}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {user.contactNumber || "—"}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <Link
                                                        to={`/user/${user.id}/saved-jobs`}
                                                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                                                    >
                                                        {user.savedJobsCount || 0}
                                                    </Link>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <Link
                                                        to={`/user/${user.id}/applied-jobs`}
                                                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                                                    >
                                                        {user.appliedJobsCount || 0}
                                                    </Link>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {isDeleted ? (
                                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
                                                            Deleted
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${user.accountActive
                                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                                    : "bg-amber-100 text-amber-700 border border-amber-200"
                                                                }`}
                                                        >
                                                            {user.accountActive ? "Active" : "Inactive"}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {user.profileDetails?.skills?.slice(0, 3).join(", ") || "—"}
                                                    {user.profileDetails?.skills?.length > 3 && <span className="text-gray-400">...</span>}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/view-user/${user.id}`}>
                                                            <button
                                                                title="View"
                                                                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </Link>

                                                        {!isDeleted && (
                                                            <Link to={`/edit-user/${user.id}`}>
                                                                <button
                                                                    title="Edit"
                                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                            </Link>
                                                        )}

                                                        {isDeleted ? (
                                                            <button
                                                                onClick={() => confirmRestore(user)}
                                                                title="Restore"
                                                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition"
                                                            >
                                                                <RotateCcw size={18} />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => confirmToggleStatus(user)}
                                                                    title={user.accountActive ? "Deactivate" : "Activate"}
                                                                    className={`p-2 rounded-lg transition ${user.accountActive
                                                                            ? "text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                                                            : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                                                        }`}
                                                                >
                                                                    {user.accountActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                                                </button>

                                                                <button
                                                                    onClick={() => confirmDelete(user)}
                                                                    title="Delete"
                                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
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
                            of <span className="font-semibold text-gray-900">{totalUsers}</span>
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

export default AllListedUsers;