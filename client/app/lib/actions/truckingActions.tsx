"use server";
import { materialUnit } from "../../prisma/generated/prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createEquipmentHauled(formData: FormData) {
  const truckingLogId = formData.get("truckingLogId") as string;

  const equipmentHauled = await prisma.equipmentHauled.create({
    data: {
      TruckingLog: {
        connect: { id: truckingLogId },
      },
    },
  });

  revalidatePath("/dashboard/truckingAssistant");
  revalidateTag("equipmentHauled");
  return equipmentHauled;
}

export async function updateEquipmentLogsLocation(formData: FormData) {
  const id = formData.get("id") as string;
  const jobSiteId = formData.get("jobSiteId") as string;
  const truckingLogId = formData.get("truckingLogId") as string;
  const name = formData.get("jobSiteName") as string;

  // First check if jobSite exists
  const jobSiteExists = await prisma.jobsite.findUnique({
    where: { qrId: jobSiteId, name },
    select: { id: true },
  });

  if (!jobSiteExists) {
    throw new Error(`Jobsite with ID ${jobSiteId} not found`);
  }

  // Use a nested update to update the related Equipment's jobsiteId in one call.
  const updatedLog = await prisma.equipmentHauled.update({
    where: { id },
    data: {
      truckingLogId,
    },
  });
  // Create EquipmentLocationLog for the updated jobSiteId
  revalidateTag("equipmentHauled");
  revalidatePath("/dashboard/truckingAssistant");
  return updatedLog;
}

export async function updateEquipmentLogs(formData: FormData) {
  const id = formData.get("id") as string;
  const truckingLogId = formData.get("truckingLogId") as string;

  // Then proceed with update, using the actual equipment's id for the relationship
  const updatedLog = await prisma.equipmentHauled.update({
    where: { id },
    data: {
      truckingLogId,
      source: formData.get("source") as string,
      destination: formData.get("destination") as string,
      startMileage:
        formData.get("startMileage") !== null &&
        formData.get("startMileage") !== ""
          ? Number(formData.get("startMileage"))
          : null,
      endMileage:
        formData.get("endMileage") !== null && formData.get("endMileage") !== ""
          ? Number(formData.get("endMileage"))
          : null,
    },
  });

  revalidateTag("equipmentHauled");
  revalidatePath("/dashboard/truckingAssistant");
  return updatedLog;
}

export async function updateEquipmentLogsEquipment(formData: FormData) {
  const id = formData.get("id") as string;
  const equipmentQrId = formData.get("equipmentId") as string;
  const truckingLogId = formData.get("truckingLogId") as string;

  // First check if equipment exists, using qrId to find it
  const equipmentExists = await prisma.equipment.findUnique({
    where: { id: equipmentQrId },
  });

  if (!equipmentExists) {
    throw new Error(`Equipment with QR ID ${equipmentQrId} not found`);
  }

  // Then proceed with update, using the actual equipment's id for the relationship
  const updatedLog = await prisma.equipmentHauled.update({
    where: { id },
    data: {
      truckingLogId,
      equipmentId: equipmentExists.id, // Use equipment's id, not qrId
    },
  });

  revalidateTag("equipmentHauled");
  revalidatePath("/dashboard/truckingAssistant");
  return updatedLog;
}

export async function deleteEquipmentHauled(id: string) {
  await prisma.equipmentHauled.delete({
    where: { id },
  });

  revalidateTag("equipmentHauled");
  return true;
}

/* MATERIALS Hauled */
//------------------------------------------------------------------
//------------------------------------------------------------------

export async function createHaulingLogs(formData: FormData) {
  const truckingLogId = formData.get("truckingLogId") as string;
  const name = formData.get("name") as string;
  const quantity = parseInt(formData.get("quantity") as string);
  const createdAt = new Date().toISOString();

  const haulingLog = await prisma.material.create({
    data: {
      truckingLogId,
      name,
      quantity,
      createdAt,
    },
  });

  revalidatePath("/dashboard/truckingAssistant");
  return haulingLog;
}

export async function updateHaulingLogs(formData: FormData) {
  const LoadType: {
    UNSCREENED: "UNSCREENED";
    SCREENED: "SCREENED";
  } = {
    UNSCREENED: "UNSCREENED",
    SCREENED: "SCREENED",
  };
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const LocationOfMaterial = formData.get("LocationOfMaterial") as string;
  const quantity = Number(formData.get("quantity") as string);
  const truckingLogId = formData.get("truckingLogId") as string;
  const loadTypeString = formData.get("loadType") as string;
  const unit = formData.get("unit") as materialUnit;

  let loadType = null;
  if (!loadTypeString) {
    loadType = null;
  } else if (loadTypeString === "UNSCREENED") {
    loadType = LoadType.UNSCREENED;
  } else if (loadTypeString === "SCREENED") {
    loadType = LoadType.SCREENED;
  }

  // If ID is provided, update the existing log
  if (id) {
    const updatedLog = await prisma.material.update({
      where: { id },
      data: {
        name,
        LocationOfMaterial,
        quantity,
        ...(unit && { unit }),
        loadType,
      },
    });

    return updatedLog;
  }

  // If no ID, create a new log
  const haulingLog = await prisma.material.create({
    data: {
      name,
      LocationOfMaterial,
      quantity,
      truckingLogId,
    },
  });
  revalidateTag("material");
  return haulingLog;
}

export async function deleteHaulingLogs(id: string) {
  await prisma.material.delete({
    where: { id },
  });

  revalidateTag("material");
  return true;
}

/* Update */
//------------------------------------------------------------------
//------------------------------------------------------------------

export const updateTruckingMileage = async (formData: FormData) => {
  const id = formData.get("id") as string;
  const endingMileage = parseInt(formData.get("endingMileage") as string);

  const updatedLog = await prisma.truckingLog.update({
    where: { id },
    data: {
      endingMileage,
    },
  });
  return updatedLog;
};

export const updateTruckDrivingNotes = async (formData: FormData) => {
  const TruckingId = formData.get("id") as string;
  const comment = (formData.get("comment") as string) || "";

  const updatedLog = await prisma.truckingLog.update({
    where: { id: TruckingId },
    data: {
      TimeSheet: {
        update: {
          comment,
        },
      },
    },
  });

  revalidatePath("/dashboard/truckingAssistant");
  return updatedLog;
};

export async function createStateMileage(formData: FormData) {
  const truckingLogId = formData.get("truckingLogId") as string;

  const equipmentHauled = await prisma.stateMileage.create({
    data: {
      truckingLogId,
    },
  });

  revalidatePath("/dashboard/truckingAssistant");
  revalidateTag("equipmentHauled");
  return equipmentHauled;
}

export async function updateStateMileage(formData: FormData) {
  const id = formData.get("id") as string;
  const state = formData.get("state") as string;
  const stateLineMileage = Number(formData.get("stateLineMileage")) || 0;

  // Update the state mileage in the database
  const updatedStateMileage = await prisma.stateMileage.update({
    where: { id },
    data: {
      state,
      stateLineMileage,
    },
  });

  return updatedStateMileage;
}

export async function deleteStateMileage(id: string) {
  await prisma.stateMileage.delete({
    where: { id },
  });

  return true;
}

export async function createRefuelLog(formData: FormData) {
  const truckingLogId = formData.get("truckingLogId") as string;

  const refueledLogs = await prisma.refuelLog.create({
    data: {
      truckingLogId,
    },
  });

  revalidatePath("/dashboard/truckingAssistant");
  return refueledLogs;
}

export async function createRefuelEquipmentLog(formData: FormData) {
  const employeeEquipmentLogId = formData.get(
    "employeeEquipmentLogId",
  ) as string;

  const gallonsRefueledStr = formData.get("gallonsRefueled") as string | null;
  const gallonsRefueled = gallonsRefueledStr
    ? parseFloat(gallonsRefueledStr)
    : null;

  const refueledLogs = await prisma.refuelLog.create({
    data: {
      employeeEquipmentLogId,
      gallonsRefueled,
    },
  });

  revalidatePath(`/dashboard/equipment/${employeeEquipmentLogId}`);
  revalidatePath("/dashboard/truckingAssistant");

  const { id } = refueledLogs;
  const data = { id, gallonsRefueled, employeeEquipmentLogId };
  return data;
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

export async function updateRefuelLog(formData: FormData) {
  const id = formData.get("id") as string;
  const gallonsRefueled =
    Number(formData.get("gallonsRefueled") as string) || 0;
  const milesAtFueling = Number(formData.get("milesAtfueling")) || 0;

  // Update the state mileage in the database
  const updatedStateMileage = await prisma.refuelLog.update({
    where: { id },
    data: {
      gallonsRefueled,
      milesAtFueling,
    },
  });
  revalidatePath("/dashboard/truckingAssistant");

  return updatedStateMileage;
}

export async function deleteRefuelLog(id: string) {
  await prisma.refuelLog.delete({
    where: { id },
  });

  return true;
}
