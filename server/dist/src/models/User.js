
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="2cd14a47-0412-51bb-83ba-c508933529db")}catch(e){}}();
import prisma from "../lib/prisma.js";
export class UserModel {
    // Get all users
    static async findAll() {
        return await prisma.user.findMany({
            orderBy: { startDate: "desc" },
        });
    }
    // Get all users with company info
    static async findAllWithCompany() {
        return await prisma.user.findMany({
            include: { Company: true },
            orderBy: { startDate: "desc" },
        });
    }
    // Get user by ID
    static async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }
    // Get user by ID with relations
    static async findByIdWithRelations(id) {
        return await prisma.user.findUnique({
            where: { id },
            include: { Company: true },
        });
    }
    // Get user by email
    static async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }
    // Get user by username
    static async findByUsername(username) {
        return await prisma.user.findUnique({
            where: { username },
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
//# debugId=2cd14a47-0412-51bb-83ba-c508933529db
