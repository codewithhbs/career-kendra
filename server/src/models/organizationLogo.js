"use strict";

module.exports = (sequelize, DataTypes) => {
  const OrganizationLogo = sequelize.define(
    "OrganizationLogo",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
      },

      description: {
        type: DataTypes.TEXT,
      },

      position: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      tableName: "organization_logos",
      timestamps: true,
    }
  );

  return OrganizationLogo;
};