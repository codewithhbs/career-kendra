"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("admin_employees", "status", {
      type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    });

    await queryInterface.addColumn("admin_employees", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("admin_employees", "otp", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("admin_employees", "otpExpiry", {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("admin_employees", "status");
    await queryInterface.removeColumn("admin_employees", "deletedAt");
    await queryInterface.removeColumn("admin_employees", "otp");
    await queryInterface.removeColumn("admin_employees", "otpExpiry");
  },
};