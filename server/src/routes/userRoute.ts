import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

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

router.post("/user/settings", getUserSettingsByQuery);

router.put("/user/settings", verifyToken, updateSettings);

router.post("/user/contact", getUserContact);

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

export default router;
