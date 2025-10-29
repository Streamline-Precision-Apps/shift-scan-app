import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import type { Request, Response } from "express";
export declare function saveFCMToken(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/tokens/password-reset
 * Request password reset email by providing an email address
 */
export declare function requestPasswordReset(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/tokens/reset-password
 * Reset user password using the reset token
 */
export declare function resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/tokens/verify-reset-token/:token
 * Verify if a reset token is valid
 */
export declare function verifyResetToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * DELETE /api/tokens/reset/:token
 * Delete a password reset token by token
 */
export declare function deleteResetToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=tokenController.d.ts.map