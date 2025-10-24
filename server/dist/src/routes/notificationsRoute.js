
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a30c5f87-5d47-50d8-becc-b7762aaf2b4a")}catch(e){}}();
import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { sendNotification, sendNotificationMulticast, topics, } from "../controllers/notificationController.js";
import { requireFirebaseEnv } from "../middleware/requireFirebaseEnv.js";
const router = Router();
/**
 * @swagger
 * /api/notifications/send-multicast:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Send notification to a topic (multicast)
 *     description: Send a notification to all users subscribed to a topic. Stores the notification in the database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               topic:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               link:
 *                 type: string
 *               referenceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messageId:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 sentToTopic:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/send-multicast", verifyToken, requireFirebaseEnv, sendNotificationMulticast);
/**
 * @swagger
 * /api/notifications/send-notification:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Send notification to a device
 *     description: Send a notification to a specific device token. Stores the notification in the database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               link:
 *                 type: string
 *               topic:
 *                 type: string
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/send-notification", verifyToken, requireFirebaseEnv, sendNotification);
/**
 * @swagger
 * /api/notifications/topics:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Subscribe or unsubscribe device to topics
 *     description: Subscribe or unsubscribe a device token to one or more topics. Optionally records topic subscriptions in the database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [subscribe, unsubscribe]
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *               token:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Topics processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       topic:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       failureCount:
 *                         type: integer
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/topics", verifyToken, requireFirebaseEnv, topics);
export default router;
//# sourceMappingURL=notificationsRoute.js.map
//# debugId=a30c5f87-5d47-50d8-becc-b7762aaf2b4a
