import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Plus, Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const NewEmployee = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [generatingPassword, setGeneratingPassword] = useState(false);

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      const res = await api.get("/ad/all-roles");
      setRoles(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      Swal.fire("Error", "Failed to load roles", "error");
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Strong Password Generator (12 characters - secure & recommended)
  const generateStrongPassword = () => {
    setGeneratingPassword(true);

    const length = 12;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allChars = uppercase + lowercase + numbers + symbols;

    let password = "";

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password for better randomness
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

   

    setFormData((prev) => ({ ...prev, password }));
    setGeneratingPassword(false);

    Swal.fire({
      icon: "success",
      title: "Password Generated",
      text: "A strong password has been auto-filled.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Create New Employee
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.name.trim()) {
      return Swal.fire("Error", "Name is required", "error");
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      return Swal.fire("Error", "Please enter a valid email", "error");
    }
    if (!formData.password || formData.password.length < 6) {
      return Swal.fire("Error", "Password must be at least 6 characters", "error");
    }
    if (!formData.roleId) {
      return Swal.fire("Error", "Please select a role", "error");
    }

    setLoading(true);

    try {
      const res = await api.post("/ad/employee/create", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        roleId: parseInt(formData.roleId),
      });

      Swal.fire({
        icon: "success",
        title: "Employee Created",
        text: `${formData.name} has been added successfully!`,
        confirmButtonText: "Go to Employees List",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/employees"); // Change this to your employees route
        }
      });

      // Reset form
      setFormData({ name: "", email: "", password: "", roleId: "" });
    } catch (err) {
        console.log(err)
      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text: err.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Plus className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Employee</h1>
            <p className="text-gray-500">Create a new team member account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
              required
            />
          </div>

          {/* Password with Generate Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
                placeholder="Strong password will be generated"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  disabled={generatingPassword}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
                >
                  {generatingPassword ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  Generate
                </button>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Click "Generate" for a strong secure password (recommended)</p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
              disabled={rolesLoading}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Creating Employee...
              </>
            ) : (
              <>
                <Plus size={24} />
                Create Employee
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewEmployee;