const express = require("express");
const router = express.Router();

const jobController = require("../controllers/job.applications");
const auth = require("../middlewares/auth");
const { savedJob, removeSavedJob, getAllSavedJobs, checkAlreadySavedJobs } = require("../controllers/Job.controllers");
const { uploadApplicationDocuments, getUploadedDocuments, verifyApplicationDocument, deleteDocument, reuploadDocument } = require("../controllers/document");
const createUploader = require("../middlewares/upload");



router.post('/apply-job/:jobId', auth, jobController.ApplyToJob)
router.get('/get-my-applications-for-job', auth, jobController.getMyApplications)

router.get("/get-all-applications/:id", jobController.getAllApplications)
router.get("/get-all-applications-for-employer/:id", jobController.getAllApplicationsForEmpoyer)


router.post("/saved-job/:id", auth, savedJob)
router.post("/remove-job/:id", auth, removeSavedJob)
router.get("/get-all-saved-job", auth, getAllSavedJobs)
router.get("/get-check-saved/:id", auth, checkAlreadySavedJobs)


router.delete('/delete/:id', auth, jobController.deleteApplication)
router.get('/get-one/:id', jobController.getApplicationById)
router.put('/:id/status', auth, jobController.changeApplicationStatus)


router.post("/mark-shortlisted/:id", auth, jobController.markShortlisted)
router.post("/create-interview/:applicationId", auth, jobController.createInterview)
router.put("/update-interview/:id", auth, jobController.updateInterview)
router.put("/final-decision/:id", auth, jobController.finalDecision)

router.get("/get-all-interviews", jobController.GetAllInterviews)
router.get("/get-all-employer-interviews", jobController.GetAllWebEmployeInterviews)


router.post("/upload-documents/:applicationId", auth, createUploader("document").any(), uploadApplicationDocuments);
router.get("/documents/:applicationId", auth, getUploadedDocuments);
router.put("/verify-document/:id", auth, verifyApplicationDocument);
router.delete("/delete-document/:id", auth, deleteDocument);
router.put("/reupload-document/:id", auth, createUploader("document").any(), reuploadDocument);

router.post("/upload-cover-letter/:id",auth,createUploader("offer-letter").single("offer-letter"), jobController.uploadCoverLetter);




router.post("/send-offer-email/:id", auth, jobController.sendSelectionMail) // New route for sending offer emails
module.exports = router;