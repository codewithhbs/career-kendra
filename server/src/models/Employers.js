"use strict";

const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
    const Employer = sequelize.define(
        "Employer",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            employerName: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            employerContactNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            employerEmail: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            otp: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            otpExpireTime: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            accountStatus: {
                type: DataTypes.ENUM(
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
                type: DataTypes.STRING,
                allowNull: false,
            },

            specialAccess: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
        },
        {
            tableName: "employers",
            timestamps: true,
        }
    );

    // ✅ Associations
    Employer.associate = (models) => {
        Employer.hasOne(models.Company, {
            foreignKey: "employerId",
            as: "company",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });

        Employer.hasMany(models.Job, {
            foreignKey: "employerId",
            as: "jobs",
        });
    };

    // ✅ Hash password before create
    Employer.beforeCreate(async (employer) => {
        if (employer.password) {
            employer.password = await bcrypt.hash(employer.password, 10);
        }
    });

    // ✅ Hash password before update (only if changed)
    Employer.beforeUpdate(async (employer) => {
        if (employer.changed("password")) {
            employer.password = await bcrypt.hash(employer.password, 10);
        }
    });



    return Employer;
};
