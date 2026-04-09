"use strict";

module.exports = (sequelize, DataTypes) => {
  const LoginOtp = sequelize.define(
    "LoginOtp",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      otpExpireTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "login_otps",
    }
  );

  return LoginOtp;
};
