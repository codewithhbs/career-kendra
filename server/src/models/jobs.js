"use strict";

module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define(
    "Job",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      // ✅ Relations
      employerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ✅ Basic Job Info
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      industry: {
        type: DataTypes.TEXT(2000),
        allowNull: true, // IT, Finance, Healthcare, etc.
      },
      jobCategory: {
        type: DataTypes.STRING,
        allowNull: true, // IT, Sales, HR, Marketing
      },

      jobDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      jobResponsibilities: {
        type: DataTypes.JSON,

        allowNull: true,
        get() {
          const raw = this.getDataValue("jobResponsibilities");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
      },

      requiredSkills: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        get() {
          const raw = this.getDataValue("requiredSkills");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
      },

      // ✅ Job Type & Mode
      jobType: {
        type: DataTypes.ENUM(
          "full-time",
          "part-time",
          "internship",
          "contract",
          "freelance"
        ),
        allowNull: false,
        defaultValue: "full-time",
      },

      workMode: {
        type: DataTypes.ENUM("onsite", "remote", "hybrid"),
        allowNull: false,
        defaultValue: "onsite",
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

      locationText: {
        type: DataTypes.STRING,
        allowNull: true, // Example: "Gurugram, Haryana"
      },

      // ✅ Salary
      salaryType: {
        type: DataTypes.ENUM("monthly", "yearly"),
        allowNull: false,
        defaultValue: "monthly",
      },

      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "INR",
      },

      salaryMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      salaryMax: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      hideSalary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // ✅ Experience
      experienceMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      experienceMax: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      // ✅ Hiring
      openings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      // ✅ Shift / Timings
      shiftType: {
        type: DataTypes.ENUM("day", "night", "rotational", "flexible"),
        allowNull: true,
      },

      noticePeriod: {
        type: DataTypes.STRING,
        allowNull: true, // Example: "Immediate", "15 days", "30 days"
      },

      // ✅ Benefits
      benefits: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        get() {
          const raw = this.getDataValue("benefits");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
      },

      // ✅ Education
      education: {
        type: DataTypes.STRING,
        allowNull: true, // Example: "Any Graduate"
      },

      // ✅ Application Type
      applyType: {
        type: DataTypes.ENUM("easy-apply", "external-link", "email"),
        allowNull: false,
        defaultValue: "easy-apply",
      },

      applyLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      applyEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // ✅ Job Status
      status: {
        type: DataTypes.ENUM("draft", "under-verification", "active", "closed", "paused", "reject"),
        allowNull: false,
        defaultValue: "draft",
      },



      // ✅ Featured / Premium
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otpExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resonToReject: {
        type: DataTypes.TEXT(5800),
        allowNull: true,
      },
      otpVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },


      workingDays: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        get() {
          const raw = this.getDataValue("workingDays");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
      },

      jobTiming: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      gender: {
        type: DataTypes.ENUM("male", "female", "other", "any"),
        allowNull: false,
        defaultValue: "any",
      },

      isIncentive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      screeningQuestions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        get() {
          const raw = this.getDataValue("screeningQuestions");
          try {
            return raw ? JSON.parse(raw) : [];
          } catch {
            return [];
          }
        }
      },
    },
    {
      tableName: "jobs",
      timestamps: true,
    }
  );

  // ✅ Associations
  Job.associate = (models) => {
    Job.belongsTo(models.Employer, {
      foreignKey: "employerId",
      as: "employer",
    });

    Job.hasOne(models.jobAssign, {
      foreignKey: "jobId",
      as: "assignment"
    });
    Job.belongsTo(models.Company, {
      foreignKey: "companyId",
      as: "company",
    });
    // ✅ Job → SavedJobs
    Job.hasMany(models.SavedJobs, {
      foreignKey: "jobId",
      as: "savedByUsers",
    });



    // ✅ Many-to-Many (Saved Jobs)
    Job.belongsToMany(models.User, {
      through: models.SavedJobs,
      foreignKey: "jobId",
      otherKey: "userId",
      as: "usersWhoSaved",
    });

    Job.hasMany(models.JobApplication, {
      foreignKey: "jobId",
      as: "applications",
    });

    Job.belongsToMany(models.User, {
      through: models.JobApplication,
      foreignKey: "jobId",
      as: "applicants",
    });




  };

  return Job;
};
