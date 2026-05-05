require("dotenv").config();

const app = require("../app");
const { connectDB } = require("../config/db");
const setupBullBoard = require("./bullboard");
require("../config/redis");

const PORT = process.env.PORT || 9120;

require("./workers/emailWorker");
require("./workers/paymentReminderWorker"); // ✅ NEW

const schedulePaymentReminderJob = require("./schedulers/paymentReminderScheduler"); // ✅ NEW

setupBullBoard(app);

(async () => {
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🔧 Bull Board dashboard available at: http://localhost:${PORT}/admin/queues`);
    console.log(`✅ Server running on http://localhost:${PORT}`);
    connectDB();

    await schedulePaymentReminderJob(); // ✅ NEW - DB connect hone ke baad schedule karo
    console.log("✅ Payment reminder cron job scheduled");
  });
})();