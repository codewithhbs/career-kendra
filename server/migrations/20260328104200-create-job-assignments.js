'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_assignments', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      adminEmployeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      assignedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM(
          "assigned",
          "in-progress",
          "completed",
          "on-hold",
          "rejected"
        ),
        defaultValue: "assigned",
      },

      priority: {
        type: Sequelize.ENUM("low", "medium", "high"),
        defaultValue: "medium",
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      assignedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

    });

    // ✅ Index (performance ke liye)
    await queryInterface.addIndex('job_assignments', ['jobId', 'adminEmployeId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_assignments');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_job_assignments_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_job_assignments_priority";'
    );
  }
};