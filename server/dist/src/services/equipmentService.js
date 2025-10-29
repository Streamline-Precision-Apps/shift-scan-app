// server/src/services/equipmentService.ts
import prisma from "../lib/prisma.js";
import { EquipmentTags, OwnershipType } from "../../generated/prisma/client.js";
export async function getEquipment(query) {
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
    }
    else {
        return prisma.equipment.findMany();
    }
}
// Find an equipment by QR code (for QR code uniqueness check)
export async function getEquipmentByQrId(qrId) {
    const equipment = await prisma.equipment.findFirst({ where: { qrId } });
    console.log("Equipment found by QR ID:", equipment);
    return equipment;
}
// Create equipment (POST)
export async function createEquipment(data) {
    const { ownershipType, createdById, equipmentTag, name, creationReason, destination, qrId, description = "", } = data;
    if (!equipmentTag) {
        throw new Error("Please select an equipment tag.");
    }
    // Transaction for equipment and hauled
    const result = await prisma.$transaction(async (prisma) => {
        const newEquipment = await prisma.equipment.create({
            data: {
                qrId,
                name,
                status: "ACTIVE",
                description,
                creationReason,
                equipmentTag: equipmentTag, // Cast to EquipmentTags
                createdById,
                ownershipType: ownershipType, // Cast to OwnershipType
            },
            include: {
                createdBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (destination) {
            await prisma.equipmentHauled.create({
                data: {
                    equipmentId: newEquipment.id,
                    destination,
                },
            });
        }
        return newEquipment;
    });
    return result;
}
//# sourceMappingURL=equipmentService.js.map