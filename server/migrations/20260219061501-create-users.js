"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      userName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      contactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      otpExpireTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      accountActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      uploadedCv: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
