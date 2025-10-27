"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { materialUnit } from "../../prisma/generated/prisma/client";
import { revalidatePath } from "next/cache";
type TimesheetUpdate = {
  id: number;
  startTime?: string;
  endTime?: string | null;
  jobsiteId?: string;
  costcode?: string;
};

interface TruckingEquipmentHaulUpdate {
  id: string;
  equipmentId?: string | null;
  jobSiteId?: string | null;
  editedByUserId?: string | null;
}

export async function updateTimesheetHighlights(
  updatedTimesheets: TimesheetUpdate[],
) {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const updatePromises = updatedTimesheets.map((timesheet) =>
      prisma.timeSheet.update({
        where: { id: timesheet.id },
        data: {
          startTime: timesheet.startTime
            ? new Date(timesheet.startTime)
            : undefined,
          endTime: timesheet.endTime ? new Date(timesheet.endTime) : null,
          jobsiteId: timesheet.jobsiteId,
          costcode: timesheet.costcode,
          editedByUserId: session.user.id,
          updatedAt: new Date(),
        },
      }),
    );

    await Promise.all(updatePromises);
    // Aggressive revalidation
    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return { success: true };
  } catch (error) {
    console.error("Error updating timesheets:", error);
    throw error;
  }
}

export async function updateTruckingMileage(
  data:
    | FormData
    | Array<{
        id: string;
        TruckingLogs: Array<{
          startingMileage?: number;
          endingMileage?: number;
        }>;
      }>,
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session) {
      console.error("[SERVER] Unauthorized attempt to update mileage");
      throw new Error("Unauthorized");
    }

    // Handle both FormData and direct array input
    let mileageUpdates: Array<{
      id: string;
      TruckingLogs: Array<{ startingMileage?: number; endingMileage?: number }>;
    }>;
    if (data instanceof FormData) {
      const changesEntries = Array.from(data.entries())
        .filter(([key]) => key.startsWith("changes"))
        .map(([, value]) => value as string);
      if (changesEntries.length === 0) {
        throw new Error("No changes data found in FormData");
      }
      mileageUpdates = changesEntries.flatMap((entry) => JSON.parse(entry));
    } else {
      mileageUpdates = data;
    }

    if (!Array.isArray(mileageUpdates)) {
      throw new Error("Invalid mileage updates format");
    }

    const updatePromises = mileageUpdates.map((mileage) => {
      if (!mileage.id) {
        console.error("[SERVER] Missing ID in mileage update:", mileage);
        throw new Error(
          `Missing ID in mileage update: ${JSON.stringify(mileage)}`,
        );
      }
      // Extract startingMileage and endingMileage from the first TruckingLogs entry
      const firstLog =
        Array.isArray(mileage.TruckingLogs) && mileage.TruckingLogs.length > 0
          ? mileage.TruckingLogs[0]
          : undefined;
      const startingMileage = firstLog?.startingMileage;
      const endingMileage = firstLog?.endingMileage;
      // Validate numbers
      if (startingMileage !== undefined && isNaN(Number(startingMileage))) {
        throw new Error(`Invalid startingMileage: ${startingMileage}`);
      }
      if (endingMileage !== undefined && isNaN(Number(endingMileage))) {
        throw new Error(`Invalid endingMileage: ${endingMileage}`);
      }
      return prisma.truckingLog.update({
        where: { id: mileage.id },
        data: {
          startingMileage:
            startingMileage !== undefined ? Number(startingMileage) : undefined,
          endingMileage:
            endingMileage !== undefined ? Number(endingMileage) : undefined,
        },
      });
    });

    const results = await Promise.all(updatePromises);
    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");
    return {
      success: true,
      updatedCount: results.length,
    };
  } catch (error) {
    console.error("[SERVER] Error updating trucking mileage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateTruckingHaulLogs(
  updates: TruckingEquipmentHaulUpdate[],
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();

    if (!session) {
      console.error("[SERVER] Unauthorized attempt to update haul logs");
      return { success: false, error: "Unauthorized" };
    }

    // Validate and deduplicate updates
    const validUpdates = updates
      .filter((update) => {
        if (!update.id) {
          console.warn("[SERVER] Skipping update with missing ID:", update);
          return false;
        }
        return true;
      })
      .filter(
        (update, index, self) =>
          self.findIndex((u) => u.id === update.id) === index,
      );

    if (validUpdates.length === 0) {
      return { success: false, error: "No valid updates provided" };
    }

    const jobsite = await prisma.jobsite.findFirst({
      where: {
        qrId: validUpdates[0].jobSiteId || undefined,
      },
      select: {
        id: true,
      },
    });

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updateResults = await Promise.all(
        validUpdates.map(async (update) => {
          try {
            return await tx.equipmentHauled.update({
              where: { id: update.id },
              data: {
                equipmentId: update.equipmentId || null,
              },
            });
          } catch (error) {
            console.error(
              `[SERVER] Failed to update haul log ${update.id}:`,
              error,
            );
            throw error;
          }
        }),
      );

      return updateResults;
    });

    // Revalidate affected paths
    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("[SERVER] Error updating trucking haul logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update trucking material logs in the database.
 * @param updates - Array of material log updates, each with strict typing.
 * @returns Result object with success, updatedCount, and error (if any).
 */
export async function updateTruckingMaterialLogs(
  updates: Array<{
    id: string;
    name?: string;
    LocationOfMaterial?: string;
    materialWeight?: number | null;
    quantity?: number;
    unit?: materialUnit;
  }>,
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    // Validate updates
    const validUpdates = updates.filter(
      (update) => !!update.id && typeof update.id === "string",
    );
    if (validUpdates.length === 0) {
      return { success: false, error: "No valid updates provided" };
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = validUpdates.map((update) =>
        tx.material.update({
          where: { id: update.id },
          data: {
            name: update.name,
            LocationOfMaterial: update.LocationOfMaterial,
            materialWeight:
              update.materialWeight !== undefined
                ? update.materialWeight
                : null,
            quantity: update.quantity || 0,
            unit: (update.unit as materialUnit) || "lbs",
          },
        }),
      );
      return await Promise.all(updatePromises);
    });

    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");
    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("[SERVER] Error updating trucking material logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// For TimeCardTruckingRefuelLogs
export async function updateTruckingRefuelLogs(
  updates: {
    id: string;
    gallonsRefueled?: number | null;
    milesAtFueling?: number | null;
  }[],
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map((update) =>
        tx.refuelLog.update({
          where: { id: update.id },
          data: {
            gallonsRefueled: update.gallonsRefueled,
            milesAtFueling: update.milesAtFueling,
          },
        }),
      );

      return await Promise.all(updatePromises);
    });

    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("Error updating trucking refuel logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// For TimeCardTruckingStateMileageLogs
export async function updateTruckingStateLogs(
  updates: {
    id: string;
    state?: string;
    stateLineMileage?: number;
  }[],
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map((update) =>
        tx.stateMileage.update({
          where: { id: update.id },
          data: {
            state: update.state,
            stateLineMileage: update.stateLineMileage,
          },
        }),
      );

      return await Promise.all(updatePromises);
    });

    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("Error updating trucking state logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// For TimeCardTascoHaulLogs
export async function updateTascoHaulLogs(
  updates: {
    id: string;
    shiftType?: string;
    equipmentId?: string | null;
    materialType?: string;
    LoadQuantity?: number | null;
  }[],
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map((update) =>
        tx.tascoLog.update({
          where: { id: update.id },
          data: {
            shiftType: update.shiftType,
            equipmentId: update.equipmentId,
            materialType: update.materialType,
            LoadQuantity: update.LoadQuantity || 0,
          },
        }),
      );

      return await Promise.all(updatePromises);
    });

    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("Error updating tasco haul logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// For TimeCardTascoRefuelLogs
export async function updateTascoRefuelLogs(
  updates: {
    id: string;
    gallonsRefueled?: number | null;
  }[],
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map((update) =>
        tx.refuelLog.update({
          where: { id: update.id },
          data: {
            gallonsRefueled: update.gallonsRefueled,
          },
        }),
      );

      return await Promise.all(updatePromises);
    });

    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("Error updating tasco refuel logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// For TimeCardEquipmentLogs
export async function updateEquipmentLogs(
  updates: {
    id: string;
    startTime?: Date;
    endTime?: Date;
  }[],
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    // Validate input
    if (
      !updates.every(
        (update) =>
          update.startTime instanceof Date || update.startTime === undefined,
      )
    ) {
      throw new Error("Invalid startTime format");
    }

    if (
      !updates.every(
        (update) =>
          update.endTime instanceof Date || update.endTime === undefined,
      )
    ) {
      throw new Error("Invalid endTime format");
    }

    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map((update) =>
        tx.employeeEquipmentLog.update({
          where: { id: update.id },
          data: {
            startTime: update.startTime,
            endTime: update.endTime,
          },
        }),
      );

      return await Promise.all(updatePromises);
    });

    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("Error updating equipment logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// For TimeCardEquipmentRefuelLogs
export async function updateEquipmentRefuelLogs(
  updates: {
    id: string;
    gallonsRefueled?: number | null;
  }[],
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map((update) =>
        tx.refuelLog.update({
          where: { id: update.id },
          data: {
            gallonsRefueled: update.gallonsRefueled || 0,
          },
        }),
      );

      return await Promise.all(updatePromises);
    });

    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("Error updating equipment logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// For TimeCardMechanicLogs (MaintenanceLogs)
export async function updateMaintenanceLogs(
  updates: {
    id: string;
    startTime?: Date;
    endTime?: Date;
  }[],
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const validUpdates = updates.filter(
      (update) => update.id && (update.startTime || update.endTime),
    );

    if (validUpdates.length === 0) {
      console.warn("[SERVER] No valid maintenance logs to update");
      return {
        success: false,
        error: "No valid maintenance logs to update",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatePromises = validUpdates.map((update) => {
        const updateData: {
          startTime?: Date;
          endTime?: Date;
        } = {};

        if (update.startTime) {
          updateData.startTime = update.startTime;
        }
        if (update.endTime) {
          updateData.endTime = update.endTime;
        }

        return tx.maintenanceLog.update({
          where: { id: update.id },
          data: updateData,
        });
      });

      return await Promise.all(updatePromises);
    });

    revalidatePath("/dashboard/myTeam");
    revalidatePath("/dashboard/myTeam/[id]/employee/[employeeId]", "page");

    return {
      success: true,
      updatedCount: result.length,
    };
  } catch (error) {
    console.error("[SERVER] Error updating maintenance logs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
