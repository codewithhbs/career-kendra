module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("Messages", "isRead", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn("Messages", "readBy", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("Messages", "readAt", {
      type: Sequelize.DATE,
      allowNull: true
    });

  },

  async down(queryInterface) {

    await queryInterface.removeColumn("Messages", "isRead");
    await queryInterface.removeColumn("Messages", "readBy");
    await queryInterface.removeColumn("Messages", "readAt");

  }
};