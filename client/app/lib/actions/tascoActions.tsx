"use server";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export interface UpdateRefuelLogParams extends RefuelLogBase {
  type: RefuelLogType;
}
export interface RefuelLogBase {
  id: string;
  gallonsRefueled?: number;
  milesAtfueling?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface DeleteRefuelLogParams {
  type: RefuelLogType;
  id: string;
}

export interface CreateRefuelLogParams {
  type: RefuelLogType;
  parentId: string; // tascoLogId or employeeEquipmentLogId
}

export type RefuelLogType = "tasco" | "equipment";

/* LOADS Hauled */
//------------------------------------------------------------------
//------------------------------------------------------------------

export async function SetLoad(formData: FormData) {
  const tascoLogId = formData.get("tascoLogId") as string;
  const loadCount = Number(formData.get("loadCount"));

  const tascoLog = await prisma.tascoLog.update({
    where: {
      id: tascoLogId,
    },
    data: {
      LoadQuantity: loadCount,
    },
  });
  revalidatePath("/dashboard/tasco");
  revalidateTag("load");
  return tascoLog;
}

// /* Tasco Comments */
// ------------------------------------------------------------------
// ------------------------------------------------------------------

export const updateTascoComments = async (formData: FormData) => {
  const id = formData.get("id") as string;
  const comment = formData.get("comment") as string;

  const updatedLog = await prisma.tascoLog.update({
    where: { id },
    data: {
      TimeSheet: {
        update: {
          comment,
        },
      },
    },
  });

  revalidatePath("/dashboard/tascoAssistant");
  return updatedLog;
};

// /* Tasco Refuel Logs */
// ------------------------------------------------------------------
// ------------------------------------------------------------------
/**
 * Creates a new refuel log
 */
export async function createRefuelLog(params: CreateRefuelLogParams) {
  try {
    return await prisma.$transaction(async (tx) => {
      const data = {
        ...(params.type === "tasco"
          ? { tascoLogId: params.parentId }
          : { employeeEquipmentLogId: params.parentId }),
      };

      const result = await tx.refuelLog.create({ data });
      revalidatePaths();
      return result;
    });
  } catch (error) {
    console.error(`Failed to create ${params.type} refuel log:`, error);
    throw new Error(`Failed to create ${params.type} refuel log`);
  }
}

/**
 * Updates an existing refuel log
 */
export async function updateRefuelLog(params: UpdateRefuelLogParams) {
  try {
    return await prisma.$transaction(async (tx) => {
      const data = {
        gallonsRefueled: params.gallonsRefueled,
      };

      const result = await tx.refuelLog.update({
        where: { id: params.id },
        data,
      });

      revalidatePaths();
      return result;
    });
  } catch (error) {
    console.error(`Failed to update ${params.type} refuel log:`, error);
    throw new Error(`Failed to update ${params.type} refuel log`);
  }
}

/**
 * Deletes a refuel log
 */
export async function deleteRefuelLog(params: DeleteRefuelLogParams) {
  try {
    return await prisma.$transaction(async (tx) => {
      const result = await tx.refuelLog.delete({
        where: { id: params.id },
      });

      revalidatePaths();
      return result;
    });
  } catch (error) {
    console.error(`Failed to delete ${params.type} refuel log:`, error);
    throw new Error(`Failed to delete ${params.type} refuel log`);
  }
}

/**
 * Helper function to revalidate paths and tags
 */
function revalidatePaths() {
  try {
    revalidatePath("/dashboard/tasco");
    revalidatePath("/dashboard/tascoAssistant");
    revalidateTag("load");
  } catch (error) {
    console.error("Failed to revalidate paths:", error);
  }
}
