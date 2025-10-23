import express from "express";
import jwt from "jsonwebtoken";
declare global {
    namespace Express {
        interface Request {
            user?: jwt.JwtPayload | string;
        }
    }
}
export declare function verifyToken(req: express.Request, res: express.Response, next: express.NextFunction): express.Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMiddleware.d.ts.map