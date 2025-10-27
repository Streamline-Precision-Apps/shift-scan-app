// server/src/services/initService.ts

!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4e4ff51f-57e0-5b1f-91c2-2986e700371a")}catch(e){}}();
import prisma from "../lib/prisma.js";
export async function getUserWithSettingsById(userId) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            signature: true,
            DOB: true,
            truckView: true,
            tascoView: true,
            laborView: true,
            mechanicView: true,
            permission: true,
            image: true,
            // startDate: true,
            terminationDate: true,
            accountSetup: true,
            clockedIn: true,
            companyId: true,
            // passwordResetTokenId: true,
            // workTypeId: true,
            middleName: true,
            secondLastName: true,
            lastSeen: true,
            accountSetupToken: true,
            Contact: true,
            // Equipment: true,
            // FCMToken: true,
            // FormApprovals: true,
            // FormSubmissions: true,
            // Jobsite: true,
            // MaintenanceLogs: true,
            // NotificationRead: true,
            // NotificationResponse: true,
            // PasswordResetTokens: true,
            // TimeSheets: true,
            // TimeSheetChanges: true,
            // topicSubscriptions: true,
            // Company: true,
            UserSettings: true, // includes settings
            // Crews: true,
            // password: false // password is excluded by not listing it
        },
    });
}
//# sourceMappingURL=initService.js.map
//# debugId=4e4ff51f-57e0-5b1f-91c2-2986e700371a
