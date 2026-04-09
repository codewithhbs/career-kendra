"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("job_interviews", {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "job_applications",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      round: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      interviewType: {
        type: Sequelize.ENUM("online", "offline"),
        allowNull: false,
      },

      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      meetingLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      meetingPerson: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM(
          "scheduled",
          "completed",
          "cancelled",
          "no_show"
        ),
        defaultValue: "scheduled",
      },

      feedback: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      result: {
        type: Sequelize.ENUM(
          "pass",
          "fail",
          "next_round"
        ),
        allowNull: true,
      },

      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.dropTable("job_interviews");

  }
};