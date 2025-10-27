"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  ApprovalStatus,
  LoadType,
  WorkType,
  materialUnit,
} from "../../prisma/generated/prisma/client";
import { TimesheetData } from "@/app/(routes)/admins/timesheets/_components/Edit/types";
import { Prisma, TimeSheet } from "../../prisma/generated/prisma";
import { auth } from "@/auth";

export type TimesheetSubmission = {
  form: {
    date: Date;
    user: { id: string; firstName: string; lastName: string };
    jobsite: { id: string; name: string };
    costcode: { id: string; name: string };
    startTime: string | null;
    endTime: string | null;
    workType: string;
    comments: string;
  };
  mechanicProjects: Array<{
    id: number;
    equipmentId: string;
    hours: number;
    description: string;
  }>;
  truckingLogs: Array<{
    equipmentId: string;
    truckNumber: string; // This is actually the truck equipment ID
    startingMileage: string;
    endingMileage: string;
    equipmentHauled: Array<{
      equipment: { id: string; name: string };
      source: string | null;
      destination: string | null;
      startMileage: string | null;
      endMileage: string | null;
    }>;
    materials: Array<{
      location: string;
      name: string;
      // materialWeight: string;
      quantity: string;
      unit: string;
      loadType: "screened" | "unscreened" | "";
    }>;
    refuelLogs: Array<{
      gallonsRefueled: string;
      milesAtFueling: string;
    }>;
    stateMileages: Array<{
      state: string;
      stateLineMileage: string;
    }>;
  }>;
  tascoLogs: Array<{
    shiftType: "ABCD Shift" | "E Shift" | "F Shift" | "";
    laborType: "Equipment Operator" | "Labor" | "";
    materialType: string;
    loadsHauled: string;
    refuelLogs: Array<{ gallonsRefueled: string }>;
    equipment: Array<{ id: string; name: string }>;
  }>;
  laborLogs: Array<{
    equipment: { id: string; name: string };
    startTime: string;
    endTime: string;
  }>;
};

export async function adminCreateTimesheet(data: TimesheetSubmission) {
  await prisma.$transaction(async (tx) => {
    // Create the main timesheet

    // Use startTime and endTime as ISO strings (or null)
    const timesheetData: Prisma.TimeSheetCreateInput = {
      date: data.form.date.toISOString(),
      User: { connect: { id: data.form.user.id } },
      Jobsite: { connect: { id: data.form.jobsite.id } },
      CostCode: { connect: { name: data.form.costcode.name } },
      workType: data.form.workType as WorkType,
      createdByAdmin: true,
      status: "APPROVED" as ApprovalStatus,
      startTime: data.form.startTime
        ? new Date(data.form.startTime)
        : new Date(),
      endTime: data.form.endTime ? new Date(data.form.endTime) : new Date(),
      comment: data.form.comments,
    };
    const timesheet = await tx.timeSheet.create({
      data: timesheetData,
    });

    // Mechanic Projects
    for (const project of data.mechanicProjects) {
      if (!project.equipmentId || project.hours === null) continue;
      await tx.mechanicProjects.create({
        data: {
          timeSheetId: timesheet.id,
          equipmentId: project.equipmentId,
          hours: project.hours,
          description: project.description || null,
        },
      });
    }

    // Trucking Logs
    for (const tlog of data.truckingLogs) {
      if (!tlog.truckNumber || !tlog.equipmentId) continue; // Check both fields
      const truckingLog = await tx.truckingLog.create({
        data: {
          timeSheetId: timesheet.id,
          laborType: "truckDriver",
          equipmentId: tlog.equipmentId, // Equipment being hauled
          truckNumber: tlog.truckNumber, // Truck equipment ID (foreign key)
          startingMileage: tlog.startingMileage
            ? parseInt(tlog.startingMileage)
            : null,
          endingMileage: tlog.endingMileage
            ? parseInt(tlog.endingMileage)
            : null,
        },
      });
      // Equipment Hauled
      for (const eq of tlog.equipmentHauled) {
        if (!eq.equipment.id) continue;
        await tx.equipmentHauled.create({
          data: {
            truckingLogId: truckingLog.id,
            equipmentId: eq.equipment.id,
            source: eq.source ?? "",
            destination: eq.destination ?? "",
            startMileage: eq.startMileage ? parseInt(eq.startMileage) : null,
            endMileage: eq.endMileage ? parseInt(eq.endMileage) : null,
          },
        });
      }
      // Materials
      for (const mat of tlog.materials) {
        await tx.material.create({
          data: {
            truckingLogId: truckingLog.id,
            LocationOfMaterial: mat.location,
            name: mat.name,
            // materialWeight: mat.materialWeight
            //   ? parseFloat(mat.materialWeight)
            //   : null,
            quantity: mat.quantity ? parseFloat(mat.quantity) : null,
            unit: mat.unit ? (mat.unit as materialUnit) : null,
            loadType: mat.loadType
              ? (mat.loadType.toUpperCase() as LoadType)
              : undefined,
          },
        });
      }
      // Refuel Logs
      for (const ref of tlog.refuelLogs) {
        await tx.refuelLog.create({
          data: {
            truckingLogId: truckingLog.id,
            gallonsRefueled: ref.gallonsRefueled
              ? parseFloat(ref.gallonsRefueled)
              : undefined,
            milesAtFueling: ref.milesAtFueling
              ? parseInt(ref.milesAtFueling)
              : undefined,
          },
        });
      }
      // State Mileages
      for (const sm of tlog.stateMileages) {
        await tx.stateMileage.create({
          data: {
            truckingLogId: truckingLog.id,
            state: sm.state,
            stateLineMileage: sm.stateLineMileage
              ? parseInt(sm.stateLineMileage)
              : null,
          },
        });
      }
    }

    // Tasco Logs
    for (const tlog of data.tascoLogs) {
      if (!tlog.shiftType) continue;
      const tascoLog = await tx.tascoLog.create({
        data: {
          timeSheetId: timesheet.id,
          shiftType: tlog.shiftType,
          laborType: tlog.laborType,
          materialType: tlog.materialType,
          LoadQuantity: tlog.loadsHauled ? parseInt(tlog.loadsHauled) : 0,
          equipmentId:
            tlog.equipment && tlog.equipment.length > 0
              ? tlog.equipment[0].id
              : undefined,
        },
      });
      // Refuel Logs for Tasco
      for (const ref of tlog.refuelLogs) {
        await tx.refuelLog.create({
          data: {
            tascoLogId: tascoLog.id,
            gallonsRefueled: ref.gallonsRefueled
              ? parseFloat(ref.gallonsRefueled)
              : undefined,
          },
        });
      }
    }

    // Helper to combine date and hh:mm string into a Date object
    const combineDateAndTime = (date: Date, time: string) => {
      if (!date || !time) return undefined;
      const [hours, minutes] = time.split(":").map(Number);
      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);
      return result;
    };

    // Labor Logs (EmployeeEquipmentLog)
    for (const log of data.laborLogs) {
      const date = data.form.date;

      if (!log.equipment.id) continue;
      await tx.employeeEquipmentLog.create({
        data: {
          equipmentId: log.equipment.id,
          ...(log.startTime
            ? { startTime: combineDateAndTime(date, log.startTime) }
            : {}),
          ...(log.endTime
            ? { endTime: combineDateAndTime(date, log.endTime) }
            : {}),
          timeSheetId: timesheet.id,
        },
      });
    }
  });
  revalidatePath("/admins/records/timesheets");
  revalidateTag("timesheets");
}

export async function adminDeleteTimesheet(id: number) {
  try {
    await prisma.timeSheet.delete({
      where: { id },
    });
    revalidateTag("timesheets");
    return true;
  } catch (error) {
    console.error(`Error deleting timesheet with ID ${id}:`, error);
    throw error;
  }
}

export async function adminUpdateTimesheetStatus(
  id: number,
  status: "APPROVED" | "REJECTED",
  changes: Record<
    string,
    {
      old: unknown;
      new: unknown;
    }
  >,
) {
  try {
    const session = await auth();
    const changedBy = session?.user?.id;

    if (!changedBy) {
      throw new Error("User not authenticated");
    }

    await prisma.$transaction(async (tx) => {
      const notifications = await tx.notification.findMany({
        where: {
          topic: "timecard-submission",
          referenceId: id.toString(),
          Response: {
            is: null,
          },
        },
      });
      if (notifications.length > 0) {
        // Use Promise.all with upsert to handle potential duplicate read records
        await Promise.all(
          notifications.map((notification) =>
            tx.notificationRead.upsert({
              where: {
                notificationId_userId: {
                  notificationId: notification.id,
                  userId: changedBy,
                },
              },
              create: {
                notificationId: notification.id,
                userId: changedBy,
              },
              update: {}, // Nothing to update if it already exists
            }),
          ),
        );
        await tx.notificationResponse.createMany({
          data: notifications.map((notification) => ({
            notificationId: notification.id,
            userId: changedBy,
            response: "Approved",
            respondedAt: new Date(),
          })),
        });
      }

      await tx.timeSheet.update({
        where: { id },
        data: {
          status: status as ApprovalStatus,
          ChangeLogs: {
            create: {
              changeReason: `Timesheet ${status === "APPROVED" ? "approved" : "denied"} on dashboard.`,
              changes: changes as Prisma.InputJsonValue, // Convert the changes object to a JSON string,
              changedBy,
              changedAt: new Date(),
              numberOfChanges: 1,
              wasStatusChange: true,
            },
          },
        },
      });
    });
    revalidateTag("notifications");
    revalidateTag("timesheets");
    return { success: true };
  } catch (error) {
    console.error(`Error deleting timesheet with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Updates a timesheet and all attached logs and connections.
 * Replaces all logs for the timesheet with the new data from the form.
 * @param formData FormData containing 'id' and 'data' (JSON string of TimesheetData)
 */

/**
 * Updates a timesheet and all attached logs and connections.
 * Replaces all logs for the timesheet with the new data from the form.
 * @param formData FormData containing 'id' and 'data' (JSON string of TimesheetData)
 */
export async function adminUpdateTimesheet(formData: FormData) {
  const id = Number(formData.get("id"));
  const dataJson = formData.get("data") as string;
  const editorId = formData.get("editorId") as string;
  const changesJson = formData.get("changes") as string;
  const changeReason = formData.get("changeReason") as string;
  const wasStatusChanged = formData.get("wasStatusChanged") === "true";
  const numberOfChanges = Number(formData.get("numberOfChanges")) || 0;

  if (!id || !dataJson) {
    throw new Error("Timesheet ID and data are required for update.");
  }

  if (!editorId) {
    throw new Error("Editor ID is required for tracking changes.");
  }

  const fetchedEditor = await prisma.user.findUnique({
    where: { id: editorId },
    select: { firstName: true, lastName: true },
  });

  if (!fetchedEditor) {
    throw new Error("You are not permitted to edit");
  }

  const editorFullName = `${fetchedEditor.firstName} ${fetchedEditor.lastName}`;

  const timesheet = await prisma.timeSheet.findUnique({
    where: { id },
    select: {
      User: { select: { firstName: true, lastName: true } },
    },
  });

  if (!timesheet) {
    throw new Error("Timesheet not found");
  }

  const userFullname = `${timesheet.User.firstName} ${timesheet.User.lastName}`;

  // Parse the changes and data
  const changes = changesJson ? JSON.parse(changesJson) : {};
  const data: TimesheetData = JSON.parse(dataJson);

  await prisma.$transaction(async (tx) => {
    // check to see if there is a notification for this timesheet
    const notifications = await tx.notification.findMany({
      where: {
        topic: "timecard-submission",
        referenceId: id.toString(),
        Response: {
          is: null,
        },
      },
    });

    if (notifications.length > 0) {
      // If there are notifications, mark them as read for the editor
      await tx.notificationRead.createMany({
        data: notifications.map((n) => ({
          notificationId: n.id,
          userId: editorId,
          readAt: new Date(),
        })),
      });
      // Add a response
      await tx.notificationResponse.createMany({
        data: notifications.map((n) => ({
          notificationId: n.id,
          userId: editorId,
          response: "Approved",
          respondedAt: new Date(),
        })),
      });
    }

    // First, record the changes if there are any
    if (Object.keys(changes).length > 0) {
      await tx.timeSheetChangeLog.create({
        data: {
          timeSheetId: id,
          changedBy: editorId,
          changes: changes,
          changeReason: changeReason || "No reason provided",
          wasStatusChange: wasStatusChanged,
          numberOfChanges: numberOfChanges,
        },
      });
    }

    // Then update main timesheet fields
    await tx.timeSheet.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        comment: data.comment ?? undefined,
        workType: data.workType as WorkType,
        status: data.status as ApprovalStatus,
        Jobsite: data.Jobsite?.id
          ? { connect: { id: data.Jobsite.id } }
          : undefined,
        CostCode: data.CostCode?.name
          ? { connect: { name: data.CostCode.name } }
          : undefined,
        User: data.User?.id ? { connect: { id: data.User.id } } : undefined,
      },
    });

    // Delete all existing logs
    await Promise.all([
      //remove maintenance logs for after first test to clear them in db.
      tx.maintenanceLog.deleteMany({ where: { timeSheetId: id } }),
      tx.mechanicProjects.deleteMany({ where: { timeSheetId: id } }),
      tx.truckingLog.deleteMany({ where: { timeSheetId: id } }),
      tx.tascoLog.deleteMany({ where: { timeSheetId: id } }),
      tx.employeeEquipmentLog.deleteMany({ where: { timeSheetId: id } }),
    ]);

    // Maintenance Logs
    for (const log of data.Maintenance || []) {
      if (!log) continue;
      await tx.mechanicProjects.create({
        data: {
          id: log.id,
          timeSheetId: id,
          equipmentId: log.equipmentId,
          hours: log.hours,
          description: log.description,
        },
      });
    }

    // Trucking Logs
    for (const tlog of data.TruckingLogs || []) {
      const truckingLog = await tx.truckingLog.create({
        data: {
          timeSheetId: id,
          truckNumber: tlog.truckNumber,
          trailerNumber: tlog.trailerNumber ?? undefined,
          startingMileage: tlog.startingMileage
            ? Number(tlog.startingMileage)
            : null,
          endingMileage: tlog.endingMileage ? Number(tlog.endingMileage) : null,
          laborType: "truckDriver",
        },
      });
      // Equipment Hauled
      for (const eq of tlog.EquipmentHauled || []) {
        if (!eq.equipmentId) continue;
        await tx.equipmentHauled.create({
          data: {
            truckingLogId: truckingLog.id,
            equipmentId: eq.equipmentId,
            source: eq.source ?? "",
            destination: eq.destination ?? "",
            startMileage: eq.startMileage ? Number(eq.startMileage) : null,
            endMileage: eq.endMileage ? Number(eq.endMileage) : null,
          },
        });
      }
      // Materials
      for (const mat of tlog.Materials || []) {
        await tx.material.create({
          data: {
            truckingLogId: truckingLog.id,
            LocationOfMaterial: mat.LocationOfMaterial ?? "",
            name: mat.name,
            quantity: mat.quantity ? Number(mat.quantity) : null,
            unit: mat.unit ? (mat.unit as materialUnit) : null,
            loadType: mat.loadType
              ? (mat.loadType.toUpperCase() as LoadType)
              : undefined,
          },
        });
      }
      // Refuel Logs
      for (const ref of tlog.RefuelLogs || []) {
        await tx.refuelLog.create({
          data: {
            truckingLogId: truckingLog.id,
            gallonsRefueled: ref.gallonsRefueled
              ? Number(ref.gallonsRefueled)
              : undefined,
            milesAtFueling: ref.milesAtFueling
              ? Number(ref.milesAtFueling)
              : undefined,
          },
        });
      }
      // State Mileages
      for (const sm of tlog.StateMileages || []) {
        await tx.stateMileage.create({
          data: {
            truckingLogId: truckingLog.id,
            state: sm.state,
            stateLineMileage: sm.stateLineMileage
              ? Number(sm.stateLineMileage)
              : null,
          },
        });
      }
    }

    // Tasco Logs
    for (const tlog of data.TascoLogs || []) {
      if (!tlog.shiftType) continue;
      const tascoLog = await tx.tascoLog.create({
        data: {
          timeSheetId: id,
          shiftType: tlog.shiftType,
          laborType: tlog.laborType,
          materialType: tlog.materialType,
          LoadQuantity: tlog.LoadQuantity ? Number(tlog.LoadQuantity) : 0,
          equipmentId: tlog.Equipment?.id ?? undefined,
        },
      });
      // Refuel Logs for Tasco
      for (const ref of tlog.RefuelLogs || []) {
        await tx.refuelLog.create({
          data: {
            tascoLogId: tascoLog.id,
            gallonsRefueled: ref.gallonsRefueled
              ? Number(ref.gallonsRefueled)
              : undefined,
          },
        });
      }
    }

    // Employee Equipment Logs
    for (const log of data.EmployeeEquipmentLogs || []) {
      if (!log.equipmentId) continue;
      await tx.employeeEquipmentLog.create({
        data: {
          equipmentId: log.equipmentId,
          startTime: log.startTime ?? undefined,
          endTime: log.endTime ?? undefined,
          timeSheetId: id,
        },
      });
    }
  });

  const onlyStatusUpdated = wasStatusChanged && numberOfChanges === 1;

  revalidatePath("/admins/records/timesheets");
  revalidateTag("timesheets");
  return {
    success: true,
    editorFullName,
    userFullname,
    onlyStatusUpdated,
  };
}

export async function adminSetNotificationToRead(
  userId: string,
  timesheetId: number,
  response: string = "READ",
) {
  try {
    if (!userId || !response) {
      throw new Error("Notification ID, User ID, and Response are required.");
    }

    const notifications = await prisma.notification.findMany({
      where: {
        topic: "timecards-changes",
        referenceId: timesheetId.toString(),
        Response: {
          is: null,
        },
      },
    });

    if (notifications.length === 0) {
      return { success: false, message: "No notifications found" };
    }

    // Use a transaction to update all found notifications
    await prisma.$transaction(async (tx) => {
      for (const notification of notifications) {
        const notificationId = notification.id;
        await tx.notificationRead.upsert({
          where: {
            notificationId_userId: {
              notificationId,
              userId,
            },
          },
          update: {
            readAt: new Date(),
          },
          create: {
            notificationId,
            userId,
            readAt: new Date(),
          },
        });

        await tx.notificationResponse.upsert({
          where: { notificationId },
          update: {
            response,
            respondedAt: new Date(),
          },
          create: {
            notificationId,
            userId,
            response,
            respondedAt: new Date(),
          },
        });
      }
    });

    revalidateTag("notifications");
    return { success: true };
  } catch (error) {
    console.error(`Error setting notification(s) to read:`, error);
    return { success: false };
  }
}

// Define types for equipment logs to avoid using 'any'
type EquipmentLog = {
  id: string;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  Equipment?: {
    code?: string | null;
    name?: string | null;
  } | null;
};

// Helper function to calculate equipment usage time in hours
function calculateEquipmentUsage(
  logs: EquipmentLog[] | null | undefined,
): string {
  if (!Array.isArray(logs) || logs.length === 0) {
    return "0.0";
  }

  let totalMs = 0;

  // Calculate usage from EmployeeEquipmentLogs
  if (Array.isArray(logs)) {
    logs.forEach((log) => {
      if (log && log.startTime && log.endTime) {
        try {
          const start = new Date(log.startTime).getTime();
          const end = new Date(log.endTime).getTime();
          if (!isNaN(start) && !isNaN(end) && end > start) {
            totalMs += end - start;
          }
        } catch (error) {
          console.error("Error calculating equipment usage:", error);
        }
      }
    });
  }

  if (totalMs <= 0) return "0.0";
  const hours = totalMs / (1000 * 60 * 60);
  return hours.toFixed(1);
}

// Define a type for the timesheet data returned by the database query
type TimesheetExportData = {
  id: number;
  date: Date | string;
  User?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  Jobsite?: {
    id: string;
    code: string | null;
  } | null;
  CostCode?: {
    id: string;
    code: string | null;
  } | null;
  nu?: string | null;
  Fp?: string | null;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  comment?: string | null;
  EmployeeEquipmentLogs?: Array<{
    id: string;
    startTime?: Date | string | null;
    endTime?: Date | string | null;
    Equipment?: {
      code?: string | null;
      name?: string | null;
    } | null;
  }> | null;
  TruckingLogs?: Array<{
    Truck?: { name?: string | null } | null;
    truckNumber?: string | null;
    startingMileage?: number | null;
    endingMileage?: number | null;
    RefuelLogs?: Array<{
      milesAtFueling?: number | null;
    }> | null;
  }> | null;
  TascoLogs?: Array<{
    shiftType: string;
    LoadQuantity?: number | null;
    Equipment?: {
      code?: string | null;
    } | null;
  }> | null;
};

export async function adminExportTimesheets(
  dateRange?: { from?: Date; to?: Date },
  selectedFields?: string[],
  selectedUsers?: string[],
  selectedCrew?: string[],
  selectedProfitCenters?: string[],
  filterByUser?: boolean,
) {
  try {
    if (!dateRange) {
      throw new Error("Date range is required for exporting timesheets.");
    }
    if (!selectedFields || selectedFields.length === 0) {
      throw new Error("Selected fields are required for exporting timesheets.");
    }
    // Build where clause
    const whereClause: Prisma.TimeSheetWhereInput = {
      status: "APPROVED",
    };
    if (dateRange?.from || dateRange?.to) {
      whereClause.startTime = {};
      if (dateRange.from) {
        // Set to beginning of the day for the from date
        whereClause.startTime.gte = dateRange.from;
      }
      if (dateRange.to) {
        // Set to end of the day for the to date
        whereClause.startTime.lte = dateRange.to;
      }
    }
    if (selectedUsers && selectedUsers.length > 0) {
      whereClause.userId = { in: selectedUsers };
    }
    if (selectedCrew && selectedCrew.length > 0) {
      whereClause.User = {
        Crews: {
          some: {
            id: { in: selectedCrew },
          },
        },
      };
    }
    if (selectedProfitCenters && selectedProfitCenters.length > 0) {
      whereClause.Jobsite = {
        code: { in: selectedProfitCenters },
      };
    }
    // Build dynamic orderBy
    let orderBy:
      | Prisma.TimeSheetOrderByWithRelationInput
      | Prisma.TimeSheetOrderByWithRelationInput[] = { startTime: "desc" };
    if (filterByUser) {
      // Correct Prisma syntax: array of orderBy objects
      orderBy = [{ User: { lastName: "asc" } }, { startTime: "desc" }];
    }

    // perform query
    const timesheets = await prisma.timeSheet.findMany({
      where: { ...whereClause },
      select: {
        id: true,
        date: true,
        User: {
          select: { id: true, firstName: true, lastName: true },
        },
        Jobsite: {
          select: { id: true, code: true },
        },
        CostCode: {
          select: { id: true, code: true },
        },
        nu: true,
        Fp: true,
        startTime: true,
        endTime: true,
        comment: true,
        EmployeeEquipmentLogs: {
          select: {
            id: true,
            Equipment: {
              select: { code: true },
            },
            startTime: true,
            endTime: true,
          },
        },
        TruckingLogs: {
          select: {
            Truck: { select: { name: true } },
            startingMileage: true,
            endingMileage: true,
            RefuelLogs: { select: { milesAtFueling: true } },
          },
        },
        TascoLogs: {
          select: {
            shiftType: true,
            LoadQuantity: true,
            Equipment: { select: { code: true } },
          },
        },
      },
      orderBy,
    });

    // advanced sorting
    let result: TimesheetExportData[] = [];
    if (filterByUser) {
      // Group by user id (ensure User is an object, not array)
      const grouped: Record<string, TimesheetExportData[]> = {};
      timesheets.forEach((ts) => {
        const userId = ts.User?.id;
        if (!userId) return;
        if (!grouped[userId]) {
          grouped[userId] = [];
        }
        grouped[userId].push(ts);
      });

      // Sort user groups by last name
      const userGroups = Object.values(grouped).sort((a, b) => {
        const aName = a[0]?.User?.lastName?.toLowerCase() || "";
        const bName = b[0]?.User?.lastName?.toLowerCase() || "";
        return aName.localeCompare(bName);
      });

      // For each user group, sort by date descending and push to result
      userGroups.forEach((group) => {
        // Sort each user's timesheets by start time descending
        const sortedUserTimesheets = group.sort((a, b) => {
          const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
          const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
          return dateB - dateA; // descending order
        });

        // Add all sorted timesheets to the result
        sortedUserTimesheets.forEach((ts) => result.push(ts));
      });
    } else {
      // Just sort by start time descending
      result = timesheets.sort((a, b) => {
        const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return dateB - dateA; // descending order
      });
    }

    // Return only selected fields
    // Define a type for the field mapping to ensure type safety
    type FieldMapping = Record<
      string,
      string | number | Date | null | undefined
    >;

    return result.map((ts) => {
      // Create a mapping between field keys and actual data
      const fieldMapping: FieldMapping = {
        Id: ts.id,
        Date: ts.startTime,
        Employee: ts.User ? `${ts.User.firstName} ${ts.User.lastName}` : "",
        Jobsite: ts.Jobsite ? ts.Jobsite.code : "",
        CostCode: ts.CostCode ? ts.CostCode.code : "",
        NU: ts.nu,
        FP: ts.Fp,
        Start: ts.startTime,
        End: ts.endTime,
        Duration:
          ts.startTime && ts.endTime
            ? (new Date(ts.endTime).getTime() -
                new Date(ts.startTime).getTime()) /
              (1000 * 60 * 60)
            : null,
        Comment: ts.comment,
        EquipmentId:
          [
            // Get equipment codes from EmployeeEquipmentLogs
            ...(ts.EmployeeEquipmentLogs?.map((log) => log.Equipment?.code) ||
              []),
            // Get equipment codes from TascoLogs
            ...(ts.TascoLogs?.map((log) => log.Equipment?.code) || []),
          ]
            .filter(Boolean) // Remove any undefined or null values
            .join(", ") || "", // Join with comma separator
        EquipmentUsage: calculateEquipmentUsage(ts.EmployeeEquipmentLogs),
        TruckNumber: ts.TruckingLogs?.[0]?.Truck?.name || "",
        TruckStartingMileage: ts.TruckingLogs?.[0]?.startingMileage,
        TruckEndingMileage: ts.TruckingLogs?.[0]?.endingMileage,
        MilesAtFueling: ts.TruckingLogs?.[0]?.RefuelLogs?.[0]?.milesAtFueling,
        TascoABCDELoads:
          ts.TascoLogs?.filter(
            (log) =>
              log.shiftType === "ABCD Shift" || log.shiftType === "E Shift",
          )
            .map((log) => log.LoadQuantity)
            .filter(Boolean)
            .join(", ") || "",
        TascoFLoads:
          ts.TascoLogs?.filter((log) => log.shiftType === "F Shift")
            .map((log) => log.LoadQuantity)
            .filter(Boolean)
            .join(", ") || "",
      };

      // Return only the selected fields
      const filtered: FieldMapping & {
        _raw?: { User?: typeof ts.User; date?: typeof ts.date };
      } = {};
      selectedFields.forEach((field) => {
        if (fieldMapping[field] !== undefined) {
          filtered[field] = fieldMapping[field];
        }
      });

      // Always include raw data if needed for further processing
      filtered._raw = {
        User: ts.User,
        date: ts.date,
      };

      return filtered;
    });
  } catch (error) {
    console.error("Error exporting timesheets:", error);
    throw error;
  }
}
