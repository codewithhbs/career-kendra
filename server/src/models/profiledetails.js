"use strict";

module.exports = (sequelize, DataTypes) => {

    // 🔁 Common JSON parser (reuse everywhere)
    const parseJSON = (value, defaultVal = []) => {
        if (!value) return defaultVal;

        if (typeof value === "string") {
            try {
                return JSON.parse(value);
            } catch (e) {
                return defaultVal;
            }
        }

        return Array.isArray(value) ? value : defaultVal;
    };

    const ProfileDetails = sequelize.define(
        "ProfileDetails",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                references: { model: "users", key: "id" },
                onDelete: "CASCADE",
            },

            // ✅ Skills
            skills: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                get() {
                    return parseJSON(this.getDataValue("skills"));
                },
                set(value) {
                    this.setDataValue("skills", value || []);
                },
            },

            // ✅ Experience
            experience: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                get() {
                    return parseJSON(this.getDataValue("experience"));
                },
                set(value) {
                    this.setDataValue("experience", value || []);
                },
            },

            headline: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            noExperince: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            // ✅ Educations
            educations: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                get() {
                    return parseJSON(this.getDataValue("educations"));
                },
                set(value) {
                    this.setDataValue("educations", value || []);
                },
            },

            profileImage: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            percentageOfAccountComplete: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
        },
        {
            tableName: "profile_details",
            timestamps: true,
        }
    );

    // 🔗 Associations
    ProfileDetails.associate = (models) => {
        ProfileDetails.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
            onDelete: "CASCADE",
        });
    };

    return ProfileDetails;
};