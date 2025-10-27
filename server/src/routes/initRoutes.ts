import { Router } from "express";
import { initHandler } from "../controllers/initController.js";
import { payPeriodSheetsHandler } from "../controllers/payPeriodController.js";

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

export default router;
