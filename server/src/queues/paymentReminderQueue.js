const { Queue } = require("bullmq");
const { redisConnection } = require("../../config/redis");

const paymentReminderQueue = new Queue("paymentReminder", {
  connection: redisConnection,
});

module.exports = paymentReminderQueue;