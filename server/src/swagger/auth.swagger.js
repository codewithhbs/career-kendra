/**
 * @swagger
 * tags:
 *   name: User Auth
 *   description: User Register, Login, OTP, Profile APIs
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register new user (Send OTP)
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - contactNumber
 *               - emailAddress
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 example: Jitender Kumar
 *               contactNumber:
 *                 type: string
 *                 example: "9999999999"
 *               emailAddress:
 *                 type: string
 *                 example: jitender@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/v1/auth/resend-otp:
 *   post:
 *     summary: Resend OTP for account verification
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               contactNumber:
 *                 type: string
 *                 example: "9999999999"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/auth/verify-otp-for-register:
 *   post:
 *     summary: Verify OTP for account activation
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login using OTP or Password
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactNumber
 *               - loginType
 *             properties:
 *               contactNumber:
 *                 type: string
 *                 example: "9999999999"
 *               loginType:
 *                 type: string
 *                 description: otp or password
 *                 example: otp
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: OTP sent OR Login successful
 */

/**
 * @swagger
 * /api/v1/auth/login-otp-verify:
 *   post:
 *     summary: Verify login OTP and generate token
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Logout user (Redis session delete)
 *     tags: [User Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/v1/auth/update-details:
 *   put:
 *     summary: Update user profile (name, email, phone)
 *     tags: [User Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: New Name
 *               contactNumber:
 *                 type: string
 *                 example: "8888888888"
 *               emailAddress:
 *                 type: string
 *                 example: newmail@gmail.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       409:
 *         description: Email or phone already in use
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
