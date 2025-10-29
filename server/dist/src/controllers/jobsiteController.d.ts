import type { Request, Response } from "express";
export declare function getJobsites(req: Request, res: Response): Promise<void>;
export declare function getJobsiteByQrId(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getJobsiteById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createJobsite(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateJobsite(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteJobsite(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=jobsiteController.d.ts.map