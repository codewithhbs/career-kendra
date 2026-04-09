'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_applications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'jobs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM(
          'applied',
          'under_review',
          'shortlisted',
          'interview_stage',
          'final_shortlist',
          'selected',
          'rejected',
          'withdrawn'
        ),
        defaultValue: 'applied',
        allowNull: false
      },
      appliedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      shortlistedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      shortlistedByAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sentToEmployerAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      employerDecisionAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      employerDecisionById: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      employerDecisionComment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resume: {
        type: Sequelize.STRING,
        allowNull: true
      },
      coverLetter: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expectedSalary: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      noticePeriod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      internalNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notesForCandidate: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isSelected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Optional: add indexes for faster queries
    await queryInterface.addIndex('job_applications', ['jobId', 'userId'], {
      unique: true,
      name: 'job_applications_jobId_userId_unique'
    });

    await queryInterface.addIndex('job_applications', ['status']);
    await queryInterface.addIndex('job_applications', ['isSelected']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_applications');
  }
};