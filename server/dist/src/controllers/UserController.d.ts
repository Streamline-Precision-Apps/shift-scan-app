import type { Request, Response } from "express";
interface CreateUserRequestBody {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    companyId: string;
    email?: string | null;
    signature?: string | null;
    DOB?: string | null;
    truckView: boolean;
    tascoView: boolean;
    laborView: boolean;
    mechanicView: boolean;
    permission?: string;
    image?: string | null;
    startDate?: string | null;
    terminationDate?: string | null;
    workTypeId?: string | null;
    middleName?: string | null;
    secondLastName?: string | null;
}
interface CreateUserRequest extends Request {
    body: CreateUserRequestBody;
}
export declare class UserController {
    static getUsers(req: Request, res: Response): Promise<void>;
    static getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createUser(req: CreateUserRequest, res: Response): Promise<void>;
    static updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export default UserController;
//# sourceMappingURL=UserController.d.ts.map