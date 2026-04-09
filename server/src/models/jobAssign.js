module.exports = (sequelize, DataTypes) => {
    const jobAssign = sequelize.define('jobAssign', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        jobId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        adminEmployeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        assignedBy: {
            type: DataTypes.INTEGER,
        },

        status: {
            type: DataTypes.ENUM(
                "assigned",
                "in-progress",
                "completed",
                "on-hold",
                "rejected"
            ),
            defaultValue: "assigned",
        },

        priority: {
            type: DataTypes.ENUM("low", "medium", "high"),
            defaultValue: "medium",
        },

        remarks: {
            type: DataTypes.TEXT,
        },

        assignedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },

        dueDate: {
            type: DataTypes.DATE,
        },

        completedAt: {
            type: DataTypes.DATE,
        },

    }, {
        tableName: "job_assignments",
        timestamps: true,
    },
    );

    jobAssign.associate = (models) => {
        jobAssign.belongsTo(models.Job, {
            foreignKey: "jobId",
            as: "job",
        });

        jobAssign.belongsTo(models.admin_employees, {
            foreignKey: "adminEmployeId",
            as: "employee",
        });

        jobAssign.belongsTo(models.admin_employees, {
            foreignKey: "assignedBy",
            as: "assignedByUser",
        });
    };

    return jobAssign;
};