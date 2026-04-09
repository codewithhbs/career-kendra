const { AuditLog } = require("../models");

exports.logAction = async ({ action, performedBy, targetId, targetType }) => {
  await AuditLog.create({ action, performedBy, targetId, targetType });
};