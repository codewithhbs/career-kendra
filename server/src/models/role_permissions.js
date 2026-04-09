// role_permissions.js
module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    "role_permissions",
    {
      roleId: DataTypes.INTEGER,
      permissionId: DataTypes.INTEGER,
    },
    {
      timestamps: false, // ✅ IMPORTANT FIX
    }
  );

  return RolePermission;
};