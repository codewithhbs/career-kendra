"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("permissions", [
      { name: "CREATE_EMPLOYEE" },
      { name: "VIEW_EMPLOYEE" },
      { name: "UPDATE_EMPLOYEE" },
      { name: "DELETE_EMPLOYEE" },
      { name: "CHANGE_ROLE" },
      { name: "CHANGE_PASSWORD" },
      { name: "CHANGE_STATUS" },
      { name: "MANAGE_ROLES" },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};