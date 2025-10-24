
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5e80a798-c640-5ef1-9895-82bcba2cacc9")}catch(e){}}();
import express from "express";
import { loginUser } from "../controllers/authController.js";
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
export default router;
//# sourceMappingURL=authRoutes.js.map
//# debugId=5e80a798-c640-5ef1-9895-82bcba2cacc9
