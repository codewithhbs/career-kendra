const { verify } = require("../utils/generateToken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ 1. Check header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Authorization header missing",
      });
    }

    // ✅ 2. Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Invalid authorization format (Use: Bearer token)",
      });
    }

    // ✅ 3. Extract token
    const token = authHeader.split(" ")[1];

    if (!token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        error: "Token not provided",
      });
    }

    // ✅ 4. Verify token
    const payload = verify(token);

    // 🔥 5. Handle BOTH token structures
    // Case 1: New format (admin inside payload)
    // Case 2: Old format (flat payload)

    let userData = {};

    if (payload.admin) {
      // ✅ NEW TOKEN STRUCTURE
      userData = {
        id: payload.admin.id,
        email: payload.admin.email,
        role: payload.admin.role,
        roleId: payload.admin.roleId,
        level: payload.admin.level,
        type: payload.type || "admin",
      };
    } else {
      // ✅ OLD TOKEN STRUCTURE (fallback)
      userData = {
        id: payload.id,
        email: payload.email,
        role: payload.role || "user",
        roleId: payload.roleId,
        level: payload.level,
        type: payload.type || "user",
      };
    }

    // ✅ Attach to request
    req.user = userData;

    // ✅ Dev logs
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[AUTH] ${userData.type.toUpperCase()} authenticated → ID: ${userData.id}, Role: ${userData.role}`
      );
    }

    next();
  } catch (error) {
    let status = 401;
    let message = "Invalid or expired token";

    // ✅ Detailed error handling
    if (error.name === "TokenExpiredError") {
      message = "Token expired. Please login again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token";
    } else if (error.name === "NotBeforeError") {
      message = "Token not active yet";
    } else {
      console.error("[AUTH ERROR]", error);
    }

    return res.status(status).json({
      success: false,
      error: message,
    });
  }
};