"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("job_applications", "adminRating", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("job_applications", "finalSalaryOffered", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("job_applications", "joiningDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("job_applications", "statusUpdatedBy", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("job_applications", "statusUpdatedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("job_applications", "statusReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn("job_applications", "adminRating");
    await queryInterface.removeColumn("job_applications", "finalSalaryOffered");
    await queryInterface.removeColumn("job_applications", "joiningDate");
    await queryInterface.removeColumn("job_applications", "statusUpdatedBy");
    await queryInterface.removeColumn("job_applications", "statusUpdatedAt");
    await queryInterface.removeColumn("job_applications", "statusReason");

  }
};