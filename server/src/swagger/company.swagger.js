/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company Management APIs (Employer Only)
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
 *     CompanyStep1:
 *       type: object
 *       required:
 *         - companyName
 *       properties:
 *         companyName:
 *           type: string
 *           example: "Tech Solutions Pvt Ltd"
 *         GST:
 *           type: string
 *           example: "29ABCDE1234F1Z5"
 *         PAN:
 *           type: string
 *           example: "ABCDE1234F"
 *         companyTagline:
 *           type: string
 *           example: "Innovating the Future"
 *         companyCategory:
 *           type: string
 *           example: "IT Services"
 *         companySize:
 *           type: string
 *           enum: ["1-10","11-50","51-200","201-500","501-1000","1000+"]
 *         foundedYear:
 *           type: string
 *           example: "2018"
 *         country:
 *           type: string
 *           example: "India"
 *         state:
 *           type: string
 *           example: "Haryana"
 *         city:
 *           type: string
 *           example: "Gurugram"
 *
 *     CompanyStep2:
 *       type: object
 *       properties:
 *         companyEmail:
 *           type: string
 *           example: "hr@techsolutions.com"
 *         companyPhone:
 *           type: string
 *           example: "9876543210"
 *         companyWebsite:
 *           type: string
 *           example: "https://techsolutions.com"
 *         linkedinUrl:
 *           type: string
 *           example: "https://linkedin.com/company/techsolutions"
 *         facebookUrl:
 *           type: string
 *         instagramUrl:
 *           type: string
 *         twitterUrl:
 *           type: string
 *         youtubeUrl:
 *           type: string
 *         githubUrl:
 *           type: string
 *         whatsappNumber:
 *           type: string
 *         googleMapsUrl:
 *           type: string
 *         pincode:
 *           type: string
 *         fullAddress:
 *           type: string
 *         companyLogo:
 *           type: string
 *           example: "https://cdn.com/logo.png"
 *         companyPhotos:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/v1/company/create-step1:
 *   post:
 *     summary: Create Company - Step 1 (Basic Details + GST + PAN)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyStep1'
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/company/update-step2:
 *   put:
 *     summary: Update Company - Step 2 (Contact, Social, Media)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyStep2'
 *     responses:
 *       200:
 *         description: Company updated successfully
 */

/**
 * @swagger
 * /api/v1/company/profile:
 *   get:
 *     summary: Get Company Profile
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company profile fetched successfully
 */

/**
 * @swagger
 * /api/v1/company/update:
 *   put:
 *     summary: Update Full Company Details
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Company updated successfully
 */

/**
 * @swagger
 * /api/v1/company/submit:
 *   post:
 *     summary: Submit Company For Verification
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company submitted for approval
 */

/**
 * @swagger
 * /api/v1/company/delete:
 *   delete:
 *     summary: Delete Company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company deleted successfully
 */