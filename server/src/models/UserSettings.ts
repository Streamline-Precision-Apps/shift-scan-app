import prisma from "../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";

export class UserSettingsModel {
  static async findByUserId(userId: string) {
    return prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  static async update(
    userId: string,
    data: Partial<Prisma.UserSettingsUpdateInput>
  ) {
    // Only copy known fields
    const cleanData: Partial<Prisma.UserSettingsUpdateInput> = {};
    if (typeof data.language === "string") cleanData.language = data.language;
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
