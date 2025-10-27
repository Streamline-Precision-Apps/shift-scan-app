import ContactsModel from "../models/Contacts.js";
import UserSettingsModel from "../models/UserSettings.js";

import { UserModel } from "../models/User.js";
import type { User, Prisma } from "../../generated/prisma/index.js";
import { hash } from "bcryptjs";

export class UserService {
  // Helper function to create user with companyId
  static createUserWithCompanyId(
    userData: Omit<Prisma.UserCreateInput, "Company"> & { companyId: string }
  ): Prisma.UserCreateInput {
    const { companyId, ...userDataWithoutCompanyId } = userData;
    return {
      ...userDataWithoutCompanyId,
      Company: {
        connect: { id: companyId },
      },
    };
  }

  // Get all users
  static async getAllUsers(): Promise<User[]> {
    try {
      return await UserModel.findAll();
    } catch (error) {
      throw new Error(
        `Failed to fetch users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get user by ID
  static async getUserById(id: string) {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      const user = await UserModel.findById(id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error(
        `Failed to fetch user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Create new user
  static async createUser(userData: Prisma.UserCreateInput): Promise<User> {
    // Validate required fields
    if (!userData.firstName) {
      throw new Error("First name is required");
    }
    if (!userData.lastName) {
      throw new Error("Last name is required");
    }
    if (!userData.username) {
      throw new Error("Username is required");
    }
    if (!userData.password) {
      throw new Error("Password is required");
    }
    if (!userData.Company) {
      throw new Error("Company is required");
    }

    // Validate email format if provided
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Invalid email format");
      }
    }

    try {
      // Check if user already exists
      if (userData.email) {
        const existingUser = await UserModel.findByEmail(userData.email);
        if (existingUser) {
          throw new Error("User with this email already exists");
        }
      }

      // Check if username already exists
      const existingUsername = await UserModel.findByUsername(
        userData.username
      );
      if (existingUsername) {
        throw new Error("Username already exists");
      }

      return await UserModel.create(userData);
    } catch (error) {
      throw new Error(
        `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Update user
  static async updateUser(
    id: string,
    userData: Prisma.UserUpdateInput
  ): Promise<User> {
    if (!id) {
      throw new Error("User ID is required");
    }
    //hash the password here
    if (userData.password) {
      userData.password = await hash(userData.password as string, 10);
    }

    if (userData.email && typeof userData.email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Invalid email format");
      }

      // Check if email is already taken by another user
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error("Email is already taken by another user");
      }
    }

    // Support nested updates for Contact and UserSettings
    const updateData: Prisma.UserUpdateInput = { ...userData };
    if (userData.Contact) {
      updateData.Contact = { update: userData.Contact };
    }
    if (userData.UserSettings) {
      updateData.UserSettings = { update: userData.UserSettings };
    }

    try {
      return await UserModel.update(id, updateData);
    } catch (error) {
      throw new Error(
        `Failed to update user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Delete user
  static async deleteUser(id: string) {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      await this.getUserById(id); // Check if user exists
      return await UserModel.delete(id);
    } catch (error) {
      throw new Error(
        `Failed to delete user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Update or upsert contact info for a user
  static async updateContact(
    userId: string,
    data: Partial<Prisma.ContactsUpdateInput>
  ) {
    // Only pass allowed fields and correct types
    const contactData: Partial<Prisma.ContactsUpdateInput> = {};
    if (typeof data.phoneNumber === "string")
      contactData.phoneNumber = data.phoneNumber;
    if (typeof data.emergencyContact === "string")
      contactData.emergencyContact = data.emergencyContact;
    if (typeof data.emergencyContactNumber === "string")
      contactData.emergencyContactNumber = data.emergencyContactNumber;
    return ContactsModel.upsert(userId, contactData);
  }

  // Update user settings
  static async updateUserSettings(
    userId: string,
    data: Partial<Prisma.UserSettingsUpdateInput>
  ) {
    // Only pass allowed fields and correct types
    const settingsData: Partial<Prisma.UserSettingsUpdateInput> = {};
    if (typeof data.language === "string")
      settingsData.language = data.language;
    if (typeof data.generalReminders === "boolean")
      settingsData.generalReminders = data.generalReminders;
    if (typeof data.personalReminders === "boolean")
      settingsData.personalReminders = data.personalReminders;
    if (typeof data.cameraAccess === "boolean")
      settingsData.cameraAccess = data.cameraAccess;
    if (typeof data.locationAccess === "boolean")
      settingsData.locationAccess = data.locationAccess;
    if (typeof data.cookiesAccess === "boolean")
      settingsData.cookiesAccess = data.cookiesAccess;
    return UserSettingsModel.update(userId, settingsData);
  }

  static async getUserSettings(userId: string) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    try {
      return await UserSettingsModel.findByUserId(userId);
    } catch (error) {
      throw new Error(
        `Failed to fetch user settings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export default UserService;
