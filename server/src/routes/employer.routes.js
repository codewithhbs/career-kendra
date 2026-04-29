const router = require("express").Router();


const {  resendOtp, login, logout, verifyLoginOtp, verifyOtpController, registerEmployer, getEmployerProfile, getAllEmployers, updateBasicDetailsOfEmployer, toggleEmployerRole, } = require("../controllers/employerControllers");
const { getEmployerDashboard } = require("../controllers/job.applications");
const auth = require("../middlewares/auth");

router.post('/register', registerEmployer)
router.post('/resend-otp', resendOtp)
router.post('/verify-otp-for-register', verifyOtpController)
router.post('/login', login)
router.post('/login-otp-verify', verifyLoginOtp)
router.get('/logout', auth, logout)
router.get('/get-profile-details',auth,getEmployerProfile)
router.get('/dashboard', auth, getEmployerDashboard)
router.get('/get-all-employers', getAllEmployers)
router.post('/update-basic', updateBasicDetailsOfEmployer)
router.put('/toggle-role', toggleEmployerRole)

module.exports = router;
