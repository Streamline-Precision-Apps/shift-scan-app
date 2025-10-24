import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import type { Request, Response } from "express";
export declare function getUserLocations(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getUserLocationHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function postUserLocation(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=locationController.d.ts.map