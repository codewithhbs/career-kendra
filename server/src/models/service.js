"use strict";

module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    "Service",
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
        allowNull: false,
        unique: true,
      },

      shortDescription: {
        type: DataTypes.TEXT,
      },

      longDescription: {
        type: DataTypes.TEXT("long"),
      },

      image: {
        type: DataTypes.STRING,
      },

      tags: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const raw = this.getDataValue("tags");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
      },

      comments: {
        type: DataTypes.JSON,
        defaultValue: [],
        get() {
          const raw = this.getDataValue("comments");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
      },

      reviews: {
        type: DataTypes.JSON,
        defaultValue: {
          totalReviews: 0,
          averageRating: 0,
          items: [],
        },
        get() {
          const raw = this.getDataValue("reviews");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
      },

      position: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },

      metaTitle: {
        type: DataTypes.STRING,
      },

      metaKeywords: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "services",
      timestamps: true,
    }
  );

  return Service;
};