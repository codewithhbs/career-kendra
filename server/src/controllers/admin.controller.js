"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  Admin,
  admin_employees,
  Role,
  ProfileDetails,
  WebSettings,
  User,
  Permission,
  AuditLog,
} = require("../models");
const { sendError, sendSuccess } = require("../utils/api");


const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const logAction = async ({ action, performedBy, targetId, targetType }) => {
  try {
    await AuditLog.create({ action, performedBy, targetId, targetType });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    // ✅ Find admin with role
    let admin = await Admin.findOne({
      where: { email },
      include: [{ model: Role, as: "role" }],
    });

    if (!admin) {
      return sendError(res, 401, "Invalid credentials");
    }

    // ✅ Password check
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid credentials");
    }

    // ✅ Role fallback
    let roleData = admin.role;
    if (!roleData && admin.roleId) {
      roleData = await Role.findByPk(admin.roleId);
    }

    // ✅ Convert to plain JSON
    const adminPlain = admin.get({ plain: true });
    delete adminPlain.password;

    const rolePlain = roleData ? roleData.get({ plain: true }) : null;

    // ✅ Attach role cleanly
    adminPlain.role = rolePlain;

    // ✅ 🔥 TOKEN WITH FULL DATA
    const token = generateToken({
      admin: {
        id: adminPlain.id,
        name: adminPlain.name,
        email: adminPlain.email,
        roleId: adminPlain.roleId,
        role: rolePlain?.roleName || null,
        level: rolePlain?.level || null,
      },
      type: "admin",
    });

    // ✅ Response
    return sendSuccess(
      res,
      {
        token,
        admin: adminPlain,
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Admin Login Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

exports.employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return sendError(res, 400, "Email and password required");

    const employee = await admin_employees.findOne({
      where: { email, deletedAt: null },
      include: [{ model: Role, as: "role" }],
    });

    if (!employee) return sendError(res, 401, "Invalid credentials");

    if (employee.status !== "ACTIVE")
      return sendError(res, 403, "Account inactive. Contact admin.");

    const match = await bcrypt.compare(password, employee.password);
    if (!match) return sendError(res, 401, "Invalid credentials");

    const token = generateToken({
      id: employee.id,
      roleId: employee.roleId,
      role: employee.role?.roleName,
      level: employee.role?.level,
      type: "employee",
    });

    return sendSuccess(res, { token, employee }, "Login successful");
  } catch (err) {
    return sendError(res, 500, "Login failed");
  }
};

/* ================= CREATE EMPLOYEE ================= */
exports.createEmployee = async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, password, roleId } = req.body;
    const adminId = req.user.id;

    if (!name || !email || !password || !roleId)
      return sendError(res, 400, "All fields required");

    const exists = await admin_employees.findOne({ where: { email } });
    if (exists) return sendError(res, 400, "Email already exists");

    const role = await Role.findByPk(roleId);
    if (!role) return sendError(res, 404, "Invalid role");

    const hashed = await bcrypt.hash(password, 10);

    const employee = await admin_employees.create({
      name,
      email,
      password: hashed,
      roleId,
      addedBy: adminId,
    });

    await logAction({
      action: "CREATE_EMPLOYEE",
      performedBy: adminId,
      targetId: employee.id,
      targetType: "Employee",
    });

    return sendSuccess(res, employee, "Employee created");
  } catch (err) {
    return sendError(res, 500, "Failed to create employee");
  }
};

/* ================= CHANGE ROLE ================= */
exports.changeEmployeeRole = async (req, res) => {
  try {
    const { employeeId, roleId } = req.body;

    const employee = await admin_employees.findByPk(employeeId);
    if (!employee) return sendError(res, 404, "Employee not found");

    const role = await Role.findByPk(roleId);
    if (!role) return sendError(res, 404, "Role not found");

    employee.roleId = roleId;
    await employee.save();

    await logAction({
      action: "CHANGE_ROLE",
      performedBy: req.user.id,
      targetId: employee.id,
      targetType: "Employee",
    });

    return sendSuccess(res, employee, "Role updated");
  } catch (err) {
    return sendError(res, 500, "Failed to update role");
  }
};

/* ================= CHANGE PASSWORD ================= */
exports.changeEmployeePassword = async (req, res) => {
  try {
    const { employeeId, newPassword } = req.body;

    const employee = await admin_employees.findByPk(employeeId);
    if (!employee) return sendError(res, 404, "Employee not found");

    employee.password = await bcrypt.hash(newPassword, 10);
    await employee.save();

    await logAction({
      action: "CHANGE_PASSWORD",
      performedBy: req.user.id,
      targetId: employee.id,
      targetType: "Employee",
    });

    return sendSuccess(res, null, "Password updated");
  } catch (err) {
    return sendError(res, 500, "Failed to update password");
  }
};

/* ================= SOFT DELETE ================= */
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await admin_employees.findByPk(req.params.id);
    if (!employee) return sendError(res, 404, "Employee not found");

    employee.deletedAt = new Date();
    await employee.save();

    await logAction({
      action: "DELETE_EMPLOYEE",
      performedBy: req.user.id,
      targetId: employee.id,
      targetType: "Employee",
    });

    return sendSuccess(res, null, "Employee deleted");
  } catch (err) {
    return sendError(res, 500, "Delete failed");
  }
};

/* ================= STATUS TOGGLE ================= */
exports.toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await admin_employees.findByPk(req.params.id);
    if (!employee) return sendError(res, 404, "Employee not found");

    employee.status = employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await employee.save();

    await logAction({
      action: "CHANGE_STATUS",
      performedBy: req.user.id,
      targetId: employee.id,
      targetType: "Employee",
    });

    return sendSuccess(res, employee, "Status updated");
  } catch (err) {
    return sendError(res, 500, "Status update failed");
  }
};

/* ================= GET EMPLOYEES ================= */
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await admin_employees.findAll({
      where: { deletedAt: null },
      include: [{ model: Role, as: "role" }],
      order: [["createdAt", "DESC"]],
    });

    return sendSuccess(res, employees, "Employees fetched");
  } catch (err) {
    console.log(err)
    return sendError(res, 500, "Fetch failed");
  }
};

/* ================= OTP SEND ================= */
exports.sendEmployeeOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const employee = await admin_employees.findOne({ where: { email } });
    if (!employee) return sendError(res, 404, "Employee not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    employee.otp = otp;
    employee.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await employee.save();

    return sendSuccess(res, null, "OTP sent");
  } catch (err) {
    return sendError(res, 500, "OTP failed");
  }
};

/* ================= OTP RESET ================= */
exports.resetEmployeePassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const employee = await admin_employees.findOne({ where: { email } });
    if (!employee) return sendError(res, 404, "Employee not found");

    if (employee.otp !== otp || new Date() > employee.otpExpiry)
      return sendError(res, 400, "Invalid/expired OTP");

    employee.password = await bcrypt.hash(newPassword, 10);
    employee.otp = null;
    employee.otpExpiry = null;

    await employee.save();

    return sendSuccess(res, null, "Password reset successful");
  } catch (err) {
    return sendError(res, 500, "Reset failed");
  }
};

/* ================= PERMISSION CHECK ================= */
exports.checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
    
      if (req.user.role === "Super Admin") {
        return next();
      }

      const role = await Role.findByPk(req.user.roleId, {
        include: [
          {
            model: Permission,
            as: "permissions", // ✅ correct alias
            attributes: ["id", "name"],
            through: { attributes: [] }, // ✅ hide junction table
          },
        ],
      });

      if (!role) {
        return sendError(res, 404, "Role not found");
      }

      const rolePlain = role.get({ plain: true });
      console.log("ROLE:", rolePlain);

      // ✅ FIX: correct key
      const allowed = rolePlain.permissions?.some(
        (p) => p.name === permissionName
      );

      if (!allowed) {
        return sendError(res, 403, "Permission denied");
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return sendError(res, 500, "Internal server error");
    }
  };
};

exports.assignPermissionsToRole = async (req, res) => {
  try {
    const { roleId, permissionIds } = req.body;

    if (!roleId || !permissionIds?.length) {
      return sendError(res, 400, "Role and permissions required");
    }

    const   role = await Role.findByPk(roleId);
    if (!role) return sendError(res, 404, "Role not found");

    await role.setPermissions(permissionIds); // 🔥 magic

    return sendSuccess(res, null, "Permissions assigned successfully");
  } catch (err) {
    console.log(err)
    return sendError(res, 500, "Failed to assign permissions");
  }
};

exports.getPermissionViaRoleId = async (req, res) => {
  try {
    const roleId = req.params.id;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    const role = await Role.findByPk(roleId, {
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Permissions fetched successfully",
      data: role,
    });

  } catch (error) {
    console.error("Error fetching permissions:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getuserProfile = async (req, res) => {
  try {
    const userId = req.params?.id;
    const findProfile = await ProfileDetails.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "userName",
            "emailAddress",
            "contactNumber",
            "uploadedCv",
            "accountActive",
          ],
        },
      ],
    });


    if (!findProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please complete your profile.",
      });
    }

    return res.status(200).json({
      success: true,
      data: findProfile,
      message: "Profile details fetched successfully",
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Profile fetch failed",
    });
  }
};



exports.updateAdminUserProfileDetails = async (req, res) => {
  try {
    const {
      userId,
      skills,
      experience,
      educations,
      headline,
      noExperience,
      userName,
      contactNumber,
      emailAddress,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = await ProfileDetails.findOne({ where: { userId } });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile details not found",
      });
    }

    /* ---------------- USER UPDATE (NAME / EMAIL / PHONE) ---------------- */

    const userUpdateData = {};

    if (userName) {
      userUpdateData.userName = userName;
    }

    if (emailAddress && emailAddress !== user.emailAddress) {
      const existingEmail = await User.findOne({
        where: { emailAddress },
      });

      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      userUpdateData.emailAddress = emailAddress;
    }

    if (contactNumber && contactNumber !== user.contactNumber) {
      const existingNumber = await User.findOne({
        where: { contactNumber },
      });

      if (existingNumber && existingNumber.id !== userId) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists",
        });
      }

      userUpdateData.contactNumber = contactNumber;
    }

    if (Object.keys(userUpdateData).length > 0) {
      await user.update(userUpdateData);
    }

    /* ---------------- PROFILE VALIDATION ---------------- */

    if (headline && headline.length > 220) {
      return res.status(400).json({
        success: false,
        message: "Headline cannot exceed 220 characters",
      });
    }

    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    if (skills && skills.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Maximum 50 skills allowed",
      });
    }

    if (experience && !Array.isArray(experience)) {
      return res.status(400).json({
        success: false,
        message: "Experience must be an array",
      });
    }

    if (noExperience === 1 && experience && experience.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot add experience if marked as no experience",
      });
    }

    if (educations && !Array.isArray(educations)) {
      return res.status(400).json({
        success: false,
        message: "Educations must be an array",
      });
    }

    /* ---------------- PROFILE UPDATE ---------------- */

    const updatedProfileData = {
      skills: skills ?? profile.skills,
      experience: experience ?? profile.experience,
      educations: educations ?? profile.educations,
      headline: headline ?? profile.headline,
      noExperince:
        noExperience !== undefined
          ? noExperience
          : profile.noExperince,
    };

    await profile.update(updatedProfileData);

    /* ---------------- COMPLETION LOGIC ---------------- */

    let completion = 0;

    if (updatedProfileData.headline) completion += 20;
    if (updatedProfileData.skills?.length > 0) completion += 20;
    if (updatedProfileData.educations?.length > 0) completion += 20;

    if (updatedProfileData.noExperince === 1) {
      completion += 20;
    } else if (updatedProfileData.experience?.length > 0) {
      completion += 20;
    }

    if (profile.profileImage) completion += 20;

    await profile.update({
      percentageOfAccountComplete: completion,
    });

    /* ---------------- FINAL RESPONSE ---------------- */

    const updatedUser = await User.findByPk(userId, {
      include: [
        {
          model: ProfileDetails,
          as: "profileDetails",
        },
      ],
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const role = await Role.findAll()
    return sendSuccess(res, role, "all roles found")
  } catch (error) {
    return sendError(res, 501, error)
  }
}

exports.createRole = async (req, res) => {
  try {
    const { roleName, level, description } = req.body;
    console.log("Level", level)
    if (!roleName) {
      return res.status(400).json({ success: false, message: "Role name is required" });
    }

    const existing = await Role.findOne({ where: { roleName } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Role already exists" });
    }

    const role = await Role.create({
      roleName,
      level: level ? level : null,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, level, description } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    // check duplicate (if name changed)
    if (roleName && roleName !== role.roleName) {
      const existing = await Role.findOne({ where: { roleName } });
      if (existing) {
        return res.status(400).json({ success: false, message: "Role name already exists" });
      }
    }

    await role.update({
      roleName: roleName || role.roleName,
      level: level ? role.level : null,
      description: description || role.description,
    });

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// ✅ Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    await role.destroy();

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createPermission = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Permission name is required",
      });
    }

    // check duplicate
    const exists = await Permission.findOne({ where: { name } });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Permission already exists",
      });
    }

    const permission = await Permission.create({ name });

    return res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: permission,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [["id"]],
    });

    return res.status(200).json({
      success: true,
      message: "All permissions fetched",
      data: permissions,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    // duplicate check
    if (name && name !== permission.name) {
      const exists = await Permission.findOne({ where: { name } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Permission already exists",
        });
      }
    }

    await permission.update({
      name: name || permission.name,
    });

    return res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: permission,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }

    await permission.destroy();

    return res.status(200).json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getWebSettings = async (req, res) => {
  try {

    const settings = await WebSettings.findByPk(1);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Web settings not found"
      });
    }



    const data = settings.toJSON();

    if (data.siteLogo) {
      data.siteLogo =data.siteLogo;
    }

    if (data.siteFavicon) {
      data.siteFavicon =data.siteFavicon;
    }

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {

    console.error("Get Web Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch web settings"
    });

  }
};  
exports.updateWebSettings = async (req, res) => {
  try {
    const settings = await WebSettings.findByPk(1);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Web settings not found",
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
    
      updateData.siteLogo = `/uploads/webSettings/${req.file.filename}`;
    }

    // Update the record
    await settings.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Web settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update Web Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update web settings",
      error: error.message,
    });
  }
};