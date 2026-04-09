"use strict";


module.exports = (sequelize, DataTypes) => {
  
  const AdminEmployee = sequelize.define("admin_employees", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.ENUM("ACTIVE", "INACTIVE"),
    otp: DataTypes.STRING,
    otpExpiry: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  });

  AdminEmployee.associate = (models) => {
    AdminEmployee.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
    AdminEmployee.belongsTo(models.Admin, { foreignKey: "addedBy" });
  };

  return AdminEmployee;
};