module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define("AuditLog", {
    action: DataTypes.STRING,
    performedBy: DataTypes.INTEGER,
    targetId: DataTypes.INTEGER,
    targetType: DataTypes.STRING,
  });

  return AuditLog;
};