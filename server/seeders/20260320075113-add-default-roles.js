"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", [
      {
        roleName: "Super Admin",
        description: "Has full access to the entire system",
      },
      {
        roleName: "Admin",
        description: "Manages platform operations and users",
      },
      {
        roleName: "Sub Admin",
        description: "Assists admin with limited permissions",
      },
      {
        roleName: "Tech HR",
        description: "Handles hiring for IT and technical roles",
      },
      {
        roleName: "BPO HR",
        description: "Manages hiring for BPO and support roles",
      },
      {
        roleName: "Non-Tech HR",
        description: "Handles hiring for non-technical roles",
      },
      {
        roleName: "General HR",
        description: "Handles overall HR operations",
      },
      {
        roleName: "Recruiter",
        description: "Responsible for sourcing and screening candidates",
      },
      {
        roleName: "Employee",
        description: "Basic employee access with limited permissions",
      },
    ], {
      ignoreDuplicates: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};