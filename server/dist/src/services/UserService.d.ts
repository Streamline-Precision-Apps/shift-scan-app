import type { User, Prisma } from "../../generated/prisma/index.js";
export declare class UserService {
    static createUserWithCompanyId(userData: Omit<Prisma.UserCreateInput, "Company"> & {
        companyId: string;
    }): Prisma.UserCreateInput;
    static getAllUsers(): Promise<User[]>;
    static getUserById(id: string): Promise<{
        id: string;
        companyId: string;
        firstName: string;
        lastName: string;
        username: string;
        email: string | null;
        password: string;
        signature: string | null;
        DOB: Date | null;
        truckView: boolean;
        tascoView: boolean;
        laborView: boolean;
        mechanicView: boolean;
        permission: import("../../generated/prisma/index.js").$Enums.Permission;
        image: string | null;
        startDate: Date | null;
        terminationDate: Date | null;
        accountSetup: boolean;
        clockedIn: boolean;
        passwordResetTokenId: string | null;
        workTypeId: string | null;
        middleName: string | null;
        secondLastName: string | null;
        lastSeen: Date | null;
    }>;
    static createUser(userData: Prisma.UserCreateInput): Promise<User>;
    static updateUser(id: string, userData: Prisma.UserUpdateInput): Promise<User>;
    static deleteUser(id: string): Promise<{
        id: string;
        companyId: string;
        firstName: string;
        lastName: string;
        username: string;
        email: string | null;
        password: string;
        signature: string | null;
        DOB: Date | null;
        truckView: boolean;
        tascoView: boolean;
        laborView: boolean;
        mechanicView: boolean;
        permission: import("../../generated/prisma/index.js").$Enums.Permission;
        image: string | null;
        startDate: Date | null;
        terminationDate: Date | null;
        accountSetup: boolean;
        clockedIn: boolean;
        passwordResetTokenId: string | null;
        workTypeId: string | null;
        middleName: string | null;
        secondLastName: string | null;
        lastSeen: Date | null;
    }>;
}
export default UserService;
//# sourceMappingURL=UserService.d.ts.map