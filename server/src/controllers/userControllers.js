const { GenerateOtp, verifyOtp } = require("../utils/generateOtp");
const { sign } = require("../utils/generateToken");
const { User, ProfileDetails, LoginOtp, JobApplication, SavedJobs } = require("../models");
const redis = require("../../config/redis");
const { Op, Sequelize } = require("sequelize");
const bcrypt = require('bcrypt');
const fs = require("fs");
const path = require("path");

exports.registerUser = async (req, res) => {
  try {
    const { userName, contactNumber, emailAddress, password } = req.body;

    /* ===================== BASIC VALIDATION ===================== */

    const emptyFields = [];
    if (!userName?.trim()) emptyFields.push("Full Name");
    if (!contactNumber?.trim()) emptyFields.push("Contact Number");
    if (!emailAddress?.trim()) emptyFields.push("Email Address");
    if (!password?.trim()) emptyFields.push("Password");

    if (emptyFields.length) {
      return res.status(400).json({
        success: false,
        message: `Please fill: ${emptyFields.join(", ")}`,
      });
    }

    const cleanPhone = contactNumber.replace(/\s+/g, "");
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be a valid 10 digit number.",
      });
    }

    const cleanEmail = emailAddress.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    /* ===================== CHECK EXISTING USER ===================== */

    let user = await User.findOne({
      where: {
        [Op.or]: [
          { emailAddress: cleanEmail },
          { contactNumber: cleanPhone },
        ],
      },
    });

    /* ===================== CASE 1: USER EXISTS ===================== */
    if (user) {
      // 🔴 Already verified → stop
      if (user.accountActive) {
        return res.status(409).json({
          success: false,
          message:
            "This account is already registered and verified. Please login.",
        });
      }

      // 🟡 Exists but NOT verified → resend OTP
      const otp = GenerateOtp();
      const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000);

      await user.update({ otp, otpExpireTime });

      try {
        await redis.set(`otp:user:${user.id}`, otp, "EX", 600);
      } catch {
        console.log("Redis OTP save failed");
      }

      /* 🔥 ENSURE PROFILE DETAILS EXISTS */
      let profileDetails = await ProfileDetails.findOne({
        where: { userId: user.id },
      });

      if (!profileDetails) {
        profileDetails = await ProfileDetails.create({
          userId: user.id,
          skills: [],
          experience: [],
          educations: [],
          percentageOfAccountComplete: 10,
        });

        await user.update({
          profileDetailsId: profileDetails.id,
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Account already exists but not verified. OTP has been resent.",
        data: {
          id: user.id,
          contactNumber: user.contactNumber,
        },
      });
    }

    /* ===================== CASE 2: NEW USER ===================== */

    const otp = GenerateOtp();
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000);

    user = await User.create({
      userName: userName.trim(),
      contactNumber: cleanPhone,
      emailAddress: cleanEmail,
      password,
      otp,
      otpExpireTime,
      accountActive: false,
      profileDetailsId: null,
    });

    try {
      await redis.set(`otp:user:${user.id}`, otp, "EX", 600);
    } catch {
      console.log("Redis OTP save failed");
    }

    /* ===================== CREATE PROFILE DETAILS ===================== */

    const profileDetails = await ProfileDetails.create({
      userId: user.id,
      skills: [],
      experience: [],
      educations: [],
      percentageOfAccountComplete: 10,
    });

    await user.update({
      profileDetailsId: profileDetails.id,
    });

    /* ===================== RESPONSE ===================== */

    return res.status(201).json({
      success: true,
      message: "OTP sent for verification on contact number.",
      data: {
        id: user.id,
        userName: user.userName,
        contactNumber: user.contactNumber,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.resendOtp = async (req, res) => {
  try {
    const { userId, contactNumber } = req.body;

    if (!userId && !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "userId or contactNumber is required",
      });
    }

    let cleanPhone = contactNumber ? contactNumber.replace(/\s+/g, "") : null;

    if (cleanPhone && !/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be a valid 10 digit number.",
      });
    }

    // ✅ Find user
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          userId ? { id: userId } : null,
          cleanPhone ? { contactNumber: cleanPhone } : null,
        ].filter(Boolean),
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingUser.accountActive) {
      return res.status(400).json({
        success: false,
        message: "Account already verified Please login",
      });
    }

    // ✅ Generate OTP
    const otp = GenerateOtp(6);

    const key = `otp:user:${existingUser.id}`;
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

    const result = await verifyOtp({ userId, otp });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.update(
      { accountActive: true, otp: null, otpExpireTime: null },

      { where: { id: userId } }
    );

    await ProfileDetails.update(
      { percentageOfAccountComplete: 20 },
      { where: { userId: userId } }
    );

    const profile = await ProfileDetails.findOne({
      where: { userId: userId },
      attributes: ["percentageOfAccountComplete"],
    });

    const payload = {
      id: user.id,
      userName: user.userName,
      contactNumber: user.contactNumber,
      role: user?.role,

      emailAddress: user.emailAddress,
      percentageOfAccountComplete: profile?.percentageOfAccountComplete || 0,
    };

    const token = sign(payload);

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
    const { contactNumber, password, loginType } = req.body;

    if (!loginType || !["otp", "password"].includes(loginType)) {
      return res.status(400).json({
        success: false,
        message: "loginType is required. Use 'otp' or 'password'.",
      });
    }

    if (!contactNumber?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required.",
      });
    }

    const cleanPhone = contactNumber.replace(/\s+/g, "");

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be a valid 10 digit number.",
      });
    }

    const user = await User.findOne({
      where: { contactNumber: cleanPhone },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found. Please register first.",
      });
    }

    if (!user.accountActive) {
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


      await LoginOtp.create({
        userId: user.id,
        contactNumber: cleanPhone,
        otp,
        otpExpireTime,
        isUsed: false,
      });


      try {
        await redis.set(`loginotp:user:${user.id}`, otp, "EX", 600);
      } catch (err) {
        console.log("Redis login otp not saved:", err.message);
      }

      // TODO: send OTP SMS here

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully to your contact number.",
        data: {
          userId: user.id,
          contactNumber: user.contactNumber,
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

      const profile = await ProfileDetails.findOne({
        where: { userId: user.id },
        attributes: ["percentageOfAccountComplete"],
      });

      const payload = {
        id: user.id,
        userName: user.userName,
        contactNumber: user.contactNumber,
        role: user.role,
        emailAddress: user.emailAddress,
        percentageOfAccountComplete: profile?.percentageOfAccountComplete || 0,
      };

      const token = sign(payload);

      // Save session in redis
      try {
        await redis.set(`session:user:${user.id}`, token, "EX", 60 * 60 * 24);
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

    const user = await User.findOne({ where: { id: userId } });

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

    const profile = await ProfileDetails.findOne({
      where: { userId: user.id },
      attributes: ["percentageOfAccountComplete"],
    });

    const payload = {
      id: user.id,
      userName: user.userName,
      role: user?.role,
      contactNumber: user.contactNumber,
      emailAddress: user.emailAddress,
      percentageOfAccountComplete: profile?.percentageOfAccountComplete || 0,
    };

    const token = sign(payload);

    // Save session in redis
    try {
      await redis.set(`session:user:${user.id}`, token, "EX", 60 * 60 * 24);
    } catch (err) {
      console.log("Redis session not saved (otp login):", err.message);
    }

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
      await redis.del(`session:user:${userId}`);
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
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userName, contactNumber, emailAddress } = req.body;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Clean inputs
    const cleanPhone = contactNumber ? contactNumber.replace(/\s+/g, "") : null;
    const cleanEmail = emailAddress ? emailAddress.toLowerCase().trim() : null;
    const cleanName = userName ? userName.trim() : null;

    // ✅ Validate phone if provided
    if (cleanPhone && !/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be a valid 10 digit number.",
      });
    }

    // ✅ Validate email if provided
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }
    }

    // ✅ Check if anything changed
    const isNameChanged = cleanName && cleanName !== user.userName;
    const isPhoneChanged = cleanPhone && cleanPhone !== user.contactNumber;
    const isEmailChanged = cleanEmail && cleanEmail !== user.emailAddress;

    if (!isNameChanged && !isPhoneChanged && !isEmailChanged) {
      return res.status(200).json({
        success: true,
        message: "No changes detected.",
        data: {
          id: user.id,
          userName: user.userName,
          contactNumber: user.contactNumber,
          emailAddress: user.emailAddress,
        },
      });
    }

    // ✅ Unique check only if phone/email changed
    if (isPhoneChanged || isEmailChanged) {
      const existing = await User.findOne({
        where: {
          id: { [Op.ne]: userId },
          [Op.or]: [
            isEmailChanged ? { emailAddress: cleanEmail } : null,
            isPhoneChanged ? { contactNumber: cleanPhone } : null,
          ].filter(Boolean),
        },
      });

      if (existing) {
        if (existing.emailAddress === cleanEmail) {
          return res.status(409).json({
            success: false,
            message: "This email is already in use.",
          });
        }

        if (existing.contactNumber === cleanPhone) {
          return res.status(409).json({
            success: false,
            message: "This contact number is already in use.",
          });
        }
      }
    }

    // ✅ Update only changed fields
    await User.update(
      {
        userName: isNameChanged ? cleanName : user.userName,
        contactNumber: isPhoneChanged ? cleanPhone : user.contactNumber,
        emailAddress: isEmailChanged ? cleanEmail : user.emailAddress,
      },
      { where: { id: userId } }
    );


    const updatedUser = await User.findOne({
      where: { id: userId },
      attributes: ["id", "userName", "contactNumber", "emailAddress"],
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log("updateProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getuserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Session timeout. Please login again.",
      });
    }

    const findProfile = await ProfileDetails.findOne({
      where: { userId },   // ✅ correct
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


exports.updateProfileDetails = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { skills, experience, educations, headline, noExperience } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
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


    // 1️⃣ Headline validation
    if (headline && headline.length > 220) {
      return res.status(400).json({
        success: false,
        message: "Headline cannot exceed 220 characters",
      });
    }

    // 2️⃣ Skills validation
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

    // 3️⃣ Experience validation
    if (experience && !Array.isArray(experience)) {
      return res.status(400).json({
        success: false,
        message: "Experience must be an array",
      });
    }

    // If noExperience = 1 then experience must be empty
    if (noExperience === 1 && experience && experience.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot add experience if marked as no experience",
      });
    }

    // 4️⃣ Education validation
    if (educations && !Array.isArray(educations)) {
      return res.status(400).json({
        success: false,
        message: "Educations must be an array",
      });
    }

    /* ---------------- UPDATE DATA ---------------- */

    const updatedData = {
      skills: skills ?? profile.skills,
      experience: experience ?? profile.experience,
      educations: educations ?? profile.educations,
      headline: headline ?? profile.headline,
      noExperince:
        noExperience !== undefined
          ? noExperience
          : profile.noExperince,
    };

    await profile.update(updatedData);


    let completion = 0;

    if (updatedData.headline) completion += 20;
    if (updatedData.skills?.length > 0) completion += 20;
    if (updatedData.educations?.length > 0) completion += 20;

    if (updatedData.noExperince === 1) {
      completion += 20;
    } else if (updatedData.experience?.length > 0) {
      completion += 20;
    }

    if (profile.profileImage) completion += 20;

    await profile.update({
      percentageOfAccountComplete: completion,
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    const profile = await ProfileDetails.findOne({ where: { userId } });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile details not found",
      });
    }

    const relativePath = `/uploads/profileimage/${file.filename}`;
    /* ---------------- DELETE OLD IMAGE ---------------- */

    if (profile.profileImage) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        profile.profileImage
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    /* ---------------- UPDATE IMAGE ---------------- */

    let completion = profile.percentageOfAccountComplete || 0;

    if (!profile.profileImage) {
      completion += 10; // image worth 10%
      if (completion > 100) completion = 100;
    }

    await profile.update({
      profileImage: relativePath,
      percentageOfAccountComplete: completion,
    });

    return res.json({
      success: true,
      message: "Profile image updated successfully",
      data: profile,
    });

  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.updateUserCv = async (req, res) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - user not authenticated",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No CV file uploaded",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let profile = await ProfileDetails.findOne({ where: { userId } });
    if (!profile) {
      profile = await ProfileDetails.create({
        userId,
        percentageOfAccountComplete: 0,
      });
    }

    const relativePath = `/uploads/UserCv/${file.filename}`;

    if (user.uploadedCv) {
      const oldCvPath = path.join(__dirname, '..', user.uploadedCv);

      if (fs.existsSync(oldCvPath)) {
        try {
          fs.unlinkSync(oldCvPath);
        } catch (unlinkErr) {
          console.warn(`Failed to delete old CV: ${oldCvPath}`, unlinkErr);
        }
      }
    }

    await user.update({
      uploadedCv: relativePath,
    });

    let completion = profile.percentageOfAccountComplete || 0;

    if (!profile.uploadedCv) {
      completion += 10;
      if (completion > 100) completion = 100;
    }

    await profile.update({
      uploadedCv: relativePath,
      percentageOfAccountComplete: completion,
    });


    return res.status(200).json({
      success: true,
      message: "CV uploaded successfully",
      data: {
        uploadedCv: relativePath,
        percentageOfAccountComplete: completion,
      },
    });

  } catch (error) {
    console.error("Error in updateUserCv:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload CV",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};



// admin handles
exports.getAlluserListed = async (req, res) => {
  try {
    const adminId = req.user?.id;


    if (!adminId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const {
      search = "",
      limit = 20,
      page = 1,
      accountStatus,
    } = req.query;

    const offset = (page - 1) * limit;

    // 🔍 Search filter
    const where = {};

    if (search) {
      where[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { emailAddress: { [Op.like]: `%${search}%` } },
        { contactNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    // 🟢 Account status filter
    if (accountStatus !== undefined) {
      where.accountActive = accountStatus;
    }

    // 📦 Fetch users with profile
    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        {
          model: ProfileDetails,
          as: "profileDetails",
        },
      ],
      attributes: {
        exclude: ["password", "otp", "otpExpireTime"],
        include: [
          // ✅ Applied Jobs Count
          [
            Sequelize.literal(`(
          SELECT COUNT(*) 
          FROM job_applications AS ja 
          WHERE ja.userId = User.id AND ja.deletedAt IS NULL
        )`),
            "appliedJobsCount",
          ],

          // ✅ Saved Jobs Count
          [
            Sequelize.literal(`(
          SELECT COUNT(*) 
          FROM saved_jobs AS sj 
          WHERE sj.userId = User.id
        )`),
            "savedJobsCount",
          ],
        ],
      },
      limit: Number(limit),
      offset: Number(offset),
      order: [["id", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      total: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: error,
      error: error.message,
    });
  }
};

exports.updateBasicDetails = async (req, res) => {
  try {
    const { userId, isDeleted, accountStatus } = req.body;

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

    if (typeof isDeleted !== "undefined") {
      updateData.isDeleted = toBool(isDeleted);
    }

    if (typeof accountStatus !== "undefined") {
      updateData.accountActive = toBool(accountStatus);
    }

    // ❗ Nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update",
      });
    }

    console.log("UPDATE DATA:", updateData);

    // ✅ 3. Update using Model (best practice)
    const [updatedRows] = await User.update(updateData, {
      where: { id: userId },
    });

    console.log("Rows Updated:", updatedRows);

    // ❗ If no row updated
    if (!updatedRows) {
      return res.status(400).json({
        success: false,
        message: "Update failed or no changes applied",
      });
    }

    // ✅ 4. Fetch updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // 🔥 hide password
    });

    // ❗ Safety check
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found after update",
      });
    }

    // ✅ 5. Success response
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