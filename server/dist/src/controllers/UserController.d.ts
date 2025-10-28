import type { Request, Response } from "express";
export declare function getUserSettingsByQuery(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getUserContact(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
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
export declare function getUsers(req: Request, res: Response): Promise<void>;
export declare function getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createUser(req: CreateUserRequest, res: Response): Promise<void>;
export declare function updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getUserSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateSettings(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=userController.d.ts.map