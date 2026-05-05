const Redis = require("ioredis");
require('dotenv').config();

// BullMQ ke liye connection config (plain object)
const redisConnection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
};

// Normal redis client (baaki jagah use ke liye - caching etc.)
const redis = new Redis({
  ...redisConnection,
  retryStrategy() {
    return 2000;
  },
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});
redis.on("error", () => {
  console.log("Redis not running — continuing without redis...");
});

module.exports = redis;
module.exports.redisConnection = redisConnection; // BullMQ ke liye