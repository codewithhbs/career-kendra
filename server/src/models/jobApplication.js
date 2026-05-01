"use strict";

module.exports = (sequelize, DataTypes) => {
  const JobApplication = sequelize.define(
    "JobApplication",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      documentUploaded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,

      },
      status: {
        type: DataTypes.ENUM(
          "applied",
          "under_review",
          "shortlisted",
          "interview_stage",
          "final_shortlist",
          "selected",
          "rejected",
          "withdrawn"
        ),
        allowNull: false,
        defaultValue: "applied",
      },

      appliedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      shortlistedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      shortlistedByAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      sentToEmployerAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      employerDecisionAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      employerDecisionById: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      employerDecisionComment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      resume: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      coverLetter: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      screeningAnswers: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },

      expectedSalary: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      noticePeriod: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      offerEmailSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      offerEmailSentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      internalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      notesForCandidate: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      adminRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      finalSalaryOffered: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      joiningDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      leavingDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      statusUpdatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      statusUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      statusReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      isSelected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "job_applications",
      timestamps: true,
      paranoid: true,
    }
  );

  JobApplication.associate = (models) => {

    JobApplication.belongsTo(models.Job, {
      foreignKey: "jobId",
      as: "job",
    });

    JobApplication.belongsTo(models.User, {
      foreignKey: "userId",
      as: "candidate",
    });

    JobApplication.belongsTo(models.User, {
      foreignKey: "shortlistedByAdminId",
      as: "shortlistedBy",
    });



    JobApplication.belongsTo(models.User, {
      foreignKey: "statusUpdatedBy",
      as: "statusUpdater",
    });

    JobApplication.belongsTo(models.Employer, {
      foreignKey: "employerDecisionById",
      as: "decidedByEmployer",
    });

    JobApplication.hasOne(models.JobApplicationDocument, {
      foreignKey: "applicationId",
      as: "applicationDocuments",
    });
    JobApplication.hasMany(models.JobInterview, {
      foreignKey: "applicationId",
      as: "interviews",
    });

  };

  return JobApplication;
};