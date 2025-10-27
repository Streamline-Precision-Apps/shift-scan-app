"use server";
import prisma from "@/lib/prisma";
import { Permission, WorkType } from "../../prisma/generated/prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { hash } from "bcrypt-ts";

export async function createUserAdmin(payload: {
  terminationDate: Date | null;
  createdById: string;
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  password: string;
  permission: string;
  truckView: boolean;
  tascoView: boolean;
  mechanicView: boolean;
  laborView: boolean;
  crews: {
    id: string;
  }[];
}) {
  const hashedPassword = await hash(payload.password, 10);
  console.log("Payload in createUserAdmin:", payload);
  // Use a transaction to ensure both operations succeed or fail together
  const result = await prisma.$transaction(async (prisma) => {
    // Create the user
    const user = await prisma.user.create({
      data: {
        username: payload.username,
        password: hashedPassword,
        firstName: payload.firstName,
        lastName: payload.lastName,
        permission: payload.permission as Permission,
        truckView: payload.truckView,
        tascoView: payload.tascoView,
        mechanicView: payload.mechanicView,
        laborView: payload.laborView,
        clockedIn: false,
        accountSetup: false,
        startDate: new Date(),
        Crews: {
          connect: payload.crews.map((crew) => ({ id: crew.id })),
        },
        Contact: {
          create: {
            // phoneNumber,
            // emergencyContact,
            // emergencyContactNumber,
          },
        },
        Company: { connect: { id: "1" } },
      },
    });

    // Create user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        language: "en",
        generalReminders: false,
        personalReminders: false,
        cameraAccess: false,
        locationAccess: false,
      },
    });

    revalidatePath("/admins/personnel");
    return { success: true, userId: user.id };
  });

  return result;
}

export async function editUserAdmin(payload: {
  id: string;
  terminationDate: string | null;
  username: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  permission: string;
  truckView: boolean;
  tascoView: boolean;
  mechanicView: boolean;
  laborView: boolean;
  crews: {
    id: string;
  }[];
}) {
  console.log("Payload in editUserAdmin:", payload);
  // Use a transaction to ensure both operations succeed or fail together
  const result = await prisma.$transaction(async (prisma) => {
    // Create the user

    // Disconnect all crews, then connect only the selected ones
    const user = await prisma.user.update({
      where: { id: payload.id },
      data: {
        username: payload.username,
        firstName: payload.firstName,
        middleName: payload.middleName,
        lastName: payload.lastName,
        secondLastName: payload.secondLastName,
        permission: payload.permission as Permission,
        truckView: payload.truckView,
        tascoView: payload.tascoView,
        mechanicView: payload.mechanicView,
        laborView: payload.laborView,
        Crews: {
          set: [], // disconnect all crews first
          connect: payload.crews.map((crew) => ({ id: crew.id })),
        },
        Company: { connect: { id: "1" } },
      },
    });

    revalidatePath("/admins/personnel");
    return { success: true, userId: user.id };
  });

  return result;
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error };
  }
}

//#TODO: Test Server Action
export async function createCrew(formData: FormData) {
  try {
    // Extract data from formData
    const crewName = formData.get("name") as string;
    const Users = formData.get("Users") as string;
    const teamLead = formData.get("leadId") as string;
    const crewType = formData.get("crewType") as WorkType;

    if (!crewName || !crewName.trim()) {
      throw new Error("Crew name is required.");
    }
    if (!Users) {
      throw new Error("Crew members data is missing.");
    }
    if (!teamLead) {
      throw new Error("A team lead is required.");
    }

    // Create the crew
    const newCrew = await prisma.crew.create({
      data: {
        name: crewName.trim(),
        leadId: teamLead,
        crewType: crewType,
        Users: {
          connect: JSON.parse(Users as string) as Array<{
            id: string;
          }>,
        },
      },
    });

    revalidateTag("crews");
    revalidatePath(`/admins/personnel`);
    return {
      success: true,
      crewId: newCrew.id,
      message: "Crew created successfully",
    };
  } catch (error) {
    console.error("Error creating crew:", error);
    throw new Error(
      `Failed to create crew: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export async function editCrew(formData: FormData) {
  try {
    // Extract data from formData
    const crewName = formData.get("name") as string;
    const Users = formData.get("Users") as string;
    const teamLead = formData.get("leadId") as string;
    const crewType = formData.get("crewType") as WorkType;
    const crewId = formData.get("id") as string;

    if (!crewName || !crewName.trim()) {
      throw new Error("Crew name is required.");
    }
    if (!Users) {
      throw new Error("Crew members data is missing.");
    }
    if (!teamLead) {
      throw new Error("A team lead is required.");
    }

    // First, fetch existing crew to get current users
    const existingCrew = await prisma.crew.findUnique({
      where: { id: crewId },
      include: { Users: true },
    });

    if (!existingCrew) {
      throw new Error("Crew not found.");
    }

    // Parse new users from form data
    const newUsers = JSON.parse(Users as string) as Array<{
      id: string;
    }>;

    // Update the crew - first disconnect all users, then connect the new selection
    const updatedCrew = await prisma.crew.update({
      where: { id: crewId },
      data: {
        name: crewName.trim(),
        leadId: teamLead,
        crewType: crewType,
        Users: {
          disconnect: existingCrew.Users.map((user) => ({ id: user.id })),
          connect: newUsers.map((user) => ({ id: user.id })),
        },
      },
    });

    revalidateTag("crews");
    revalidatePath(`/admins/personnel`);
    return {
      success: true,
      crewId: updatedCrew.id,
      message: "Crew updated successfully",
    };
  } catch (error) {
    console.error("Error updating crew:", error);
    throw new Error(
      `Failed to update crew: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export async function deleteCrew(id: string) {
  try {
    await prisma.crew.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting crew:", error);
    return { success: false, error: error };
  }
}
