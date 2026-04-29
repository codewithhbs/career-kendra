const { GenerateOtp, verifyOtp } = require("../utils/generateOtp");
const { sign } = require("../utils/generateToken");
const { Employer, LoginOtp } = require("../models");
const redis = require("../../config/redis");
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');

exports.registerEmployer = async (req, res) => {
  try {
    const { employerName, employerContactNumber, employerEmail, password } = req.body;

    const emptyFields = [];

    if (!employerName?.trim()) emptyFields.push("Full Name");
    if (!employerContactNumber?.trim()) emptyFields.push("Contact Number");
    if (!employerEmail?.trim()) emptyFields.push("Email Address");
    if (!password?.trim()) emptyFields.push("Password");

    if (emptyFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please fill: ${emptyFields.join(", ")}`,
      });
    }

    // ✅ 2) Phone validation (India friendly)
    const cleanPhone = employerContactNumber.replace(/\s+/g, "");
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be a valid 10 digit number.",
      });
    }

    // ✅ 3) Email validation
    const cleanEmail = employerEmail.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // ✅ 4) Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // ✅ 5) Check existing user (email OR phone)
    const existingUser = await Employer.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { employerEmail: cleanEmail },
          { employerContactNumber: cleanPhone },
        ],
      },
    });

    if (existingUser) {
      // Friendly messages
      if (existingUser.employerEmail === cleanEmail) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered. Please try with another email address.",
        });
      }

      if (existingUser.employerContactNumber === cleanPhone) {
        return res.status(409).json({
          success: false,
          message: "This contact number is already registered. Please try with another number.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    const otp = GenerateOtp();
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins


    const user = await Employer.create({
      employerName: employerName.trim(),
      employerContactNumber: cleanPhone,
      employerEmail: cleanEmail,
      password,
      otp,
      accountStatus: "pending",
      otpExpireTime,
    });

    try {
      const key = `otp:employer:${user?.id}`;
      await redis.set(key, otp, "EX", 600);
      console.log("Otp save in redis")
    } catch (vvc) {
      console.log("Otp Not save in redis")

    }


    return res.status(201).json({
      success: true,
      message: "OTP sent for verification on contact number.",
      data: {
        id: user.id,
        employerName: user.employerName,
        employerContactNumber: user.employerContactNumber
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
exports.resendOtp = async (req, res) => {
  try {
    const { userId, employerContactNumber } = req.body;

    if (!userId && !employerContactNumber) {
      return res.status(400).json({
        success: false,
        message: "userId or employerContactNumber is required",
      });
    }

    let cleanPhone = employerContactNumber ? employerContactNumber.replace(/\s+/g, "") : null;

    if (cleanPhone && !/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be a valid 10 digit number.",
      });
    }

    // ✅ Find user
    const existingUser = await Employer.findOne({
      where: {
        [Op.or]: [
          userId ? { id: userId } : null,
          cleanPhone ? { employerContactNumber: cleanPhone } : null,
        ].filter(Boolean),
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingUser.accountStatus === "active") {
      return res.status(400).json({
        success: false,
        message: "Account already verified Please login",
      });
    }

    // ✅ Generate OTP
    const otp = GenerateOtp(6);

    const key = `otp:employer:${existingUser.id}`;
    await redis.set(key, otp, "EX", 600);

    console.log("OTP saved in redis:", key);


    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      otp, // ❌ production me OTP return mat karna
    });

  } catch (error) {
    console.log("resendOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.verifyOtpController = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "userId and otp are required",
      });
    }

    const result = await verifyOtp({ userId, otp, keyS: "employer" });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    const user = await Employer.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    await Employer.update(
      { accountStatus: "company-details-pending", otp: null, otpExpireTime: null },

      { where: { id: userId } }
    );



    const payload = {
      id: user.id,
      employerName: user.employerName,
      employerContactNumber: user.employerContactNumber,
      role: "employer",
      employerEmail: user.employerEmail,
    };

    const token = sign(payload);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
        path: "/",
    });
    return res.json({
      success: true,
      message: "Account verified successfully 🎉",
      token,
      user: payload,
    });

  } catch (err) {
    console.log("verifyOtpController error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { employerContactNumber, password, loginType } = req.body;

    if (!loginType || !["otp", "password"].includes(loginType)) {
      return res.status(400).json({
        success: false,
        message: "loginType is required. Use 'otp' or 'password'.",
      });
    }

    if (!employerContactNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required.",
      });
    }

    const cleanPhone = employerContactNumber.replace(/\s+/g, "");

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be a valid 10 digit number.",
      });
    }

    const user = await Employer.findOne({
      where: { employerContactNumber: cleanPhone },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found. Please register first.",
      });
    }

    if (["pending", "blocked"].includes(user.accountStatus)) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please verify OTP first.",
      });
    }

    // =========================
    // ✅ LOGIN WITH OTP
    // =========================

    if (loginType === "otp") {
      const otp = GenerateOtp(6);
      const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000);


      console.log("Otp For Login", otp)
      await LoginOtp.create({
        userId: user.id,
        contactNumber: cleanPhone,
        otp,
        otpExpireTime,
        isUsed: false,
      });


      try {
        await redis.set(`loginotp:employer:${user.id}`, otp, "EX", 600);
      } catch (err) {
        console.log("Redis login otp not saved:", err.message);
      }

      // TODO: send OTP SMS here

      return res.status(200).json({
        success: true,
        otpsend: true,
        message: "OTP sent successfully to your contact number.",
        data: {
          userId: user.id,
          employerContactNumber: user.employerContactNumber,
        },
      });
    }

    // =========================
    // ✅ LOGIN WITH PASSWORD
    // =========================
    if (loginType === "password") {
      if (!password?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Password is required for password login.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid password. Please try again.",
        });
      }



      const payload = {
        id: user.id,
        employerName: user.employerName,
        employerContactNumber: user.employerContactNumber,
        role: "employer",
        employerEmail: user.employerEmail,
      };

      const token = sign(payload);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
          path: "/",
      });
      // Save session in redis
      try {
        await redis.set(`session:employer:${user.id}`, token, "EX", 60 * 60 * 24);
      } catch (err) {
        console.log("Redis session not saved (login):", err.message);
      }

      return res.status(200).json({
        success: true,
        message: "Login successful 🎉",
        token,
        user: payload,
      });
    }
  } catch (error) {
    console.log("login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "userId and otp are required.",
      });
    }

    const user = await Employer.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const latestOtp = await LoginOtp.findOne({
      where: {
        userId,
        isUsed: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!latestOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (new Date() > new Date(latestOtp.otpExpireTime)) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP.",
      });
    }

    // Match check
    if (latestOtp.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Mark used
    await LoginOtp.update(
      { isUsed: true },
      { where: { id: latestOtp.id } }
    );


    const payload = {
      id: user.id,
      employerName: user.employerName,
      role: "employer",
      employerContactNumber: user.employerContactNumber,
      employerEmail: user.employerEmail,
    };

    const token = sign(payload);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
        path: "/",

    });
    // Save session in redis
    try {
      await redis.set(`session:employer:${user.id}`, token, "EX", 60 * 60 * 24);
    } catch (err) {
      console.log("Redis session not saved (otp login):", err.message);
    }

    console.log("Login Success", payload, token)
    return res.json({
      success: true,
      message: "Login successful 🎉",
      token,
      user: payload,
    });
  } catch (error) {
    console.log("verifyLoginOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;

    try {
      await redis.del(`session:employer:${userId}`);
    } catch (err) {
      console.log("Redis logout error:", err.message);
    }

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getEmployerProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Session timeout. Please login again.",
      });
    }

    const findProfile = await Employer.findOne({
      where: { id: userId },   // ✅ correct
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

exports.getAllEmployers = async (req, res) => {
  try {
    const employers = await Employer.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (employers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employers found",
      });
    }

    return res.status(200).json({
      success: true,
      total: employers.length,
      data: employers,
    });
  } catch (error) {
    console.error("Get employers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employers",
    });
  }
};

exports.updateBasicDetailsOfEmployer = async (req, res) => {
  try {
    const { userId, specialAccess } = req.body;

    console.log("REQUEST BODY:", req.body);

    // ✅ 1. Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // ✅ 2. Prepare update object
    const updateData = {};

    // 🔁 Boolean helper (handles true / "true")
    const toBool = (val) => val === true || val === "true";

    // ✅ NEW FIELD
    if (typeof specialAccess !== "undefined") {
      updateData.specialAccess = toBool(specialAccess);
    }

    // ❗ Nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    console.log("UPDATE DATA:", updateData);

    // ✅ 3. Update
    const [updatedRows] = await Employer.update(updateData, {
      where: { id: userId },
    });

    console.log("Rows Updated:", updatedRows);

    if (!updatedRows) {
      return res.status(400).json({
        success: false,
        message: "Update failed or no changes applied",
      });
    }

    // ✅ 4. Fetch updated user
    const updatedUser = await Employer.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found after update",
      });
    }

    // ✅ 5. Response
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Update Basic Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.toggleEmployerRole = async (req, res) => {
  try {
    const { employerId } = req.body;

    if (!employerId) {
      return res.status(400).json({
        success: false,
        message: "employerId is required",
      });
    }

    // 🔍 Find employer
    const employer = await Employer.findOne({
      where: { id: employerId },
    });

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: "Employer not found",
      });
    }

    // 🔄 Toggle logic
    let newRole;
    if (employer.role === "employer") {
      newRole = "employer-admin";
    } else if (employer.role === "employer-admin") {
      newRole = "employer";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role found for employer",
      });
    }

    // ✅ Update role
    employer.role = newRole;
    await employer.save();

    return res.status(200).json({
      success: true,
      message: `Role updated to ${newRole}`,
      data: {
        id: employer.id,
        role: newRole,
      },
    });

  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};