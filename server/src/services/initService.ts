// server/src/services/initService.ts
import prisma from "../lib/prisma.js";

export async function getUserWithSettingsById(userId: string) {
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
