"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Messages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "job_applications",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      senderType: {
        type: Sequelize.ENUM("user", "admin", "employer", "system"),
        allowNull: false,
      },

      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      receiverType: {
        type: Sequelize.ENUM("user", "admin", "employer"),
        allowNull: true,
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      sentAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Messages");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Messages_senderType";'
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Messages_receiverType";'
    );
  },
};