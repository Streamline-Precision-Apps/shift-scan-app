// server/src/services/initService.ts

!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ef4cd2e1-54a8-565a-b04a-35062590d4cb")}catch(e){}}();
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
            terminationDate: true,
            accountSetup: true,
            clockedIn: true,
            companyId: true,
            middleName: true,
            secondLastName: true,
            lastSeen: true,
            accountSetupToken: true,
            Contact: true,
            UserSettings: true,
        },
    });
}
//# sourceMappingURL=initService.js.map
//# debugId=ef4cd2e1-54a8-565a-b04a-35062590d4cb
