
"use strict";

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      level: {
        type: DataTypes.INTEGER,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "roles",
      timestamps: false,
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.admin_employees, { foreignKey: "roleId", as: "admin_employees" });
    
    Role.belongsToMany(models.Permission, {
    through: "role_permissions", 
    foreignKey: "roleId",
    otherKey: "permissionId",
    as: "permissions",
  });
    Role.hasMany(models.Admin, {
    foreignKey: "roleId",
    as: "admins",
  });
  };

  return Role;
};