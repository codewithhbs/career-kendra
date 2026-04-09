module.exports = (sequelize, DataTypes) => {
    const JobApplicationDocument = sequelize.define(
        "JobApplicationDocument",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            applicationId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            documents: {
                type: DataTypes.JSON,
                allowNull: false,
                get() {
                    const raw = this.getDataValue("documents");
                    try {
                        return raw ? JSON.parse(raw) : [];
                    } catch {
                        return [];
                    }
                }
            },

            uploadedBy: {
                type: DataTypes.INTEGER,
            },
        },
        {
            tableName: "jobapplicationdocuments", // optional but best
            freezeTableName: true,
        }
    );

    JobApplicationDocument.associate = (models) => {
        JobApplicationDocument.belongsTo(models.JobApplication, {
            foreignKey: "applicationId",
            as: "application",
        });
        JobApplicationDocument.belongsTo(models.User, {
            foreignKey: "uploadedBy",
            as: "uploader",
        });
    };

    return JobApplicationDocument;
};