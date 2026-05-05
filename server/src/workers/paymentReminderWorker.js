const { Worker } = require("bullmq");
const { redisConnection } = require("../../config/redis");
const { Op } = require("sequelize");
const db = require("../models");                    // ✅ index.js se
const JobApplication = db.JobApplication;           // ✅ initialized model
const emailQueue = require("../queues/emailQueue");

const paymentReminderWorker = new Worker(
  "paymentReminder",
  async (job) => {
    console.log("[PaymentReminder] Job started:", new Date().toISOString());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // paymentStatus false hai AND paymentDate aa chuki hai (aaj ya pehle)
    const overdueApplications = await JobApplication.findAll({
      where: {
        paymentStatus: false,
        paymentDate: {
          [Op.not]: null,
          [Op.lte]: today, // payment date <= aaj
        },
      },
      include: [
        {
          association: "candidate", // apna association name
          attributes: ["userName", "emailAddress"],
        },
        {
          association: "job",
          attributes: ["jobTitle"],
        },
      ],
    });

    if (overdueApplications.length === 0) {
      console.log("[PaymentReminder] Koi overdue payment nahi mili.");
      return;
    }

    console.log(`[PaymentReminder] ${overdueApplications.length} overdue applications mili.`);

    // HTML banao
const html = `
  <h2>Payment Reminder — ${overdueApplications.length} Pending Payment(s)</h2>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
    <thead>
      <tr style="background:#f3f4f6">
        <th>App ID</th>
        <th>Candidate</th>
        <th>Email</th>
        <th>Job Title</th>
        <th>Payment Due Date</th>
      </tr>
    </thead>
    <tbody>
      ${overdueApplications.map((app) => `
        <tr>
          <td>#${app.id}</td>
          <td>${app.candidate?.userName || "N/A"}</td>
          <td>${app.candidate?.emailAddress || "N/A"}</td>
          <td>${app.job?.jobTitle || "N/A"}</td>
          <td style="color:red">${
            new Date(app.paymentDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })
          }</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
`;

// ✅ sendEmail ke structure ke according { html, options } bhejo
await emailQueue.add("sendAdminPaymentReminder", {
  html,
  options: {
    receiver_email: process.env.ADMIN_EMAIL,
    subject: `Payment Reminder: ${overdueApplications.length} Pending Payment(s)`,
  },
});

    console.log("[PaymentReminder] Admin ko email queue me add kiya.");
  },
  { connection: redisConnection } // ← plain object, Redis instance nahi
);

paymentReminderWorker.on("completed", (job) => {
  console.log(`[PaymentReminder] Job ${job.id} completed.`);
});

paymentReminderWorker.on("failed", (job, err) => {
    // console.log("job",job)
  console.error(`[PaymentReminder] Job ${job.id} failed:`, err.message);
});

module.exports = paymentReminderWorker;