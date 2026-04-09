"use strict";

const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    "Admin",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "admins",
      hooks: {

        beforeCreate: async (admin) => {
          if (admin.password) {
            const salt = await bcrypt.genSalt(12);
            admin.password = await bcrypt.hash(admin.password, salt);
          }
        },


        beforeUpdate: async (admin) => {
          if (admin.changed("password") && admin.password) {
            const salt = await bcrypt.genSalt(12);
            admin.password = await bcrypt.hash(admin.password, salt);
          }
        },
      },
    }
  );

  // Instance method to compare password
  Admin.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  Admin.associate = (models) => {
    if (!models.admin_employees) {
      throw new Error("admin_employees model not loaded");
    }

    Admin.hasMany(models.admin_employees, {
      foreignKey: "addedBy",
      as: "admin_employees",
    });
    Admin.belongsTo(models.Role, {
    foreignKey: "roleId",
    as: "role",
  });
  };
  return Admin;
};