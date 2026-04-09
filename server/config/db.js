const mysql = require("mysql2/promise");
const path = require("path");
const env = process.env.NODE_ENV || "production";
const config = require(path.join(__dirname, "./config.json"))[env];



const pool = mysql.createPool({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 20,
  maxIdle: 10, // idle connections
  idleTimeout: 60000,
  queueLimit: 50, // prevent infinite queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/* ================= CONNECT FUNCTION ================= */

async function connectDB() {
  try {
    const connection = await pool.getConnection();

    console.log(
      `✅ MySQL Connected Successfully (${env.toUpperCase()})`
    );

    connection.release();
  } catch (error) {
    console.error("❌ MySQL Connection Failed:", error.message);
    process.exit(1);
  }
}

module.exports = { pool, connectDB };