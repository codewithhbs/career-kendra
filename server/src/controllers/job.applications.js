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
const ExcelJS = require("exceljs");
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

/* ================================================================
   HELPER: Date range from filter key
   ================================================================ */
const getDateRange = (period) => {
  const now = new Date();
  const from = new Date();

  switch (period) {
    case "15days":
      from.setDate(now.getDate() - 15);
      break;
    case "1month":
      from.setMonth(now.getMonth() - 1);
      break;
    case "3months":
      from.setMonth(now.getMonth() - 3);
      break;
    case "6months":
      from.setMonth(now.getMonth() - 6);
      break;
    case "1year":
      from.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return null; // No date filter
  }

  return { [Op.between]: [from, now] };
};

/* ================================================================
   HELPER: Build summary stats for a list of applications
   ================================================================ */
const buildStats = (applications = []) => {
  const total = applications.length;
  const selected = applications.filter((a) => a.isSelected).length;
  const joined = applications.filter((a) => a.status === "joined").length;
  const notJoined = applications.filter((a) => a.status === "not_joined").length;
  const finalShort = applications.filter((a) => a.status === "final_shortlist").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;
  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const interviewStage = applications.filter((a) => a.status === "interview_stage").length;
  const withdrawn = applications.filter((a) => a.status === "withdrawn").length;
  const offerSent = applications.filter((a) => a.offerEmailSent).length;

  // Interview stats
  const allInterviews = applications.flatMap((a) => a.interviews || []);
  const totalInterviews = allInterviews.length;
  const scheduledIntvw = allInterviews.filter((i) => i.status === "scheduled").length;
  const completedIntvw = allInterviews.filter((i) => i.status === "completed").length;
  const cancelledIntvw = allInterviews.filter((i) => i.status === "cancelled").length;
  const passedIntvw = allInterviews.filter((i) => i.result === "pass").length;
  const failedIntvw = allInterviews.filter((i) => i.result === "fail").length;

  // Avg salary offered
  const salaries = applications
    .filter((a) => a.finalSalaryOffered)
    .map((a) => a.finalSalaryOffered);
  const avgSalary = salaries.length
    ? Math.round(salaries.reduce((s, v) => s + v, 0) / salaries.length)
    : null;

  return {
    total,
    selected,
    joined,
    notJoined,
    finalShort,
    rejected,
    shortlisted,
    interviewStage,
    withdrawn,
    offerSent,
    interviews: {
      total: totalInterviews,
      scheduled: scheduledIntvw,
      completed: completedIntvw,
      cancelled: cancelledIntvw,
      passed: passedIntvw,
      failed: failedIntvw,
    },
    avgSalaryOffered: avgSalary,
  };
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
    location,
    area
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
        area: area ? area.trim() : null,
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
        area: area !== undefined ? area.trim() : user.area,
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
      page = 1, limit = 10, status, search,
      sortBy = "createdAt", order = "DESC",
      dateFrom, dateTo, interviewStatus, interviewResult,
      candidateLocation, candidateArea, // ADD
    } = req.query;

    const offset = (page - 1) * limit;

    let whereCondition = { jobId };

    if (status) {
      whereCondition.status = status;
    }

    // Date range filter (appliedAt pe)
    if (dateFrom || dateTo) {
      whereCondition.appliedAt = {};
      if (dateFrom) whereCondition.appliedAt[Op.gte] = new Date(dateFrom);
      if (dateTo) whereCondition.appliedAt[Op.lte] = new Date(dateTo + "T23:59:59.999Z");
    }

    // Interview filter ke liye where condition
    const interviewWhere = {};
    if (interviewStatus) interviewWhere.status = interviewStatus;
    if (interviewResult) interviewWhere.result = interviewResult;
    const hasInterviewFilter = Object.keys(interviewWhere).length > 0;

    // User include mein where build karo:
    const candidateWhere = {};
    if (search) {
      candidateWhere[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { emailAddress: { [Op.like]: `%${search}%` } },
        { contactNumber: { [Op.like]: `%${search}%` } },
      ];
    }
    if (candidateLocation) candidateWhere.location = { [Op.like]: `%${candidateLocation}%` };
    if (candidateArea) candidateWhere.area = { [Op.like]: `%${candidateArea}%` };

    const include = [
      {
        model: User,
        as: "candidate",
        attributes: ["id", "userName", "emailAddress", "contactNumber", "location", "area"], // location, area ADD
        where: Object.keys(candidateWhere).length > 0 ? candidateWhere : undefined,
        required: !!(search || candidateLocation || candidateArea), // koi bhi ho to INNER JOIN
      },
      {
        model: User,
        as: "shortlistedBy",
        attributes: ["id", "userName"],
      },
      {
        model: Job,
        as: "job",
        attributes: ["id", "jobTitle", "jobCategory", "industry"],
      },
      {
        model: Employer,
        as: "decidedByEmployer",
        attributes: ["id", "employerName"],
      },
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
          "holdReason",
          "cancelReason",
          "rescheduleReason",
        ],
        where: hasInterviewFilter ? interviewWhere : undefined,
        required: hasInterviewFilter, // filter laga ho to INNER JOIN, warna LEFT JOIN
        order: [["round", "ASC"]],
      },
    ];

    const { count, rows } = await JobApplication.findAndCountAll({
      where: whereCondition,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, order]],
      distinct: true, // interviews join se count duplicate na ho
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
        [Op.in]: [, "applied", "under_review", "shortlisted", "final_shortlist", "selected", "joined", "not_joined", "rejected", "interview_stage"]
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
          "holdReason",
          "rescheduleReason",
          "cancelReason",
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
            "rescheduleReason",
            "holdReason",
            "cancelReason",
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
      rescheduleReason,
      holdReason
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


      updateData.cancelReason = cancelReason;
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

    /* ================= HOLD ================= */

    if (status === "hold") {
      updateData.holdReason = holdReason;
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

exports.updateJoiningDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, joiningDate, notJoinReason } = req.body;

    const application = await JobApplication.findByPk(id);

    if (!application) {
      return sendError(res, 404, "Application not found");
    }

    if (!status) {
      return sendError(res, 400, "Status is required");
    }

    const updateData = { status };

    if (status === "not_joined") {
      if (!notJoinReason) {
        return sendError(res, 400, "notJoinReason is required when status is not_joined");
      }
      updateData.notJoinReason = notJoinReason;
      updateData.joiningDate = null; // clear joining date
    }

    else if (status === "joined") {
      updateData.joiningDate = joiningDate || null;
      updateData.notJoinReason = null; // clear not join reason
    }

    else {
      return sendError(res, 400, "Invalid status. Use 'joined' or 'not_joined'");
    }

    await application.update(updateData);

    return res.status(200).json({
      success: true,
      message: status === "joined" ? "Joining details updated!" : "Not joined reason saved!",
      data: application,
    });

  } catch (error) {
    console.error("Update Joining Detail Error:", error);
    return sendError(res, 500, "Failed to update joining detail");
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

exports.updateLeaveDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { leavingDate } = req.body;
    const application = await JobApplication.findByPk(id);

    if (!application) {
      return sendError(res, 404, "Application not found");
    }
    await application.update({
      leavingDate,
    });

    return sendSuccess(res, application, "Leave date updated successfully");
  } catch (error) {
    console.log("Internal server error", error);
    return sendError(res, 500, "Failed to update leave date");
  }
}

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


exports.exportApplications = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    console.log("I am hit")
    const {
      status,
      search,
      sortBy = "createdAt",
      order = "DESC",
      dateFrom,
      dateTo,
      interviewStatus,
      interviewResult,
      candidateLocation,
      candidateArea,
      format = "xlsx", // "xlsx" or "csv"
    } = req.query;

    // ─── Build WHERE conditions (same as getAllApplications) ───────────────
    const whereCondition = { jobId };

    if (status) whereCondition.status = status;

    if (dateFrom || dateTo) {
      whereCondition.appliedAt = {};
      if (dateFrom) whereCondition.appliedAt[Op.gte] = new Date(dateFrom);
      if (dateTo)
        whereCondition.appliedAt[Op.lte] = new Date(dateTo + "T23:59:59.999Z");
    }

    const interviewWhere = {};
    if (interviewStatus) interviewWhere.status = interviewStatus;
    if (interviewResult) interviewWhere.result = interviewResult;
    const hasInterviewFilter = Object.keys(interviewWhere).length > 0;

    const candidateWhere = {};
    if (search) {
      candidateWhere[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { emailAddress: { [Op.like]: `%${search}%` } },
        { contactNumber: { [Op.like]: `%${search}%` } },
      ];
    }
    if (candidateLocation)
      candidateWhere.location = { [Op.like]: `%${candidateLocation}%` };
    if (candidateArea)
      candidateWhere.area = { [Op.like]: `%${candidateArea}%` };

    // ─── Fetch ALL matching records (no pagination for export) ────────────
    const applications = await JobApplication.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "candidate",
          attributes: [
            "id",
            "userName",
            "emailAddress",
            "contactNumber",
            "location",
            "area",
          ],
          where:
            Object.keys(candidateWhere).length > 0 ? candidateWhere : undefined,
          required: !!(search || candidateLocation || candidateArea),
        },
        {
          model: Job,
          as: "job",
          attributes: ["id", "jobTitle", "jobCategory", "industry"],
        },
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
            "cancelReason",
            "rescheduleReason",
          ],
          where: hasInterviewFilter ? interviewWhere : undefined,
          required: hasInterviewFilter,
          order: [["round", "ASC"]],
        },
      ],
      order: [[sortBy, order]],
      distinct: true,
    });

    // ─── Flatten data for export ──────────────────────────────────────────
    const rows = applications.map((app) => {
      const latestInterview = app.interviews?.length
        ? app.interviews[app.interviews.length - 1]
        : null;

      return {
        "Application ID": app.id,
        "Candidate Name": app.candidate?.userName || "",
        Email: app.candidate?.emailAddress || "",
        Phone: app.candidate?.contactNumber || "",
        Location: app.candidate?.location || "",
        Area: app.candidate?.area || "",
        "Application Status": (app.status || "").replace(/_/g, " "),
        "Applied At": app.appliedAt
          ? new Date(app.appliedAt).toLocaleString("en-IN")
          : "",
        "Job Title": app.job?.jobTitle || "",
        "Job Category": app.job?.jobCategory || "",
        Industry: app.job?.industry || "",
        "Rejection Reason": app.rejectionReason || "",
        "Resume Link": app.resume || "",
        "Total Interviews": app.interviews?.length || 0,
        "Latest Interview Round": latestInterview?.round || "",
        "Latest Interview Type": latestInterview?.interviewType || "",
        "Latest Interview Status": latestInterview?.status
          ? latestInterview.status.replace(/_/g, " ")
          : "",
        "Latest Interview Result": latestInterview?.result || "",
        "Scheduled At": latestInterview?.scheduledAt
          ? new Date(latestInterview.scheduledAt).toLocaleString("en-IN")
          : "",
        Interviewer: latestInterview?.meetingPerson || "",
        "Meeting Link": latestInterview?.meetingLink || "",
        "Interview Location": latestInterview?.location || "",
        "Interview Feedback": latestInterview?.feedback || "",
        "Cancel Reason": latestInterview?.cancelReason || "",
        "Reschedule Reason": latestInterview?.rescheduleReason || "",
      };
    });

    const filename = `applications_${jobId}_${Date.now()}`;

    // ─── CSV Export ───────────────────────────────────────────────────────
    if (format === "csv") {
      const headers = Object.keys(rows[0] || {});
      const csvLines = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
            .join(",")
        ),
      ];
      const csvContent = csvLines.join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`
      );
      return res.send(csvContent);
    }

    // ─── XLSX Export ──────────────────────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "HireApp";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Applications", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    // Define columns
    const columns = Object.keys(rows[0] || {}).map((key) => ({
      header: key,
      key,
      width: Math.max(key.length + 4, 18),
    }));
    sheet.columns = columns;

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4C1D95" }, // violet-900
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
      };
    });
    headerRow.height = 30;

    // Status color map
    const statusColors = {
      applied: "FFDBEAFE",
      under_review: "FFFEF3C7",
      shortlisted: "FFD1FAE5",
      interview_stage: "FFEDE9FE",
      final_shortlist: "FFE0E7FF",
      selected: "FFDCFCE7",
      rejected: "FFFEE2E2",
    };
    const interviewResultColors = {
      pass: "FFDCFCE7",
      fail: "FFFEE2E2",
      pending: "FFFEF3C7",
    };

    // Add data rows
    rows.forEach((rowData, idx) => {
      const row = sheet.addRow(rowData);
      row.height = 20;

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = { vertical: "middle", wrapText: false };
        cell.font = { size: 10 };
        if (idx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }
      });

      // Color-code Application Status cell
      const statusKey = rowData["Application Status"]
        ?.toLowerCase()
        .replace(/ /g, "_");
      if (statusColors[statusKey]) {
        const statusCell = row.getCell("Application Status");
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusColors[statusKey] },
        };
        statusCell.font = { size: 10, bold: true };
      }

      // Color-code Interview Result cell
      const resultKey = rowData["Latest Interview Result"]?.toLowerCase();
      if (interviewResultColors[resultKey]) {
        const resultCell = row.getCell("Latest Interview Result");
        resultCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: interviewResultColors[resultKey] },
        };
        resultCell.font = { size: 10, bold: true };
      }
    });

    // Auto-fit some columns
    sheet.getColumn("Email").width = 28;
    sheet.getColumn("Candidate Name").width = 22;
    sheet.getColumn("Interview Feedback").width = 35;
    sheet.getColumn("Rejection Reason").width = 30;
    sheet.getColumn("Meeting Link").width = 35;

    // Add summary sheet
    const summarySheet = workbook.addWorksheet("Summary");
    const statusCounts = {};
    rows.forEach((r) => {
      const s = r["Application Status"] || "Unknown";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    summarySheet.columns = [
      { header: "Status", key: "status", width: 22 },
      { header: "Count", key: "count", width: 12 },
      { header: "Percentage", key: "pct", width: 15 },
    ];

    const sumHeader = summarySheet.getRow(1);
    sumHeader.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F2937" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    sumHeader.height = 25;

    const total = rows.length;
    Object.entries(statusCounts).forEach(([status, count], idx) => {
      const row = summarySheet.addRow({
        status,
        count,
        pct: `=B${idx + 2}/${total}`,
      });
      row.getCell("pct").numFmt = "0.0%";
      row.height = 20;
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { size: 10 };
      });
    });

    // Total row
    const totalRow = summarySheet.addRow({
      status: "TOTAL",
      count: `=SUM(B2:B${Object.keys(statusCounts).length + 1})`,
      pct: "100%",
    });
    totalRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF3F4F6" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Metadata in summary
    summarySheet.addRow([]);
    summarySheet.addRow(["Export Date", new Date().toLocaleString("en-IN")]);
    summarySheet.addRow(["Job ID", jobId]);
    summarySheet.addRow(["Total Records", total]);
    if (status) summarySheet.addRow(["Filter: Status", status]);
    if (search) summarySheet.addRow(["Filter: Search", search]);
    if (dateFrom) summarySheet.addRow(["Filter: Date From", dateFrom]);
    if (dateTo) summarySheet.addRow(["Filter: Date To", dateTo]);
    if (interviewStatus)
      summarySheet.addRow(["Filter: Interview Status", interviewStatus]);
    if (interviewResult)
      summarySheet.addRow(["Filter: Interview Result", interviewResult]);
    if (candidateLocation)
      summarySheet.addRow(["Filter: Location", candidateLocation]);
    if (candidateArea)
      summarySheet.addRow(["Filter: Area", candidateArea]);

    // Stream response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export Applications Error:", error);
    return res.status(500).json({ success: false, message: "Export failed" });
  }
};

exports.AllJobsDetail = async (req, res) => {
  try {

    const {
      period,
      fromDate,
      toDate,
      jobStatus,
      appStatus,
      employerId,
      companyId,
      jobType,
      workMode,
      city,
      isSelected,
      interviewResult,
      interviewStatus,
    } = req.query;

    /* ── Job-level WHERE ── */
    const jobWhere = {};
    if (jobStatus) jobWhere.status = jobStatus;
    if (employerId) jobWhere.employerId = Number(employerId);
    if (companyId) jobWhere.companyId = Number(companyId);
    if (jobType) jobWhere.jobType = jobType;
    if (workMode) jobWhere.workMode = workMode;
    if (city) jobWhere.city = { [Op.like]: `%${city}%` };

    /* ── Application-level WHERE ── */
    const appWhere = {};
    if (appStatus) appWhere.status = appStatus;
    if (isSelected !== undefined) appWhere.isSelected = isSelected === "true";

    // Date filter on applications
    let dateRange = null;
    if (period) {
      dateRange = getDateRange(period);
    } else if (fromDate && toDate) {
      dateRange = { [Op.between]: [new Date(fromDate), new Date(toDate)] };
    }
    if (dateRange) appWhere.appliedAt = dateRange;

    /* ── Interview-level WHERE ── */
    const interviewWhere = {};
    if (interviewResult) interviewWhere.result = interviewResult;
    if (interviewStatus) interviewWhere.status = interviewStatus;

    /* ── Query ── */
    const jobs = await Job.findAll({
      where: jobWhere,
      include: [
        {
          model: JobApplication,
          as: "applications",
          where: Object.keys(appWhere).length ? appWhere : undefined,
          required: false,
          include: [
            {
              model: JobInterview,
              as: "interviews",
              where: Object.keys(interviewWhere).length ? interviewWhere : undefined,
              required: false,
            },
            {
              model: User,
              as: "candidate",
              attributes: ["id", "userName", "emailAddress", "contactNumber"],
            },
            {
              model: Employer,
              as: "decidedByEmployer",
              attributes: ["id", "employerName", "employerEmail"],
            },
          ],
        },
        {
          model: Company,
          as: "company",
          attributes: ["id", "companyName"],
        },
        {
          model: Employer,
          as: "employer",
          attributes: ["id", "employerName", "employerEmail"],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        [
          { model: JobApplication, as: "applications" },
          { model: JobInterview, as: "interviews" },
          "round",
          "ASC",
        ],
      ],
    });

    /* ── Attach stats per job ── */
    const data = jobs.map((job) => {
      const j = job.toJSON();
      return { ...j, _stats: buildStats(j.applications || []) };
    });

    /* ── Global summary ── */
    const allApps = data.flatMap((j) => j.applications || []);
    const globalStats = buildStats(allApps);

    return res.status(200).json({
      success: true,
      totalJobs: data.length,
      globalStats,
      filters: { period, fromDate, toDate, jobStatus, appStatus, employerId, companyId, jobType, workMode, city, isSelected, interviewResult, interviewStatus },
      data,
    });
  } catch (error) {
    console.error("AllJobsDetail Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch jobs detail" });
  }
};

exports.ExportJobsExcel = async (req, res) => {
  try {
    // const {
    //   Job,
    //   JobApplication,
    //   JobInterview,
    //   User,
    //   Employer,
    //   Company,
    // } = req.app.get("models");

    const {
      period,
      fromDate,
      toDate,
      jobStatus,
      appStatus,
      employerId,
      companyId,
      jobType,
      workMode,
      city,
      isSelected,
      interviewResult,
      interviewStatus,
    } = req.query;

    /* ── Same WHERE logic ── */
    const jobWhere = {};
    if (jobStatus) jobWhere.status = jobStatus;
    if (employerId) jobWhere.employerId = Number(employerId);
    if (companyId) jobWhere.companyId = Number(companyId);
    if (jobType) jobWhere.jobType = jobType;
    if (workMode) jobWhere.workMode = workMode;
    if (city) jobWhere.city = { [Op.like]: `%${city}%` };

    const appWhere = {};
    if (appStatus) appWhere.status = appStatus;
    if (isSelected !== undefined) appWhere.isSelected = isSelected === "true";

    let dateRange = null;
    if (period) {
      dateRange = getDateRange(period);
    } else if (fromDate && toDate) {
      dateRange = { [Op.between]: [new Date(fromDate), new Date(toDate)] };
    }
    if (dateRange) appWhere.appliedAt = dateRange;

    const interviewWhere = {};
    if (interviewResult) interviewWhere.result = interviewResult;
    if (interviewStatus) interviewWhere.status = interviewStatus;

    const jobs = await Job.findAll({
      where: jobWhere,
      include: [
        {
          model: JobApplication,
          as: "applications",
          where: Object.keys(appWhere).length ? appWhere : undefined,
          required: false,
          include: [
            {
              model: JobInterview,
              as: "interviews",
              where: Object.keys(interviewWhere).length ? interviewWhere : undefined,
              required: false,
            },
            {
              model: User,
              as: "candidate",
              attributes: ["id", "userName", "emailAddress", "contactNumber"],
            },
            {
              model: Employer,
              as: "decidedByEmployer",
              attributes: ["id", "employerName"],
            },
          ],
        },
        {
          model: Company,
          as: "company",
          attributes: ["id", "companyName"],
        },
        {
          model: Employer,
          as: "employer",
          attributes: ["id", "employerName", "employerEmail"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = jobs.map((j) => {
      const job = j.toJSON();
      return { ...job, _stats: buildStats(job.applications || []) };
    });

    const allApps = data.flatMap((j) => j.applications || []);
    const globalStats = buildStats(allApps);

    /* ============================================================
       BUILD EXCEL
       ============================================================ */
    const wb = new ExcelJS.Workbook();
    wb.creator = "HiringPortal";
    wb.created = new Date();

    /* ── Color palette ── */
    const COLORS = {
      headerBg: "1E3A5F",
      headerFg: "FFFFFF",
      subHeaderBg: "2E6DA4",
      subHeaderFg: "FFFFFF",
      accent1: "E8F4FD",
      accent2: "D4EDDA",
      accent3: "FFF3CD",
      accent4: "F8D7DA",
      rowAlt: "F8FAFC",
      white: "FFFFFF",
      borderColor: "CBD5E1",
      statCard: "EFF6FF",
    };

    const headerFont = { name: "Arial", bold: true, size: 11, color: { argb: COLORS.headerFg } };
    const subHeaderFont = { name: "Arial", bold: true, size: 10, color: { argb: COLORS.subHeaderFg } };
    const bodyFont = { name: "Arial", size: 10 };
    const boldBodyFont = { name: "Arial", size: 10, bold: true };
    const thinBorder = {
      top: { style: "thin", color: { argb: COLORS.borderColor } },
      left: { style: "thin", color: { argb: COLORS.borderColor } },
      bottom: { style: "thin", color: { argb: COLORS.borderColor } },
      right: { style: "thin", color: { argb: COLORS.borderColor } },
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    const fmtNum = (n) => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

    /* ══════════════════════════════════════════════════════════
       SHEET 1 — Dashboard Summary
       ══════════════════════════════════════════════════════════ */
    const dash = wb.addWorksheet("📊 Dashboard", {
      views: [{ showGridLines: false }],
      pageSetup: { orientation: "landscape", fitToPage: true },
    });

    dash.getColumn("A").width = 4;
    dash.getColumn("B").width = 30;
    dash.getColumn("C").width = 18;
    dash.getColumn("D").width = 30;
    dash.getColumn("E").width = 18;
    dash.getColumn("F").width = 30;
    dash.getColumn("G").width = 18;

    // Title
    dash.mergeCells("A1:G1");
    const titleCell = dash.getCell("A1");
    titleCell.value = "HIRING PIPELINE — COMPLETE REPORT";
    titleCell.font = { name: "Arial", bold: true, size: 16, color: { argb: COLORS.headerFg } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    dash.getRow(1).height = 40;

    // Generated at
    dash.mergeCells("A2:G2");
    const genCell = dash.getCell("A2");
    genCell.value = `Generated: ${new Date().toLocaleString("en-IN")}   |   Filters: Period=${period || "All"} | Status=${jobStatus || "All"} | AppStatus=${appStatus || "All"}`;
    genCell.font = { name: "Arial", size: 9, italic: true, color: { argb: "64748B" } };
    genCell.alignment = { horizontal: "center" };
    dash.getRow(2).height = 18;

    dash.addRow([]);

    // Section header helper
    const addSectionHeader = (ws, row, text, cols) => {
      ws.mergeCells(`B${row}:${cols}${row}`);
      const c = ws.getCell(`B${row}`);
      c.value = text;
      c.font = subHeaderFont;
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.subHeaderBg } };
      c.alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      ws.getRow(row).height = 22;
    };

    // Stat row helper
    const addStatRow = (ws, row, label, value, bgColor = COLORS.statCard) => {
      const lc = ws.getCell(`B${row}`);
      const vc = ws.getCell(`C${row}`);
      lc.value = label;
      lc.font = bodyFont;
      lc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      lc.border = thinBorder;
      lc.alignment = { vertical: "middle", indent: 1 };
      vc.value = value;
      vc.font = boldBodyFont;
      vc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      vc.border = thinBorder;
      vc.alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(row).height = 20;
    };

    // ── Application Stats (col B-C) + Interview Stats (col D-E) ──
    let r = 4;
    addSectionHeader(dash, r, "📋 APPLICATION OVERVIEW", "C"); r++;
    addStatRow(dash, r, "Total Applications", globalStats.total); r++;
    addStatRow(dash, r, "Shortlisted", globalStats.shortlisted); r++;
    addStatRow(dash, r, "Interview Stage", globalStats.interviewStage); r++;
    addStatRow(dash, r, "Final Shortlist", globalStats.finalShort); r++;
    addStatRow(dash, r, "Selected", globalStats.selected, "D4EDDA"); r++;
    addStatRow(dash, r, "Joined", globalStats.joined, "D4EDDA"); r++;
    addStatRow(dash, r, "Not Joined", globalStats.notJoined, "F8D7DA"); r++;
    addStatRow(dash, r, "Rejected", globalStats.rejected, "F8D7DA"); r++;
    addStatRow(dash, r, "Withdrawn", globalStats.withdrawn); r++;
    addStatRow(dash, r, "Offer Emails Sent", globalStats.offerSent); r++;
    addStatRow(dash, r, "Avg Salary Offered", globalStats.avgSalaryOffered ? `₹${Number(globalStats.avgSalaryOffered).toLocaleString("en-IN")}` : "—"); r++;

    // Interview stats — col D-E (same rows, offset)
    const iStart = 5;
    const addInterviewStat = (ws, row, label, value, bgColor = COLORS.statCard) => {
      const lc = ws.getCell(`D${row}`);
      const vc = ws.getCell(`E${row}`);
      lc.value = label;
      lc.font = bodyFont;
      lc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      lc.border = thinBorder;
      lc.alignment = { vertical: "middle", indent: 1 };
      vc.value = value;
      vc.font = boldBodyFont;
      vc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
      vc.border = thinBorder;
      vc.alignment = { horizontal: "center", vertical: "middle" };
    };

    // Interview section header
    const ic = dash.getCell(`D4`);
    dash.mergeCells("D4:E4");
    ic.value = "🎯 INTERVIEW OVERVIEW";
    ic.font = subHeaderFont;
    ic.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.subHeaderBg } };
    ic.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    addInterviewStat(dash, iStart, "Total Interviews", globalStats.interviews.total);
    addInterviewStat(dash, iStart + 1, "Scheduled", globalStats.interviews.scheduled);
    addInterviewStat(dash, iStart + 2, "Completed", globalStats.interviews.completed);
    addInterviewStat(dash, iStart + 3, "Cancelled", globalStats.interviews.cancelled);
    addInterviewStat(dash, iStart + 4, "Passed", globalStats.interviews.passed, "D4EDDA");
    addInterviewStat(dash, iStart + 5, "Failed", globalStats.interviews.failed, "F8D7DA");

    // Job stats section — col F-G
    dash.mergeCells("F4:G4");
    const jc = dash.getCell("F4");
    jc.value = "💼 JOB OVERVIEW";
    jc.font = subHeaderFont;
    jc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.subHeaderBg } };
    jc.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    const addJobStat = (ws, row, label, value) => {
      const lc = ws.getCell(`F${row}`);
      const vc = ws.getCell(`G${row}`);
      lc.value = label; lc.font = bodyFont;
      lc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.statCard } };
      lc.border = thinBorder; lc.alignment = { vertical: "middle", indent: 1 };
      vc.value = value; vc.font = boldBodyFont;
      vc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.statCard } };
      vc.border = thinBorder; vc.alignment = { horizontal: "center", vertical: "middle" };
    };

    const activeJobs = data.filter((j) => j.status === "active").length;
    const closedJobs = data.filter((j) => j.status === "closed").length;
    const pausedJobs = data.filter((j) => j.status === "paused").length;
    addJobStat(dash, iStart, "Total Jobs", data.length);
    addJobStat(dash, iStart + 1, "Active", activeJobs);
    addJobStat(dash, iStart + 2, "Closed", closedJobs);
    addJobStat(dash, iStart + 3, "Paused", pausedJobs);
    addJobStat(dash, iStart + 4, "Total Openings", data.reduce((s, j) => s + (j.openings || 0), 0));

    /* ══════════════════════════════════════════════════════════
       SHEET 2 — Jobs Summary
       ══════════════════════════════════════════════════════════ */
    const jobSheet = wb.addWorksheet("💼 Jobs Summary", {
      views: [{ showGridLines: false, state: "frozen", ySplit: 2 }],
    });

    const jobCols = [
      { header: "#", key: "sno", width: 5 },
      { header: "Job Title", key: "jobTitle", width: 28 },
      { header: "Company", key: "company", width: 22 },
      { header: "Employer", key: "employer", width: 22 },
      { header: "Job Type", key: "jobType", width: 14 },
      { header: "Work Mode", key: "workMode", width: 13 },
      { header: "City", key: "city", width: 14 },
      { header: "Status", key: "status", width: 16 },
      { header: "Openings", key: "openings", width: 10 },
      { header: "Total Apps", key: "totalApps", width: 11 },
      { header: "Shortlisted", key: "shortlisted", width: 12 },
      { header: "Selected", key: "selected", width: 10 },
      { header: "Joined", key: "joined", width: 10 },
      { header: "Not Joined", key: "notJoined", width: 11 },
      { header: "Rejected", key: "rejected", width: 10 },
      { header: "Interviews", key: "interviews", width: 12 },
      { header: "Avg Salary", key: "avgSalary", width: 16 },
      { header: "Posted On", key: "postedOn", width: 14 },
    ];
    jobSheet.columns = jobCols;

    // Header row
    const jobHeaderRow = jobSheet.getRow(1);
    jobCols.forEach((_, i) => {
      const cell = jobHeaderRow.getCell(i + 1);
      cell.font = headerFont;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = thinBorder;
    });
    jobHeaderRow.height = 28;

    data.forEach((job, idx) => {
      const s = job._stats;
      const row = jobSheet.addRow({
        sno: idx + 1,
        jobTitle: job.jobTitle,
        company: job.company?.companyName || "—",
        employer: job.employer?.employerName || "—",
        jobType: job.jobType,
        workMode: job.workMode,
        city: job.city || "—",
        status: job.status?.toUpperCase(),
        openings: job.openings,
        totalApps: s.total,
        shortlisted: s.shortlisted,
        selected: s.selected,
        joined: s.joined,
        notJoined: s.notJoined,
        rejected: s.rejected,
        interviews: s.interviews.total,
        avgSalary: s.avgSalaryOffered ? `₹${Number(s.avgSalaryOffered).toLocaleString("en-IN")}` : "—",
        postedOn: fmtDate(job.createdAt),
      });
      row.eachCell((cell) => {
        cell.font = bodyFont;
        cell.border = thinBorder;
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: idx % 2 === 0 ? COLORS.white : COLORS.rowAlt } };
        cell.alignment = { vertical: "middle" };
      });
      // Status color
      const statusCell = row.getCell(8);
      const statusColors = { ACTIVE: "D4EDDA", CLOSED: "F8D7DA", PAUSED: "FFF3CD", DRAFT: "E2E8F0" };
      const bg = statusColors[job.status?.toUpperCase()] || COLORS.white;
      statusCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      statusCell.alignment = { horizontal: "center", vertical: "middle" };
      row.height = 20;
    });

    // Totals row
    const totalRow = jobSheet.addRow({
      sno: "", jobTitle: "TOTAL", company: "", employer: "", jobType: "", workMode: "", city: "", status: "",
      openings: data.reduce((s, j) => s + (j.openings || 0), 0),
      totalApps: globalStats.total,
      shortlisted: globalStats.shortlisted,
      selected: globalStats.selected,
      joined: globalStats.joined,
      notJoined: globalStats.notJoined,
      rejected: globalStats.rejected,
      interviews: globalStats.interviews.total,
      avgSalary: "",
      postedOn: "",
    });
    totalRow.eachCell((cell) => {
      cell.font = { name: "Arial", bold: true, size: 10 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A5F" } };
      cell.font = { name: "Arial", bold: true, size: 10, color: { argb: "FFFFFF" } };
      cell.border = thinBorder;
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    totalRow.height = 22;

    /* ══════════════════════════════════════════════════════════
       SHEET 3 — All Applications
       ══════════════════════════════════════════════════════════ */
    const appSheet = wb.addWorksheet("📋 Applications", {
      views: [{ showGridLines: false, state: "frozen", ySplit: 1 }],
    });

    const appCols = [
      { header: "#", key: "sno", width: 5 },
      { header: "App ID", key: "appId", width: 9 },
      { header: "Candidate", key: "candidate", width: 22 },
      { header: "Email", key: "email", width: 28 },
      { header: "Phone", key: "phone", width: 14 },
      { header: "Job Title", key: "jobTitle", width: 26 },
      { header: "Company", key: "company", width: 20 },
      { header: "App Status", key: "appStatus", width: 16 },
      { header: "Is Selected", key: "isSelected", width: 12 },
      { header: "Applied On", key: "appliedAt", width: 14 },
      { header: "Interviews", key: "interviews", width: 11 },
      { header: "Final Salary", key: "finalSalary", width: 14 },
      { header: "Joining Date", key: "joiningDate", width: 14 },
      { header: "Leaving Date", key: "leavingDate", width: 14 },
      { header: "Not Join Reason", key: "notJoinReason", width: 28 },
      { header: "Offer Email Sent", key: "offerEmail", width: 16 },
      { header: "Decided By", key: "decidedBy", width: 20 },
    ];
    appSheet.columns = appCols;

    const appHeaderRow = appSheet.getRow(1);
    appCols.forEach((_, i) => {
      const cell = appHeaderRow.getCell(i + 1);
      cell.font = headerFont;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = thinBorder;
    });
    appHeaderRow.height = 28;

    let appRowIdx = 0;
    data.forEach((job) => {
      (job.applications || []).forEach((app) => {
        appRowIdx++;
        const row = appSheet.addRow({
          sno: appRowIdx,
          appId: app.id,
          candidate: app.candidate?.userName || "—",
          email: app.candidate?.emailAddress || "—",
          phone: app.candidate?.contactNumber || "—",
          jobTitle: job.jobTitle,
          company: job.company?.companyName || "—",
          appStatus: app.status?.toUpperCase(),
          isSelected: app.isSelected ? "YES" : "NO",
          appliedAt: fmtDate(app.appliedAt),
          interviews: (app.interviews || []).length,
          finalSalary: fmtNum(app.finalSalaryOffered),
          joiningDate: fmtDate(app.joiningDate),
          leavingDate: fmtDate(app.leavingDate),
          notJoinReason: app.notJoinReason || "—",
          offerEmail: app.offerEmailSent ? `YES (${fmtDate(app.offerEmailSentAt)})` : "NO",
          decidedBy: app.decidedByEmployer?.employerName || "—",
        });

        const statusBgMap = {
          JOINED: "D4EDDA",
          SELECTED: "D1FAE5",
          NOT_JOINED: "F8D7DA",
          REJECTED: "F8D7DA",
          FINAL_SHORTLIST: "FFF3CD",
          SHORTLISTED: "E8F4FD",
        };
        const bg = statusBgMap[app.status?.toUpperCase()] || (appRowIdx % 2 === 0 ? COLORS.white : COLORS.rowAlt);

        row.eachCell((cell) => {
          cell.font = bodyFont;
          cell.border = thinBorder;
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
          cell.alignment = { vertical: "middle", wrapText: false };
        });
        row.height = 20;
      });
    });

    /* ══════════════════════════════════════════════════════════
       SHEET 4 — Interview Details
       ══════════════════════════════════════════════════════════ */
    const intvwSheet = wb.addWorksheet("🎯 Interviews", {
      views: [{ showGridLines: false, state: "frozen", ySplit: 1 }],
    });

    const intvwCols = [
      { header: "#", key: "sno", width: 5 },
      { header: "Candidate", key: "candidate", width: 22 },
      { header: "Email", key: "email", width: 28 },
      { header: "Job Title", key: "jobTitle", width: 26 },
      { header: "Company", key: "company", width: 20 },
      { header: "Round", key: "round", width: 9 },
      { header: "Round Label", key: "roundLabel", width: 14 },
      { header: "Type", key: "type", width: 12 },
      { header: "Status", key: "status", width: 15 },
      { header: "Result", key: "result", width: 12 },
      { header: "Scheduled At", key: "scheduledAt", width: 20 },
      { header: "Meeting Link", key: "meetingLink", width: 32 },
      { header: "Location", key: "location", width: 20 },
      { header: "Interviewer", key: "interviewer", width: 20 },
      { header: "Feedback", key: "feedback", width: 35 },
      { header: "Cancel Reason", key: "cancelReason", width: 28 },
      { header: "Hold Reason", key: "holdReason", width: 28 },
    ];
    intvwSheet.columns = intvwCols;

    const intvwHeaderRow = intvwSheet.getRow(1);
    intvwCols.forEach((_, i) => {
      const cell = intvwHeaderRow.getCell(i + 1);
      cell.font = headerFont;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = thinBorder;
    });
    intvwHeaderRow.height = 28;

    let intvwIdx = 0;
    const roundLabel = (r) => (r === 2 ? "HR Round" : `Round ${r}`);

    data.forEach((job) => {
      (job.applications || []).forEach((app) => {
        (app.interviews || []).forEach((iv) => {
          intvwIdx++;
          const row = intvwSheet.addRow({
            sno: intvwIdx,
            candidate: app.candidate?.userName || "—",
            email: app.candidate?.emailAddress || "—",
            jobTitle: job.jobTitle,
            company: job.company?.companyName || "—",
            round: iv.round,
            roundLabel: roundLabel(iv.round),
            type: iv.interviewType?.toUpperCase(),
            status: iv.status?.toUpperCase(),
            result: iv.result?.toUpperCase() || "—",
            scheduledAt: iv.scheduledAt ? new Date(iv.scheduledAt).toLocaleString("en-IN") : "—",
            meetingLink: iv.meetingLink || "—",
            location: iv.location || "—",
            interviewer: iv.meetingPerson || "—",
            feedback: iv.feedback || "—",
            cancelReason: iv.cancelReason || "—",
            holdReason: iv.holdReason || "—",
          });

          const resultBgMap = { PASS: "D4EDDA", FAIL: "F8D7DA", NEXT_ROUND: "E8F4FD" };
          const bg = iv.result ? (resultBgMap[iv.result.toUpperCase()] || COLORS.white) : (intvwIdx % 2 === 0 ? COLORS.white : COLORS.rowAlt);

          row.eachCell((cell) => {
            cell.font = bodyFont;
            cell.border = thinBorder;
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
            cell.alignment = { vertical: "middle", wrapText: false };
          });
          row.height = 20;
        });
      });
    });

    /* ══════════════════════════════════════════════════════════
       SHEET 5 — Employer Performance
       ══════════════════════════════════════════════════════════ */
    const empSheet = wb.addWorksheet("👤 Employer Stats", {
      views: [{ showGridLines: false, state: "frozen", ySplit: 1 }],
    });

    // Group by employer
    const empMap = {};
    data.forEach((job) => {
      const eId = job.employer?.id || "unknown";
      const eName = job.employer?.employerName || "Unknown";
      if (!empMap[eId]) empMap[eId] = { name: eName, jobs: [], apps: [] };
      empMap[eId].jobs.push(job);
      empMap[eId].apps.push(...(job.applications || []));
    });

    const empCols = [
      { header: "#", key: "sno", width: 5 },
      { header: "Employer", key: "employer", width: 24 },
      { header: "Total Jobs", key: "jobs", width: 12 },
      { header: "Total Apps", key: "apps", width: 12 },
      { header: "Shortlisted", key: "shortlisted", width: 13 },
      { header: "Selected", key: "selected", width: 11 },
      { header: "Joined", key: "joined", width: 11 },
      { header: "Not Joined", key: "notJoined", width: 12 },
      { header: "Rejected", key: "rejected", width: 11 },
      { header: "Interviews", key: "interviews", width: 12 },
      { header: "Pass Rate", key: "passRate", width: 11 },
      { header: "Join Rate", key: "joinRate", width: 11 },
      { header: "Avg Salary", key: "avgSalary", width: 16 },
    ];
    empSheet.columns = empCols;

    const empHeaderRow = empSheet.getRow(1);
    empCols.forEach((_, i) => {
      const cell = empHeaderRow.getCell(i + 1);
      cell.font = headerFont;
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = thinBorder;
    });
    empHeaderRow.height = 28;

    Object.values(empMap).forEach((emp, idx) => {
      const s = buildStats(emp.apps);
      const allIv = emp.apps.flatMap((a) => a.interviews || []);
      const passed = allIv.filter((i) => i.result === "pass").length;
      const passRate = allIv.length ? ((passed / allIv.length) * 100).toFixed(1) + "%" : "—";
      const joinRate = s.selected ? ((s.joined / s.selected) * 100).toFixed(1) + "%" : "—";

      const row = empSheet.addRow({
        sno: idx + 1,
        employer: emp.name,
        jobs: emp.jobs.length,
        apps: s.total,
        shortlisted: s.shortlisted,
        selected: s.selected,
        joined: s.joined,
        notJoined: s.notJoined,
        rejected: s.rejected,
        interviews: s.interviews.total,
        passRate,
        joinRate,
        avgSalary: s.avgSalaryOffered ? `₹${Number(s.avgSalaryOffered).toLocaleString("en-IN")}` : "—",
      });
      row.eachCell((cell) => {
        cell.font = bodyFont;
        cell.border = thinBorder;
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: idx % 2 === 0 ? COLORS.white : COLORS.rowAlt } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
      row.getCell(2).alignment = { horizontal: "left", vertical: "middle", indent: 1 };
      row.height = 20;
    });

    /* ── Send file ── */
    const fileName = `hiring-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    await wb.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("ExportJobsExcel Error:", error);
    return res.status(500).json({ success: false, message: "Export failed" });
  }
};

exports.updatePaymentDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate, paymentStatus } = req.body;
    const jobApplication = await JobApplication.findByPk(id);

    if (!jobApplication) {
      return sendError(res, 404, "Application not found");
    }

    jobApplication.paymentDate = paymentDate;
    jobApplication.paymentStatus = paymentStatus;
    await jobApplication.save();

    return sendSuccess(res, jobApplication, "Payment date updated successfully");
  } catch (error) {
    console.log("Internal server error", error)
    return sendError(res, 500, "Failed to update payment date");
  }
}