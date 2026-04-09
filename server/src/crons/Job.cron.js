const cron = require("node-cron");
const { Op } = require("sequelize");
const { Job } = require("../models");

cron.schedule("*/1 * * * *", async () => {
  try {
    const updated = await Job.update(
      { status: "active", },
      {
        where: {
          status: "under-verification",
        },
      }
    );

    if (updated[0] > 0) {
      console.log(`✅ ${updated[0]} job(s) activated`);
    }
  } catch (error) {
    console.error("❌ Job activation cron failed:", error);
  }
});