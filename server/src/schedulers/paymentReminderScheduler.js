const paymentReminderQueue = require("../queues/paymentReminderQueue");

const schedulePaymentReminderJob = async () => {
  // Pehle purane repeatable jobs hata do (duplicate se bachne ke liye)
  const repeatableJobs = await paymentReminderQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await paymentReminderQueue.removeRepeatableByKey(job.key);
  }

  // Roz raat 12:00 AM IST = 6:30 PM UTC (IST = UTC+5:30)
  await paymentReminderQueue.add(
    "dailyPaymentCheck",
    {}, // payload khaali, worker khud data fetch karega
    {
      repeat: {
        cron: "30 18 * * *", // UTC mein 18:30 = IST mein 00:00
        // agar server IST pe chale to: cron: "0 0 * * *"
      },
      removeOnComplete: { count: 10 }, // last 10 completed jobs rakho
      removeOnFail: { count: 20 },
    }
  );

  console.log("[PaymentReminder] Cron job scheduled: roz raat 12 baje (IST)");
};

module.exports = schedulePaymentReminderJob;