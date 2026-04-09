"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {



    await queryInterface.addColumn("companies", "linkedinUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("companies", "facebookUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("companies", "instagramUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("companies", "twitterUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("companies", "youtubeUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("companies", "githubUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("companies", "whatsappNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("companies", "googleMapsUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    
  },

  async down(queryInterface, Sequelize) {

   
    await queryInterface.removeColumn("companies", "linkedinUrl");
    await queryInterface.removeColumn("companies", "facebookUrl");
    await queryInterface.removeColumn("companies", "instagramUrl");
    await queryInterface.removeColumn("companies", "twitterUrl");
    await queryInterface.removeColumn("companies", "youtubeUrl");
    await queryInterface.removeColumn("companies", "githubUrl");
    await queryInterface.removeColumn("companies", "whatsappNumber");
    await queryInterface.removeColumn("companies", "googleMapsUrl");

  
  
  },
};