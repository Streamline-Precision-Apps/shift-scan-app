import prisma from "../lib/prisma.js";
import type { User, Prisma } from "../../generated/prisma/index.js";
import { hash } from "bcryptjs";

const ALLOWED_USER_FIELDS = [
  "id",
  "username",
  "email",
  "firstName",
  "lastName",
  "signature",
  "DOB",
  "truckView",
  "tascoView",
  "laborView",
  "mechanicView",
  "permission",
  "image",
  "startDate",
  "terminationDate",
  "workTypeId",
  "middleName",
  "secondLastName",
  "createdAt",
  "updatedAt",
  "lastSeen",
];

// Create user with companyId helper
export function createUserWithCompanyId(
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
export async function getAllUsers(): Promise<User[]> {
  try {
    return await prisma.user.findMany({
      orderBy: { startDate: "desc" },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch users: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getUserById(id: string) {
  if (!id) {
    throw new Error("User ID is required");
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
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

export async function getUserByIdQuery(id: string, query: string) {
  if (!id) throw new Error("User ID is required");

  // Parse and validate fields
  const fields = query
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const invalidFields = fields.filter((f) => !ALLOWED_USER_FIELDS.includes(f));
  if (invalidFields.length > 0) {
    throw new Error(`Invalid field(s) requested: ${invalidFields.join(", ")}`);
  }

  // Build select object
  const select: Record<string, true> = {};
  for (const field of fields) {
    select[field] = true;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select,
    });
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    throw new Error(
      `Failed to fetch user: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createUser(
  userData: Prisma.UserCreateInput
): Promise<User> {
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
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
    }

    if (userData.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: userData.username },
      });
      if (existingUsername) {
        throw new Error("Username already exists");
      }
    }

    return await prisma.user.create({
      data: userData,
    });
  } catch (error) {
    throw new Error(
      `Failed to create user: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function updateUser(
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
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser && existingUser.id !== id) {
      throw new Error("Email is already taken by another user");
    }
  }
  if (userData.image && typeof userData.image !== "string") {
    throw new Error("Image must be a string URL");
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
    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    throw new Error(
      `Failed to update user: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function deleteUser(id: string) {
  if (!id) {
    throw new Error("User ID is required");
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");
    return await prisma.user.delete({ where: { id } });
  } catch (error) {
    throw new Error(
      `Failed to delete user: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getUserSettings(userId: string) {
  return prisma.userSettings.findUnique({
    where: { userId },
  });
}

export async function updateUserSettings(
  userId: string,
  data: Partial<Prisma.UserSettingsUpdateInput>
) {
  const cleanData: Partial<Prisma.UserSettingsUpdateInput> = {};
  if (typeof data.language === "string") cleanData.language = data.language;
  if (typeof data.generalReminders === "boolean")
    cleanData.generalReminders = data.generalReminders;
  if (typeof data.personalReminders === "boolean")
    cleanData.personalReminders = data.personalReminders;
  if (typeof data.cameraAccess === "boolean")
    cleanData.cameraAccess = data.cameraAccess;
  if (typeof data.locationAccess === "boolean")
    cleanData.locationAccess = data.locationAccess;
  if (typeof data.cookiesAccess === "boolean")
    cleanData.cookiesAccess = data.cookiesAccess;
  return prisma.userSettings.update({
    where: { userId },
    data: cleanData,
  });
}

export async function updateContact(
  userId: string,
  data: Partial<Prisma.ContactsUpdateInput>
) {
  // Build createData with only allowed fields and correct types
  const createData: Prisma.ContactsCreateInput = {
    User: { connect: { id: userId } },
  };
  if (typeof data.phoneNumber === "string")
    createData.phoneNumber = data.phoneNumber;
  if (typeof data.emergencyContact === "string")
    createData.emergencyContact = data.emergencyContact;
  if (typeof data.emergencyContactNumber === "string")
    createData.emergencyContactNumber = data.emergencyContactNumber;
  // Only include defined fields in update
  const updateData: Partial<Prisma.ContactsUpdateInput> = {};
  if (typeof data.phoneNumber === "string")
    updateData.phoneNumber = data.phoneNumber;
  if (typeof data.emergencyContact === "string")
    updateData.emergencyContact = data.emergencyContact;
  if (typeof data.emergencyContactNumber === "string")
    updateData.emergencyContactNumber = data.emergencyContactNumber;
  return prisma.contacts.upsert({
    where: { userId },
    update: updateData,
    create: createData,
  });
}

export async function getAllActiveEmployees() {
  const employees = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      terminationDate: true,
    },
  });

  if (!employees || employees.length === 0) {
    throw new Error("No employees found");
  }

  const activeEmployees = employees.filter((employee) => {
    // Check if terminationDate is null or in the future
    return (
      !employee.terminationDate ||
      new Date(employee.terminationDate) > new Date()
    );
  });

  const activeEmployeeNames = activeEmployees.map((employee) => ({
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
  }));

  return activeEmployeeNames;
}

export async function getUsersTimeSheetByDate(
  userId: string,
  dateParam: string
) {
  const date = new Date(dateParam);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);

  // Query the database for timesheets on the specified date
  const timesheets = await prisma.timeSheet.findMany({
    where: {
      userId: userId,
      date: {
        gte: date,
        lt: nextDay,
      },
    },
    orderBy: { date: "desc" },
    include: {
      Jobsite: {
        select: {
          name: true,
        },
      },
    },
  });
  return timesheets;
}
