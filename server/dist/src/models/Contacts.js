
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f3baad2e-43a9-50b8-b78d-9bcda37646b5")}catch(e){}}();
import prisma from "../lib/prisma.js";
export class ContactsModel {
    static async upsert(userId, data) {
        // Build createData with only allowed fields and correct types
        const createData = {
            User: { connect: { id: userId } },
        };
        if (typeof data.phoneNumber === 'string')
            createData.phoneNumber = data.phoneNumber;
        if (typeof data.emergencyContact === 'string')
            createData.emergencyContact = data.emergencyContact;
        if (typeof data.emergencyContactNumber === 'string')
            createData.emergencyContactNumber = data.emergencyContactNumber;
        // Only include defined fields in update
        const updateData = {};
        if (typeof data.phoneNumber === 'string')
            updateData.phoneNumber = data.phoneNumber;
        if (typeof data.emergencyContact === 'string')
            updateData.emergencyContact = data.emergencyContact;
        if (typeof data.emergencyContactNumber === 'string')
            updateData.emergencyContactNumber = data.emergencyContactNumber;
        return prisma.contacts.upsert({
            where: { userId },
            update: updateData,
            create: createData,
        });
    }
}
export default ContactsModel;
//# sourceMappingURL=Contacts.js.map
//# debugId=f3baad2e-43a9-50b8-b78d-9bcda37646b5
