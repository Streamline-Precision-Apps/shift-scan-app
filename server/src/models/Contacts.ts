import prisma from "../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";

export class ContactsModel {
  static async upsert(userId: string, data: Partial<Prisma.ContactsUpdateInput>) {
    // Build createData with only allowed fields and correct types
    const createData: Prisma.ContactsCreateInput = {
      User: { connect: { id: userId } },
    };
    if (typeof data.phoneNumber === 'string') createData.phoneNumber = data.phoneNumber;
    if (typeof data.emergencyContact === 'string') createData.emergencyContact = data.emergencyContact;
    if (typeof data.emergencyContactNumber === 'string') createData.emergencyContactNumber = data.emergencyContactNumber;
    // Only include defined fields in update
    const updateData: Partial<Prisma.ContactsUpdateInput> = {};
    if (typeof data.phoneNumber === 'string') updateData.phoneNumber = data.phoneNumber;
    if (typeof data.emergencyContact === 'string') updateData.emergencyContact = data.emergencyContact;
    if (typeof data.emergencyContactNumber === 'string') updateData.emergencyContactNumber = data.emergencyContactNumber;
    return prisma.contacts.upsert({
      where: { userId },
      update: updateData,
      create: createData,
    });
  }
}

export default ContactsModel;
