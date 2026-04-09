"use strict";

module.exports = (sequelize, DataTypes) => {
  const WebSettings = sequelize.define(
    "WebSettings",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      siteName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      siteTagline: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      siteLogo: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      siteFavicon: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      supportEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      pincode: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      googleMapsUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      googleMapsEmbed: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      /* Working Hours */

      workingHours: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },

      officeOpenTime: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      officeCloseTime: {
        type: DataTypes.TIME,
        allowNull: true,
      },

      workingDays: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      /* Social Media */

      facebookUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      twitterUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      linkedinUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      instagramUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      youtubeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      /* SEO */

      metaTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      metaDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      metaKeywords: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      footerText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      maintenanceMode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "web_settings",
      timestamps: true,
    }
  );

  return WebSettings;
};