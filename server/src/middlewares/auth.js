const { verify } = require("../utils/generateToken");

module.exports = async (req, res, next) => {
  const debug = process.env.AUTH_DEBUG === "false";

  try {
    if (debug) {
      console.log("\n🔐 ===== AUTH DEBUG START =====");
      console.log("👉 URL:", req.originalUrl);
      console.log("👉 Method:", req.method);
      console.log("👉 Headers:", req.headers);
      console.log("👉 Cookies:", req.cookies);
    }

    let token = null;
    let source = null;

    // ✅ 1. Check Authorization Header
    const authHeader = req.headers.authorization;

    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
        source = "header (Bearer)";
      } else {
        if (debug) console.log("❌ Invalid header format:", authHeader);
        return res.status(401).json({
          success: false,
          error: "Invalid authorization format (Use: Bearer token)",
        });
      }
    }

    // ✅ 2. Check Cookies (fallback)
    if (!token && req.cookies?.employer_token) {
      token = req.cookies.employer_token;
      source = "cookie (employer_token)";
    }

    if (!token && req.cookies?.apto_token) {
      token = req.cookies.apto_token;
      source = "cookie (apto_token)";
    }

    // ❌ 3. No token anywhere
    if (!token) {
      if (debug) console.log("❌ No token found in header or cookies");
      return res.status(401).json({
        success: false,
        error: "Token not provided",
      });
    }

    // ❌ 4. Empty token
    if (!token.trim()) {
      if (debug) console.log("❌ Empty token string");
      return res.status(401).json({
        success: false,
        error: "Empty token",
      });
    }

    if (debug) {
      console.log("✅ Token source:", source);
      console.log("✅ Token preview:", token.slice(0, 25) + "...");
    }

    // ✅ 5. Verify token
    const payload = verify(token);

    if (debug) {
      console.log("✅ Decoded Payload:", payload);
    }

    // ✅ 6. Normalize user data
    let userData = {};

    if (payload.admin) {
      userData = {
        id: payload.admin.id,
        email: payload.admin.email,
        role: payload.admin.role,
        roleId: payload.admin.roleId,
        level: payload.admin.level,
        type: payload.type || "admin",
      };
      if (debug) console.log("🆕 Admin token detected");
    } else {
      userData = {
        id: payload.id,
        email: payload.email,
        role: payload.role || "user",
        roleId: payload.roleId,
        level: payload.level,
        type: payload.type || "user",
      };
      if (debug) console.log("📦 User token detected");
    }

    // ✅ 7. Attach user
    req.user = userData;

    if (debug) {
      console.log("👤 Attached user:", userData);
      console.log("🔐 ===== AUTH DEBUG END =====\n");
    }

    next();
  } catch (error) {
    let message = "Invalid or expired token";

    console.log("\n❌ ===== AUTH ERROR =====");
    console.error(error);

    if (error.name === "TokenExpiredError") {
      message = "Token expired. Please login again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token";
    } else if (error.name === "NotBeforeError") {
      message = "Token not active yet";
    }

    return res.status(401).json({
      success: false,
      error: message,
    });
  }
};