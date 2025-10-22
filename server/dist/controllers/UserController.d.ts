import type { Request, Response } from 'express';
export declare class UserController {
    static getUsers(req: Request, res: Response): Promise<void>;
    static getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createUser(req: Request, res: Response): Promise<void>;
    static updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export default UserController;
//# sourceMappingURL=UserController.d.ts.map