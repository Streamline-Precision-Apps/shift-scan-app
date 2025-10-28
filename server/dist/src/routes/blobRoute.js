
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b50fab36-3c46-5223-92f3-2780bf47d8e1")}catch(e){}}();
import { Router } from "express";
import multer from "multer";
import { requireFirebaseEnv } from "../middleware/requireFirebaseEnv.js";
import { blobDelete, blobUpload } from "../controllers/blobsController.js";
const router = Router();
// Configure Multer for file uploads (store in memory)
const upload = multer({ storage: multer.memoryStorage() });
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
router.post("/upload", requireFirebaseEnv, upload.single("file"), blobUpload);
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
//# debugId=b50fab36-3c46-5223-92f3-2780bf47d8e1
