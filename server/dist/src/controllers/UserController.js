import UserService from "../services/UserService.js";
export class UserController {
    // GET /api/users
    static async getUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            // Remove password from each user object
            const safeUsers = users.map(({ password, ...rest }) => rest);
            res.status(200).json({
                success: true,
                data: safeUsers,
                message: "Users retrieved successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Failed to retrieve users",
            });
        }
    }
    // GET /api/users/:id
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: "User ID is required",
                    message: "Failed to retrieve user",
                });
            }
            const user = await UserService.getUserById(id);
            // Remove password from user object
            const { password, ...safeUser } = user || {};
            res.status(200).json({
                success: true,
                data: safeUser,
                message: "User retrieved successfully",
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes("not found")
                ? 404
                : 500;
            res.status(statusCode).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Failed to retrieve user",
            });
        }
    }
    // POST /api/users
    static async createUser(req, res) {
        try {
            // Convert request body to proper Prisma input
            const userData = UserService.createUserWithCompanyId(req.body);
            const newUser = await UserService.createUser(userData);
            res.status(201).json({
                success: true,
                data: newUser,
                message: "User created successfully",
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes("already exists")
                ? 409
                : 400;
            res.status(statusCode).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Failed to create user",
            });
        }
    }
    // PUT /api/users/:id
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: "User ID is required",
                    message: "Failed to update user",
                });
            }
            const userData = req.body;
            // Convert string 'true'/'false' to boolean for accountSetup if present in body
            if (userData.accountSetup !== undefined) {
                if (userData.accountSetup === "true")
                    userData.accountSetup = true;
                else if (userData.accountSetup === "false")
                    userData.accountSetup = false;
            }
            const updatedUser = await UserService.updateUser(id, userData);
            res.status(200).json({
                success: true,
                data: updatedUser,
                message: "User updated successfully",
            });
        }
        catch (error) {
            let statusCode = 500;
            if (error instanceof Error) {
                if (error.message.includes("not found"))
                    statusCode = 404;
                else if (error.message.includes("already taken"))
                    statusCode = 409;
                else if (error.message.includes("required") ||
                    error.message.includes("Invalid"))
                    statusCode = 400;
            }
            res.status(statusCode).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Failed to update user",
            });
        }
    }
    // DELETE /api/users/:id
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: "User ID is required",
                    message: "Failed to delete user",
                });
            }
            await UserService.deleteUser(id);
            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        }
        catch (error) {
            const statusCode = error instanceof Error && error.message.includes("not found")
                ? 404
                : 500;
            res.status(statusCode).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Failed to delete user",
            });
        }
    }
    // PUT /api/user/settings
    static async updateSettings(req, res) {
        try {
            const { userId, ...settings } = req.body;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: "User ID is required",
                    message: "Failed to update user settings",
                });
            }
            // Update User email if provided
            if (settings.email !== undefined) {
                await UserService.updateUser(userId, { email: settings.email });
            }
            // Update Contacts info if provided
            if (settings.phoneNumber !== undefined ||
                settings.emergencyContact !== undefined ||
                settings.emergencyContactNumber !== undefined) {
                // Assume UserService.updateContact exists, otherwise implement as needed
                if (UserService.updateContact) {
                    await UserService.updateContact(userId, {
                        phoneNumber: settings.phoneNumber,
                        emergencyContact: settings.emergencyContact,
                        emergencyContactNumber: settings.emergencyContactNumber,
                    });
                }
            }
            // Update UserSettings if any settings provided
            const userSettingsFields = [
                "language",
                "generalReminders",
                "personalReminders",
                "cameraAccess",
                "locationAccess",
                "cookiesAccess",
            ];
            const hasSettings = userSettingsFields.some((key) => settings[key] !== undefined);
            if (hasSettings && UserService.updateUserSettings) {
                // Sanitize boolean values
                const sanitizedSettings = { ...settings };
                if (sanitizedSettings.cameraAccess !== undefined) {
                    sanitizedSettings.cameraAccess = Boolean(sanitizedSettings.cameraAccess);
                }
                if (sanitizedSettings.locationAccess !== undefined) {
                    sanitizedSettings.locationAccess = Boolean(sanitizedSettings.locationAccess);
                }
                if (sanitizedSettings.personalReminders !== undefined) {
                    sanitizedSettings.personalReminders = Boolean(sanitizedSettings.personalReminders);
                }
                if (sanitizedSettings.generalReminders !== undefined) {
                    sanitizedSettings.generalReminders = Boolean(sanitizedSettings.generalReminders);
                }
                if (sanitizedSettings.cookiesAccess !== undefined) {
                    sanitizedSettings.cookiesAccess = Boolean(sanitizedSettings.cookiesAccess);
                }
                await UserService.updateUserSettings(userId, sanitizedSettings);
            }
            res.status(200).json({
                success: true,
                message: "User settings updated successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                message: "Failed to update user settings",
            });
        }
    }
}
export const getUsers = UserController.getUsers;
export const getUserById = UserController.getUserById;
export const createUser = UserController.createUser;
export const updateUser = UserController.updateUser;
export const deleteUser = UserController.deleteUser;
export const updateSettings = UserController.updateSettings;
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="20e6fd3e-ca10-53ed-aa2d-59f857f2da6a")}catch(e){}}();
//# sourceMappingURL=userController.js.map
//# debugId=20e6fd3e-ca10-53ed-aa2d-59f857f2da6a
