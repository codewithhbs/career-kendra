const { Job, jobAssign, admin_employees ,AuditLog} = require("../models");
const { sendError, sendSuccess } = require("../utils/api");
const { Op } = require("sequelize");


exports.assignJobToEmploye = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { adminEmployeId, priority, remarks, dueDate } = req.body;

    if (!jobId) {
      return sendError(res, 400, "Please select job first");
    }

    if (!adminEmployeId) {
      return sendError(res, 400, "Please select employee");
    }

    const findJob = await Job.findByPk(jobId);
    if (!findJob) {
      return sendError(res, 404, "Job not found");
    }

    if (findJob.status !== "active") {
      return sendError(
        res,
        403,
        `Job is not active. Current status: ${findJob.status}`
      );
    }

    const employee = await admin_employees.findByPk(adminEmployeId);
    if (!employee) {
      return sendError(res, 404, "Employee not found");
    }

    // 🔍 Check if job already assigned
    const existingAssignment = await jobAssign.findOne({
      where: {
        jobId,
        status: {
          [Op.notIn]: ["completed", "rejected"],
        },
      },
    });

    // ✅ If assignment exists
    if (existingAssignment) {

      // Same employee
      if (existingAssignment.adminEmployeId === adminEmployeId) {
        return sendError(
          res,
          409,
          "This employee is already assigned to this job"
        );
      }

      // 🔁 Update assignment to new employee
      await existingAssignment.update({
        adminEmployeId,
        priority: priority || existingAssignment.priority,
        remarks: remarks || existingAssignment.remarks,
        dueDate: dueDate || existingAssignment.dueDate,
        assignedBy: req.user?.id || null,
        assignedAt: new Date(),
        status: "assigned",
      });

      return sendSuccess(res, 200, "Assignment updated successfully", {
        assignment: existingAssignment,
      });
    }

    // 🆕 Create new assignment
    const newAssignment = await jobAssign.create({
      jobId,
      adminEmployeId,
      assignedBy: req.user?.id || null,
      priority: priority || "medium",
      remarks: remarks || null,
      dueDate: dueDate || null,
      status: "assigned",
      assignedAt: new Date(),
    });

    return sendSuccess(res, 201, "Job assigned successfully", {
      assignment: newAssignment,
    });

  } catch (error) {
    console.error("Assign Job Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

exports.updateAssignmentStatus = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { status, remarks } = req.body;

    const assignment = await jobAssign.findByPk(assignmentId);
    if (!assignment) {
      return sendError(res, 404, "Assignment not found");
    }

    await assignment.update({
      status,
      remarks: remarks || assignment.remarks,
      completedAt: status === "completed" ? new Date() : null,
    });

    // ✅ Audit Log
    await AuditLog.create({
      action: `STATUS_UPDATED_TO_${status}`,
      performedBy: req.user?.id || null,
      targetId: assignment.id,
      targetType: "job_assignments",
    });

    return sendSuccess(res, 200, "Status updated successfully", {
      assignment,
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

exports.getMyAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, priority } = req.query;

    const where = {
      adminEmployeId: userId, 
    };

  
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const assignments = await jobAssign.findAll({
      where,
      include: [
        { model: Job, as: "job" },
        { model: admin_employees, as: "employee" },
      ],
      order: [["createdAt", "DESC"]],
    });

    return sendSuccess(res, 200, "My assignments fetched", assignments);

  } catch (error) {
    console.error("Fetch Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const id = req.params.id;

    const assignment = await jobAssign.findByPk(id, {
      include: [
        { model: Job, as: "job" },
        { model: admin_employees, as: "employee" },
      ],
    });

    if (!assignment) {
      return sendError(res, 404, "Assignment not found");
    }

    return sendSuccess(res, 200, "Assignment fetched", assignment);

  } catch (error) {
    return sendError(res, 500, "Internal server error");
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const id = req.params.id;

    const assignment = await jobAssign.findByPk(id);
    if (!assignment) {
      return sendError(res, 404, "Assignment not found");
    }

    await assignment.destroy();

    // ✅ Audit Log
    await AuditLog.create({
      action: "JOB_UNASSIGNED",
      performedBy: req.user?.id || null,
      targetId: id,
      targetType: "job_assignments",
    });

    return sendSuccess(res, 200, "Assignment deleted successfully");

  } catch (error) {
    return sendError(res, 500, "Internal server error");
  }
};

exports.assignmentStats = async (req, res) => {
  try {
    const total = await jobAssign.count();
    const completed = await jobAssign.count({ where: { status: "completed" } });
    const pending = await jobAssign.count({
      where: { status: { [Op.in]: ["assigned", "in-progress"] } },
    });

    return sendSuccess(res, 200, "Stats fetched", {
      total,
      completed,
      pending,
    });

  } catch (error) {
    return sendError(res, 500, "Internal server error");
  }
};