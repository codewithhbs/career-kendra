"use strict";
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { checkPermission } = require("../controllers/admin.controller");
const { assignJobToEmploye, updateAssignmentStatus, getMyAssignments, getAssignmentById, deleteAssignment, assignmentStats } = require("../controllers/Job.assign.controller");
const { deleteApplication, changeApplicationStatus, getApplicationById } = require("../controllers/job.applications");


router.post('/:id', auth, checkPermission("MANAGE_JOB_ASSIGN"), assignJobToEmploye)
router.put('/:id', auth, checkPermission("MANAGE_JOB_ASSIGN"), updateAssignmentStatus)
router.get('/', auth, getMyAssignments)
router.get('/:id', auth, getAssignmentById)
router.delete('/:id', auth, deleteAssignment)
router.get('/stats', auth, assignmentStats)






module.exports = router;