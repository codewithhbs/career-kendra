const router = require("express").Router();


const { messageForMe, markMessageRead, getUnreadMessageCount, myInterViews } = require("../controllers/job.applications");
const { registerUser, resendOtp, login, logout, verifyLoginOtp, verifyOtpController, updateProfile, getuserProfile, updateProfileDetails, updateProfileImage, updateUserCv } = require("../controllers/userControllers");
const auth = require("../middlewares/auth");
const createUploader = require("../middlewares/upload");

router.post('/register', registerUser)
router.post('/resend-otp', resendOtp)
router.post('/verify-otp-for-register', verifyOtpController)
router.post('/login', login)
router.post('/login-otp-verify', verifyLoginOtp)
router.get('/logout', auth, logout)
router.put('/update-details', auth, updateProfile)

router.get('/message-for-me', auth, messageForMe)
router.put('/mark-message-read/:id', auth, markMessageRead)
router.get('/get-unread-message-count', auth, getUnreadMessageCount)
router.get('/my-interviews', auth, myInterViews)

router.get('/get-profile-details', auth, getuserProfile)
router.put('/update-profile-details', auth, updateProfileDetails)
router.put("/update-cv", auth, createUploader("UserCv").single("cv"), updateUserCv)
router.put("/update-profile-image", auth, createUploader("profileimage").single("profileImage"), updateProfileImage)
module.exports = router;
