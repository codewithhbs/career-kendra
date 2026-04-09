"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("jobs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      employerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "employers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "companies",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      jobCategory: Sequelize.STRING,
      jobDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      jobResponsibilities: Sequelize.TEXT,

      requiredSkills: {
        type: Sequelize.JSON,
        defaultValue: [],
      },

      jobType: {
        type: Sequelize.ENUM(
          "full-time",
          "part-time",
          "internship",
          "contract",
          "freelance"
        ),
        defaultValue: "full-time",
      },

      workMode: {
        type: Sequelize.ENUM("onsite", "remote", "hybrid"),
        defaultValue: "onsite",
      },

      salaryType: {
        type: Sequelize.ENUM("monthly", "yearly"),
        defaultValue: "monthly",
      },

      currency: {
        type: Sequelize.STRING,
        defaultValue: "INR",
      },

      salaryMin: Sequelize.INTEGER,
      salaryMax: Sequelize.INTEGER,
      hideSalary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      experienceMin: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      experienceMax: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      openings: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },

      shiftType: {
        type: Sequelize.ENUM("day", "night", "rotational", "flexible"),
      },

      noticePeriod: Sequelize.STRING,
      benefits: {
        type: Sequelize.JSON,
        defaultValue: [],
      },

      education: Sequelize.STRING,

      applyType: {
        type: Sequelize.ENUM("easy-apply", "external-link", "email"),
        defaultValue: "easy-apply",
      },

      applyLink: Sequelize.STRING,
      applyEmail: Sequelize.STRING,

      status: {
        type: Sequelize.ENUM("draft", "active", "closed", "paused"),
        defaultValue: "draft",
      },

      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      expiryDate: Sequelize.DATE,

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("jobs", ["employerId"]);
    await queryInterface.addIndex("jobs", ["companyId"]);
    await queryInterface.addIndex("jobs", ["slug"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("jobs");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_jobs_jobType";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_jobs_workMode";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_jobs_salaryType";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_jobs_shiftType";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_jobs_applyType";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_jobs_status";'
    );
  },
};