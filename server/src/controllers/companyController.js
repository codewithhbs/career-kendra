"use strict";

const { Company, Employer, Job } = require("../models");
const { Op, Sequelize } = require("sequelize");

const fs = require("fs");
const path = require("path");
// =============================================
// ✅ STEP 1: Create Basic Company Details
// =============================================
exports.createCompanyStep1 = async (req, res) => {
  try {
    console.log("createCompanyStep1 called with body:", req.user);
    const employerId = req.user.id;

    const {
      companyName,
      companyTagline,
      companyCategory,
      companySize,
      GST,
      PAN,
      foundedYear,
      country,
      state,
      city
    } = req.body;

    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // Check already exists
    // const existing = await Company.findOne({ where: { employerId } });

    // if (existing) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Company already created. Please update instead.",
    //   });
    // }

    const company = await Company.create({
      employerId,
      companyName,
      companyTagline,
      companyCategory,
      companySize,
      GST,
      PAN,
      foundedYear,
      country,
      state,
      city,
      employerRole: "owner",
    });

    return res.status(201).json({
      success: true,
      message: "Basic company details added successfully",
      data: company,
    });

  } catch (error) {
    console.log("createCompanyStep1 error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================
// ✅ STEP 2: Add Contact + Social + Media
// =============================================
exports.updateCompanyStep2 = async (req, res) => {
  try {
    const employerId = req.user.id;
    const file = req.file;

    // companyId frontend se aaya hai toh pehle usse try karo,
    // warna employerId se fallback
    const { companyId, ...restBody } = req.body;

    const company = companyId
      ? await Company.findOne({ where: { id: companyId, employerId } }) // ✅ security: employerId bhi match karo
      : await Company.findOne({ where: { employerId } });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found. Complete Step 1 first.",
      });
    }

    let updateData = { ...restBody };

    if (file) {
      updateData.companyLogo = `/uploads/companyDocuments/${file.filename}`;
    }

    await company.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Company details updated successfully",
      data: company,
    });

  } catch (error) {
    console.log("updateCompanyStep2 error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllCompaniesList = async (req, res) => {
  try {
    console.log("req.user",req.user)
    const employerId = req.user.id;

    const companies = await Company.findAll({
      where: { employerId },
      include: [
        {
          model: Employer,
          as: "employer",
        },
      ],
    });

    if (companies.length === 0) {
      return res.status(200).json({
        success: true,
        notFound: true,
        message: "Company profile not found Please add it first",
      });
    }

    return res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    console.log("Internal server error", error)
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const {id} = req.params;

    const company = await Company.findOne({
      where: { id },
      include: [
        {
          model: Employer,
          as: "employer",
        },
      ],
    });

    if (!company) {
      return res.status(200).json({
        success: true,
        notFound: true,
        message: "Company profile not found Please add it first",
      });
    }

    return res.status(200).json({
      success: true,
      data: company,
    })
  } catch (error) {
    console.log("Internal server error", error)
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// =============================================
// ✅ Get Company Profile
// =============================================
exports.getCompanyProfile = async (req, res) => {
  try {
    const employerId = req.user.id;

    const company = await Company.findOne({
      where: { employerId },
      include: [
        {
          model: Employer,
          as: "employer",
        },
      ],
    });

    if (!company) {
      return res.status(200).json({
        success: true,
        notFound: false,
        message: "Company profile not found Please add it first",
      });
    }

    return res.json({
      success: true,
      data: company,
    });

  } catch (error) {
    console.log("getCompanyProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================
// ✅ Update Full Company
// =============================================
exports.updateCompany = async (req, res) => {
  try {
    const employerId = req.user.id;

    const company = await Company.findOne({ where: { employerId } });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await company.update(req.body);

    return res.json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });

  } catch (error) {
    console.log("updateCompany error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================
// ✅ Submit Company For Verification
// =============================================
exports.submitCompanyForApproval = async (req, res) => {
  try {
    const employerId = req.user.id;

    const company = await Company.findOne({ where: { employerId } });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await company.update({ companyStatus: "submitted" });

    await Employer.update(
      { accountStatus: "active" },
      { where: { id: employerId } }
    );

    return res.json({
      success: true,
      message: "Company submitted for approval",
    });

  } catch (error) {
    console.log("submitCompanyForApproval error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================================
// ✅ Delete Company
// =============================================
exports.deleteCompany = async (req, res) => {
  try {
    const employerId = req.user.id;

    const company = await Company.findOne({ where: { employerId } });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await company.destroy();

    return res.json({
      success: true,
      message: "Company deleted successfully",
    });

  } catch (error) {
    console.log("deleteCompany error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ADMIN CONTROLLERS

exports.getAllCompanyProfile = async (req, res) => {
  try {
    const {
      search = "",
      limit = 20,
      page = 1,
      status,
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { companyName: { [Op.like]: `%${search}%` } },
        { companyEmail: { [Op.like]: `%${search}%` } },
        { companyPhone: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      where.companyStatus = status;
    }

    const { count, rows } = await Company.findAndCountAll({
      where,
      include: [
        {
          model: Employer,
          as: "employer",

        },
      ],
      limit: Number(limit),
      offset: Number(offset),
      order: [["id", "DESC"]],
    });

    // 🌐 Base URL (dynamic)
const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    // 🖼 Format images
    const formattedData = rows.map((company) => {
      const data = company.toJSON();

      // ✅ Company Logo
      if (data.companyLogo) {
        data.companyLogo = `${baseUrl}${data.companyLogo}`;
      }

      // ✅ Company Photos (array)
      if (Array.isArray(data.companyPhotos)) {
        data.companyPhotos = data.companyPhotos.map(
          (img) => `${baseUrl}${img}`
        );
      }

      return data;
    });

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      total: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getSingleCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id, {
      include: [
        {
          model: Employer,
          as: "employer",
        },
      ],
      attributes: {
        include: [
          // ✅ Total Jobs Count
          [
            Sequelize.literal(`(
              SELECT COUNT(*) 
              FROM jobs j 
              WHERE j.companyId = Company.id
            )`),
            "jobCount",
          ],

          // ✅ Last Job Posted Date
          [
            Sequelize.literal(`(
              SELECT MAX(j.createdAt) 
              FROM jobs j 
              WHERE j.companyId = Company.id
            )`),
            "lastJobPostedAt",
          ],
        ],
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
// 
    const data = company.toJSON();

    // ✅ Helper
    const addBaseUrl = (path) => {
      if (!path) return path;
      if (path.startsWith("http")) return path;
      return `${baseUrl}${path}`;
    };

    // 🖼 Images
    data.companyLogo = addBaseUrl(data.companyLogo);

    if (Array.isArray(data.companyPhotos)) {
      data.companyPhotos = data.companyPhotos.map(addBaseUrl);
    }

    return res.status(200).json({
      success: true,
      message: "Company fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // 🔁 Toggle soft delete
    const newStatus = !company.isDeleted;

    await company.update({
      isDeleted: newStatus,
    });

    return res.status(200).json({
      success: true,
      message: newStatus
        ? "Company soft deleted successfully"
        : "Company restored successfully",
      data: {
        id: company.id,
        isDeleted: newStatus,
      },
    });
  } catch (error) {
    console.error("Delete company error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { companyStatus } = req.body;

    if (!companyStatus) {
      return res.status(400).json({
        success: false,
        message: "Company status is required",
      });
    }

    // ✅ Normalize (handle Active, ACTIVE type cases)
    companyStatus = companyStatus.trim().toLowerCase();

    const validStatuses = ["pending", "submitted", "approved", "rejected"];

    if (!validStatuses.includes(companyStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company status",
      });
    }

    const company = await Company.findByPk(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await company.update({ companyStatus });

    return res.status(200).json({
      success: true,
      message: "Company status updated successfully",
      data: company,
    });
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.AdminUpdateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const file = req.file;

    const company = await Company.findByPk(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // ✅ Allowed fields only (VERY IMPORTANT)
    const allowedFields = [
      "companyName",
      "companyEmail",
      "companyPhone",
      "companyWebsite",
      "companyTagline",
      "description",
      "companyAbout",
      "companyCategory",
      "companySize",
      "foundedYear",
      "state",
      "city",
      "pincode",
      "fullAddress",
      "country",
      "linkedinUrl",
      "facebookUrl",
      "instagramUrl",
      "twitterUrl",
      "youtubeUrl",
      "githubUrl",
      "whatsappNumber",
      "googleMapsUrl",
    ];

    const updateData = {};

    // 🔥 Filter only allowed fields
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // 🖼 Handle Logo Upload
    if (file) {
      updateData.companyLogo = `/uploads/companyDocuments/${file.filename}`;
    }

    await company.update(updateData);

    return res.json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });

  } catch (error) {
    console.log("updateCompany error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findByPk(id);

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    await company.destroy();

    return res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (error) {
    console.log("Internal server error")
    return res.status(500).json({ success: false, message: "Server error" });
  }
}