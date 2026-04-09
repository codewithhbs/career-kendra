"use strict";

module.exports = (sequelize, DataTypes) => {
  const SavedJobs = sequelize.define(
    "SavedJobs",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      savedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "saved_jobs",
      timestamps: false,

      indexes: [
        {
          unique: true,
          fields: ["userId", "jobId"],
        },
      ],
    }
  );


  SavedJobs.associate = (models) => {
    SavedJobs.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });


    SavedJobs.belongsTo(models.Job, {
      foreignKey: "jobId",
      as: "job",
    });
  };

  return SavedJobs;
};