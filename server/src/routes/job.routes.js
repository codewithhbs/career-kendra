const express = require("express");
const router = express.Router();

const jobController = require("../controllers/Job.controllers");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { ownJob } = require("../middlewares/jobOwnership");
const { checkPermission } = require("../controllers/admin.controller");


router.get("/job-via/:slug", jobController.getJobViaSlug);
router.get("/for-user", jobController.GetAllJobsForUser)



router.use(auth);
router.use(role(["employer", "admin", "Super Admin"]));

router.post("/", jobController.createJob);
router.post("/verify-otp", jobController.verifyJobOtp);
router.post("/resend-otp", jobController.resendJobOtp);

router.get("/", jobController.getAllJobs);
router.get("/admin/:id", jobController.getAllJobs);
router.put("/admin/change-status/:id", checkPermission("MANAGE_JOBS"), jobController.changeStatusByAdmin);
router.patch("/admin-change/:id/:type", checkPermission("MANAGE_JOBS"), jobController.updateJob);

router.get("/:id", jobController.getOneJob);
router.patch("/:id", ownJob, jobController.updateJob);
router.delete("/:id", ownJob, jobController.deleteJob);
router.delete("/admin/:id/:type", checkPermission("MANAGE_JOBS"), jobController.deleteJob);


router.patch("/:id/status", ownJob, jobController.changeJobStatus);



module.exports = router;