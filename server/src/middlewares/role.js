const { sendError } = require("../utils/api");



module.exports = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};


exports.checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!allowedRoles.includes(userRole)) {
        return sendError(res, 403, "You do not have permission to perform this action");
      }

      next();
    } catch (error) {
      return sendError(res, 500, "Role validation failed");
    }
  };
};



exports.checkLevel = (minLevel) => {
  return (req, res, next) => {
    try {
      if (req.user.level > minLevel) {
        return sendError(res, 403, "Access denied");
      }
      next();
    } catch (error) {
      return sendError(res, 500, "Permission check failed");
    }
  };
};