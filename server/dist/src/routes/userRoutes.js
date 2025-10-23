import { Router } from "express";
import * as UserController from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
const router = Router();
/**
 * @swagger
 * /api/users:
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
router.get("/", UserController.getUsers);
/**
 * @swagger
 * /api/users/{id}:
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
router.get("/:id", verifyToken, UserController.getUserById);
/**
 * @swagger
 * /api/users:
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
router.post("/", verifyToken, UserController.createUser);
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update an existing user (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
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
router.put("/:id", verifyToken, UserController.updateUser);
/**
 * @swagger
 * /api/users/{id}:
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
router.delete("/:id", verifyToken, UserController.deleteUser);
export default router;
//# sourceMappingURL=userRoutes.js.map