/**
 * @swagger
 * tags:
 *   name: Employer Auth
 *   description: Employer Authentication APIs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     RegisterEmployer:
 *       type: object
 *       required:
 *         - employerName
 *         - employerContactNumber
 *         - employerEmail
 *         - password
 *       properties:
 *         employerName:
 *           type: string
 *         employerContactNumber:
 *           type: string
 *           example: "9876543210"
 *         employerEmail:
 *           type: string
 *           example: "hr@company.com"
 *         password:
 *           type: string
 *           example: "password123"
 *
 *     LoginEmployer:
 *       type: object
 *       required:
 *         - employerContactNumber
 *         - loginType
 *       properties:
 *         employerContactNumber:
 *           type: string
 *         loginType:
 *           type: string
 *           enum: [otp, password]
 *         password:
 *           type: string
 *
 *     VerifyOtp:
 *       type: object
 *       required:
 *         - userId
 *         - otp
 *       properties:
 *         userId:
 *           type: integer
 *         otp:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/auth-employer/register:
 *   post:
 *     summary: Register new employer
 *     tags: [Employer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterEmployer'
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/auth-employer/resend-otp:
 *   post:
 *     summary: Resend OTP
 *     tags: [Employer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               employerContactNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 */

/**
 * @swagger
 * /api/v1/auth-employer/verify-otp-for-register:
 *   post:
 *     summary: Verify OTP for registration
 *     tags: [Employer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtp'
 *     responses:
 *       200:
 *         description: Account verified successfully
 */

/**
 * @swagger
 * /api/v1/auth-employer/login:
 *   post:
 *     summary: Employer login (OTP or Password)
 *     tags: [Employer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginEmployer'
 *     responses:
 *       200:
 *         description: Login successful or OTP sent
 */

/**
 * @swagger
 * /api/v1/auth-employer/login-otp-verify:
 *   post:
 *     summary: Verify login OTP
 *     tags: [Employer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtp'
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /api/v1/auth-employer/logout:
 *   get:
 *     summary: Logout employer
 *     tags: [Employer Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/v1/auth-employer/get-profile-details:
 *   get:
 *     summary: Get employer profile details
 *     tags: [Employer Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */

/**
 * @swagger
 * /api/v1/auth-employer/update-details:
 *   put:
 *     summary: Update employer profile
 *     tags: [Employer Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employerName:
 *                 type: string
 *               employerEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */