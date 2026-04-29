"use strict";

const { Job, Company, Employer, ProfileDetails, JobInterview, User, JobApplication, admin_employees, Message, SavedJobs, Role, role_permissions, JobApplicationDocument, jobAssign } = require("../models");
console.log("Models imported in job.applications.js:", role_permissions)
const { GenerateOtp } = require("../utils/generateOtp"); // assume you have these
const { sendError, sendSuccess } = require("../utils/api");
const { where, Op, fn, col } = require("sequelize");
const addEmailJob = require("../services/emailService");
const sendEmail = require("../utils/sendEmail");
const { sendMessage } = require("../utils/sendMessage");
// const webSettings = require("../models/webSettings");
const { WebSettings } = require("../models");
const path = require("path");
const fs = require("fs");
const withRetry = async (fn, maxRetries = 3, delayMs = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`[EMAIL RETRY] Attempt ${attempt}/${maxRetries} failed:`, err.message);

      if (attempt === maxRetries) {
        throw lastError; // final failure → caught by outer try/catch
      }

      // Exponential backoff: 1s → 2s → 4s ...
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
    }
  }
};
exports.ApplyToJob = async (req, res) => {
  const userId = req.user?.id;
  const { jobId } = req.params;
  let { screeningAnswers } = req.body;

  if (!userId) {
    return sendError(res, 401, "Unauthorized access");
  }

  try {
    // ================================
    // 1️⃣ Check User
    // ================================
    const user = await User.findByPk(userId);

    if (!user) {
      return sendError(res, 404, "User not found. Please register and login.");
    }

    if (!user.accountActive) {
      return sendError(
        res,
        403,
        "Your account is deactivated. Please contact support."
      );
    }

    if (!user.uploadedCv) {
      return sendError(res, 400, "Please upload your CV before applying.");
    }

    // ================================
    // 2️⃣ Check Job
    // ================================
    const job = await Job.findByPk(jobId);

    if (!job) {
      return sendError(res, 404, "This job does not exist or has been removed.");
    }

    const invalidStatuses = ["paused", "closed", "draft", "under-verification"];

    if (invalidStatuses.includes(job.status)) {
      return sendError(
        res,
        400,
        "This job is currently not accepting applications."
      );
    }

    // ================================
    // 3️⃣ Prevent Duplicate Applications
    // ================================
    const alreadyApplied = await JobApplication.findOne({
      where: { jobId, userId },
      attributes: ["id"],
    });

    if (alreadyApplied) {
      return sendError(res, 409, "You have already applied for this job.");
    }

    // ====================== NEW: Validate Screening Answers ======================
    const questions = job.screeningQuestions || [];

    if (questions.length > 0) {
      if (!screeningAnswers || typeof screeningAnswers !== "object") {
        return sendError(res, 400, "Screening answers are required for this job");
      }

      const answersToSave = {};

      for (const q of questions) {
        const answer = screeningAnswers[q.id];

        if (q.required && (answer === undefined || answer === "" || answer === null)) {
          return sendError(res, 400, `Answer is required for question: ${q.question}`);
        }

        // Optional: Auto-disqualify logic
        if (q.disqualifyAnswer && answer === q.disqualifyAnswer) {
          // Aap yahan application status "disqualified" bhi rakh sakte ho
          console.log(`Candidate disqualified on question: ${q.question}`);
        }

        answersToSave[q.id] = {
          question: q.question,
          type: q.type,
          answer: answer ?? null,
          options: q.options || null
        };
      }

      screeningAnswers = answersToSave;   // structured format mein save kar rahe hain
    } else {
      screeningAnswers = {};   // koi question nahi to empty object
    }

    // ================================
    // 4️⃣ Create Application
    // ================================
    const application = await JobApplication.create({
      jobId,
      userId,
      status: "applied",
      appliedAt: new Date(),
      resume: user.uploadedCv,
      screeningAnswers: screeningAnswers   // ← structured object save ho raha hai
    });

    // ================================
    // 5️⃣ Get Full Details (Job + Company)
    // ================================
    const applicationDetails = await JobApplication.findByPk(application.id, {
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["id", "userName", "emailAddress"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle", "employerId"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["companyName", "companyEmail", "companyPhone"],
            },
          ],
        },
      ],
    });

    const candidateName =
      applicationDetails?.candidate?.userName || "Candidate";

    const jobTitle =
      applicationDetails?.job?.jobTitle || "the position";

    const companyName =
      applicationDetails?.job?.company?.companyName || "the company";

    const employerId = applicationDetails?.job?.employerId;

    const websiteDetail = await WebSettings.findOne({ where: { id: 1 } });
    console.log("websiteDetail", websiteDetail);

    const adminEmail = websiteDetail?.contactEmail || "";
    console.log("adminEmail", adminEmail);

    // ================================
    // 6️⃣ Send Email to Candidate (Async)
    // ================================
    if (user.emailAddress) {
      const applicationEmail = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Application Submitted</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
<td style="background:#1a73e8;color:#ffffff;padding:25px;text-align:center;">
<h1 style="margin:0;font-size:24px;">Career Kendra</h1>
<p style="margin:5px 0 0;font-size:14px;">Connecting Talent with Opportunity</p>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:35px; color:#333; font-size:15px; line-height:1.6;">

<p style="margin-top:0;">Hi <strong>${user.firstName || "Candidate"}</strong>,</p>

<p>
Great news! 🎉 Your application for the position of 
<strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been 
successfully submitted.
</p>

<p>
Our recruitment team will review your application shortly. If your profile 
matches the job requirements, you will be contacted for the next steps.
</p>

<p>
While you wait, why not explore more exciting opportunities? Thousands of 
companies are hiring right now on <strong>Career Kendra</strong>.
</p>

<p>
🚀 Discover new opportunities, connect with top employers, and grow your career 
with <strong>Career Kendra</strong>.
</p>

<p>
We wish you the best of luck with your application!
</p>

<br>

<p style="margin-bottom:0;">
Best regards,<br>
<strong>The Career Kendra Team</strong>
</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#f1f3f6;padding:20px;text-align:center;font-size:13px;color:#666;">
<p style="margin:0;">© ${new Date().getFullYear()} Career Kendra</p>
<p style="margin:6px 0 0;">
Helping professionals discover better career opportunities.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

      try {
        const emailJob = await addEmailJob({
          html: applicationEmail,
          options: {
            receiver_email: user.emailAddress,
            subject: "Job Application Submitted Successfully",
          },
        });

        console.log("Application email job queued:", emailJob?.id);
      } catch (error) {
        console.log("Failed to queue application email:", error.message);
      }
    }

    // ================================
    // 7️⃣ Send Email to Admin (Async)
    // ================================
    if (adminEmail) {
      console.log("adminEmail i am in", adminEmail)
      const appliedAt = new Date(application.appliedAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const adminNotificationEmail = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Job Application</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 6px 16px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
<td style="background:#1a73e8;color:#ffffff;padding:25px;text-align:center;">
<h1 style="margin:0;font-size:24px;">Career Kendra — Admin</h1>
<p style="margin:5px 0 0;font-size:14px;">New Job Application Received</p>
</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:35px; color:#333; font-size:15px; line-height:1.6;">

<p style="margin-top:0;">A new application has been submitted on the platform. Here are the details:</p>

<!-- Candidate Details -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
<tr>
<td style="background:#f8f9fa;padding:12px 16px;font-weight:bold;font-size:13px;color:#1a73e8;letter-spacing:0.5px;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">
Candidate Details
</td>
</tr>
<tr>
<td style="padding:0;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr style="border-bottom:1px solid #f0f0f0;">
<td style="padding:12px 16px;font-size:14px;color:#666;width:40%;background:#fafafa;">Full Name</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">${user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : candidateName}</td>
</tr>
<tr style="border-bottom:1px solid #f0f0f0;">
<td style="padding:12px 16px;font-size:14px;color:#666;background:#fafafa;">Email Address</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">${user.emailAddress}</td>
</tr>
<tr style="border-bottom:1px solid #f0f0f0;">
<td style="padding:12px 16px;font-size:14px;color:#666;background:#fafafa;">Phone Number</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">${user.phoneNumber || "Not provided"}</td>
</tr>
<tr>
<td style="padding:12px 16px;font-size:14px;color:#666;background:#fafafa;">User ID</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">#${user.id}</td>
</tr>
</table>
</td>
</tr>
</table>

<!-- Job Details -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
<tr>
<td style="background:#f8f9fa;padding:12px 16px;font-weight:bold;font-size:13px;color:#1a73e8;letter-spacing:0.5px;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">
Job Details
</td>
</tr>
<tr>
<td style="padding:0;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr style="border-bottom:1px solid #f0f0f0;">
<td style="padding:12px 16px;font-size:14px;color:#666;width:40%;background:#fafafa;">Job Title</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">${jobTitle}</td>
</tr>
<tr style="border-bottom:1px solid #f0f0f0;">
<td style="padding:12px 16px;font-size:14px;color:#666;background:#fafafa;">Company</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">${companyName}</td>
</tr>
<tr style="border-bottom:1px solid #f0f0f0;">
<td style="padding:12px 16px;font-size:14px;color:#666;background:#fafafa;">Job ID</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">#${jobId}</td>
</tr>
<tr>
<td style="padding:12px 16px;font-size:14px;color:#666;background:#fafafa;">Applied At</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">${appliedAt}</td>
</tr>
</table>
</td>
</tr>
</table>

<!-- Application Details -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
<tr>
<td style="background:#f8f9fa;padding:12px 16px;font-weight:bold;font-size:13px;color:#1a73e8;letter-spacing:0.5px;text-transform:uppercase;border-bottom:1px solid #e0e0e0;">
Application Details
</td>
</tr>
<tr>
<td style="padding:0;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr style="border-bottom:1px solid #f0f0f0;">
<td style="padding:12px 16px;font-size:14px;color:#666;width:40%;background:#fafafa;">Application ID</td>
<td style="padding:12px 16px;font-size:14px;color:#333;font-weight:500;">#${application.id}</td>
</tr>
<tr>
<td style="padding:12px 16px;font-size:14px;color:#666;background:#fafafa;">Status</td>
<td style="padding:12px 16px;font-size:14px;font-weight:500;">
<span style="background:#e8f5e9;color:#2e7d32;padding:3px 10px;border-radius:12px;font-size:13px;">Applied</span>
</td>
</tr>
</table>
</td>
</tr>
</table>

<p style="color:#888;font-size:13px;margin-top:24px;margin-bottom:0;">
This is an automated notification from Career Kendra. No action is required on this email.
</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#f1f3f6;padding:20px;text-align:center;font-size:13px;color:#666;">
<p style="margin:0;">© ${new Date().getFullYear()} Career Kendra — Admin Notification</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

      try {
        const adminEmailJob = await addEmailJob({
          html: adminNotificationEmail,
          options: {
            receiver_email: adminEmail,
            subject: `New Application: ${jobTitle} — ${candidateName}`,
          },
        });

        console.log("Admin notification email job queued:", adminEmailJob?.id);
      } catch (error) {
        console.log("Failed to queue admin notification email:", error.message);
      }
    }

    // ================================
    // 8️⃣ Message to Employer
    // ================================
    await sendMessage({
      applicationId: application.id,
      senderId: user.id,
      senderType: "user",
      receiverId: employerId,
      receiverType: "employer",
      content: `New application received from ${candidateName} for the position of ${jobTitle}.`,
    });

    // ================================
    // 9️⃣ System Message to User
    // ================================
    await sendMessage({
      applicationId: application.id,
      senderId: 0,
      senderType: "system",
      receiverId: user.id,
      receiverType: "user",
      content: `Your application for ${jobTitle} at ${companyName} has been successfully submitted.`,
    });

    // ================================
    // 🔟 Response
    // ================================
    return sendSuccess(
      res,
      {
        applicationId: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
      },
      "Application submitted successfully."
    );
  } catch (error) {
    console.error("[ApplyToJob FAILED]", {
      userId,
      jobId,
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 600),
    });

    return sendError(res, 500, error);
  }
};

exports.ApplyJobByAdmin = async (req, res) => {
  const { jobId } = req.params;
  const {
    userName,
    contactNumber,
    emailAddress,
    totalExperience,
    lastSalary,
    location
  } = req.body;

  const file = req.file;           // Multer se aaya file
  const adminId = req.user?.id;

  try {
    if (!adminId) {
      return sendError(res, 403, "Unauthorized access");
    }

    if (!file) {
      return sendError(res, 400, "No CV file uploaded");
    }

    const relativePath = `/uploads/UserCv/${file.filename}`;

    // ====================== Input Validation ======================
    const cleanPhone = contactNumber?.replace(/\s+/g, "");
    if (!cleanPhone || !/^[0-9]{10}$/.test(cleanPhone)) {
      return sendError(res, 400, "Contact number must be a valid 10 digit number.");
    }

    const cleanEmail = emailAddress?.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return sendError(res, 400, "Please enter a valid email address.");
    }

    if (!userName?.trim()) {
      return sendError(res, 400, "User name is required.");
    }

    // ====================== Check if User Already Exists ======================
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { emailAddress: cleanEmail },
          { contactNumber: cleanPhone },
        ],
      },
      include: [{ model: ProfileDetails, as: "profileDetails" }]
    });

    let isNewUser = false;

    if (!user) {
      // ==================== CREATE NEW USER ====================
      isNewUser = true;

      user = await User.create({
        userName: userName.trim(),
        contactNumber: cleanPhone,
        emailAddress: cleanEmail,
        password: cleanPhone,                    // temporary password
        accountActive: true,
        uploadedCv: relativePath,                // ← CV save kar rahe hain
        experience: totalExperience ? parseInt(totalExperience) : null,
        lastSalary: lastSalary ? parseFloat(lastSalary) : null,
        location: location ? location.trim() : null,
      });

      // Create ProfileDetails
      const profileDetails = await ProfileDetails.create({
        userId: user.id,
        skills: [],
        experience: [],
        educations: [],
        percentageOfAccountComplete: 40,   // CV + basic info filled
      });

      await user.update({ profileDetailsId: profileDetails.id });

    } else {
      // ==================== EXISTING USER ====================

      // Delete old CV if exists
      if (user.uploadedCv) {
        const oldCvPath = path.join(__dirname, '..', user.uploadedCv);
        if (fs.existsSync(oldCvPath)) {
          try {
            fs.unlinkSync(oldCvPath);
            console.log(`Old CV deleted: ${oldCvPath}`);
          } catch (unlinkErr) {
            console.warn(`Failed to delete old CV: ${oldCvPath}`, unlinkErr);
          }
        }
      }

      // Update User
      await user.update({
        userName: userName.trim(),
        uploadedCv: relativePath,                    // ← New CV update
        experience: totalExperience !== undefined ? parseInt(totalExperience) : user.experience,
        lastSalary: lastSalary !== undefined ? parseFloat(lastSalary) : user.lastSalary,
        location: location !== undefined ? location.trim() : user.location,
      });

      // Agar ProfileDetails nahi hai to bana do
      if (!user.profileDetails) {
        const profileDetails = await ProfileDetails.create({
          userId: user.id,
          skills: [],
          experience: [],
          educations: [],
          percentageOfAccountComplete: 35,
        });

        await user.update({ profileDetailsId: profileDetails.id });
      } else {
        // Optional: ProfileDetails ka percentage update kar sakte ho
        await user.profileDetails.update({
          percentageOfAccountComplete: Math.max(user.profileDetails.percentageOfAccountComplete, 40)
        });
      }
    }

    // ====================== Job Validation ======================
    const job = await Job.findByPk(jobId);
    if (!job) {
      return sendError(res, 404, "This job does not exist or has been removed.");
    }

    const invalidStatuses = ["paused", "closed", "draft", "under-verification"];
    if (invalidStatuses.includes(job.status)) {
      return sendError(res, 400, "This job is currently not accepting applications.");
    }

    // ====================== Prevent Duplicate Application ======================
    const alreadyApplied = await JobApplication.findOne({
      where: { jobId, userId: user.id },
    });

    if (alreadyApplied) {
      return sendError(res, 409, "This user has already applied for this job.");
    }

    // ====================== Create Job Application ======================
    const application = await JobApplication.create({
      jobId,
      userId: user.id,
      status: "applied",
      appliedAt: new Date(),
      resume: user.uploadedCv,           // latest uploaded CV
      appliedByAdmin: adminId,           // track karne ke liye
    });

    // ====================== Final Response ======================
    return sendSuccess(
      res,
      {
        applicationId: application.id,
        userId: user.id,
        isNewUser,
        status: application.status,
        appliedAt: application.appliedAt,
      },
      isNewUser
        ? "New user created with CV and application submitted successfully."
        : "CV updated and application submitted successfully for existing user."
    );

  } catch (error) {
    console.error("[ApplyJobByAdmin FAILED]", {
      jobId,
      email: emailAddress,
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 700),
    });

    return sendError(res, 500, "Internal server error");
  }
};

exports.getMyApplications = async (req, res) => {
  try {

    const userId = req.user.id

    if (!userId) {
      return sendError(res, 401, "Unauthorized access");
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    const applications = await JobApplication.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: "job",

          required: true,
          include: [
            {
              model: Company,
              as: "company",

            },
          ],
        },
      ],
      order: [["appliedAt", "DESC"]],
      limit: 50,
    });

    const enrichedApplications = applications.map((app) => {
      const plain = app.get({ plain: true });
      return {
        ...plain,
        daysSinceApplied: Math.floor(
          (new Date() - new Date(plain.appliedAt)) / (1000 * 60 * 60 * 24)
        ),
        canWithdraw: ["applied", "under_review", "shortlisted"].includes(plain.status),
      };
    });

    console.log(enrichedApplications.length)
    return sendSuccess(res, {
      count: enrichedApplications.length,
      applications: enrichedApplications,
    }, "Your job applications retrieved",);
  } catch (error) {
    console.error("getMyApplications Error:", error);
    return sendError(res, 500, "Failed to fetch your applications");
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const { id: jobId } = req.params;

    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    let whereCondition = { jobId };

    if (status) {
      whereCondition.status = status;
    }

    const include = [
      {
        model: User,
        as: "candidate",
        attributes: ["id", "userName", "emailAddress", "contactNumber"],
        where: search
          ? {
            [Op.or]: [
              { userName: { [Op.like]: `%${search}%` } },
              { emailAddress: { [Op.like]: `%${search}%` } },
              { contactNumber: { [Op.like]: `%${search}%` } },
            ],
          }
          : undefined,
        required: !!search,
      },
      {
        model: User,
        as: "shortlistedBy",
        attributes: ["id", "userName"],
      },
      {
        model: Job,
        as: "job",
        attributes: ["id", "jobTitle"],
      },
      {
        model: Employer,
        as: "decidedByEmployer",
        attributes: ["id", "employerName"],
      },

      // 👇 ADD THIS
      {
        model: JobInterview,
        as: "interviews",
        attributes: [
          "id",
          "round",
          "interviewType",
          "scheduledAt",
          "feedback",
          "meetingLink",
          "location",
          "meetingPerson",
          "status",
          "result",
          "completedAt",
        ],
        required: false, // important (LEFT JOIN)
        order: [["round", "ASC"]],
      },
    ];

    const { count, rows } = await JobApplication.findAndCountAll({
      where: whereCondition,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
    });

    return res.status(200).json({
      success: true,
      totalApplications: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      applications: rows,
    });

  } catch (error) {
    console.error("Get Applications Error:", error);
    return sendError(res, 500, "Failed to fetch applications");
  }
};

exports.getAllApplicationsForEmpoyer = async (req, res) => {
  try {

    const { id: jobId } = req.params;

    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    /* ONLY THESE STATUSES */
    const whereCondition = {
      jobId,
      status: {
        [Op.in]: ["final_shortlist", "selected", "rejected", "interview_stage"]
      }
    };
    const include = [
      {
        model: User,
        as: "candidate",
        attributes: ["id", "userName", "emailAddress", "contactNumber"],
        where: search
          ? {
            [Op.or]: [
              { userName: { [Op.like]: `%${search}%` } },
              { emailAddress: { [Op.like]: `%${search}%` } },
              { contactNumber: { [Op.like]: `%${search}%` } },
            ],
          }
          : undefined,
        required: !!search,
      },
      {
        model: User,
        as: "shortlistedBy",
        attributes: ["id", "userName"],
      },
      {
        model: Job,
        as: "job",
        attributes: ["id", "jobTitle"],
      },
      {
        model: Employer,
        as: "decidedByEmployer",
        attributes: ["id", "employerName"],
      },

      // 👇 ADD THIS
      {
        model: JobInterview,
        as: "interviews",
        attributes: [
          "id",
          "round",
          "interviewType",
          "scheduledAt",
          "feedback",
          "meetingLink",
          "location",
          "meetingPerson",
          "status",
          "result",
          "completedAt",
        ],
        required: false, // important (LEFT JOIN)
        order: [["round", "ASC"]],
      },
    ];

    const { count, rows } = await JobApplication.findAndCountAll({
      where: whereCondition,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
      distinct: true
    });

    return res.status(200).json({
      success: true,
      totalApplications: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      applications: rows,
    });

  } catch (error) {
    console.error("Get Applications Error:", error);
    return sendError(res, 500, "Failed to fetch applications");
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findByPk(id);
    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    await application.destroy();
    return sendSuccess(res, 200, "Application deleted successfully");

  } catch (error) {
    console.error("Delete Application Error:", error);
    return sendError(res, 500, "Failed to delete application");
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["id", "userName", "emailAddress", "contactNumber"],
        },
        {
          model: JobApplicationDocument,
          as: "applicationDocuments",
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle", "jobDescription"],
        },
        {
          model: User,
          as: "shortlistedBy",
          attributes: ["id", "userName"],
        },
        {
          model: Employer,
          as: "decidedByEmployer",
          attributes: ["id", "employerName"],
        },
        // 👇 ADD THIS
        {
          model: JobInterview,
          as: "interviews",
          attributes: [
            "id",
            "round",
            "interviewType",
            "scheduledAt",
            "feedback",
            "meetingLink",
            "location",
            "meetingPerson",
            "status",
            "result",
            "completedAt",
          ],
          required: false, // important (LEFT JOIN)
          order: [["round", "ASC"]],
        },
      ],
    });

    if (!application) {
      return sendError(res, 404, "Application not found");
    }
    return sendSuccess(res, application, "Application details fetched");

  }

  catch (error) {
    console.error("Get Application By ID Error:", error);
    return sendError(res, 500, "Failed to fetch application details");
  }
}

exports.changeApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await JobApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["id", "userName", "emailAddress"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["companyName", "companyEmail", "companyPhone"],
            },
          ],
        },
      ],
    });
    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    application.status = status;
    await application.save();
    if (status === "shortlisted") {
      const name = application.candidate.userName;
      const email = application.candidate.emailAddress;
      const jobTitle = application.job.jobTitle;
      const companyName = application.job.company?.companyName || "Our Company";

      /* ================= EMAIL TEMPLATE ================= */

      const shortlistedEmail = `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
        
        <div style="max-width:600px;margin:auto;background:white;border-radius:8px;padding:30px;">
          
          <h2 style="color:#2c3e50;">🎉 Congratulations ${name}</h2>

          <p style="font-size:16px;color:#444;">
            Your application for the position of 
            <strong>${jobTitle}</strong> at 
            <strong>${companyName}</strong> has been <b>shortlisted</b>.
          </p>

          <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
            <p style="margin:0"><strong>Position:</strong> ${jobTitle}</p>
            <p style="margin:0"><strong>Company:</strong> ${companyName}</p>
            <p style="margin:0"><strong>Status:</strong> Shortlisted</p>
          </div>

          <p style="font-size:15px;color:#555;">
            Our hiring team will review your profile and may contact you soon
            regarding the next steps, such as interviews or further assessments.
          </p>

          <p style="font-size:15px;color:#555;">
            Please keep an eye on your email and dashboard for further updates.
          </p>

          <hr style="margin:30px 0"/>

          <p style="font-size:14px;color:#777;">
            Best Regards,<br/>
            <strong>Career Kendra Hiring Team</strong>
          </p>

        </div>

      </div>
    `;

      /* ================= ADD EMAIL JOB ================= */

      try {
        const job = await addEmailJob({
          html: shortlistedEmail,
          options: {
            receiver_email: email,
            subject: `Your application for ${jobTitle} has been shortlisted`,
          },
        });

        console.log("Shortlisted email job queued:", job?.id);

      } catch (error) {
        console.log("Failed to queue shortlisted email:", { email, jobTitle });
      }
    }

    const jobTitle = application.job.jobTitle;
    const companyName = application.job.company?.companyName || "the company";
    const userId = application.candidate.id;
    const statusMessages = {
      applied: `Your application for ${jobTitle} at ${companyName} has been submitted successfully.`,

      under_review: `Your application for ${jobTitle} at ${companyName} is currently under review.`,

      shortlisted: `Congratulations! Your application for ${jobTitle} at ${companyName} has been shortlisted.`,

      interview_stage: `Good news! You have moved to the interview stage for the ${jobTitle} position at ${companyName}.`,

      final_shortlist: `You have been placed in the final shortlist for the ${jobTitle} role at ${companyName}.`,

      selected: `Congratulations! You have been selected for the ${jobTitle} position at ${companyName}.`,

      rejected: `Thank you for applying for the ${jobTitle} position at ${companyName}. Unfortunately, your application was not selected this time.`,

      withdrawn: `Your application for ${jobTitle} at ${companyName} has been withdrawn.`,
    };

    if (statusMessages[status]) {
      await sendMessage({
        applicationId: application.id,
        senderId: 0, // system
        senderType: "system",
        receiverId: userId,
        receiverType: "user",
        content: statusMessages[status],
      });
    }

    return sendSuccess(res, 200, "Application status updated", application);

  } catch (error) {
    console.error("Change Application Status Error:", error);
    return sendError(res, 500, "Failed to update application status");
  }
}

exports.markShortlisted = async (req, res) => {
  try {

    const { id } = req.params;
    const adminId = req.user?.id;

    const application = await JobApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["id", "userName", "emailAddress"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["companyName", "companyEmail", "companyPhone"],
            },
          ],
        },
      ],
    });

    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    await application.update({
      status: "shortlisted",
      shortlistedAt: new Date(),
      shortlistedByAdminId: adminId,
      statusUpdatedBy: adminId,
      statusUpdatedAt: new Date(),
    });

    const name = application.candidate.userName;
    const email = application.candidate.emailAddress;
    const jobTitle = application.job.jobTitle;
    const companyName = application.job.company?.companyName || "Our Company";

    /* ================= EMAIL TEMPLATE ================= */

    const shortlistedEmail = `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
        
        <div style="max-width:600px;margin:auto;background:white;border-radius:8px;padding:30px;">
          
          <h2 style="color:#2c3e50;">🎉 Congratulations ${name}</h2>

          <p style="font-size:16px;color:#444;">
            Your application for the position of 
            <strong>${jobTitle}</strong> at 
            <strong>${companyName}</strong> has been <b>shortlisted</b>.
          </p>

          <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
            <p style="margin:0"><strong>Position:</strong> ${jobTitle}</p>
            <p style="margin:0"><strong>Company:</strong> ${companyName}</p>
            <p style="margin:0"><strong>Status:</strong> Shortlisted</p>
          </div>

          <p style="font-size:15px;color:#555;">
            Our hiring team will review your profile and may contact you soon
            regarding the next steps, such as interviews or further assessments.
          </p>

          <p style="font-size:15px;color:#555;">
            Please keep an eye on your email and dashboard for further updates.
          </p>

          <hr style="margin:30px 0"/>

          <p style="font-size:14px;color:#777;">
            Best Regards,<br/>
            <strong>Career Kendra Hiring Team</strong>
          </p>

        </div>

      </div>
    `;

    /* ================= ADD EMAIL JOB ================= */

    try {
      const job = await addEmailJob({
        html: shortlistedEmail,
        options: {
          receiver_email: email,
          subject: `Your application for ${jobTitle} has been shortlisted`,
        },
      });

      console.log("Shortlisted email job queued:", job?.id);

    } catch (error) {
      console.log("Failed to queue shortlisted email:", { email, jobTitle });
    }
    return sendSuccess(res, 200, "Candidate shortlisted successfully", application);

  } catch (error) {
    console.error("Shortlist Error:", error);
    return sendError(res, 500, "Failed to shortlist candidate");
  }
};

exports.createInterview = async (req, res) => {
  try {

    const { applicationId } = req.params;
    const {
      round,
      interviewType,
      scheduledAt,
      meetingLink,
      location,
      meetingPerson,
      notes
    } = req.body;

    const application = await JobApplication.findByPk(applicationId, {
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["id", "userName", "emailAddress"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["companyName", "companyEmail", "companyPhone"],
            },
          ],
        },
      ],
    });

    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    const interview = await JobInterview.create({
      applicationId,
      round,
      interviewType,
      scheduledAt,
      meetingLink,
      location,
      meetingPerson,
      notes,
      status: "scheduled",
    });

    await application.update({
      status: "interview_stage",
      statusUpdatedAt: new Date(),
      statusUpdatedBy: req.user?.id,
    });
    const name = application.candidate.userName;
    const email = application.candidate.emailAddress;
    const jobTitle = application.job.jobTitle;
    const companyName = application.job.company?.companyName || "Our Company";

    /* ================= EMAIL TEMPLATE ================= */

    const interviewEmail = `
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">

  <div style="max-width:600px;margin:auto;background:white;border-radius:8px;padding:30px;">

    <h2 style="color:#2c3e50;">📅 Interview Scheduled</h2>

    <p style="font-size:16px;color:#444;">
      Hello <strong>${name}</strong>,
    </p>

    <p style="font-size:16px;color:#444;">
      We are pleased to inform you that your interview for the position of 
      <strong>${jobTitle}</strong> at 
      <strong>${companyName}</strong> has been scheduled.
    </p>

    <div style="background:#f1f5f9;padding:18px;border-radius:6px;margin:20px 0;">

      <p style="margin:6px 0"><strong>Position:</strong> ${jobTitle}</p>
      <p style="margin:6px 0"><strong>Company:</strong> ${companyName}</p>
      <p style="margin:6px 0"><strong>Interview Round:</strong> ${round}</p>
      <p style="margin:6px 0"><strong>Interview Type:</strong> ${interviewType}</p>
      <p style="margin:6px 0"><strong>Date & Time:</strong> ${scheduledAt}</p>
      ${meetingPerson ? `<p style="margin:6px 0"><strong>Interviewer:</strong> ${meetingPerson}</p>` : ""}
      ${meetingLink ? `<p style="margin:6px 0"><strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank">${meetingLink}</a></p>` : ""}
      ${location ? `<p style="margin:6px 0"><strong>Location:</strong> ${location}</p>` : ""}
      ${notes ? `<p style="margin:6px 0"><strong>Notes:</strong> ${notes}</p>` : ""}

    </div>

    <p style="font-size:15px;color:#555;">
      Please ensure you join the interview on time and prepare accordingly.
      If you have any questions or need to reschedule, feel free to contact us.
    </p>

    <p style="font-size:15px;color:#555;">
      We wish you the best of luck for your interview!
    </p>

    <hr style="margin:30px 0"/>

    <p style="font-size:14px;color:#777;">
      Best Regards,<br/>
      <strong>${companyName} Hiring Team</strong>
    </p>

  </div>

</div>
`;
    /* ================= ADD EMAIL JOB ================= */

    try {
      const job = await addEmailJob({
        html: interviewEmail,
        options: {
          receiver_email: email,
          subject: `Interview Scheduled for ${jobTitle} - ${companyName}`,
        },
      });

      console.log("Interview email job queued:", job?.id);

    } catch (error) {
      console.log("Failed to queue interview email:", { email, jobTitle });
    }
    return sendSuccess(res, 201, "Interview scheduled successfully", interview);

  } catch (error) {
    console.error("Create Interview Error:", error);
    return sendError(res, 500, "Failed to schedule interview");
  }
};

exports.updateInterview = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      round,
      interviewType,
      scheduledAt,
      meetingLink,
      location,
      meetingPerson,
      notes,
      status,
      feedback,
      result,
      cancelReason,
      rescheduleReason
    } = req.body;

    const interview = await JobInterview.findByPk(id);

    if (!interview) {
      return sendError(res, 404, "Interview not found");
    }

    /* ================= BUILD UPDATE OBJECT ================= */

    const updateData = {};

    if (round !== undefined) updateData.round = round;
    if (interviewType !== undefined) updateData.interviewType = interviewType;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (location !== undefined) updateData.location = location;
    if (meetingPerson !== undefined) updateData.meetingPerson = meetingPerson;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (result !== undefined) updateData.result = result;

    /* ================= CANCEL ================= */

    if (status === "cancelled") {

      if (!cancelReason) {
        return sendError(res, 400, "Cancel reason is required");
      }

      updateData.feedback = cancelReason;
    }

    /* ================= RESCHEDULE ================= */

    if (status === "rescheduled") {

      if (!scheduledAt) {
        return sendError(res, 400, "New interview date/time required");
      }

      if (!rescheduleReason) {
        return sendError(res, 400, "Reschedule reason required");
      }

      updateData.rescheduleReason = rescheduleReason;
      updateData.status = "scheduled";
    }

    /* ================= COMPLETE ================= */

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    /* ================= UPDATE INTERVIEW ================= */

    await interview.update(updateData);

    /* ================= GET APPLICATION WITH RELATIONS ================= */

    const application = await JobApplication.findByPk(interview.applicationId, {
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["userName", "emailAddress"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["jobTitle"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["companyName"],
            },
          ],
        },
      ],
    });

    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    const name = application.candidate.userName;
    const email = application.candidate.emailAddress;
    const jobTitle = application.job.jobTitle;
    const companyName = application.job.company?.companyName || "Our Company";

    let subject = "";
    let emailHtml = "";

    /* ================= EMAIL CONTENT BASE ================= */

    const formattedDate = scheduledAt
      ? new Date(scheduledAt).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      })
      : "";

    /* ================= STATUS BASED EMAIL ================= */

    if (status === "cancelled") {

      subject = `Interview Cancelled - ${jobTitle}`;

      emailHtml = `
      <div style="font-family:Arial;background:#f4f6f8;padding:30px">
      <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px">

      <h2 style="color:#e74c3c">Interview Cancelled</h2>

      <p>Hello <strong>${name}</strong>,</p>

      <p>Your interview for <strong>${jobTitle}</strong> at 
      <strong>${companyName}</strong> has been cancelled.</p>

      <p><strong>Reason:</strong> ${cancelReason}</p>

      <hr/>

      <p style="font-size:14px;color:#777">
      Regards,<br/>
      ${companyName} Hiring Team
      </p>

      </div>
      </div>
      `;
    }

    else if (status === "rescheduled") {

      subject = `Interview Rescheduled - ${jobTitle}`;

      emailHtml = `
      <div style="font-family:Arial;background:#f4f6f8;padding:30px">
      <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px">

      <h2>Interview Rescheduled</h2>

      <p>Hello <strong>${name}</strong>,</p>

      <p>Your interview for <strong>${jobTitle}</strong> at 
      <strong>${companyName}</strong> has been rescheduled.</p>

      <p><strong>New Date:</strong> ${formattedDate}</p>
      <p><strong>Reason:</strong> ${rescheduleReason}</p>

      ${meetingLink ? `<p><strong>Meeting Link:</strong> ${meetingLink}</p>` : ""}
      ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}

      <hr/>

      <p style="font-size:14px;color:#777">
      Regards,<br/>
      ${companyName} Hiring Team
      </p>

      </div>
      </div>
      `;
    }

    else if (status === "completed") {

      if (result === "pass") {

        subject = `Congratulations! Interview Cleared - ${jobTitle}`;

        emailHtml = `
        <div style="font-family:Arial;background:#f4f6f8;padding:30px">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px">

        <h2 style="color:#27ae60">Congratulations ${name}</h2>

        <p>You have successfully cleared the interview for 
        <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>

        <p>Our team will contact you soon regarding the next steps.</p>

        </div>
        </div>
        `;

      }

      if (result === "fail") {

        subject = `Interview Result Update - ${jobTitle}`;

        emailHtml = `
        <div style="font-family:Arial;background:#f4f6f8;padding:30px">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px">

        <h2>Interview Update</h2>

        <p>Hello ${name},</p>

        <p>Thank you for attending the interview for 
        <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>

        <p>Unfortunately, we will not be moving forward with your application.</p>

        <p>We wish you success in your future opportunities.</p>

        </div>
        </div>
        `;
      }

    }

    else {

      subject = `Interview Updated - ${jobTitle}`;

      emailHtml = `
      <div style="font-family:Arial;background:#f4f6f8;padding:30px">
      <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px">

      <h2>Interview Updated</h2>

      <p>Hello <strong>${name}</strong>,</p>

      <p>Your interview details for <strong>${jobTitle}</strong> at 
      <strong>${companyName}</strong> have been updated.</p>

      ${formattedDate ? `<p><strong>Date:</strong> ${formattedDate}</p>` : ""}
      ${meetingLink ? `<p><strong>Meeting Link:</strong> ${meetingLink}</p>` : ""}
      ${location ? `<p><strong>Location:</strong> ${location}</p>` : ""}
      ${meetingPerson ? `<p><strong>Interviewer:</strong> ${meetingPerson}</p>` : ""}

      </div>
      </div>
      `;
    }

    /* ================= UPDATE APPLICATION STATUS ================= */

    if (result === "fail") {

      await application.update({
        status: "rejected",
        rejectionReason: feedback,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.user?.id
      });

    }

    if (result === "pass") {

      await application.update({
        status: "final_shortlist",
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.user?.id
      });

    }

    /* ================= SEND EMAIL ================= */

    try {

      await addEmailJob({
        html: emailHtml,
        options: {
          receiver_email: email,
          subject: subject,
        },
      });

      console.log("Interview email queued:", email);

    } catch (error) {

      console.log("Email queue failed:", error);

    }

    return sendSuccess(res, 200, "Interview updated successfully", interview);

  } catch (error) {

    console.error("Update Interview Error:", error);
    return sendError(res, 500, "Failed to update interview");

  }
};

exports.finalDecision = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      decision,
      finalSalaryOffered,
      joiningDate,
      comment
    } = req.body;

    const application = await JobApplication.findByPk(id);

    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    await application.update({
      status: decision,
      finalSalaryOffered,
      joiningDate,
      employerDecisionComment: comment,
      employerDecisionById: req.user?.id,
      employerDecisionAt: new Date(),
      isSelected: decision === "selected",
    });

    return sendSuccess(res, 200, "Final decision updated", application);

  } catch (error) {

    console.error("Final Decision Error:", error);
    return sendError(res, 500, "Failed to update decision");

  }
};


exports.GetAllInterviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      interviewType,
      employeeId,
      round,
      startDate,
      endDate,
      sortBy = "scheduledAt",
      order = "ASC"
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    console.log("EmployeeId Query:", employeeId);

    /* ================= WHERE CONDITION ================= */

    let whereCondition = {};

    if (status) whereCondition.status = status;
    if (interviewType) whereCondition.interviewType = interviewType;
    if (round) whereCondition.round = round;

    if (startDate && endDate) {
      whereCondition.scheduledAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    /* ================= INCLUDE ================= */

    const include = [
      {
        model: JobApplication,
        as: "application",
        attributes: ["id", "status"],
        include: [
          {
            model: User,
            as: "candidate",
            attributes: ["id", "userName", "emailAddress", "contactNumber"],
            where: search
              ? {
                [Op.or]: [
                  { userName: { [Op.like]: `%${search}%` } },
                  { emailAddress: { [Op.like]: `%${search}%` } },
                  { contactNumber: { [Op.like]: `%${search}%` } },
                ],
              }
              : undefined,
            required: !!search,
          },
          {
            model: Job,
            as: "job",
            attributes: ["id", "jobTitle"],
            include: [
              {
                model: jobAssign,
                as: "assignment",
                attributes: ["id", "adminEmployeId", "status"],
                required: false,
              },
            ],
          },
        ],
      },
    ];

    /* ================= QUERY ================= */

    const { count, rows } = await JobInterview.findAndCountAll({
      where: whereCondition,
      include,
      limit: limitNumber,
      offset,
      order: [[sortBy, order]],
      distinct: true,
    });

    console.log("Total Interviews Before Filter:", rows.length);

    /* ================= JS FILTER (EMPLOYEE) ================= */

    let filteredRows = rows;

    if (employeeId) {
      filteredRows = rows.filter((interview) => {
        const assignedEmployee =
          interview?.application?.job?.assignment?.adminEmployeId;

        console.log("Interview:", interview.id, "Assigned:", assignedEmployee);

        return Number(assignedEmployee) === Number(employeeId);
      });

      console.log("After Employee Filter:", filteredRows.length);
    }

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      totalInterviews: filteredRows.length,
      totalPages: Math.ceil(filteredRows.length / limitNumber),
      currentPage: pageNumber,
      interviews: filteredRows,
    });

  } catch (error) {
    console.error("Get All Interviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
    });
  }
};

exports.GetAllWebEmployeInterviews = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 10,
      search,
      status,
      interviewType,
      startDate,
      endDate,
      sortBy = "scheduledAt",
      order = "ASC",
    } = req.query;

    const employeeId = 9 || req.user?.id;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    console.log("Employee ID:", employeeId);

    /* ================= WHERE CONDITION ================= */

    let whereCondition = {
      round: 2
    };

    if (status) whereCondition.status = status;
    if (interviewType) whereCondition.interviewType = interviewType;

    // if (startDate && endDate) {
    //   whereCondition.scheduledAt = {
    //     [Op.between]: [new Date(startDate), new Date(endDate)],
    //   };
    // }

    console.log("Interview Where Condition:", whereCondition);

    /* ================= INCLUDE ================= */

    const include = [
      {
        model: JobApplication,
        as: "application",
        attributes: ["id", "status"],
        required: true,
        include: [
          {
            model: User,
            as: "candidate",
            attributes: ["id", "userName", "emailAddress", "contactNumber"],
          },
          {
            model: Job,
            as: "job",
            attributes: ["id", "employerId", "jobTitle"],
          },
        ],
      },
    ];

    /* ================= QUERY ================= */

    const { count, rows } = await JobInterview.findAndCountAll({
      where: whereCondition,
      include,
      order: [[sortBy, order]],
      distinct: true,
    });

    console.log("Total Interviews From DB:", rows.length);

    /* ================= JS FILTER ================= */

    let filteredRows = rows.filter((interview) => {

      const job = interview?.application?.job;
      const candidate = interview?.application?.candidate;

      if (!job) return false;

      console.log(
        "Checking Interview -> Employer:",
        job.employerId,
        "Employee:",
        employeeId
      );

      /* Employer Match */
      if (job.employerId !== employeeId) return false;

      /* Search Filter */
      if (search) {

        const searchText = search.toLowerCase();

        const matchCandidate =
          candidate?.userName?.toLowerCase().includes(searchText) ||
          candidate?.emailAddress?.toLowerCase().includes(searchText) ||
          candidate?.contactNumber?.includes(searchText);

        const matchJob =
          job?.jobTitle?.toLowerCase().includes(searchText);

        if (!matchCandidate && !matchJob) return false;
      }

      return true;
    });

    console.log("After Employer + Search Filter:", filteredRows.length);

    /* ================= PAGINATION ================= */

    const paginatedRows = filteredRows.slice(offset, offset + limitNumber);

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      totalInterviews: filteredRows.length,
      totalPages: Math.ceil(filteredRows.length / limitNumber),
      currentPage: pageNumber,
      interviews: paginatedRows,
    });

  } catch (error) {

    console.error("Get All Interviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
    });

  }
};


exports.sendSelectionMail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, body } = req.body;

    const application = await JobApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["id", "userName", "emailAddress"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["companyName", "companyEmail", "companyPhone"],
            },
          ],
        },
      ],
    });

    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    if (!application.candidate?.emailAddress) {
      return sendError(res, 400, "Candidate email address is not available");
    }

    const jobTitle = application.job?.jobTitle || "the position";
    const companyName = application.job?.company?.companyName || "Career Kendra";
    const companyEmail = application.job?.company?.companyEmail || "hr@careerkendra.com";
    const companyPhone = application.job?.company?.companyPhone || "";

    // Dynamic Email Subject
    const emailSubject = subject || `Congratulations! You have been selected for ${jobTitle}`;

    // Professional HTML Email Template
    const htmlEmail = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Offer - ${jobTitle}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Arial, sans-serif;">
        
        <div style="max-width: 650px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
              Congratulations!
            </h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 18px;">
              You have been selected
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 35px;">
            
            <p style="font-size: 18px; color: #1f2937; line-height: 1.6; margin-bottom: 25px;">
              Dear <strong>${application.candidate.userName}</strong>,
            </p>

            ${body ? `<div style="font-size: 16px; line-height: 1.7; color: #374151;">${body}</div>` : `
            <p style="font-size: 16px; line-height: 1.7; color: #374151;">
              We are pleased to inform you that you have been <strong>selected</strong> for the position of 
              <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
            </p>

            <p style="font-size: 16px; line-height: 1.7; color: #374151;">
              Your skills and experience impressed us, and we believe you will be a great addition to our team.
            </p>`}

            <!-- Next Steps Section -->
            <div style="background-color: #f8fafc; border-left: 5px solid #4f46e5; padding: 25px; margin: 30px 0; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #1e2937; font-size: 17px;">
                📋 Next Steps – Document Submission
              </h3>
              <p style="margin: 0 0 15px 0; color: #475569; font-size: 15px;">
                To proceed with your offer, please complete the following:
              </p>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #334155; line-height: 1.8; font-size: 15px;">
                <li><strong>Upload all required documents</strong> on the <strong>TechHR Portal</strong> in your candidate panel.</li>
                <li>OR reply directly to this email with the documents attached.</li>
              </ul>

              <p style="margin: 12px 0 8px 0; color: #475569; font-size: 15px;">
                <strong>Required Documents:</strong>
              </p>
              <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #334155; line-height: 1.8; font-size: 15px;">
            
                <li>Latest Salary Slips (last 3 months)</li>
                <li>Educational Certificates & Marksheets</li>
                <li>Experience Letters from previous employers</li>
                <li>Government ID Proof (Aadhaar, PAN, Passport)</li>
                <li>Bank Account Details</li>
              </ul>
            </div>

            <p style="font-size: 16px; line-height: 1.7; color: #374151; margin-top: 30px;">
              We are excited to welcome you to the <strong>${companyName}</strong> family and look forward to your quick response.
            </p>

            <p style="margin-top: 35px; font-size: 16px; color: #1f2937;">
              Best regards,<br>
              <strong>Hiring Team</strong><br>
              ${companyName}
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 25px 35px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 13px;">
              This is an automated email. Please do not reply to this address for general queries.<br>
              For any questions, feel free to reach out to us at 
              <a href="mailto:${companyEmail}" style="color: #4f46e5; text-decoration: none;">${companyEmail}</a>
              ${companyPhone ? ` | Phone: ${companyPhone}` : ''}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await sendEmail(htmlEmail, {
      receiver_email: application.candidate.emailAddress,
      subject: emailSubject,
    });

    if (!emailResult.status) {
      return sendError(res, 500, emailResult.message || "Failed to send selection email");
    }

    // Update application status
    await application.update({
      offerEmailSent: true,
      offerEmailSentAt: new Date()
    });

    return sendSuccess(res, 200, "Selection / Offer email sent successfully", {
      messageId: emailResult.messageId,
      sentTo: application.candidate.emailAddress,
      company: companyName
    });

  } catch (error) {
    console.error("Send Selection Mail Error:", error);
    return sendError(res, 500, "Failed to send selection email");
  }
};

exports.messageForMe = async (req, res) => {
  try {
    const userId = req.user?.id;

    const messages = await Message.findAll({
      where: {
        receiverId: userId,
      },
      include: [
        {
          model: JobApplication,
          as: "application",
          attributes: ["id", "jobId"],
          include: [
            {
              model: Job,
              as: "job",
              attributes: ["id", "jobTitle"],
              include: [
                {
                  model: Company,
                  as: "company",
                  attributes: ["id", "companyName"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return sendSuccess(res, messages, "Messages fetched successfully");
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return sendError(res, 500, "Failed to fetch messages");
  }
};

exports.markMessageRead = async (req, res) => {
  try {

    const { id } = req.params;
    const userId = req.user?.id;

    const message = await Message.findByPk(id);

    if (!message) {
      return sendError(res, 404, "Message not found");
    }

    await message.update({
      isRead: true,
      readBy: userId,
      readAt: new Date()
    });

    return sendSuccess(res, message, "Message marked as read");

  } catch (error) {
    return sendError(res, 500, error);
  }
};

exports.getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    const count = await Message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return sendSuccess(res, { count }, "Unread message count fetched");
  } catch (error) {
    console.error("Unread Count Error:", error);
    return sendError(res, 500, "Failed to fetch unread message count");
  }
};

exports.myInterViews = async (req, res) => {
  try {
    const userId = req.user?.id;

    const {
      page = 1,
      limit = 10,

    } = req.query;

    const offset = (page - 1) * limit;

    // Application filters
    const applicationWhere = {
      userId: userId,
    };


    const { rows: applications, count } = await JobApplication.findAndCountAll({
      where: applicationWhere,

      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["id", "companyName"],
            },
          ],
        },
        {
          model: JobInterview,

          as: "interviews",
          required: true,
        },
      ],

      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
      order: [["createdAt", "DESC"]],
    });

    return sendSuccess(
      res,
      {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        data: applications,
      },
      "Your interviews fetched successfully"
    );
  } catch (error) {
    console.error("My Interviews Error:", error);
    return sendError(res, 500, "Failed to fetch your interviews");
  }
};


exports.uploadCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { notesForCandidate } = req.body;

    const application = await JobApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: "candidate",
          attributes: ["id", "userName", "emailAddress"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle"],
          include: [
            {
              model: Company,
              as: "company",
              attributes: ["companyName", "companyEmail", "companyPhone"],
            },
          ],
        },
      ],
    });

    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    if (!req.file) {
      return sendError(res, 400, "No file uploaded");
    }

    const offerLetterUrl = `/uploads/offer-letter/${req.file.filename}`;

    // Update application
    await application.update({
      coverLetter: offerLetterUrl,
      notesForCandidate: notesForCandidate ? notesForCandidate : "Contact Adminstrator for more details",
      offerEmailSent: true,
      offerEmailSentAt: new Date(),
      status: "selected",
    });

    const candidateName = application.candidate.userName;
    const jobTitle = application.job.jobTitle;
    const companyName = application.job.company.companyName;
    const companyEmail = application.job.company.companyEmail;
    const companyPhone = application.job.company.companyPhone;

    const emailSubject = `🎉 Congratulations! Offer Letter for ${jobTitle}`;

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
        
        <div style="max-width:600px;margin:auto;background:white;border-radius:8px;padding:30px;">
          
          <h2 style="color:#2c3e50;">Congratulations ${candidateName} 🎉</h2>

          <p style="font-size:16px;color:#444;">
            We are pleased to inform you that you have been <strong>selected</strong> for the position of 
            <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
          </p>

          <p style="font-size:15px;color:#555;">
            Please download your offer letter from the link below.
          </p>

          <div style="margin:20px 0;">
            <a href="${process.env.FILE_DOWNLOAD_URL}${offerLetterUrl}" 
               style="background:#2563eb;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:bold;">
               Download Offer Letter
            </a>
          </div>

          ${notesForCandidate
        ? `<p style="font-size:15px;color:#444;"><strong>Notes:</strong> ${notesForCandidate}</p>`
        : ""
      }

          <hr style="margin:30px 0"/>

          <p style="font-size:14px;color:#555;">
            If you have any questions, feel free to contact us:
          </p>

          <p style="font-size:14px;color:#555;">
            📧 Email: ${companyEmail} <br/>
            📞 Phone: ${companyPhone}
          </p>

          <p style="font-size:14px;color:#777;margin-top:20px;">
            Best Regards,<br/>
            <strong>${companyName} Hiring Team</strong>
          </p>

        </div>

      </div>
    `;

    // Send email
    await sendEmail(htmlEmail, {
      receiver_email: application.candidate.emailAddress,
      subject: emailSubject,
    });

    // Optional: system message
    await sendMessage({
      applicationId: application.id,
      senderId: 0,
      senderType: "system",
      receiverId: application.userId,
      receiverType: "user",
      content: `Congratulations! You have been selected for ${jobTitle}. Your offer letter is available for download.`,
      anyLink: process.env.FILE_DOWNLOAD_URL + offerLetterUrl
    });

    return sendSuccess(res, application, "Offer letter uploaded and email sent");

  } catch (error) {
    console.error("Upload Cover Letter Error:", error);
    return sendError(res, 500, "Failed to upload cover letter");
  }
};

exports.getEmployerDashboard = async (req, res) => {

  
  try {

    const employerId = req.user?.id;
    console.log("Employer ID for Dashboard:", req.user);
    /* ================= DASHBOARD STATS ================= */

    const jobsPosted = await Job.count({
      where: { employerId }
    });

    const applicationsReceived = await JobApplication.count({
      include: [
        {
          model: Job,
          as: "job",
          attributes: [],
          where: { employerId }
        }
      ]
    });

    const round2PendingInterviews = await JobInterview.count({
      where: {
        round: 2,
        status: "scheduled"
      },
      include: [
        {
          model: JobApplication,
          as: "application",
          attributes: [],
          include: [
            {
              model: Job,
              as: "job",
              attributes: [],
              where: { employerId }
            }
          ]
        }
      ]
    });

    const totalInterviewsScheduled = await JobInterview.count({
      include: [
        {
          model: JobApplication,
          as: "application",
          attributes: [],
          include: [
            {
              model: Job,
              as: "job",
              attributes: [],
              where: { employerId }
            }
          ]
        }
      ]
    });

    const documentsUploaded = await JobApplicationDocument.count({
      include: [
        {
          model: JobApplication,
          as: "application",
          attributes: [],
          include: [
            {
              model: Job,
              as: "job",
              attributes: [],
              where: { employerId }
            }
          ]
        }
      ]
    });

    /* ================= RECENT JOB POSTS ================= */

    const recentJobs = await Job.findAll({
      where: { employerId },
      attributes: ["id", "jobTitle", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    /* ================= RECENT INTERVIEWS ================= */

    const recentInterviews = await JobInterview.findAll({
      attributes: [
        "id",
        "round",
        "interviewType",
        "scheduledAt",
        "status"
      ],
      include: [
        {
          model: JobApplication,
          as: "application",
          attributes: ["id"],
          include: [
            {
              model: User,
              as: "candidate",
              attributes: ["id", "userName"]
            },
            {
              model: Job,
              as: "job",
              attributes: ["jobTitle"],
              where: { employerId }
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    /* ================= RECENT MESSAGES ================= */

    const recentMessages = await Message.findAll({

      order: [["createdAt", "DESC"]],
      limit: 5
    });

    /* ================= DASHBOARD TIPS ================= */

    const tips = [
      "Review candidate profiles before scheduling interviews.",
      "Respond quickly to candidates to improve hiring success.",
      "Keep interview feedback updated for better decision making.",
      "Shortlist candidates early to avoid losing talent.",
      "Schedule interviews in advance to reduce delays."
    ];

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,

      stats: {
        jobsPosted,
        applicationsReceived,
        round2PendingInterviews,
        totalInterviewsScheduled,
        documentsUploaded
      },

      recentJobs,
      recentInterviews,
      recentMessages,

      tips
    });

  } catch (error) {

    console.error("Employer Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });

  }
};






exports.getAdminDashboard = async (req, res) => {
  try {

    /* ================= BASIC STATS ================= */

    const totalUsers = await User.count();

    const totalEmployers = await Employer.count();

    const totalAdminEmployees = await admin_employees.count();

    const totalCompanies = await Company.count();

    const totalJobs = await Job.count();

    const totalApplications = await JobApplication.count();

    const totalInterviews = await JobInterview.count();

    const totalDocumentsUploaded = await JobApplicationDocument.count();

    const totalSavedJobs = await SavedJobs.count();

    const totalRoles = await Role.count();

    const totalPermissions = await role_permissions.count();


    /* ================= JOB ASSIGNMENT STATS ================= */

    const totalJobAssignments = await jobAssign.count();

    const assignedJobs = await jobAssign.count({
      where: { status: "assigned" }
    });

    const inProgressJobs = await jobAssign.count({
      where: { status: "in-progress" }
    });

    const completedJobs = await jobAssign.count({
      where: { status: "completed" }
    });

    const onHoldJobs = await jobAssign.count({
      where: { status: "on-hold" }
    });

    const rejectedJobs = await jobAssign.count({
      where: { status: "rejected" }
    });


    /* ================= MOST SAVED JOBS ================= */

    const mostSavedJobs = await SavedJobs.findAll({
      attributes: [
        "jobId",
        [fn("COUNT", col("jobId")), "saveCount"]
      ],
      group: ["jobId"],
      order: [[fn("COUNT", col("jobId")), "DESC"]],
      limit: 5,
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle"]
        }
      ]
    });


    /* ================= MOST APPLIED JOBS ================= */

    const mostAppliedJobs = await JobApplication.findAll({
      attributes: [
        "jobId",
        [fn("COUNT", col("jobId")), "applyCount"]
      ],
      group: ["jobId"],
      order: [[fn("COUNT", col("jobId")), "DESC"]],
      limit: 5,
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle"]
        }
      ]
    });


    /* ================= COMPANY STATUS ================= */

    const companyStatusStats = await Company.findAll({
      attributes: [
        "companyStatus",
        [fn("COUNT", col("companyStatus")), "count"]
      ],
      group: ["companyStatus"]
    });


    /* ================= APPLICATION STATUS ================= */

    const applicationStatusStats = await JobApplication.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("status")), "count"]
      ],
      group: ["status"]
    });


    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalEmployers,
        totalAdminEmployees,
        totalCompanies,
        totalJobs,
        totalApplications,
        totalInterviews,
        totalDocumentsUploaded,
        totalSavedJobs,
        totalRoles,
        totalPermissions,
        totalJobAssignments
      },

      jobAssignmentStats: {
        assigned: assignedJobs,
        inProgress: inProgressJobs,
        completed: completedJobs,
        onHold: onHoldJobs,
        rejected: rejectedJobs
      },

      companyStatusStats,

      applicationStatusStats,

      mostSavedJobs,

      mostAppliedJobs

    });

  } catch (error) {

    console.error("Admin Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard"
    });

  }
};