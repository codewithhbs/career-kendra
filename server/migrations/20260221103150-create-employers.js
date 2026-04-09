"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("employers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      employerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      employerContactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      employerEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      otpExpireTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      accountStatus: {
        type: Sequelize.ENUM(
          "active",
          "blocked",
          "pending",
          "company-details-pending",
          "waiting-for-verification"
        ),
        allowNull: false,
        defaultValue: "pending",
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
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

    await queryInterface.addIndex("employers", ["employerEmail"]);
    await queryInterface.addIndex("employers", ["employerContactNumber"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("employers");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_employers_accountStatus";'
    );
  },
};