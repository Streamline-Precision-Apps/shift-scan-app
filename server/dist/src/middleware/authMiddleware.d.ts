import express from "express";
import type { JwtUserPayload } from "../lib/jwt.js";
export interface AuthenticatedRequest extends express.Request {
    user?: JwtUserPayload;
}
export declare function verifyToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): express.Response<any, Record<string, any>> | undefined;
export declare function authorizeRoles(...allowedRoles: ("USER" | "MANAGER" | "ADMIN" | "SUPERADMIN")[]): (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMiddleware.d.ts.map