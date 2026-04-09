"use strict";

module.exports = (sequelize, DataTypes) => {
  const ContactMessage = sequelize.define(
    "ContactMessage",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone: {
        type: DataTypes.STRING,
      },


      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      ipAddress: {
        type: DataTypes.STRING,
      },

      status: {
        type: DataTypes.ENUM("new", "read", "replied", "closed"),
        defaultValue: "new",
      },

      adminReply: {
        type: DataTypes.TEXT,
      },

      repliedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "contact_messages",
      timestamps: true,
    }
  );

  return ContactMessage;
};