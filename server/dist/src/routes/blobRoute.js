
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3bff482c-f7b7-5e00-a26e-7a8e09973f77")}catch(e){}}();
import { Router } from "express";
import { requireFirebaseEnv } from "../middleware/requireFirebaseEnv.js";
import { blobDelete, blobUpload } from "../controllers/blobsController.js";
const router = Router();
/**
 * @swagger
 * /api/storage/upload:
 *   post:
 *     tags:
 *       - Storage
 *     summary: Upload a file (image/pdf) to storage
 *     description: Uploads a file to Firebase Storage. Requires multipart/form-data with a file and userId.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               folder:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *           description: "'folder' is optional. Default is 'profileImages'."
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Upload failed
 */
router.post("/upload", requireFirebaseEnv, blobUpload);
/**
 * @swagger
 * /api/storage/delete:
 *   delete:
 *     tags:
 *       - Storage
 *     summary: Delete a file from storage
 *     description: Deletes a file from Firebase Storage by userId and optional folder.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               folder:
 *                 type: string
 *           description: "'folder' is optional. Default is 'profileImages'."
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Bad request
 *       404:
 *         description: File not found
 *       500:
 *         description: Delete failed
 */
router.delete("/delete", requireFirebaseEnv, blobDelete);
export default router;
//# sourceMappingURL=blobRoute.js.map
//# debugId=3bff482c-f7b7-5e00-a26e-7a8e09973f77
