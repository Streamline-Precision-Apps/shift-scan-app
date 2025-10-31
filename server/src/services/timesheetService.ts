import { formatISO } from "date-fns";
import type { Prisma } from "../../generated/prisma/client.js";
import type { GeneralTimesheetInput } from "../controllers/timesheetController.js";
import prisma from "../lib/prisma.js";

export async function updateTimesheetService({
  id,
  editorId,
  changes,
  changeReason,
  numberOfChanges,
  startTime,
  endTime,
  Jobsite,
  CostCode,
  comment,
}: {
  id: number;
  editorId: string;
  changes: string;
  changeReason?: string;
  numberOfChanges?: number;
  startTime: string;
  endTime?: string;
  Jobsite?: string;
  CostCode?: string;
  comment?: string;
}) {
  try {
    const parsedChanges =
      changes && typeof changes === "string"
        ? JSON.parse(changes)
        : changes || {};
    const transactionResult = await prisma.$transaction(async (tx) => {
      let editorLog = null;
      let userFullname = null;
      let editorFullName = null;

      if (parsedChanges && Object.keys(parsedChanges).length > 0) {
        editorLog = await tx.timeSheetChangeLog.create({
          data: {
            timeSheetId: id,
            changedBy: editorId,
            changes: parsedChanges,
            changeReason: changeReason || "No reason provided",
            numberOfChanges: numberOfChanges || 0,
          },
          include: {
            User: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      }
      editorFullName = editorLog
        ? `${editorLog.User.firstName} ${editorLog.User.lastName}`
        : "Unknown Editor";

      // Build update data object dynamically to only update provided fields
      const updateData: Prisma.TimeSheetUpdateInput = {};
      if (typeof startTime !== "undefined") {
        updateData.startTime = startTime;
      }
      if (typeof endTime !== "undefined") {
        updateData.endTime = endTime ? new Date(endTime) : null;
      }
      if (typeof Jobsite !== "undefined" && Jobsite) {
        updateData.Jobsite = { connect: { id: Jobsite } }; // or { id: Jobsite } if you use IDs
      }
      if (typeof CostCode !== "undefined" && CostCode) {
        updateData.CostCode = { connect: { name: CostCode } }; // or { id: CostCode } if you use IDs
      }
      if (typeof comment !== "undefined") {
        updateData.comment = comment;
      }
      const updated = await tx.timeSheet.update({
        where: { id },
        data: updateData,
        include: {
          Jobsite: true,
          CostCode: true,
          ChangeLogs: true,
          User: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      userFullname = updated
        ? `${updated.User.firstName} ${updated.User.lastName}`
        : "Unknown User";

      return { updated, editorLog, userFullname, editorFullName };
    });

    return {
      success: true,
      timesheet: transactionResult.updated,
      editorLog: transactionResult.editorLog,
      userFullname: transactionResult.userFullname,
      editorFullName: transactionResult.editorFullName,
    };
  } catch (error) {
    let message = "Failed to update timesheet.";
    if (error instanceof Error) {
      message = error.message;
    }
    return { error: message };
  }
}

export async function getUserTimesheetsByDate({
  employeeId,
  dateParam,
}: {
  employeeId: string;
  dateParam?: string | undefined;
}) {
  let start: Date | undefined = undefined;
  let end: Date | undefined = undefined;
  if (dateParam) {
    start = new Date(dateParam + "T00:00:00.000Z");
    end = new Date(dateParam + "T23:59:59.999Z");
  }

  // Only include date filter if both start and end are defined
  const where: Prisma.TimeSheetWhereInput = {
    userId: employeeId,
    status: {
      not: "DRAFT",
    },
    ...(start && end ? { date: { gte: start, lte: end } } : {}),
  };

  const timesheetData = await prisma.timeSheet.findMany({
    where,
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      workType: true,
      Jobsite: {
        select: {
          name: true,
        },
      },
      CostCode: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
  return timesheetData;
}

export async function getTimesheetDetailsManager({
  timesheetId,
}: {
  timesheetId: number;
}) {
  const timesheet = await prisma.timeSheet.findUnique({
    where: { id: timesheetId },
    select: {
      id: true,
      comment: true,
      startTime: true,
      endTime: true,
      Jobsite: {
        select: {
          id: true,
          name: true,
        },
      },
      CostCode: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  return timesheet;
}

// Get all timesheets for all users in a manager's crew
export async function getManagerCrewTimesheets({
  managerId,
}: {
  managerId: string;
}) {
  // Find all users in crews led by this manager
  const crew = await prisma.user.findMany({
    where: {
      Crews: {
        some: {
          leadId: managerId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      clockedIn: true,
      Crews: {
        select: {
          id: true,
          leadId: true,
        },
      },

      TimeSheets: {
        where: {
          status: "PENDING",
          endTime: { not: null },
        },
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          jobsiteId: true,
          workType: true,
          Jobsite: {
            select: {
              name: true,
            },
          },
          CostCode: {
            select: {
              name: true,
            },
          },
          TascoLogs: {
            select: {
              id: true,
              shiftType: true,
              laborType: true,
              materialType: true,
              LoadQuantity: true,
              Equipment: {
                select: {
                  id: true,
                  name: true,
                },
              },
              RefuelLogs: {
                select: {
                  id: true,
                  gallonsRefueled: true,
                  TascoLog: {
                    select: {
                      Equipment: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          TruckingLogs: {
            select: {
              id: true,
              laborType: true,
              Truck: {
                select: { id: true, name: true },
              },
              Trailer: {
                select: { id: true, name: true },
              },
              Equipment: {
                select: {
                  id: true,
                  name: true,
                },
              },
              startingMileage: true,
              endingMileage: true,
              Materials: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  loadType: true,
                  unit: true,
                  LocationOfMaterial: true,
                  materialWeight: true,
                },
              },
              EquipmentHauled: {
                select: {
                  id: true,
                  source: true,
                  destination: true,
                  Equipment: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              RefuelLogs: {
                select: {
                  id: true,
                  gallonsRefueled: true,
                  milesAtFueling: true,
                  TruckingLog: {
                    select: {
                      Equipment: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
              StateMileages: {
                select: {
                  id: true,
                  state: true,
                  stateLineMileage: true,
                  TruckingLog: {
                    select: {
                      Equipment: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          EmployeeEquipmentLogs: {
            select: {
              id: true,
              startTime: true,
              endTime: true,
              Equipment: {
                select: {
                  id: true,
                  name: true,
                },
              },
              RefuelLog: {
                select: {
                  id: true,
                  gallonsRefueled: true,
                },
              },
            },
          },
          status: true,
        },
      },
    },
  });
  return crew;
}
// Batch approve timesheets and handle notifications
export async function approveTimesheetsBatchService({
  userId,
  timesheetIds,
  statusComment,
  editorId,
}: {
  userId: string;
  timesheetIds: number[];
  statusComment: string;
  editorId: string;
}) {
  try {
    // Update all matching timesheets with the same values
    await prisma.timeSheet.updateMany({
      where: {
        id: { in: timesheetIds },
        userId,
      },
      data: {
        status: "APPROVED",
        statusComment,
      },
    });

    // check for notifications
    const notifications = await prisma.notification.findMany({
      where: {
        topic: "timecard-submission",
        referenceId: { in: timesheetIds.map(String) },
        Response: { is: null },
      },
    });

    if (notifications.length > 0) {
      // Filter out notifications that already have a notificationRead for this user
      const existingReads = await prisma.notificationRead.findMany({
        where: {
          notificationId: { in: notifications.map((n) => n.id) },
          userId: editorId,
        },
        select: { notificationId: true },
      });
      const alreadyReadIds = new Set(
        existingReads.map((r) => r.notificationId)
      );
      const unreadNotifications = notifications.filter(
        (n) => !alreadyReadIds.has(n.id)
      );
      await prisma.$transaction(async (tx) => {
        if (unreadNotifications.length > 0) {
          await tx.notificationRead.createMany({
            data: unreadNotifications.map((n) => ({
              notificationId: n.id,
              userId: editorId,
              readAt: new Date(),
            })),
          });
        }
        await tx.notificationResponse.createMany({
          data: notifications.map((n) => ({
            notificationId: n.id,
            userId: editorId,
            response: "Approved",
            respondedAt: new Date(),
          })),
        });
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating timesheets:", error);
    return { success: false, error: "Failed to update timesheets" };
  }
}

export async function createGeneralTimesheetService({
  data,
  type,
}: {
  data: GeneralTimesheetInput;
  type?: string;
}) {
  const createdTimeSheet = await prisma.$transaction(async (prisma) => {
    // Step 1: Create a new TimeSheet
    const createdTimeSheet = await prisma.timeSheet.create({
      data: {
        date: data.date,
        Jobsite: { connect: { id: data.jobsiteId } },
        User: { connect: { id: data.userId } },
        CostCode: { connect: { name: data.costCode } },
        startTime: data.startTime,
        workType: "LABOR",
        status: "DRAFT",
        clockInLat: data.clockInLat || null,
        clockInLng: data.clockInLong || null,
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update user status if timesheet created successfully
    if (createdTimeSheet) {
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          clockedIn: true,
        },
      });
    }
    if (type === "switchJobs" && data.previousTimeSheetId && data.endTime) {
      await prisma.timeSheet.update({
        where: { id: data.previousTimeSheetId },
        data: {
          endTime: formatISO(data.endTime),
          comment: data.previoustimeSheetComments || null,
          status: "PENDING",
          clockOutLat: data.clockOutLat || null,
          clockOutLng: data.clockOutLong || null,
        },
      });
    }
    return createdTimeSheet;
  });
  return createdTimeSheet;
}

export async function createMechanicTimesheetService({}) {
  // Implementation for creating a mechanic timesheet
}

export async function createTruckDriverTimesheetService({}) {
  // Implementation for creating a truck driver timesheet
}

export async function createTascoTimesheetService({}) {
  // Implementation for creating a tasco timesheet
}

export async function getRecentTimeSheetForUser(userId: string) {
  // Implementation for fetching recent timesheet for a user
  // Fetch the most recent active (unfinished) timesheet for the user
  const timesheet = await prisma.timeSheet.findFirst({
    where: {
      userId,
      endTime: null, // Ensure timesheet is still active
    },
    orderBy: {
      createdAt: "desc", // Sort by most recent submission date
    },
    select: {
      id: true,
      endTime: true,
    },
  });

  return timesheet;
}

export async function getTimesheetActiveStatus({ userId }: { userId: string }) {
  // Implementation for checking active timesheet status
  const activeTimesheet = await prisma.timeSheet.findFirst({
    where: {
      userId: userId,
      endTime: null, // No end time means still active
    },
    select: {
      id: true,
      startTime: true,
    },
  });

  const hasActiveTimesheet = activeTimesheet ? true : false;
  return {
    hasActiveTimesheet: hasActiveTimesheet,
    timesheetId: activeTimesheet?.id || null,
  };
}

export async function getBannerDataForTimesheet(
  timesheetId: number,
  userId: string
) {
  // Implementation for fetching banner data
  const jobCode = await prisma.timeSheet.findFirst({
    where: { userId, id: timesheetId },
    select: {
      id: true,
      startTime: true,
      Jobsite: {
        select: { id: true, qrId: true, name: true },
      },
      CostCode: {
        select: { id: true, name: true, code: true },
      },
    },
  });
  if (!jobCode) {
    throw new Error("No active timesheet found.");
  }
  // Parallelize queries for performance
  const [tascoLogs, truckingLogs, eqLogs] = await Promise.all([
    prisma.tascoLog.findMany({
      where: { timeSheetId: timesheetId },
      select: {
        shiftType: true,
        laborType: true,
        Equipment: { select: { qrId: true, name: true } },
      },
    }),
    prisma.truckingLog.findMany({
      where: { timeSheetId: timesheetId },
      select: {
        laborType: true,
        Truck: { select: { qrId: true, name: true } },
        Equipment: { select: { qrId: true, name: true } },
      },
    }),
    prisma.employeeEquipmentLog.findMany({
      where: { timeSheetId: timesheetId, endTime: null },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        Equipment: { select: { id: true, name: true } },
      },
    }),
  ]);

  // Format Logs
  const formattedTascoLogs = tascoLogs.map((log) => ({
    laborType: log.laborType,
    shiftType: log.shiftType,
    equipment: log.Equipment || { qrId: null, name: "Unknown" },
  }));

  const formattedTruckingLogs = truckingLogs.map((log) => ({
    laborType: log.laborType,
    equipment: log.Truck || { qrId: null, name: "Unknown" },
  }));

  const formattedEmployeeEquipmentLogs = eqLogs.map((log) => ({
    id: log.id,
    startTime: log.startTime,
    endTime: log.endTime,
    equipment: log.Equipment || { id: null, name: "Unknown" },
  }));

  return {
    id: jobCode.id,
    startTime: jobCode.startTime,
    jobsite: jobCode.Jobsite
      ? {
          id: jobCode.Jobsite.id,
          qrId: jobCode.Jobsite.qrId,
          name: jobCode.Jobsite.name,
        }
      : null,
    costCode: jobCode.CostCode
      ? {
          id: jobCode.CostCode.id,
          name: jobCode.CostCode.name,
        }
      : null,
    tascoLogs: formattedTascoLogs,
    truckingLogs: formattedTruckingLogs,
    employeeEquipmentLogs: formattedEmployeeEquipmentLogs,
  };
}
