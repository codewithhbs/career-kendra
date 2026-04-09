'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      jobApplicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'job_applications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      interviewerId: {
        type: Sequelize.INTEGER,
         allowNull: true, // ✅ FIX
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      scheduledDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      scheduledTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      mode: {
        type: Sequelize.ENUM('online', 'offline', 'phone', 'video_call'),
        allowNull: false
      },
      meetingLink: {
        type: Sequelize.STRING,
        allowNull: true
      },
      meetingLocation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      startedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(
          'scheduled',
          'in_progress',
          'completed',
          'cancelled',
          'no_show'
        ),
        defaultValue: 'scheduled',
        allowNull: false
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 10 }
      },
      createdById: {
        type: Sequelize.INTEGER,
          allowNull: true, // ✅ FIX
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      roundNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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
      }
    });

    // Indexes for performance
    await queryInterface.addIndex('interviews', ['jobApplicationId']);
    await queryInterface.addIndex('interviews', ['status']);
    await queryInterface.addIndex('interviews', ['scheduledDate', 'scheduledTime']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('interviews');
  }
};