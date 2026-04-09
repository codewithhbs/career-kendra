"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("job_applications");

    const addColumnIfNotExists = async (columnName, definition) => {
      if (!table[columnName]) {
        await queryInterface.addColumn("job_applications", columnName, definition);
      }
    };

    await addColumnIfNotExists("interviewScheduledAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await addColumnIfNotExists("interviewDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await addColumnIfNotExists("interviewTime", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await addColumnIfNotExists("interviewCompletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await addColumnIfNotExists("rejectedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await addColumnIfNotExists("rejectionReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await addColumnIfNotExists("hiredAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await addColumnIfNotExists("notesForCandidate", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await addColumnIfNotExists("notesForEmployer", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await addColumnIfNotExists("approvedForNextRound", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await addColumnIfNotExists("finalOfferAccepted", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await addColumnIfNotExists("applicationSource", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // ✅ Safely update ENUM (no duplicate issue)
    await queryInterface.changeColumn("job_applications", "status", {
      type: Sequelize.ENUM(
        "applied",
        "shortlisted",
        "interview_scheduled",
        "interview_completed",
        "rejected",
        "hired",
        "withdrawn"
      ),
      defaultValue: "applied",
    });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("job_applications");

    const removeColumnIfExists = async (columnName) => {
      if (table[columnName]) {
        await queryInterface.removeColumn("job_applications", columnName);
      }
    };

    await removeColumnIfExists("applicationSource");
    await removeColumnIfExists("finalOfferAccepted");
    await removeColumnIfExists("approvedForNextRound");
    await removeColumnIfExists("notesForEmployer");
    await removeColumnIfExists("notesForCandidate");
    await removeColumnIfExists("hiredAt");
    await removeColumnIfExists("rejectionReason");
    await removeColumnIfExists("rejectedAt");
    await removeColumnIfExists("interviewCompletedAt");
    await removeColumnIfExists("interviewTime");
    await removeColumnIfExists("interviewDate");
    await removeColumnIfExists("interviewScheduledAt");

    // revert ENUM
    await queryInterface.changeColumn("job_applications", "status", {
      type: Sequelize.ENUM(
        "applied",
        "shortlisted",
        "interview",
        "rejected",
        "hired"
      ),
      defaultValue: "applied",
    });
  },
};