"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("saved_jobs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // table name
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "jobs", // table name
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      savedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // ✅ Unique constraint (VERY IMPORTANT)
    await queryInterface.addConstraint("saved_jobs", {
      fields: ["userId", "jobId"],
      type: "unique",
      name: "unique_saved_job_per_user",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("saved_jobs");
  },
};