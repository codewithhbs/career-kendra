// bullboard.js
const { ExpressAdapter } = require("@bull-board/express");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");

const emailQueue = require("./queues/emailQueue");
const paymentReminderQueue = require("./queues/paymentReminderQueue");

const setupBullBoard = (app) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");

  createBullBoard({
    queues: [
      new BullMQAdapter(emailQueue),
      new BullMQAdapter(paymentReminderQueue),
    ],
    serverAdapter,
  });

  app.use("/admin/queues", serverAdapter.getRouter());

};

module.exports = setupBullBoard;