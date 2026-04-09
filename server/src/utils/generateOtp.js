const redis = require("../../config/redis");

exports.GenerateOtp = () => {
  return 123456
  // return Math.floor(100000 + Math.random() * 900000).toString();
};


exports.verifyOtp = async ({ userId, otp ,keyS="user"}) => {
  const key = `otp:${keyS}:${userId}`;
  const savedOtp = await redis.get(key);

  if (!savedOtp) return { success: false, message: "OTP expired. Please resend." };

  if (savedOtp !== otp) return { success: false, message: "Invalid OTP." };

  await redis.del(key); // delete after success
  return { success: true, message: "OTP verified successfully." };
};