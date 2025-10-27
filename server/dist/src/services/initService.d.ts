export declare function getUserWithSettingsById(userId: string): Promise<{
    id: string;
    companyId: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string | null;
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
    middleName: string | null;
    secondLastName: string | null;
    lastSeen: Date | null;
    accountSetupToken: {
        id: string;
        code: string;
        userId: string;
        expiresAt: Date;
        used: boolean;
    } | null;
    UserSettings: {
        id: string;
        createdAt: Date;
        language: string;
        generalReminders: boolean;
        personalReminders: boolean;
        cameraAccess: boolean;
        locationAccess: boolean;
        cookiesAccess: boolean;
        lastUpdated: Date;
        userId: string;
    } | null;
    Contact: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phoneNumber: string | null;
        emergencyContact: string | null;
        emergencyContactNumber: string | null;
        userId: string;
    } | null;
} | null>;
//# sourceMappingURL=initService.d.ts.map