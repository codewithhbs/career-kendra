"use strict";

module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define(
    "Company",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      employerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      GST: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      PAN: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      companyTagline: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      companyAbout: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      companyCategory: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      companySize: {
        type: DataTypes.ENUM(
          "1-10",
          "11-50",
          "51-200",
          "201-500",
          "501-1000",
          "1000+"
        ),
        allowNull: true,
      },

      foundedYear: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // ✅ Contact Info
      companyEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      companyPhone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      companyWebsite: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      linkedinUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      facebookUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      instagramUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      twitterUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      youtubeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      githubUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      googleMapsUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // ✅ Location
      country: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "India",
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

      fullAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      //isDeleted
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // ✅ Photos
      companyLogo: {
        type: DataTypes.STRING,
        allowNull: true, // single image url
      },

      companyPhotos: {
        type: DataTypes.JSON,
        allowNull: true, // array of urls
        defaultValue: [],
      },

      // ✅ Employer role in company
      employerRole: {
        type: DataTypes.ENUM("owner", "hr", "recruiter", "admin"),
        allowNull: false,
        defaultValue: "owner",
      },

      // ✅ Verification / Status
      companyStatus: {
        type: DataTypes.ENUM("pending", "submitted", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "companies",
      timestamps: true,
    }
  );

  Company.associate = (models) => {
    Company.belongsTo(models.Employer, {
      foreignKey: "employerId",
      as: "employer",
    });

    Company.hasMany(models.Job, {
      foreignKey: "companyId",
      as: "jobs",
    });
  };

  return Company;
};
