"use strict";

module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define(
    "Page",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },

      content: {
        type: DataTypes.TEXT("long"),
      },

      pageType: {
        type: DataTypes.ENUM(
          "terms",
          "privacy",
          "disclaimer",
          "about",
          "contact",
          "custom"
        ),
        defaultValue: "custom",
      },

      status: {
        type: DataTypes.ENUM("draft", "published"),
        defaultValue: "published",
      },

      metaTitle: DataTypes.STRING,

      metaDescription: DataTypes.TEXT,

      metaKeywords: DataTypes.TEXT,

      ogTitle: DataTypes.STRING,

      ogDescription: DataTypes.TEXT,

      ogImage: DataTypes.STRING,

      canonicalUrl: DataTypes.STRING,
    },
    {
      tableName: "pages",
      timestamps: true,
    }
  );

  return Page;
};