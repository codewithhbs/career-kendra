"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_logs", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      action: Sequelize.STRING,
      performedBy: Sequelize.INTEGER,
      targetId: Sequelize.INTEGER,
      targetType: Sequelize.STRING,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("audit_logs");
  },
};