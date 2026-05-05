const { Worker } = require("bullmq");
const sendEmail = require("../utils/sendEmail");

const worker = new Worker(
  "emailQueue",
  async (job) => {
    console.log(`[EmailWorker] Job "${job.name}" started`);

    const { html, options } = job.data; // ✅ job.data se lo, receiver_email nahi

    await sendEmail(html, options);
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Email Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Email Job ${job.id} failed:`, err);
});