import type { Request, Response, NextFunction } from "express";
export declare function routeErrorHandler(error: unknown, message?: string): void;
export declare function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const validateJsonMiddleware: (error: Error, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=errorMiddleware.d.ts.map