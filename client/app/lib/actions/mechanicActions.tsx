"use server";
import prisma from "@/lib/prisma";
import { Priority } from "../../prisma/generated/prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

// This Updates the selected staus of the project in the database
export async function setProjectSelected(id: string, selected: boolean) {
  try {
    await prisma.maintenance.update({
      where: { id },
      data: { selected },
    });

    // Revalidate both the page and the data
    revalidatePath("/dashboard/mechanic");
    revalidateTag("maintenance-projects");

    return { success: true };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function CreateMechanicProject(formData: FormData) {
  try {
    const equipmentId = formData.get("equipmentId") as string;
    const equipmentIssue = formData.get("equipmentIssue") as string;
    const additionalInfo = formData.get("additionalInfo") as string;
    const location = formData.get("location") as string;
    const stringPriority = formData.get("priority") as Priority;
    const createdBy = formData.get("createdBy") as string;

    let priority: Priority;

    switch (stringPriority) {
      case Priority.LOW:
        priority = Priority.LOW;
        break;
      case Priority.MEDIUM:
        priority = Priority.MEDIUM;
        break;
      case Priority.HIGH:
        priority = Priority.HIGH;
        break;
      case Priority.PENDING:
        priority = Priority.PENDING;
        break;
      case Priority.TODAY:
        priority = Priority.TODAY;
        break;
      default:
        priority = Priority.PENDING;
    }

    await prisma.maintenance.create({
      data: {
        equipmentId,
        equipmentIssue,
        additionalInfo,
        location,
        priority,
        createdBy,
      },
    });

    revalidatePath("/dashboard/mechanic");
    revalidateTag("projects");
    return true;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

export async function RemoveDelayRepair(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    const updatedRepair = await prisma.maintenance.update({
      where: { id },
      data: {
        delayReasoning: null,
        delay: null,
        hasBeenDelayed: true,
      },
    });
    return updatedRepair;
  } catch (error) {
    console.error("Error removing delay:", error);
    throw error;
  }
}

export async function setEditForProjectInfo(formData: FormData) {
  try {
    const location = formData.get("location") as string;
    const stringPriority = formData.get("priority") as string;
    const delay = formData.get("delay") as string;
    const delayReasoning = formData.get("delayReasoning") as string;
    const equipmentIssue = formData.get("equipmentIssue") as string;
    const additionalInfo = formData.get("additionalInfo") as string;

    let priority: Priority;

    switch (stringPriority) {
      case Priority.LOW:
        priority = Priority.LOW;
        break;
      case Priority.MEDIUM:
        priority = Priority.MEDIUM;
        break;
      case Priority.HIGH:
        priority = Priority.HIGH;
        break;
      case Priority.PENDING:
        priority = Priority.PENDING;
        break;
      case Priority.TODAY:
        priority = Priority.TODAY;
        break;
      default:
        priority = Priority.PENDING;
    }

    if (delay === "") {
      await prisma.maintenance.update({
        where: {
          id: formData.get("id") as string,
        },
        data: {
          location,
          priority,
          delay: null,
          delayReasoning: null,
          equipmentIssue,
          additionalInfo,
        },
      });
    } else {
      await prisma.maintenance.update({
        where: {
          id: formData.get("id") as string,
        },
        data: {
          location,
          priority,
          delay,
          delayReasoning,
          equipmentIssue,
          additionalInfo,
        },
      });
    }
  } catch (error) {
    console.error("Error updating project:", error);
  }
}

export async function deleteMaintenanceProject(id: string) {
  try {
    await prisma.maintenance.delete({
      where: {
        id,
      },
    });
    revalidateTag("maintenance-projects");
    return true;
  } catch (error) {
    console.error("Error updating project:", error);
  }
}

export async function startEngineerProject(formData: FormData) {
  try {
    const maintenanceId = formData.get("maintenanceId") as string;
    const timeSheetId = Number(formData.get("timeSheetId"));
    const userId = formData.get("userId") as string;
    const startTime = new Date().toISOString();

    // ✅ Check if timeSheetId exists in TimeSheet model
    const existingTimeSheet = await prisma.timeSheet.findUnique({
      where: { id: timeSheetId },
    });

    if (!existingTimeSheet) {
      throw new Error(`TimeSheet with ID ${timeSheetId} does not exist.`);
    }

    // ✅ Insert Maintenance Log
    const log = await prisma.maintenanceLog.create({
      data: {
        timeSheetId,
        maintenanceId,
        userId,
        startTime,
      },
    });

    revalidatePath("/dashboard/mechanic");
    revalidateTag("projects");

    return log;
  } catch (error) {
    console.error("Error updating project:", error);
    return false;
  }
}

export async function LeaveEngineerProject(formData: FormData) {
  try {
    const comment = formData.get("comment") as string;
    const id = formData.get("maintenanceId") as string;
    const userId = formData.get("userId") as string;
    const endTime = new Date().toISOString();

    await prisma.maintenanceLog.update({
      where: {
        id,
      },
      data: {
        comment,
        userId,
        endTime,
      },
    });

    revalidatePath("/dashboard/mechanic");
    revalidateTag("projects");
    return true;
  } catch (error) {}
}

export async function updateDelay(formData: FormData) {
  try {
    const id = formData.get("maintenanceId") as string;
    const delay = formData.get("delay") as string;
    const delayReasoning = formData.get("delayReasoning") as string;
    await prisma.maintenance.update({
      where: {
        id,
      },
      data: {
        delay,
        delayReasoning,
        hasBeenDelayed: true,
      },
    });
    revalidatePath("/dashboard/mechanic");
  } catch (error) {}
}

export async function findUniqueUser(formData: FormData) {
  try {
    const user = await prisma.maintenanceLog.findFirst({
      where: {
        maintenanceId: formData.get("maintenanceId") as string,
        userId: formData.get("userId") as string,
        endTime: null,
      },
      select: {
        id: true,
        userId: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error finding user:", error);
  }
}

export async function SubmitEngineerProject(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const problemDiagnosis = formData.get("diagnosedProblem") as string;
    const solution = formData.get("solution") as string;
    const totalHoursLaboured = parseFloat(
      formData.get("totalHoursLaboured") as string,
    );

    // Check for open MaintenanceLogs (endTime is null) for this Maintenance
    const openLogs = await prisma.maintenanceLog.findMany({
      where: {
        maintenanceId: id,
        endTime: null,
      },
      select: { id: true },
    });

    if (openLogs.length > 0) {
      return {
        success: false,
        error: "Cannot finish project while someone is still working on it.",
      };
    }

    await prisma.maintenance.update({
      where: {
        id,
      },
      data: {
        problemDiagnosis,
        solution,
        repaired: true,
        totalHoursLaboured,
      },
    });

    revalidatePath("/dashboard/mechanic");
    revalidateTag("projects");
    revalidateTag("maintenance-projects");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while finishing the project.",
    };
  }
}
export async function setEngineerComment(comment: string, id: string) {
  try {
    await prisma.maintenanceLog.update({
      where: {
        id,
      },
      data: {
        comment,
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating project:", error);
    return false;
  }
}

// new actions
export async function createProject(formData: FormData) {
  try {
    const equipmentId = formData.get("equipmentId") as string;
    const hours = Number(formData.get("hours") as string);
    const description = formData.get("description") as string;
    const timeSheetId = Number(formData.get("timecardId") as string);

    // User Only needs to provide equipmentId and timeSheetId
    if (!equipmentId || !timeSheetId) {
      throw new Error("All fields are required.");
    }

    await prisma.mechanicProjects.create({
      data: {
        timeSheetId,
        equipmentId,
        hours: hours || 0,
        description: description || "",
      },
    });

    return true;
  } catch (error) {
    console.error("Error creating project:", error);
    return false;
  }
}

export async function updateProject(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const equipmentId = formData.get("equipmentId") as string;
    const hours = Number(formData.get("hours") as string);
    const description = formData.get("description") as string;

    const updateData: {
      equipmentId?: string;
      hours?: number;
      description?: string;
      timeSheetId?: number;
    } = {};

    if (equipmentId) updateData.equipmentId = equipmentId;
    if (hours) updateData.hours = hours;
    if (description) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      throw new Error("No fields to update.");
    }

    await prisma.mechanicProjects.update({
      where: { id: Number(id) },
      data: updateData,
    });

    revalidatePath("/dashboard/mechanic");

    return true;
  } catch (error) {
    console.error("Error updating project:", error);
    return false;
  }
}

export async function deleteProject(projectId: number) {
  try {
    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    await prisma.mechanicProjects.delete({
      where: { id: projectId },
    });

    revalidatePath("/dashboard/mechanic");

    return true;
  } catch (error) {
    console.error("Error updating project:", error);
    return false;
  }
}
