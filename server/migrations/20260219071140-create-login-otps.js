"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("login_otps", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      contactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      otp: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      otpExpireTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      isUsed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("login_otps");
  },
};
