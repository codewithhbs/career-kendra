require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./src/routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const app = express();
const path = require("path");
// require("./src/crons/Job.cron");
/* ===================== MIDDLEWARES ===================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://careerkendra.com",
      "https://www.careerkendra.com",
      "https://www.admin.careerkendra.com",
      "https://admin.careerkendra.com",

    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "src/uploads"))
);
/* ===================== ROUTES ===================== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HRMS Backend is running 🚀",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1',routes)

module.exports = app;
