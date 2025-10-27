import type { Prisma } from "../../generated/prisma/index.js";
export declare class ContactsModel {
    static upsert(userId: string, data: Partial<Prisma.ContactsUpdateInput>): Promise<{
        createdAt: Date;
        id: string;
        userId: string;
        updatedAt: Date;
        phoneNumber: string | null;
        emergencyContact: string | null;
        emergencyContactNumber: string | null;
    }>;
}
export default ContactsModel;
//# sourceMappingURL=Contacts.d.ts.map