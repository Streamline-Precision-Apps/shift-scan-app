export declare function getUserWithSettingsById(userId: string): Promise<{
    id: string;
    username: string;
    email: string | null;
    firstName: string;
    lastName: string;
    signature: string | null;
    DOB: Date | null;
    truckView: boolean;
    tascoView: boolean;
    laborView: boolean;
    mechanicView: boolean;
    permission: import("../../generated/prisma/index.js").$Enums.Permission;
    image: string | null;
    terminationDate: Date | null;
    accountSetup: boolean;
    clockedIn: boolean;
    companyId: string;
    middleName: string | null;
    secondLastName: string | null;
    lastSeen: Date | null;
    accountSetupToken: {
        id: string;
        userId: string;
        code: string;
        expiresAt: Date;
        used: boolean;
    } | null;
    Contact: {
        createdAt: Date;
        id: string;
        userId: string;
        updatedAt: Date;
        phoneNumber: string | null;
        emergencyContact: string | null;
        emergencyContactNumber: string | null;
    } | null;
    UserSettings: {
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
    } | null;
} | null>;
//# sourceMappingURL=initService.d.ts.map