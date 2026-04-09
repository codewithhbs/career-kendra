module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      name: DataTypes.STRING,
    },
    {
     tableName: "permissions",
      timestamps: false,
    }
  );

  Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
      through: "role_permissions",
      foreignKey: "permissionId",
    });
  };

  return Permission;
};