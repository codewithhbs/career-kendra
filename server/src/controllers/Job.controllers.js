"use strict";

const { Job, Company, Employer, User, SavedJobs, jobAssign, admin_employees } = require("../models");
const { GenerateOtp } = require("../utils/generateOtp"); // assume you have these
const { sendError, sendSuccess } = require("../utils/api");
const {
  createJobSchema,
  updateJobSchema,
  verifyOtpSchema,
  changeStatusSchema,
} = require("../validations/job.validation");
const { z, ZodError } = require("zod");

const slugify = require('slugify');
const ShortUniqueId = require('short-unique-id');
const { where, Op } = require("sequelize");
const uid = new ShortUniqueId({ length: 7 });

async function generateUniqueSlug(jobTitle, companyName) {
  if (!jobTitle) throw new Error("Job title is required for slug generation");
  let baseSlug = slugify(jobTitle, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });

  if (companyName) {
    const companyPart = slugify(companyName, { lower: true, strict: true });
    if (companyPart) {
      baseSlug = `${baseSlug}-${companyPart}`;
    }
  }

  let slug = baseSlug;
  let attempt = 0;
  const maxAttempts = 8;

  while (attempt < maxAttempts) {
    const existing = await Job.findOne({ where: { slug } });
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${uid.rnd()}`;
    attempt++;
  }

  // Very rare – fallback
  throw new Error("Could not generate unique slug after several attempts");
}

exports.createJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const data = createJobSchema.parse({
      ...req.body,
      companyId: req.body.companyId,

      // ✅ ensure JSON fields are parsed
      workingDays: typeof req.body.workingDays === "string"
        ? JSON.parse(req.body.workingDays)
        : req.body.workingDays,

      screeningQuestions: typeof req.body.screeningQuestions === "string"
        ? JSON.parse(req.body.screeningQuestions)
        : req.body.screeningQuestions,
    });

    console.log("Creating job with data:", req.body);
    const company = await Company.findOne({
      where: { id: data.companyId, employerId },
    });

    if (!company) {
      return sendError(
        
        res,
        403,
        "You do not own this company or company not found",
      );
    }

     // ✅ 🔥 NEW: Employee check
    const employee = await Employer.findByPk(employerId); // ya Employee model jo bhi hai

    let status = "under-verification";

    if (employee?.specialAccess) {
      status = "active";
    }

    let slug = data.slug?.trim();
    if (!slug) {
      slug = await generateUniqueSlug(data.jobTitle, company.name);
    } else {
      const cleanSlug = slugify(slug, { lower: true, strict: true });
      if (cleanSlug !== slug) {
        return sendError(res, 400, "Slug contains invalid characters. Use only letters, numbers, and hyphens.");
      }

      const existing = await Job.findOne({ where: { slug } });
      if (existing) {
        return sendError(res, 409, "This slug is already in use. Please choose another or leave blank to auto-generate.");
      }
    }

    const otp = GenerateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // const conditionalStatus = 

    const job = await Job.create({
      ...data,
      slug,
      employerId,
      otp,
      otpExpiry,
      otpVerified: false,
      status: "under-verification"
    });

    console.log(`OTP for job ${job.id}: ${otp} (expires at ${otpExpiry.toISOString()})`);
    // TODO: send email with OTP (optional - depending on your flow)
    // await sendOtpEmail(company.email || req.user.email, otp, job.jobTitle);

    return sendSuccess(
      res,
      job,
      "Job created successfully. Please verify with OTP.",
    );
  } catch (err) {

    if (err instanceof ZodError) {
      return sendError(
        res,
        400,
        err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    console.error("Unexpected Error:", err);

    return sendError(res, 500, "Failed to create job");
  }
};

exports.verifyJobOtp = async (req, res) => {
  try {
    const { jobId, otp } = verifyOtpSchema.parse(req.body);

    const job = await Job.findByPk(jobId);
    if (!job) return sendError(res, 404, "Job not found");

    if (job.otpVerified) {
      return sendError(res, 400, "Job is already verified");
    }

    if (!job.otp || !job.otpExpiry || job.otpExpiry < new Date()) {
      return sendError(res, 400, "OTP expired or invalid");
    }

    if (job.otp !== otp) {
      return sendError(res, 400, "Incorrect OTP");
    }

    await job.update({
      otp: null,
      otpExpiry: null,
      otpVerified: true,
      status: "under-verification",
    });

    return sendSuccess(res, null, "Job verified successfully");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return sendError(res, 400, err.errors[0].message);
    }
    return sendError(res, 500, "Verification failed");
  }
};

exports.resendJobOtp = async (req, res) => {
  try {
    const { jobId } = z
      .object({ jobId: z.number().int().positive() })
      .parse(req.body);

    const job = await Job.findByPk(jobId);
    if (!job) return sendError(res, 404, "Job not found");

    if (job.otpVerified) {
      return sendError(res, 400, "Job is already verified");
    }

    const newOtp = GenerateOtp();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await job.update({
      otp: newOtp,
      otpExpiry: newExpiry,
    });

    console.log(`New OTP for job ${job.id}: ${newOtp} (expires at ${newExpiry.toISOString()})`);
    // await sendOtpEmail(..., newOtp, ...);

    return sendSuccess(res, null, "New OTP sent successfully");
  } catch (err) {
    return sendError(res, 500, "Failed to resend OTP");
  }
};

exports.companyRegister = async (req, res) => {
  try {
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
    const existing = await Company.findOne({ where: { employerId } });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Company already created. Please update instead.",
      });
    }

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
    return sendError(res, 500, "Failed to register company");
  }
}

exports.getAllJobs = async (req, res) => {
  try {
    const employerId = req.params.id || req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { employerId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [
        { model: Company, as: "company" },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return sendSuccess(res, {
      jobs: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    return sendError(res, 500, "Failed to fetch jobs");
  }
};

exports.getOneJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: employerId, type } = req.user;

    let whereCondition = { id };

    if (type !== "admin") {
      whereCondition.employerId = employerId;
    }

    const job = await Job.findOne({
      where: whereCondition,
      include: [
        { model: Company, as: "company" },
        { model: Employer, as: "employer" },
      ],
    });

    if (!job)
      return sendError(res, 404, "Job not found or you don't have access");

    return sendSuccess(res, job);
  } catch (err) {
    console.error("GetOneJob Error:", err);
    return sendError(res, 500, "Failed to fetch job");
  }
};


exports.updateJob = async (req, res) => {
  try {
    const { id, type } = req.params;
    const employerId = req.user.id;

    const data = updateJobSchema.parse(req.body);
    console.log("Updating job with data:", req.body);
    /* ================= FIND JOB ================= */

    let whereCondition = { id };

    // 👤 User
    if (!type) {
      whereCondition.employerId = employerId;
    }

    const job = await Job.findOne({ where: whereCondition });

    if (!job)
      return sendError(res, 404, "Job not found or access denied");

    const isAdmin = !!type;

    /* ================= STATUS PROTECTION ================= */

    if (!isAdmin && (job.status === "active" || job.status === "closed")) {
      if (data.status || data.isFeatured) {
        return sendError(
          res,
          403,
          "Cannot change status or featured flag after job is active/closed"
        );
      }
    }

    /* ================= SLUG CHECK ================= */

    if (data.slug && data.slug !== job.slug && job.otpVerified) {
      const slugExists = await Job.findOne({
        where: { slug: data.slug, id: { [Op.ne]: id } },
      });

      if (slugExists)
        return sendError(res, 409, "This slug is already taken");
    }

    /* ================= OTP LOGIC (ONLY USER + DRAFT) ================= */

    let otpSend = false;

    if (!isAdmin && job.status === "draft") {
      const otp = GenerateOtp();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      data.otp = otp;
      data.otpExpiry = otpExpiry;
      data.otpVerified = false;
      data.status = "draft";

      otpSend = true;
    }

    /* ================= UPDATE ================= */

    await job.update(data);

    const resData = {
      isOtpSend: otpSend,
      job,
    };

    return sendSuccess(
      res,
      resData,
      otpSend
        ? "Job updated. OTP sent, please verify."
        : "Job updated successfully"
    );
  } catch (err) {
    console.log(err);

    if (err instanceof z.ZodError) {
      const msg = err.errors.map((e) => e.message).join(", ");
      return sendError(res, 400, msg);
    }

    console.error("Update Job Error:", err);
    return sendError(res, 500, "Failed to update job");
  }
};
exports.deleteJob = async (req, res) => {


  try {

    const { id, type } = req.params;
    const employerId = req.user.id;


    let whereCondition = { id };

    if (!type) {
      whereCondition.employerId = employerId;

    }

    const job = await Job.findOne({ where: whereCondition });

    if (!job) {
      return sendError(res, 404, "Job not found");
    }

    await job.destroy();
    return sendSuccess(res, null, "Job deleted successfully");
  } catch (err) {
    console.error("❌ Delete job error:", err);
    return sendError(res, 500, "Failed to delete job");
  }
};

exports.changeJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;

    const { status } = changeStatusSchema.parse(req.body);

    const job = await Job.findOne({ where: { id, employerId } });
    if (!job) return sendError(res, 404, "Job not found");

    if (!job.otpVerified && status !== "draft") {
      return sendError(
        res,
        403,
        "Job must be OTP verified before changing status to non-draft",
      );
    }

    await job.update({ status });

    return sendSuccess(res, { status }, `Job status changed to ${status}`);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return sendError(res, 400, err.errors[0].message);
    }
    return sendError(res, 500, "Failed to change job status");
  }
};

exports.changeStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatus = [
      "draft",
      "under-verification",
      "active",
      "closed",
      "paused",
      "reject",
    ];

    // ✅ Validate status
    if (!status || !validStatus.includes(status)) {
      return sendError(res, 400, "Invalid status value");
    }

    // ✅ Reason required only for rejected
    if (status === "reject" && !reason) {
      return sendError(res, 400, "Reason is required when rejecting a job");
    }

    const job = await Job.findOne({ where: { id } });

    if (!job) {
      return sendError(res, 404, "Job not found");
    }

    // ✅ Prevent same status update
    if (job.status === status) {
      return sendError(res, 400, "Job already in this status");
    }

    const updateData = {
      status,
      resonToReject: status === "reject" ? reason : null,
    };

    await job.update(updateData);

    return sendSuccess(res, job, "Job status updated successfully");
  } catch (error) {
    return sendError(res, 500, "Failed to change job status");
  }
};

exports.getJobViaSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`Fetching job with slug: ${slug}`);
    const job = await Job.findOne({
      where: { slug },
      include: [
        { model: Company, as: "company" },
        {
          model: Employer,
          as: "employer"
        },
      ],
    });

    if (!job) return sendError(res, 404, "Job not found");

    return sendSuccess(res, job);
  } catch (err) {
    return sendError(res, 500, "Failed to fetch job");
  }
}


exports.GetAllJobsForUser = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      jobType,
      employeeId,
      workMode,
      shiftType,
      status = "active",
      city,
      industry,
      jobCategory,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience,
      sortBy = "createdAt",
      order = "DESC"
    } = req.query;
    console.log("GetAllJobsForUser Query:", req.query);
    const offset = (page - 1) * limit;

    let whereCondition = {};

    if (status === "under-verification") {
      whereCondition.status = {
        [Op.in]: ["draft", "under-verification"]
      };
    }

    else if (status === "pending") {
      whereCondition.status = {
        [Op.in]: ["draft", "under-verification"]
      };
    } else {
      whereCondition.status = status;
      whereCondition.expiryDate = {
        [Op.gt]: new Date()
      };
    }

    // 🔍 Search
    if (search) {
      const words = search
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      whereCondition[Op.or] = words.flatMap((word) => [
        { jobTitle: { [Op.like]: `%${word}%` } },
        { jobCategory: { [Op.like]: `%${word}%` } },
        { requiredSkills: { [Op.like]: `%${word}%` } },
        { city: { [Op.like]: `%${word}%` } },
      ]);
    }

    if (jobType) whereCondition.jobType = jobType;
    //use like
    if (industry) whereCondition.industry = { [Op.like]: `%${industry}%` };
    if (jobCategory) whereCondition.jobCategory = { [Op.like]: `%${jobCategory}%` };

    if (workMode) whereCondition.workMode = workMode;
    if (shiftType) whereCondition.shiftType = shiftType;
    if (city) whereCondition.city = city;

    if (minSalary && maxSalary) {
      whereCondition.salaryMin = { [Op.gte]: minSalary };
      whereCondition.salaryMax = { [Op.lte]: maxSalary };
    }

    if (minExperience && maxExperience) {
      whereCondition.experienceMin = { [Op.gte]: minExperience };
      whereCondition.experienceMax = { [Op.lte]: maxExperience };
    }

    // 🔥 Assignment Include
    const assignmentInclude = {
      model: jobAssign,
      as: "assignment",
      required: !!employeeId, // INNER JOIN if employeeId exists
      attributes: ["id", "status", "assignedAt"],
      ...(employeeId && {
        where: {
          adminEmployeId: employeeId
        }
      }),
      include: [
        {
          model: admin_employees,
          as: "employee",
          attributes: ["id", "name"]
        }
      ]
    };

    const { count, rows } = await Job.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Company,
          as: "company"
        },
        assignmentInclude
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]]
    });

    return res.status(200).json({
      success: true,
      totalJobs: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      jobs: rows
    });

  } catch (error) {
    console.error("GetAllJobsForUser Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.savedJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const jobId = req.params?.id;

    // Validate user login
    if (!userId) return sendError(res, 401, "You need to login to save jobs.");

    // Validate job ID param
    if (!jobId) return sendError(res, 400, "Invalid request. Job ID is required.");

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) return sendError(res, 403, "User account not found. Please login or register.");

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) return sendError(res, 404, "The job you are trying to save does not exist.");

    // Save the job if not already saved
    const [savedJob, created] = await SavedJobs.findOrCreate({
      where: { userId, jobId },
    });

    if (!created) return sendSuccess(res, savedJob, "You have already saved this job.");

    return sendSuccess(res, savedJob, "Job saved successfully to your wishlist!");
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Oops! Something went wrong while saving the job. Please try again.");
  }
};

exports.removeSavedJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const jobId = req.params?.id;

    if (!userId) return sendError(res, 401, "You need to login to remove saved jobs.");
    if (!jobId) return sendError(res, 400, "Invalid request. Job ID is required.");

    const deleted = await SavedJobs.destroy({
      where: { userId, jobId },
    });

    if (!deleted) return sendError(res, 404, "This job is not in your saved list.");

    return sendSuccess(res, null, "Job removed successfully from your wishlist.");
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Oops! Something went wrong while removing the saved job. Please try again.");
  }
};

exports.getAllSavedJobs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return sendError(res, 401, "You need to login to view your saved jobs.");

    const savedJobs = await SavedJobs.findAll({
      where: { userId },
      include: [
        { model: Job, as: "job" },
      ],
      order: [["savedAt", "DESC"]],
    });

    if (!savedJobs.length) return sendSuccess(res, [], "You have no saved jobs yet. Start saving jobs you like!");

    return sendSuccess(res, savedJobs, "Here are your saved jobs.");
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Oops! Something went wrong while fetching your saved jobs. Please try again.");
  }
};

exports.checkAlreadySavedJobs = async (req, res) => {
  try {
    const userId = req.user?.id;
    const jobId = req.params?.id;

    // Validate user login
    if (!userId) return sendError(res, 401, "You need to login to check saved jobs.");

    // Validate job ID
    if (!jobId) return sendError(res, 400, "Invalid request. Job ID is required.");

    // Check if job is already saved
    const savedJob = await SavedJobs.findOne({
      where: { userId, jobId },
    });

    if (savedJob) {
      return sendSuccess(res, { isSaved: true }, "This job is already in your saved list.");
    } else {
      return sendSuccess(res, { isSaved: false }, "This job is not saved yet.");
    }
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Something went wrong while checking saved jobs. Please try again.");
  }
};