export declare function getUserWithSettingsById(userId: string): Promise<{
    user: {
        id: string;
        email: string | null;
        username: string;
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
    } | null;
    jobsites: {
        id: string;
        name: string;
        qrId: string;
        approvalStatus: import("../../generated/prisma/index.js").$Enums.ApprovalStatus;
        archiveDate: Date | null;
        code: string | null;
    }[];
    equipments: {
        id: string;
        name: string;
        qrId: string;
        approvalStatus: import("../../generated/prisma/index.js").$Enums.ApprovalStatus;
        code: string | null;
        status: import("../../generated/prisma/index.js").$Enums.FormTemplateStatus;
    }[];
    costCodes: {
        name: string;
        code: string | null;
        CCTags: {
            id: string;
            name: string;
            description: string | null;
            Jobsites: {
                id: string;
                name: string;
            }[];
        }[];
        isActive: boolean;
    }[];
}>;
//# sourceMappingURL=initService.d.ts.map