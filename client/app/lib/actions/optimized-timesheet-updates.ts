"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { TimesheetData } from "@/app/(routes)/admins/timesheets/_components/Edit/hooks/useTimesheetData";
import {
  ApprovalStatus,
  LoadType,
  materialUnit,
  Prisma,
  WorkType,
} from "../../prisma/generated/prisma/client";

type LogRecord = {
  added: string[];
  updated: string[];
  deleted: string[];
};

/**
 * Updates a timesheet using an optimized approach that only modifies what has changed.
 * This avoids the inefficient delete-and-recreate pattern.
 * @param formData FormData containing timesheet update information
 */
export async function adminUpdateTimesheetOptimized(formData: FormData) {
  const id = Number(formData.get("id"));
  const dataJson = formData.get("data") as string;
  const editorId = formData.get("editorId") as string;
  const changesJson = formData.get("changes") as string;
  const changeReason = formData.get("changeReason") as string;
  const wasStatusChanged = formData.get("wasStatusChanged") === "true";
  const numberOfChanges = Number(formData.get("numberOfChanges")) || 0;
  const originalDataJson = formData.get("originalData") as string;

  if (!id || !dataJson || !originalDataJson) {
    throw new Error(
      "Timesheet ID, current data, and original data are required for update.",
    );
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
  const originalData: TimesheetData = JSON.parse(originalDataJson);

  // Calculate log diffs to determine what records to add, update, or delete
  const logChanges = calculateLogChanges(originalData, data);

  await prisma.$transaction(async (tx) => {
    // Handle notifications
    await handleNotifications(tx, id, editorId);
    // Record the changes
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

    // Update the main timesheet record
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

    // Update maintenance logs
    await updateMaintenanceLogs(tx, id, originalData, data, logChanges);

    // Update trucking logs
    await updateTruckingLogs(tx, id, originalData, data, logChanges);

    // Update tasco logs
    await updateTascoLogs(tx, id, originalData, data, logChanges);

    // Update employee equipment logs
    await updateEmployeeEquipmentLogs(tx, id, originalData, data, logChanges);
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

/**
 * Handles notification processing for timesheet updates
 */
async function handleNotifications(
  tx: Prisma.TransactionClient,
  id: number,
  editorId: string,
) {
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
    // Mark notifications as read
    await tx.notificationRead.createMany({
      data: notifications.map((n) => ({
        notificationId: n.id,
        userId: editorId,
        readAt: new Date(),
      })),
    });

    // Add responses
    await tx.notificationResponse.createMany({
      data: notifications.map((n) => ({
        notificationId: n.id,
        userId: editorId,
        response: "Approved",
        respondedAt: new Date(),
      })),
    });
  }
}

/**
 * Calculates which logs were added, updated, or deleted by comparing original and new data
 */
function calculateLogChanges(
  originalData: TimesheetData,
  newData: TimesheetData,
) {
  const changes = {
    Maintenance: {
      added: [] as string[],
      updated: [] as string[],
      deleted: [] as string[],
    },
    TruckingLogs: {
      added: [] as string[],
      updated: [] as string[],
      deleted: [] as string[],
    },
    TascoLogs: {
      added: [] as string[],
      updated: [] as string[],
      deleted: [] as string[],
    },
    EmployeeEquipmentLogs: {
      added: [] as string[],
      updated: [] as string[],
      deleted: [] as string[],
    },
  };

  // Process Maintenance logs
  const originalMaintenanceIds = (originalData.Maintenance || []).map((log) =>
    String(log.id),
  );
  const newMaintenanceIds = (newData.Maintenance || []).map((log) =>
    String(log.id),
  );

  changes.Maintenance.added = newMaintenanceIds.filter(
    (id) => !originalMaintenanceIds.includes(id),
  );
  changes.Maintenance.deleted = originalMaintenanceIds.filter(
    (id) => !newMaintenanceIds.includes(id),
  );
  changes.Maintenance.updated = newMaintenanceIds.filter(
    (id) =>
      originalMaintenanceIds.includes(id) &&
      JSON.stringify(newData.Maintenance?.find((l) => String(l.id) === id)) !==
        JSON.stringify(
          originalData.Maintenance?.find((l) => String(l.id) === id),
        ),
  );

  // Process TruckingLogs
  const originalTruckingIds = (originalData.TruckingLogs || []).map((log) =>
    String(log.id),
  );
  const newTruckingIds = (newData.TruckingLogs || []).map((log) =>
    String(log.id),
  );

  changes.TruckingLogs.added = newTruckingIds.filter(
    (id) => !originalTruckingIds.includes(id),
  );
  changes.TruckingLogs.deleted = originalTruckingIds.filter(
    (id) => !newTruckingIds.includes(id),
  );
  changes.TruckingLogs.updated = newTruckingIds.filter(
    (id) =>
      originalTruckingIds.includes(id) &&
      JSON.stringify(newData.TruckingLogs?.find((l) => String(l.id) === id)) !==
        JSON.stringify(
          originalData.TruckingLogs?.find((l) => String(l.id) === id),
        ),
  );

  // Process TascoLogs
  const originalTascoIds = (originalData.TascoLogs || []).map((log) =>
    String(log.id),
  );
  const newTascoIds = (newData.TascoLogs || []).map((log) => String(log.id));

  changes.TascoLogs.added = newTascoIds.filter(
    (id) => !originalTascoIds.includes(id),
  );
  changes.TascoLogs.deleted = originalTascoIds.filter(
    (id) => !newTascoIds.includes(id),
  );
  changes.TascoLogs.updated = newTascoIds.filter(
    (id) =>
      originalTascoIds.includes(id) &&
      JSON.stringify(newData.TascoLogs?.find((l) => String(l.id) === id)) !==
        JSON.stringify(
          originalData.TascoLogs?.find((l) => String(l.id) === id),
        ),
  );

  // Process EmployeeEquipmentLogs
  const originalEquipmentIds = (originalData.EmployeeEquipmentLogs || []).map(
    (log) => String(log.id),
  );
  const newEquipmentIds = (newData.EmployeeEquipmentLogs || []).map((log) =>
    String(log.id),
  );

  changes.EmployeeEquipmentLogs.added = newEquipmentIds.filter(
    (id) => !originalEquipmentIds.includes(id),
  );
  changes.EmployeeEquipmentLogs.deleted = originalEquipmentIds.filter(
    (id) => !newEquipmentIds.includes(id),
  );
  changes.EmployeeEquipmentLogs.updated = newEquipmentIds.filter(
    (id) =>
      originalEquipmentIds.includes(id) &&
      JSON.stringify(
        newData.EmployeeEquipmentLogs?.find((l) => String(l.id) === id),
      ) !==
        JSON.stringify(
          originalData.EmployeeEquipmentLogs?.find((l) => String(l.id) === id),
        ),
  );

  return changes;
}

/**
 * Updates maintenance logs using an optimized approach
 */
async function updateMaintenanceLogs(
  tx: Prisma.TransactionClient,
  timesheetId: number,
  originalData: TimesheetData,
  newData: TimesheetData,
  changes: Record<string, LogRecord>,
) {
  const { added, updated, deleted } = changes.Maintenance;

  // Delete removed logs
  if (deleted.length > 0) {
    await tx.mechanicProjects.deleteMany({
      where: {
        id: { in: deleted.map(Number) },
        timeSheetId: timesheetId,
      },
    });
  }

  // Update existing logs
  for (const id of updated) {
    const log = newData.Maintenance?.find((l) => String(l.id) === id);
    if (!log) continue;

    await tx.mechanicProjects.update({
      where: { id: Number(id) },
      data: {
        timeSheetId: timesheetId,
        equipmentId: log.equipmentId,
        hours: log.hours,
        description: log.description,
      },
    });
  }

  // Add new logs
  for (const id of added) {
    const log = newData.Maintenance?.find((l) => String(l.id) === id);
    if (!log) continue;

    // Don't specify id for new records, let the database auto-generate it
    await tx.mechanicProjects.create({
      data: {
        timeSheetId: timesheetId,
        equipmentId: log.equipmentId,
        hours: log.hours,
        description: log.description,
      },
    });
  }
}

/**
 * Updates trucking logs using an optimized approach
 */
async function updateTruckingLogs(
  tx: Prisma.TransactionClient,
  timesheetId: number,
  originalData: TimesheetData,
  newData: TimesheetData,
  changes: Record<string, LogRecord>,
) {
  const { added, updated, deleted } = changes.TruckingLogs;

  // Handle deleted trucking logs - cascades to child records
  if (deleted.length > 0) {
    await tx.truckingLog.deleteMany({
      where: {
        id: { in: deleted },
        timeSheetId: timesheetId,
      },
    });
  }

  // Handle updated trucking logs
  for (const id of updated) {
    const log = newData.TruckingLogs?.find((l) => l.id === id);
    if (!log) continue;

    // Update the trucking log
    const updatedLog = await tx.truckingLog.update({
      where: { id },
      data: {
        timeSheetId: timesheetId,
        truckNumber: log.truckNumber,
        trailerNumber: log.trailerNumber ?? undefined,
        startingMileage: log.startingMileage
          ? Number(log.startingMileage)
          : null,
        endingMileage: log.endingMileage ? Number(log.endingMileage) : null,
        laborType: "truckDriver",
      },
    });

    // For simplicity, we'll delete and recreate child records
    // In a more complex system, you might want to diff these too
    await Promise.all([
      tx.equipmentHauled.deleteMany({ where: { truckingLogId: id } }),
      tx.material.deleteMany({ where: { truckingLogId: id } }),
      tx.refuelLog.deleteMany({ where: { truckingLogId: id } }),
      tx.stateMileage.deleteMany({ where: { truckingLogId: id } }),
    ]);

    // Recreate child records
    await createTruckingLogChildren(tx, updatedLog.id, log);
  }

  // Handle added trucking logs
  for (const id of added) {
    const log = newData.TruckingLogs?.find((l) => l.id === id);
    if (!log) continue;

    const newTruckingLog = await tx.truckingLog.create({
      data: {
        id,
        timeSheetId: timesheetId,
        truckNumber: log.truckNumber,
        trailerNumber: log.trailerNumber ?? undefined,
        startingMileage: log.startingMileage
          ? Number(log.startingMileage)
          : null,
        endingMileage: log.endingMileage ? Number(log.endingMileage) : null,
        laborType: "truckDriver",
      },
    });

    // Create child records
    await createTruckingLogChildren(tx, newTruckingLog.id, log);
  }
}

/**
 * Interface for trucking log data
 */
interface TruckingLogData {
  EquipmentHauled?: Array<{
    equipmentId?: string;
    source?: string;
    destination?: string;
    startMileage?: string | number | null;
    endMileage?: string | number | null;
  }>;
  Materials?: Array<{
    LocationOfMaterial?: string;
    name: string;
    quantity?: string | number | null;
    unit?: string;
    loadType?: string;
  }>;
  RefuelLogs?: Array<{
    gallonsRefueled?: string | number;
    milesAtFueling?: string | number;
  }>;
  StateMileages?: Array<{
    state: string;
    stateLineMileage?: string | number | null;
  }>;
}

/**
 * Helper function to create child records for a trucking log
 */
async function createTruckingLogChildren(
  tx: Prisma.TransactionClient,
  truckingLogId: string,
  log: TruckingLogData,
) {
  // Create equipment hauled records
  for (const eq of log.EquipmentHauled || []) {
    if (!eq.equipmentId) continue;
    await tx.equipmentHauled.create({
      data: {
        truckingLogId,
        equipmentId: eq.equipmentId,
        source: eq.source ?? "",
        destination: eq.destination ?? "",
        startMileage: eq.startMileage ? Number(eq.startMileage) : null,
        endMileage: eq.endMileage ? Number(eq.endMileage) : null,
      },
    });
  }

  // Create material records
  for (const mat of log.Materials || []) {
    await tx.material.create({
      data: {
        truckingLogId,
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

  // Create refuel log records
  for (const ref of log.RefuelLogs || []) {
    await tx.refuelLog.create({
      data: {
        truckingLogId,
        gallonsRefueled: ref.gallonsRefueled
          ? Number(ref.gallonsRefueled)
          : undefined,
        milesAtFueling: ref.milesAtFueling
          ? Number(ref.milesAtFueling)
          : undefined,
      },
    });
  }

  // Create state mileage records
  for (const sm of log.StateMileages || []) {
    await tx.stateMileage.create({
      data: {
        truckingLogId,
        state: sm.state,
        stateLineMileage: sm.stateLineMileage
          ? Number(sm.stateLineMileage)
          : null,
      },
    });
  }
}

/**
 * Updates tasco logs using an optimized approach
 */
async function updateTascoLogs(
  tx: Prisma.TransactionClient,
  timesheetId: number,
  originalData: TimesheetData,
  newData: TimesheetData,
  changes: Record<string, LogRecord>,
) {
  const { added, updated, deleted } = changes.TascoLogs;

  // Handle deleted tasco logs
  if (deleted.length > 0) {
    await tx.tascoLog.deleteMany({
      where: {
        id: { in: deleted },
        timeSheetId: timesheetId,
      },
    });
  }

  // Handle updated tasco logs
  for (const id of updated) {
    const log = newData.TascoLogs?.find((l) => l.id === id);
    if (!log || !log.shiftType) continue;

    // Update the tasco log
    const updatedLog = await tx.tascoLog.update({
      where: { id },
      data: {
        timeSheetId: timesheetId,
        shiftType: log.shiftType,
        laborType: log.laborType,
        materialType: log.materialType,
        LoadQuantity: log.LoadQuantity ? Number(log.LoadQuantity) : 0,
        equipmentId: log.Equipment?.id ?? undefined,
      },
    });

    // Delete and recreate refuel logs
    await tx.refuelLog.deleteMany({ where: { tascoLogId: id } });

    // Create refuel logs
    for (const ref of log.RefuelLogs || []) {
      await tx.refuelLog.create({
        data: {
          tascoLogId: updatedLog.id,
          gallonsRefueled: ref.gallonsRefueled
            ? Number(ref.gallonsRefueled)
            : undefined,
        },
      });
    }
  }

  // Handle added tasco logs
  for (const id of added) {
    const log = newData.TascoLogs?.find((l) => l.id === id);
    if (!log || !log.shiftType) continue;

    const tascoLog = await tx.tascoLog.create({
      data: {
        id,
        timeSheetId: timesheetId,
        shiftType: log.shiftType,
        laborType: log.laborType,
        materialType: log.materialType,
        LoadQuantity: log.LoadQuantity ? Number(log.LoadQuantity) : 0,
        equipmentId: log.Equipment?.id ?? undefined,
      },
    });

    // Create refuel logs
    for (const ref of log.RefuelLogs || []) {
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
}

/**
 * Updates employee equipment logs using an optimized approach
 */
async function updateEmployeeEquipmentLogs(
  tx: Prisma.TransactionClient,
  timesheetId: number,
  originalData: TimesheetData,
  newData: TimesheetData,
  changes: Record<string, LogRecord>,
) {
  const { added, updated, deleted } = changes.EmployeeEquipmentLogs;

  // Delete removed logs
  if (deleted.length > 0) {
    await tx.employeeEquipmentLog.deleteMany({
      where: {
        id: { in: deleted },
        timeSheetId: timesheetId,
      },
    });
  }

  // Update existing logs
  for (const id of updated) {
    const log = newData.EmployeeEquipmentLogs?.find((l) => l.id === id);
    if (!log || !log.equipmentId) continue;

    await tx.employeeEquipmentLog.update({
      where: { id },
      data: {
        equipmentId: log.equipmentId,
        startTime: log.startTime ?? undefined,
        endTime: log.endTime ?? undefined,
        timeSheetId: timesheetId,
      },
    });
  }

  // Add new logs
  for (const id of added) {
    const log = newData.EmployeeEquipmentLogs?.find((l) => l.id === id);
    if (!log || !log.equipmentId) continue;

    await tx.employeeEquipmentLog.create({
      data: {
        id,
        equipmentId: log.equipmentId,
        startTime: log.startTime ?? undefined,
        endTime: log.endTime ?? undefined,
        timeSheetId: timesheetId,
      },
    });
  }
}
