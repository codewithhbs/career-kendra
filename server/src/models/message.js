module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "job_applications",
        key: "id",
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    anyLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    readBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    senderType: {
      type: DataTypes.ENUM("user", "admin", "employer", "system"),
      allowNull: false,
    },

    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    receiverType: {
      type: DataTypes.ENUM("user", "admin", "employer"),
      allowNull: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  Message.associate = (models) => {
    console.log(models)
    Message.belongsTo(models.JobApplication, {
      foreignKey: "applicationId",
      as: "application",
    });

    Message.belongsTo(models.User, {
      foreignKey: "senderId",
      as: "sender",
    });
  };

  return Message;
};