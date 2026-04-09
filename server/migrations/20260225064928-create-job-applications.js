"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("job_applications", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "jobs",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      status: {
        type: Sequelize.ENUM(
          "applied",
          "shortlisted",
          "interview",
          "rejected",
          "hired"
        ),
        defaultValue: "applied",
      },

      coverLetter: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      resume: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      expectedSalary: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      noticePeriod: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("job_applications");
  },
};