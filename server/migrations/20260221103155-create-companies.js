"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("companies", {
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

      companyName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      companyEmail: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      companyPhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      companyWebsite: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      companySize: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      companyIndustry: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      companyDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      country: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "India",
      },

      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },

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

    await queryInterface.addIndex("companies", ["employerId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("companies");
  },
};