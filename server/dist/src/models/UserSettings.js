
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="31c23e18-fc8f-5907-86b2-47ce94284965")}catch(e){}}();
import prisma from "../lib/prisma.js";
export class UserSettingsModel {
    static async update(userId, data) {
        // Only copy known fields
        const cleanData = {};
        if (typeof data.language === 'string')
            cleanData.language = data.language;
        if (typeof data.generalReminders === 'boolean')
            cleanData.generalReminders = data.generalReminders;
        if (typeof data.personalReminders === 'boolean')
            cleanData.personalReminders = data.personalReminders;
        if (typeof data.cameraAccess === 'boolean')
            cleanData.cameraAccess = data.cameraAccess;
        if (typeof data.locationAccess === 'boolean')
            cleanData.locationAccess = data.locationAccess;
        if (typeof data.cookiesAccess === 'boolean')
            cleanData.cookiesAccess = data.cookiesAccess;
        return prisma.userSettings.update({
            where: { userId },
            data: cleanData,
        });
    }
}
export default UserSettingsModel;
//# sourceMappingURL=UserSettings.js.map
//# debugId=31c23e18-fc8f-5907-86b2-47ce94284965
