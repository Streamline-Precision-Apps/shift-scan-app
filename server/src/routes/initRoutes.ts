import { Router } from "express";
import { initHandler } from "../controllers/initController.js";
import { payPeriodSheetsHandler } from "../controllers/payPeriodController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createFormApproval,
  createFormSubmission,
  deleteFormSubmission,
  saveDraft,
  saveDraftToPending,
  savePending,
  updateFormApproval,
} from "../controllers/formsController.js";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateSettings,
  updateUser,
  getUserSettingsByQuery,
  getUserContact,
} from "../controllers/userController.js";
const router = Router();
// Define your init routes here

/**
 * @swagger
 * /api/v1/init:
 *   post:
 *     summary: Initialize user session and get user info
 *     description: Returns user information and settings for a given userId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token for authentication
 *               userId:
 *                 type: string
 *                 description: User ID to fetch info for
 *             required:
 *               - token
 *               - userId
 *     responses:
 *       '200':
 *         description: User info and settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: User data (excluding password)
 *       '400':
 *         description: Missing userId
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */

router.post("/init", initHandler);

/**
 * @swagger
 * /api/v1/pay-period-timesheets:
 *   post:
 *     summary: Get pay period timesheets for a user
 *     description: Returns timesheets for the current pay period for the given userId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to fetch timesheets for
 *             required:
 *               - userId
 *     responses:
 *       '200':
 *         description: Pay period timesheets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *       '401':
 *         description: Unauthorized or missing userId
 *       '500':
 *         description: Server error
 */
router.post("/pay-period-timesheets", payPeriodSheetsHandler);

// Form submission
router.post("/forms/submission", verifyToken, createFormSubmission);
router.delete("/forms/submission/:id", verifyToken, deleteFormSubmission);
// Drafts
router.post("/forms/draft", verifyToken, saveDraft);
router.post("/forms/draft-to-pending", verifyToken, saveDraftToPending);
router.post("/forms/pending", verifyToken, savePending);
// Approvals
router.post("/forms/approval", verifyToken, createFormApproval);
router.put("/forms/approval/update", verifyToken, updateFormApproval);

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve a list of all users (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized - invalid or missing bearer token
 */
router.get("/user", verifyToken, getUsers);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized - invalid or missing bearer token
 *       404:
 *         description: User not found
 */
router.get("/user/:id", verifyToken, getUserById);

/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     description: Create a new user (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - password
 *               - companyId
 *               - truckView
 *               - tascoView
 *               - laborView
 *               - mechanicView
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               companyId:
 *                 type: string
 *               email:
 *                 type: string
 *                 nullable: true
 *               signature:
 *                 type: string
 *                 nullable: true
 *               DOB:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               truckView:
 *                 type: boolean
 *               tascoView:
 *                 type: boolean
 *               laborView:
 *                 type: boolean
 *               mechanicView:
 *                 type: boolean
 *               permission:
 *                 type: string
 *                 enum: [USER, ADMIN, SUPERADMIN]
 *               image:
 *                 type: string
 *                 nullable: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               terminationDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               workTypeId:
 *                 type: string
 *                 nullable: true
 *               middleName:
 *                 type: string
 *                 nullable: true
 *               secondLastName:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Unauthorized - invalid or missing bearer token
 *       400:
 *         description: Bad request
 */
router.post("/user", verifyToken, createUser);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update an existing user (requires authentication). You must send fields to update in the request body.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               companyId:
 *                 type: string
 *               email:
 *                 type: string
 *                 nullable: true
 *               signature:
 *                 type: string
 *                 nullable: true
 *               DOB:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               truckView:
 *                 type: boolean
 *               tascoView:
 *                 type: boolean
 *               laborView:
 *                 type: boolean
 *               mechanicView:
 *                 type: boolean
 *               permission:
 *                 type: string
 *                 enum: [USER, ADMIN, SUPERADMIN]
 *               image:
 *                 type: string
 *                 nullable: true
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               terminationDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               workTypeId:
 *                 type: string
 *                 nullable: true
 *               middleName:
 *                 type: string
 *                 nullable: true
 *               secondLastName:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized - invalid or missing bearer token
 *       404:
 *         description: User not found
 */
router.put("/user/:id", verifyToken, updateUser);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Delete a user (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - invalid or missing bearer token
 *       404:
 *         description: User not found
 */
router.delete("/user/:id", verifyToken, deleteUser);

/**
 * @swagger
 * /api/v1/user/settings:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user settings
 *     description: Update the settings of an existing user (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *               emergencyContactNumber:
 *                 type: string
 *               language:
 *                 type: string
 *               generalReminders:
 *                 type: boolean
 *               personalReminders:
 *                 type: boolean
 *               cameraAccess:
 *                 type: boolean
 *               locationAccess:
 *                 type: boolean
 *               cookiesAccess:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User settings updated successfully
 *       401:
 *         description: Unauthorized - invalid or missing bearer token
 *       400:
 *         description: Bad request
 */

// GET user settings (by userId query param or header)
router.post("/user/settings", getUserSettingsByQuery);

// GET user contact info (by userId query param or header)
router.post("/user/contact", getUserContact);

export default router;
