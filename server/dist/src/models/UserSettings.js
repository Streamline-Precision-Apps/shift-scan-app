
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="91a8b0db-cfff-59bc-a42e-b891b719965e")}catch(e){}}();
import prisma from "../lib/prisma.js";
export class UserSettingsModel {
    static async findByUserId(userId) {
        return prisma.userSettings.findUnique({
            where: { userId },
        });
    }
    static async update(userId, data) {
        // Only copy known fields
        const cleanData = {};
        if (typeof data.language === "string")
            cleanData.language = data.language;
        if (typeof data.generalReminders === "boolean")
            cleanData.generalReminders = data.generalReminders;
        if (typeof data.personalReminders === "boolean")
            cleanData.personalReminders = data.personalReminders;
        if (typeof data.cameraAccess === "boolean")
            cleanData.cameraAccess = data.cameraAccess;
        if (typeof data.locationAccess === "boolean")
            cleanData.locationAccess = data.locationAccess;
        if (typeof data.cookiesAccess === "boolean")
            cleanData.cookiesAccess = data.cookiesAccess;
        return prisma.userSettings.update({
            where: { userId },
            data: cleanData,
        });
    }
}
export default UserSettingsModel;
//# sourceMappingURL=UserSettings.js.map
//# debugId=91a8b0db-cfff-59bc-a42e-b891b719965e
