"use strict";
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            userName: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            contactNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            emailAddress: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            otp: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            otpExpireTime: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            accountActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

            uploadedCv: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            role: {
                type: DataTypes.STRING,
                defaultValue: "user",
            },

            profileDetailsId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            specialAccess: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },

            // ✅ Newly Added Fields
            totalExperience: {
                type: DataTypes.INTEGER,           // total years of totalExperience
                allowNull: true,
                defaultValue: null,
            },

            lastSalary: {
                type: DataTypes.INTEGER,           // last salary
                allowNull: true,
                defaultValue: null,
            },

            area: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            location: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "users",
        }
    );

    // ✅ Password Hash Hooks
    User.beforeCreate(async (user) => {
        if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    User.beforeUpdate(async (user) => {
        if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    User.associate = (models) => {

        // User → ProfileDetails
        User.hasOne(models.ProfileDetails, {
            foreignKey: "userId",
            as: "profileDetails",
        });
        // ✅ User → Saved Jobs
        User.hasMany(models.SavedJobs, {
            foreignKey: "userId",
            as: "savedJobs",
        });

        // ✅ Many-to-Many (Saved Jobs)
        User.belongsToMany(models.Job, {
            through: models.SavedJobs,
            foreignKey: "userId",
            otherKey: "jobId",
            as: "bookmarkedJobs",
        });
        // User → JobApplications
        User.hasMany(models.JobApplication, {
            foreignKey: "userId",
            as: "applications",
        });

        // User ↔ Jobs (Many to Many)
        User.belongsToMany(models.Job, {
            through: models.JobApplication,
            foreignKey: "userId",
            as: "appliedJobs",
        });
    };

    return User;
};