// server/src/services/initService.ts
import prisma from "../lib/prisma.js";

export async function getUserWithSettingsById(userId: string) {
  const user = await prisma.user.findUnique({
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

  // Jobsites (for profitStore)
  const jobsites = await prisma.jobsite.findMany({
    select: {
      id: true,
      qrId: true,
      name: true,
      approvalStatus: true,
      archiveDate: true,
    },
  });

  // Equipment (for equipmentStore)
  const equipments = await prisma.equipment.findMany({
    select: {
      id: true,
      name: true,
      qrId: true,
      approvalStatus: true,
      status: true,
    },
  });

  // CostCodes (for costCodeStore)
  const costCodes = await prisma.costCode.findMany({
    select: {
      name: true,
      isActive: true,
      code: true,
      CCTags: {
        select: {
          id: true,
          name: true,
          description: true,
          Jobsites: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  console.log("user:", user);
  console.log("jobsites:", jobsites);
  console.log("equipments:", equipments);
  console.log("costCodes:", costCodes);

  return {
    user,
    jobsites,
    equipments,
    costCodes,
  };
}
