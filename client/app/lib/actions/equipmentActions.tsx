"use server";
import prisma from "@/lib/prisma";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import {
  EquipmentTags,
  EquipmentState,
} from "../../prisma/generated/prisma/client";
import { auth } from "@/auth";
import { OwnershipType } from "../../prisma/generated/prisma";

export async function equipmentTagExists(id: string) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: {
        id: id,
      },
    });
    return equipment;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error checking if equipment exists:", error);
    throw error;
  }
}

// Create equipment
export async function createEquipment(formData: FormData) {
  try {
    const ownershipType = formData.get("ownershipType") as OwnershipType;
    const createdById = formData.get("createdById") as string;
    const equipmentTag = formData.get("equipmentTag") as EquipmentTags;
    const name = formData.get("temporaryEquipmentName") as string;
    const creationReason = formData.get("creationReasoning") as string;
    const destination = formData.get("destination") as string;
    const qrId = formData.get("eqCode") as string;
    const description = "";

    // Validate required fields before starting transaction
    if (!equipmentTag) {
      throw new Error("Please select an equipment tag.");
    }

    const result = await prisma.$transaction(async (prisma) => {
      const newEquipment = await prisma.equipment.create({
        data: {
          qrId,
          name,
          status: "ACTIVE",
          description,
          creationReason,
          equipmentTag,
          createdById,
          ownershipType,
        },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (destination) {
        await prisma.equipmentHauled.create({
          data: {
            equipmentId: newEquipment.id,
            destination,
          },
        });
      }

      return newEquipment;
    });

    revalidatePath("/dashboard/qr-generator");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating equipment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function CreateEmployeeEquipmentLog(formData: FormData) {
  console.log("Creating Employee Equipment Log with formData:", formData);
  try {
    const equipmentId = formData.get("equipmentId") as string;
    console.log("Looking for equipment with ID:", equipmentId);

    // Try to determine if this is a QR ID or database ID
    // QR IDs are typically formatted like "EQ-XXXXXX" or just the UUID from QR scanning
    // Database IDs are UUIDs from the selector
    let equipmentExists;

    // First try to find by database ID (for manual selection)
    equipmentExists = await prisma.equipment.findFirst({
      where: {
        id: equipmentId,
        status: "ACTIVE",
      },
    });

    // If not found, try to find by QR ID (for QR scanning)
    if (!equipmentExists) {
      equipmentExists = await prisma.equipment.findFirst({
        where: {
          qrId: equipmentId,
          status: "ACTIVE",
        },
      });
    }

    console.log("Equipment found:", equipmentExists ? "Yes" : "No");

    // If still not found, check if equipment exists but is archived
    if (!equipmentExists) {
      const equipmentAnyStatus = await prisma.equipment.findFirst({
        where: {
          OR: [{ id: equipmentId }, { qrId: equipmentId }],
        },
        select: { status: true, id: true, qrId: true },
      });

      console.log("Equipment with any status:", equipmentAnyStatus);

      if (equipmentAnyStatus) {
        throw new Error(
          `Equipment with ID ${equipmentId} is ${equipmentAnyStatus.status.toLowerCase()}. Please scan an active equipment QR code.`,
        );
      } else {
        throw new Error(
          `Equipment with ID ${equipmentId} not found. Please scan a valid equipment QR code.`,
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get timesheet ID from form data
      const timeSheetId = formData.get("timeSheetId") as string | null;

      if (!timeSheetId) {
        throw new Error(
          "TimeSheet ID is required. Make sure you're properly clocked in.",
        );
      }

      // Validate that the timesheet exists and is still open
      const timeSheet = await tx.timeSheet.findUnique({
        where: {
          id: parseInt(timeSheetId, 10),
        },
        select: { id: true, workType: true, endTime: true },
      });

      if (!timeSheet) {
        throw new Error("Invalid timesheet ID. Please clock in again.");
      }

      if (timeSheet.endTime) {
        throw new Error(
          "This timesheet has been closed. Please clock in again before logging equipment.",
        );
      }

      const newLog = await tx.employeeEquipmentLog.create({
        data: {
          equipmentId: equipmentExists.id, // Use the database ID from the found equipment
          timeSheetId: timeSheet.id,
          startTime: new Date().toISOString(),
          endTime: formData.get("endTime")
            ? new Date(formData.get("endTime") as string)
            : null,
          comment: formData.get("comment") as string,
        },
      });

      return newLog;
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating employee equipment log:", error);
      throw new Error(
        `Failed to create employee equipment log: ${error.message}`,
      );
    } else {
      throw error;
    }
  }
}

export async function deleteEmployeeEquipmentLog(id: string) {
  try {
    await prisma.employeeEquipmentLog.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting employee equipment log:", error);
    throw error;
  }
}

export async function deleteMaintenanceInEquipment(id: string) {
  try {
    // Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (prisma) => {
      // Delete the maintenance record if it exists
      await prisma.maintenance.delete({
        where: { id },
      });
    });
  } catch (error) {
    console.error("Error deleting maintenance:", error);
    throw error; // Re-throw to handle in calling function
  }
}

export async function updateEmployeeEquipmentLog(formData: FormData) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized user");
    }

    const result = await prisma.$transaction(async (prisma) => {
      const id = formData.get("id") as string;
      const equipmentId = formData.get("equipmentId") as string;
      const startTime = formData.get("startTime") as string;
      const endTime = formData.get("endTime") as string;
      const comment = formData.get("comment") as string;
      const status = formData.get("Equipment.status") as EquipmentState;

      // Refuel log fields - handle null values with special "__NULL__" marker
      const disconnectRefuelLog =
        formData.get("disconnectRefuelLog") === "true";
      const refuelLogId = formData.get("refuelLogId") as string | null;
      const gallonsRefueledStr = formData.get("gallonsRefueled") as
        | string
        | null;

      const actualRefuelLogId = refuelLogId === "__NULL__" ? null : refuelLogId;
      const actualGallonsStr =
        gallonsRefueledStr === "__NULL__" ? null : gallonsRefueledStr;
      const gallonsRefueled = actualGallonsStr
        ? Number(actualGallonsStr)
        : null;

      // Prepare RefuelLog data based on form values
      let refuelLogUpdate = {};

      if (disconnectRefuelLog) {
        // Explicitly disconnect refuel log when requested
        refuelLogUpdate = {
          disconnect: true,
        };
      } else if (gallonsRefueled && actualRefuelLogId) {
        // Update existing refuel log
        refuelLogUpdate = {
          update: {
            where: { id: actualRefuelLogId },
            data: { gallonsRefueled },
          },
        };
      } else if (gallonsRefueled) {
        // Create new refuel log
        refuelLogUpdate = {
          create: {
            gallonsRefueled,
          },
        };
      }

      // --- UPDATE EMPLOYEE EQUIPMENT LOG (including maintenanceId if present) ---
      const log = await prisma.employeeEquipmentLog.update({
        where: { id },
        data: {
          startTime,
          endTime: endTime ? endTime : new Date().toISOString(),
          comment,
          ...(Object.keys(refuelLogUpdate).length > 0
            ? { RefuelLog: refuelLogUpdate }
            : {}),
        },
        include: {
          Equipment: true,
          TimeSheet: {
            include: {
              User: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });

      // Update equipment status
      if (status) {
        await prisma.equipment.update({
          where: { id: equipmentId },
          data: {
            state: status,
          },
        });
      }

      // Prepare data for send-multicast
      const resultData = {
        name: log.Equipment?.name || null,
        id: log.Equipment?.id || null,
        createdBy: `${log.TimeSheet?.User.firstName} ${log.TimeSheet?.User.lastName}`,
      };

      revalidatePath(`/dashboard/equipment/${id}`);
      revalidatePath("/dashboard/equipment");
      return resultData;
    });
    return {
      success: true,
      message: "Equipment log updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error updating employee equipment log:", error);
    throw new Error(`Failed to update employee equipment log: ${error}`);
  }
}
