
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b869947a-4fb5-559c-bd2a-689c970765ba")}catch(e){}}();
import prisma from "../lib/prisma.js";
import { Permission } from "../../generated/prisma/client.js";
export class UserModel {
    // Get all users
    static async findAll() {
        return await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    // Get user by ID
    static async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }
    // Get user by email
    static async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }
    // Create a new user
    static async create(data) {
        return await prisma.user.create({
            data,
        });
    }
    // Update user
    static async update(id, data) {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }
    // Delete user
    static async delete(id) {
        return await prisma.user.delete({
            where: { id },
        });
    }
}
export default UserModel;
//# sourceMappingURL=User.js.map
//# debugId=b869947a-4fb5-559c-bd2a-689c970765ba
