// server/src/services/equipmentService.ts
import prisma from "../lib/prisma.js";

export async function getEquipment(query: { qrg?: boolean }) {
  if (query.qrg) {
    return prisma.equipment.findMany({
      where: {
        status: { not: "ARCHIVED" },
      },
      select: {
        id: true,
        qrId: true,
        name: true,
        code: true,
        status: true,
      },
    });
  } else {
    return prisma.equipment.findMany();
  }
}
