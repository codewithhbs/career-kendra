"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("role_permissions", {
      roleId: {
        type: Sequelize.INTEGER,
        references: { model: "roles", key: "id" },
      },
      permissionId: {
        type: Sequelize.INTEGER,
        references: { model: "permissions", key: "id" },
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("role_permissions");
  },
};