import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { saveFCMToken, requestPasswordReset, resetPassword, verifyResetToken, deleteResetToken, } from "../controllers/tokenController.js";
const router = Router();
// FCM token management (requires authentication)
router.post("/fcm", verifyToken, saveFCMToken);
// Password reset endpoints (no authentication required)
/**
 * POST /api/tokens/password-reset
 * Request a password reset email
 * Body: { email: string }
 */
router.post("/password-reset", requestPasswordReset);
/**
 * POST /api/tokens/reset-password
 * Reset the password using a valid reset token
 * Body: { token: string, password: string }
 */
router.post("/reset-password", resetPassword);
/**
 * GET /api/tokens/verify-reset-token/:token
 * Verify if a reset token is valid
 */
router.get("/verify-reset-token/:token", verifyResetToken);
/**
 * DELETE /api/tokens/reset/:token
 * Delete a password reset token
 */
router.delete("/reset/:token", deleteResetToken);
export default router;
//# sourceMappingURL=tokenRoutes.js.map