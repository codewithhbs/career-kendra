"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("roles", "level", {
      type: Sequelize.INTEGER,
      allowNull: true, // keep true for existing data safety
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("roles", "level");
  },
};