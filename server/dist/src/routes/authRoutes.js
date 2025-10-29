import express from "express";
import { loginUser, signOutUser } from "../controllers/authController.js";
import { sign } from "crypto";
const router = express.Router();
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in to get a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);
router.post("/signout", signOutUser);
export default router;
//# sourceMappingURL=authRoutes.js.map