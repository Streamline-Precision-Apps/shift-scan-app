// GET /api/v1/user/settings (GET, by query param or header)
import type { Request, Response } from "express";
import type { User, Prisma } from "../../generated/prisma/index.js";
import * as UserService from "../services/UserService.js";
import prisma from "../lib/prisma.js";

export async function getUserSettingsByQuery(req: Request, res: Response) {
  try {
    // Accept userId from body (POST)
    const userId = req.body.userId;
    console.log("📝 getUserSettingsByQuery called with userId:", userId);

    if (!userId || typeof userId !== "string") {
      console.log("❌ Invalid userId:", userId);
      return res.status(400).json({
        success: false,
        error: "User ID is required",
        message: "Failed to retrieve user settings",
      });
    }

    // Only select the requested fields
    const data = await prisma.userSettings.findUnique({
      where: { userId },
      select: {
        userId: true,
        language: true,
        personalReminders: true,
        generalReminders: true,
        cameraAccess: true,
        locationAccess: true,
        cookiesAccess: true,
      },
    });

    console.log("🔍 Found UserSettings:", data);

    if (!data) {
      console.log("❌ UserSettings not found for userId:", userId);
      return res.status(404).json({
        success: false,
        error: "User settings not found",
        message: "No settings for this user",
      });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error in getUserSettingsByQuery:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to retrieve user settings",
    });
  }
}

// GET /api/v1/user/contact (GET, by query param or header)
export async function getUserContact(req: Request, res: Response) {
  try {
    const userId = req.body.userId;
    console.log("📝 getUserContact called with userId:", userId);

    if (!userId || typeof userId !== "string") {
      console.log("❌ Invalid userId:", userId);
      return res.status(400).json({
        success: false,
        error: "User ID is required",
        message: "Failed to retrieve user contact info",
      });
    }

    // Fetch employee details as requested
    const employee = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        signature: true,
        Contact: {
          select: {
            phoneNumber: true,
            emergencyContact: true,
            emergencyContactNumber: true,
          },
        },
      },
    });

    console.log("🔍 Found employee:", employee);

    if (!employee) {
      console.log("❌ User not found for userId:", userId);
      return res.status(404).json({
        success: false,
        error: "User not found",
        message: "No employee/contact info for this user",
      });
    }
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error("❌ Error in getUserContact:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to retrieve user contact info",
    });
  }
}

// Type the request body for create/update operations
interface CreateUserRequestBody {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  companyId: string;
  email?: string | null;
  signature?: string | null;
  DOB?: string | null;
  truckView: boolean;
  tascoView: boolean;
  laborView: boolean;
  mechanicView: boolean;
  permission?: string;
  image?: string | null;
  startDate?: string | null;
  terminationDate?: string | null;
  workTypeId?: string | null;
  middleName?: string | null;
  secondLastName?: string | null;
}

interface CreateUserRequest extends Request {
  body: CreateUserRequestBody;
}

// GET /api/users
export async function getUsers(req: Request, res: Response) {
  try {
    const users = await UserService.getAllUsers();
    // Remove password from each user object
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.status(200).json({
      success: true,
      data: safeUsers,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to retrieve users",
    });
  }
}

// GET /api/users
export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await UserService.getAllActiveEmployees();
    res.status(200).json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to retrieve users",
    });
  }
}

// GET /api/users/:id || GET /api/users/:id?query
export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { query } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
        message: "Failed to retrieve user",
      });
    }
    if (query) {
      const user = await UserService.getUserByIdQuery(id, query as string);
      res.status(200).json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } else {
      const user = await UserService.getUserById(id);
      // Remove password from user object
      const { password, ...safeUser } = user || {};
      res.status(200).json({
        success: true,
        data: safeUser,
        message: "User retrieved successfully",
      });
    }
  } catch (error) {
    const statusCode =
      error instanceof Error && error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to retrieve user",
    });
  }
}

// POST /api/users
export async function createUser(req: CreateUserRequest, res: Response) {
  try {
    // Convert request body to proper Prisma input
    const userData = UserService.createUserWithCompanyId(
      req.body as Prisma.UserCreateInput & { companyId: string }
    );
    const newUser: User = await UserService.createUser(userData);

    // Additional action: log creation
    console.log(`User created: ${newUser.id}`);

    res.status(201).json({
      success: true,
      data: newUser,
      message: "User created successfully",
    });
  } catch (error) {
    const statusCode =
      error instanceof Error && error.message.includes("already exists")
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
export async function updateUser(req: Request, res: Response) {
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
      if (userData.accountSetup === "true") userData.accountSetup = true;
      else if (userData.accountSetup === "false") userData.accountSetup = false;
    }

    const updatedUser = await UserService.updateUser(id, userData);

    // Additional action: log update
    console.log(`User updated: ${id}`);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes("not found")) statusCode = 404;
      else if (error.message.includes("already taken")) statusCode = 409;
      else if (
        error.message.includes("required") ||
        error.message.includes("Invalid")
      )
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
export async function deleteUser(req: Request, res: Response) {
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

    // Additional action: log deletion
    console.log(`User deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    const statusCode =
      error instanceof Error && error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to delete user",
    });
  }
}

// GET /api/user/settings
export async function getUserSettings(req: Request, res: Response) {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
        message: "Failed to retrieve user settings",
      });
    }
    const settings = await UserService.getUserSettings(userId);
    res.status(200).json({
      success: true,
      data: settings,
      message: "User settings retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to retrieve user settings",
    });
  }
}
// PUT /api/user/settings
export async function updateSettings(req: Request, res: Response) {
  try {
    // Extract userId from authenticated token (req.user set by verifyToken middleware)
    const authenticatedUserId = (req as any).user?.id;
    console.log(
      "🔍 updateSettings called - authenticatedUserId:",
      authenticatedUserId
    );
    console.log("📝 Request body:", JSON.stringify(req.body, null, 2));

    // Verify user is authenticated
    if (!authenticatedUserId) {
      console.error("❌ No authenticated user found");
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const { userId, ...settings } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
        message: "Failed to update user settings",
      });
    }

    // Verify user is only updating their own settings
    if (userId !== authenticatedUserId) {
      console.warn(
        `❌ Unauthorized update attempt: user ${authenticatedUserId} tried to update settings for user ${userId}`
      );
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Cannot update other users' settings",
      });
    }

    // Update User email if provided
    if (settings.email !== undefined) {
      await UserService.updateUser(userId, { email: settings.email });
    }

    // Update Contacts info if provided
    if (
      settings.phoneNumber !== undefined ||
      settings.emergencyContact !== undefined ||
      settings.emergencyContactNumber !== undefined
    ) {
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
    const hasSettings = userSettingsFields.some(
      (key) => settings[key] !== undefined
    );
    if (hasSettings && UserService.updateUserSettings) {
      // Only extract UserSettings fields, not contact or user fields
      const sanitizedSettings: Prisma.UserSettingsUpdateInput = {};

      if (settings.language !== undefined) {
        sanitizedSettings.language = settings.language;
      }
      if (settings.generalReminders !== undefined) {
        sanitizedSettings.generalReminders = Boolean(settings.generalReminders);
      }
      if (settings.personalReminders !== undefined) {
        sanitizedSettings.personalReminders = Boolean(
          settings.personalReminders
        );
      }
      if (settings.cameraAccess !== undefined) {
        sanitizedSettings.cameraAccess = Boolean(settings.cameraAccess);
      }
      if (settings.locationAccess !== undefined) {
        sanitizedSettings.locationAccess = Boolean(settings.locationAccess);
      }
      if (settings.cookiesAccess !== undefined) {
        sanitizedSettings.cookiesAccess = Boolean(settings.cookiesAccess);
      }

      await UserService.updateUserSettings(userId, sanitizedSettings);
    }

    // Additional action: log settings update
    console.log(`User settings updated: ${userId}`);

    res.status(200).json({
      success: true,
      message: "User settings updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to update user settings",
    });
  }
}

// GET /api/v1/user/:userId/timesheet/:date
export async function getUsersTimeSheetByDate(req: Request, res: Response) {
  try {
    const { userId, date } = req.params;
    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        error: "User ID and date are required",
        message: "Failed to retrieve timesheet",
      });
    }
    const timesheets = await UserService.getUsersTimeSheetByDate(userId, date);
    if (!timesheets || timesheets.length === 0) {
      // 204 No Content for empty result
      return res.status(204).send();
    }
    res.status(200).json({
      success: true,
      data: timesheets,
      message: "Timesheet(s) retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to retrieve timesheet",
    });
  }
}
