import type { Request, Response } from "express";
export declare function getEquipment(req: Request, res: Response): Promise<void>;
export declare function createEquipment(req: Request, res: Response): Promise<void>;
export declare function getEquipmentByQrId(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=equipmentController.d.ts.map