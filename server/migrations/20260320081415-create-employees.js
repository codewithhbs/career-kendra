"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("admin_employees", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: Sequelize.STRING,
      email: { type: Sequelize.STRING, unique: true },
      password: Sequelize.STRING,
      roleId: {
        type: Sequelize.INTEGER,
        references: { model: "roles", key: "id" },
      },
      addedBy: {
        type: Sequelize.INTEGER,
        references: { model: "admins", key: "id" },
      },
      status: {
        type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
      },
      otp: Sequelize.STRING,
      otpExpiry: Sequelize.DATE,
      deletedAt: Sequelize.DATE,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("admin_employees");
  },
};