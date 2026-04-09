const emailQueue = require("../queues/emailQueue");

async function addEmailJob(data) {
  try {
    const job = await emailQueue.add("sendEmail", data);
    console.log("Email job added:", job.id);
    return job;
  } catch (error) {
    console.error("Queue error:", error);
    throw error;
  }
}

module.exports = addEmailJob;