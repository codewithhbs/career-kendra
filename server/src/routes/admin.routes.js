"use strict";

const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");

const { checkPermission, adminLogin, employeeLogin, createEmployee, getAllEmployees, changeEmployeeRole, changeEmployeePassword, deleteEmployee, toggleEmployeeStatus, sendEmployeeOtp, resetEmployeePassword, assignPermissionsToRole, getuserProfile, updateAdminUserProfileDetails, getAllRoles, updateRole, deleteRole, createRole, createPermission, getAllPermissions, updatePermission, deletePermission, getPermissionViaRoleId, getWebSettings, updateWebSettings } = require("../controllers/admin.controller");
const { getAlluserListed, updateBasicDetails } = require("../controllers/userControllers");
const { getAllCompanyProfile, getSingleCompany, deleteCompany, updateCompanyStatus, AdminUpdateCompany } = require("../controllers/companyController");

const createUploader = require("../middlewares/upload");
const { getAdminDashboard } = require("../controllers/job.applications");

const upload = createUploader("companyDocuments");
// Admin Login
router.post("/admin/login", adminLogin);
// Employee Login
router.post("/employee/login", employeeLogin);


/* =====================================================
   👨‍💼 EMPLOYEE MANAGEMENT
===================================================== */

// Create Employee
router.post(
  "/employee/create",
  auth,
  checkPermission("CREATE_EMPLOYEE"),
  createEmployee
);

// Get All Employees
router.get(
  "/employees",
  auth,
  checkPermission("VIEW_EMPLOYEE"),
  getAllEmployees
);

// Change Employee Role
router.get(
  "/employee/role/permission/:id",
  auth,
  checkPermission("CHANGE_ROLE"),
  getPermissionViaRoleId
);

router.put(
  "/employee/change-role",
  auth,
  checkPermission("CHANGE_ROLE"),
  changeEmployeeRole
);


// Change Employee Password (by admin)
router.put(
  "/employee/change-password",
  auth,
  checkPermission("CHANGE_PASSWORD"),
  changeEmployeePassword
);

// Delete Employee (Soft Delete)
router.delete(
  "/employee/:id",
  auth,
  checkPermission("DELETE_EMPLOYEE"),
  deleteEmployee
);

// Toggle Employee Status (Active/Inactive)
router.put(
  "/employee/status/:id",
  auth,
  checkPermission("CHANGE_STATUS"),
  toggleEmployeeStatus
);


/* =====================================================
   🔐 PASSWORD RESET (OTP FLOW)
===================================================== */

// Send OTP
router.post("/employee/send-otp", sendEmployeeOtp);

// Reset Password
router.post("/employee/reset-password", resetEmployeePassword);


/* =====================================================
   🔑 ROLE & PERMISSION MANAGEMENT
===================================================== */

// Assign Permissions to Role
router.post(
  "/role/assign-permissions",
  auth,
  assignPermissionsToRole
);




router.get("/listed-user", auth, checkPermission("MANAGE_USERS"), getAlluserListed)
router.post("/update-basic", auth, checkPermission("MANAGE_USERS"), updateBasicDetails)
router.get("/user-details/:id", auth, checkPermission("MANAGE_USERS"), getuserProfile)
router.put("/update-details/:id", auth, checkPermission("MANAGE_USERS"), updateAdminUserProfileDetails)

router.get("/get-all-compnay", getAllCompanyProfile)
router.get("/company/:id", auth, checkPermission("MANAGE_COMPANY"), getSingleCompany);
router.delete("/company/:id", auth, checkPermission("MANAGE_COMPANY"), deleteCompany);
router.put("/company/:id/status", auth, checkPermission("MANAGE_COMPANY"), updateCompanyStatus);
router.put("/company/:id", auth, upload.single('companyLogo'), checkPermission("MANAGE_COMPANY"), AdminUpdateCompany);



// all roles
router.get("/all-roles", auth, getAllRoles)
router.put("/update-role/:id", auth, checkPermission("MANAGE_ROLES"), updateRole)
router.delete("/delete-role/:id", auth, checkPermission("MANAGE_ROLES"), deleteRole)
router.post("/create-role", auth, checkPermission("MANAGE_ROLES"), createRole)

router.post(
  "/create-permission",
  auth,
  checkPermission("MANAGE_PERMISSIONS"),
  createPermission
);

// Get all
router.get(
  "/all-permissions",
  // auth,
  getAllPermissions
);



// Update
router.put(
  "/update-permission/:id",
  auth,
  checkPermission("MANAGE_PERMISSIONS"),
  updatePermission
);

// Delete
router.delete(
  "/delete-permission/:id",
  auth,
  checkPermission("MANAGE_PERMISSIONS"),
  deletePermission
);


router.get("/admin-dashboard", getAdminDashboard)

router.get("/get-web-settings", getWebSettings)
router.put("/update-web-settings",createUploader("webSettings").single("siteLogo"), updateWebSettings)

module.exports = router;