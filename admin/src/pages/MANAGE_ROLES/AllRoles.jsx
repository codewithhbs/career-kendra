import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Search,
  Edit,
  Trash2,
  Plus,
  RotateCcw,
  X,
  ShieldCheck,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";

/* ─── Role Modal ─────────────────────────────────────────────────────────── */
const RoleModal = ({ isOpen, onClose, role = null, onSuccess }) => {
  const [formData, setFormData] = useState({ roleName: "", level: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (role) setFormData({ roleName: role.roleName || "", level: role.level || "", description: role.description || "" });
    else setFormData({ roleName: "", level: "", description: "" });
    setErrors({});
  }, [role, isOpen]);

  const validate = () => {
    const e = {};
    if (!formData.roleName.trim()) e.roleName = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (role) {
        await api.put(`/ad/update-role/${role.id}`, formData);
        Swal.fire("Updated!", "Role updated.", "success");
      } else {
        await api.post("/ad/create-role", formData);
        Swal.fire("Created!", "Role created.", "success");
      }
      onSuccess();
      onClose();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">
              {role ? "Edit" : "New"}
            </p>
            <h3 className="text-base font-semibold text-gray-800">{role ? "Update Role" : "Create Role"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Role Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.roleName}
              onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              placeholder="e.g. Manager"
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 ${errors.roleName ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}
            />
            {errors.roleName && <p className="text-red-400 text-xs mt-1">{errors.roleName}</p>}
          </div>

          {/* Level */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Level <span className="text-gray-300">(optional)</span></label>
            <input
              type="number"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              placeholder="e.g. 5"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-xl outline-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of this role..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-xl outline-none resize-none transition focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Saving…" : role ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Assign Permissions Modal ───────────────────────────────────────────── */
const AssignPermissionsModal = ({ isOpen, onClose, role, allPermissions, onSuccess }) => {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !role) return;
    setLoading(true);
    api.get(`/ad/employee/role/permission/${role.id}`)
      .then((res) => setSelected(res.data.data?.permissions?.map((p) => p.id) || []))
      .catch(() => setSelected([]))
      .finally(() => setLoading(false));
  }, [isOpen, role]);

  const toggle = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/ad/role/assign-permissions/", { roleId: role.id, permissionIds: selected });
      Swal.fire({ icon: "success", title: "Permissions Updated", timer: 1800, showConfirmButton: false });
      onSuccess();
      onClose();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !role) return null;

  const allSelected = selected.length === allPermissions.length;
  const toggleAll = () => setSelected(allSelected ? [] : allPermissions.map((p) => p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">Permissions</p>
            <h3 className="text-base font-semibold text-gray-800">{role.roleName}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-400 transition">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-xs">Loading permissions…</span>
            </div>
          ) : (
            <>
              {/* Select All */}
              <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer mb-3 hover:border-indigo-300 transition">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-indigo-600" />
                <span className="text-xs font-semibold text-gray-600">Select All</span>
                <span className="ml-auto text-[10px] text-gray-400">{selected.length}/{allPermissions.length}</span>
              </label>

              <div className="space-y-1.5">
                {allPermissions.map((perm) => (
                  <label key={perm.id} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition text-sm ${selected.includes(perm.id) ? "border-indigo-200 bg-indigo-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                    <input type="checkbox" checked={selected.includes(perm.id)} onChange={() => toggle(perm.id)} className="w-4 h-4 accent-indigo-600" />
                    <span className={`font-medium ${selected.includes(perm.id) ? "text-indigo-700" : "text-gray-700"}`}>{perm.name}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving…" : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Badge ──────────────────────────────────────────────────────────────── */
const LevelBadge = ({ level }) => {
  if (!level && level !== 0) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
      L{level}
    </span>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const AllRoles = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRoleForAssign, setSelectedRoleForAssign] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ad/all-roles");
      setRoles(res.data.data || []);
    } catch {
      Swal.fire("Error", "Failed to fetch roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get("/ad/all-permissions");
      setAllPermissions(res.data.data || []);
    } catch {
      console.error("Failed to fetch permissions");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleDelete = async (id, roleName) => {
    const result = await Swal.fire({
      title: `Delete "${roleName}"?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/ad/delete-role/${id}`);
        Swal.fire("Deleted!", "Role removed.", "success");
        fetchRoles();
      } catch {
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  const filtered = roles.filter((r) =>
    r.roleName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/60 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Roles & Permissions</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage roles and control access</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchRoles(); fetchPermissions(); }}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 border border-gray-200 bg-white rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
            >
              <RotateCcw size={13} />
              Refresh
            </button>
            <button
              onClick={() => { setEditingRole(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
            >
              <Plus size={14} />
              New Role
            </button>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Roles", value: roles.length },
            { label: "Permissions", value: allPermissions.length },
            { label: "Search Results", value: filtered.length },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-10">#</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-20">Level</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-xs">Loading…</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <ShieldCheck size={24} className="text-gray-200" />
                      <span className="text-xs">No roles found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((role, i) => (
                  <tr key={role.id} className="group hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-gray-300 font-mono">{String(i + 1).padStart(2, "0")}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-gray-800 text-sm">{role.roleName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <LevelBadge level={role.level} />
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <span className="text-xs text-gray-400 truncate block">{role.description || "No description"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => { setEditingRole(role); setModalOpen(true); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit"
                        >
                          <Edit size={13} />
                        </button>
                        {/* Permissions */}
                        <button
                          onClick={() => { setSelectedRoleForAssign(role); setAssignModalOpen(true); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition"
                          title="Assign Permissions"
                        >
                          <ShieldCheck size={13} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(role.id, role.roleName)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of <span className="font-semibold text-gray-600">{roles.length}</span> roles
              </span>
              <span className="text-[11px] text-gray-300 flex items-center gap-1">
                Roles & Permissions <ChevronRight size={10} />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RoleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        role={editingRole}
        onSuccess={fetchRoles}
      />
      <AssignPermissionsModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        role={selectedRoleForAssign}
        allPermissions={allPermissions}
        onSuccess={fetchRoles}
      />
    </div>
  );
};

export default AllRoles;