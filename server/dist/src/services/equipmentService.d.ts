export declare function getEquipment(query: {
    qrg?: boolean;
}): Promise<{
    id: string;
    name: string;
    qrId: string;
    code: string | null;
    status: import("../../generated/prisma/index.js").$Enums.FormTemplateStatus;
}[]>;
export declare function getEquipmentByQrId(qrId: string): Promise<{
    createdAt: Date;
    id: string;
    name: string;
    updatedAt: Date;
    description: string | null;
    qrId: string;
    creationReason: string | null;
    approvalStatus: import("../../generated/prisma/index.js").$Enums.ApprovalStatus;
    createdById: string | null;
    createdVia: import("../../generated/prisma/index.js").$Enums.CreatedVia;
    code: string | null;
    status: import("../../generated/prisma/index.js").$Enums.FormTemplateStatus;
    equipmentTag: import("../../generated/prisma/index.js").$Enums.EquipmentTags;
    state: import("../../generated/prisma/index.js").$Enums.EquipmentState;
    overWeight: boolean | null;
    currentWeight: number | null;
    acquiredDate: Date | null;
    color: string | null;
    licensePlate: string | null;
    licenseState: string | null;
    make: string | null;
    memo: string | null;
    model: string | null;
    ownershipType: import("../../generated/prisma/index.js").$Enums.OwnershipType | null;
    registrationExpiration: Date | null;
    serialNumber: string | null;
    year: string | null;
    acquiredCondition: import("../../generated/prisma/index.js").$Enums.Condition | null;
} | null>;
export declare function createEquipment(data: {
    ownershipType: string;
    createdById: string;
    equipmentTag: string;
    name: string;
    creationReason: string;
    destination?: string;
    qrId: string;
    description?: string;
}): Promise<{
    createdBy: {
        firstName: string;
        lastName: string;
    } | null;
} & {
    createdAt: Date;
    id: string;
    name: string;
    updatedAt: Date;
    description: string | null;
    qrId: string;
    creationReason: string | null;
    approvalStatus: import("../../generated/prisma/index.js").$Enums.ApprovalStatus;
    createdById: string | null;
    createdVia: import("../../generated/prisma/index.js").$Enums.CreatedVia;
    code: string | null;
    status: import("../../generated/prisma/index.js").$Enums.FormTemplateStatus;
    equipmentTag: import("../../generated/prisma/index.js").$Enums.EquipmentTags;
    state: import("../../generated/prisma/index.js").$Enums.EquipmentState;
    overWeight: boolean | null;
    currentWeight: number | null;
    acquiredDate: Date | null;
    color: string | null;
    licensePlate: string | null;
    licenseState: string | null;
    make: string | null;
    memo: string | null;
    model: string | null;
    ownershipType: import("../../generated/prisma/index.js").$Enums.OwnershipType | null;
    registrationExpiration: Date | null;
    serialNumber: string | null;
    year: string | null;
    acquiredCondition: import("../../generated/prisma/index.js").$Enums.Condition | null;
}>;
//# sourceMappingURL=equipmentService.d.ts.map