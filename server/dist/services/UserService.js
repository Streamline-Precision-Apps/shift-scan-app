
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="eb08a7fb-610f-5b5e-9279-c034f4978bad")}catch(e){}}();
import { UserModel } from '../models/User.js';
export class UserService {
    // Get all users
    static async getAllUsers() {
        try {
            return await UserModel.findAll();
        }
        catch (error) {
            throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Get user by ID
    static async getUserById(id) {
        if (!id) {
            throw new Error('User ID is required');
        }
        try {
            const user = await UserModel.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }
        catch (error) {
            throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Create new user
    static async createUser(userData) {
        if (!userData.email) {
            throw new Error('Email is required');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Invalid email format');
        }
        try {
            // Check if user already exists
            const existingUser = await UserModel.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            return await UserModel.create(userData);
        }
        catch (error) {
            throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Update user
    static async updateUser(id, userData) {
        if (!id) {
            throw new Error('User ID is required');
        }
        if (userData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Invalid email format');
            }
            // Check if email is already taken by another user
            const existingUser = await UserModel.findByEmail(userData.email);
            if (existingUser && existingUser.id !== id) {
                throw new Error('Email is already taken by another user');
            }
        }
        try {
            return await UserModel.update(id, userData);
        }
        catch (error) {
            throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Delete user
    static async deleteUser(id) {
        if (!id) {
            throw new Error('User ID is required');
        }
        try {
            await this.getUserById(id); // Check if user exists
            return await UserModel.delete(id);
        }
        catch (error) {
            throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
export default UserService;
//# sourceMappingURL=UserService.js.map
//# debugId=eb08a7fb-610f-5b5e-9279-c034f4978bad
