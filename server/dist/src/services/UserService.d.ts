import type { User, Prisma } from "../../generated/prisma/index.js";
export declare class UserService {
    static createUserWithCompanyId(userData: Omit<Prisma.UserCreateInput, "Company"> & {
        companyId: string;
    }): Prisma.UserCreateInput;
    static getAllUsers(): Promise<User[]>;
    static getUserById(id: string): Promise<{
        id: string;
        username: string;
        email: string | null;
        firstName: string;
        lastName: string;
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
        companyId: string;
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
        username: string;
        email: string | null;
        firstName: string;
        lastName: string;
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
        companyId: string;
        passwordResetTokenId: string | null;
        workTypeId: string | null;
        middleName: string | null;
        secondLastName: string | null;
        lastSeen: Date | null;
    }>;
    static updateContact(userId: string, data: Partial<Prisma.ContactsUpdateInput>): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        updatedAt: Date;
        phoneNumber: string | null;
        emergencyContact: string | null;
        emergencyContactNumber: string | null;
    }>;
    static updateUserSettings(userId: string, data: Partial<Prisma.UserSettingsUpdateInput>): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        language: string;
        generalReminders: boolean;
        personalReminders: boolean;
        cameraAccess: boolean;
        locationAccess: boolean;
        cookiesAccess: boolean;
        lastUpdated: Date;
    }>;
    static getUserSettings(userId: string): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        language: string;
        generalReminders: boolean;
        personalReminders: boolean;
        cameraAccess: boolean;
        locationAccess: boolean;
        cookiesAccess: boolean;
        lastUpdated: Date;
    } | null>;
}
export default UserService;
//# sourceMappingURL=UserService.d.ts.map