require("dotenv").config();

const app = require("../app");
const { connectDB } = require("../config/db");
const setupBullBoard = require("./bullboard");
require("../config/redis"); // ✅ just initialize redis

const PORT = process.env.PORT || 9120;
require("./workers/emailWorker"); // ✅ start email worker before server starts
setupBullBoard(app); // ✅ setup Bull Board before starting the server
(async () => {

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🔧 Bull Board dashboard available at: http://localhost:${PORT}/admin/queues`);
    console.log(`✅ Server running on http://localhost:${PORT}`);
    connectDB(); // ✅ connect DB first

  });

})();
