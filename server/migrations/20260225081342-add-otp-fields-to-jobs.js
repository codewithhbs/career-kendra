"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("jobs", "otp", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "otpExpiry", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("jobs", "otpVerified", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn("jobs", "otp");
    await queryInterface.removeColumn("jobs", "otpExpiry");
    await queryInterface.removeColumn("jobs", "otpVerified");

  },
};