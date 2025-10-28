import type { Prisma } from "../../generated/prisma/index.js";
export declare class UserSettingsModel {
    static findByUserId(userId: string): Promise<{
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
    static update(userId: string, data: Partial<Prisma.UserSettingsUpdateInput>): Promise<{
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
}
export default UserSettingsModel;
//# sourceMappingURL=UserSettings.d.ts.map