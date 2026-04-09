"use strict";

module.exports = (sequelize, DataTypes) => {
    const JobInterview = sequelize.define(
        "JobInterview",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            applicationId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            round: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            interviewType: {
                type: DataTypes.ENUM("online", "offline"),
                allowNull: false,
            },

            scheduledAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            rescheduleReason:{ type: DataTypes.TEXT(2000), allowNull: true , defaultValue: null},
            meetingLink: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            location: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            meetingPerson: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            status: {
                type: DataTypes.ENUM(
                    "scheduled",
                    "completed",
                    "in_progress",
                    "cancelled",
                    "rescheduled",
                    "no_show"
                ),
                defaultValue: "scheduled",
            },

            feedback: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            result: {
                type: DataTypes.ENUM(
                    "pass",
                    "fail",
                    "next_round"
                ),
                allowNull: true,
            },

            completedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: "job_interviews",
            timestamps: true,
        }
    );

    JobInterview.associate = (models) => {
        JobInterview.belongsTo(models.JobApplication, {
            foreignKey: "applicationId",
            as: "application",
        });
    };

    return JobInterview;
};