"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { FormStatus, WorkType } from "../../prisma/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { formatISO } from "date-fns";

// Get all TimeSheets
type TimesheetUpdate = {
  id: number;
  startTime?: string;
  endTime?: string | null;
  jobsiteId?: string;
  costcode?: string;
};

type TimesheetHighlights = {
  submitDate: string;
  date: Date | string;
  id: number;
  userId: string;
  jobsiteId: string;
  costcode: string;
  startTime: Date | string;
  endTime: Date | string | null;
  status: FormStatus; // Enum: PENDING, APPROVED, etc.
  workType: WorkType; // Enum: Type of work
  Jobsite: {
    name: string;
  };
};

//-------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------  GENERAL CRUD  ---------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
// Create TimeSheet
export async function CreateTimeSheet(formData: FormData) {
  try {
    // convert workType to correct enum
    const workTypeMapping: Record<string, WorkType> = {
      general: "LABOR",
      mechanic: "MECHANIC",
      tasco: "TASCO",
      truck: "TRUCK_DRIVER",
    };
    // create a key from the type
    const originalWorkType = formData.get("workType");
    if (
      typeof originalWorkType !== "string" ||
      !(originalWorkType in workTypeMapping)
    ) {
      throw new Error(`Invalid workType: ${originalWorkType}`);
    }
    // using the record find the type base on the user input
    const workType = workTypeMapping[originalWorkType];

    // this will set costcode to undefined if empty
    const costCode = formData.get("costcode") as string;

    const newTimeSheet = await prisma.timeSheet.create({
      data: {
        date: formatISO(formData.get("date") as string),
        Jobsite: { connect: { id: formData.get("jobsiteId") as string } },
        comment: (formData.get("timeSheetComments") as string) || null,
        User: { connect: { id: formData.get("userId") as string } },
        CostCode: { connect: { name: costCode } },
        startTime: formatISO(formData.get("startTime") as string),
        workType: workType,
        status: "DRAFT",
      },
    });

    revalidatePath("/admins/settings");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/reports");
    revalidatePath("/admins/personnel");
    revalidatePath("/admins");
    revalidatePath("/dashboard");

    return newTimeSheet;
  } catch (error) {
    console.error("[CreateTimeSheet] Error creating timesheet:", error);
    throw error;
  }
}

//--------- Update Time Sheet
export async function breakOutTimeSheet(formData: FormData) {
  try {
    const id = Number(formData.get("id"));
    const endTime = formatISO(formData.get("endTime") as string);
    const comment = formData.get("timesheetComments") as string;
    const clockOutLat = Number(formData.get("clockOutLat") as string) || null;
    const clockOutLng = Number(formData.get("clockOutLng") as string) || null;

    // Only DB operations in transaction
    await prisma.$transaction(async (prisma) => {
      const updatedTimeSheet = await prisma.timeSheet.update({
        where: { id },
        data: {
          endTime,
          comment,
          status: "PENDING",
          clockOutLat,
          clockOutLng,
        },
      });
      if (updatedTimeSheet) {
        await prisma.user.update({
          where: { id: updatedTimeSheet.userId },
          data: {
            clockedIn: false,
            lastSeen: new Date().toISOString(),
          },
        });
      }
    });

    // Revalidate the path
    revalidatePath(`/`);
    revalidatePath("/dashboard");
    revalidatePath("/admins/settings");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/reports");
    revalidatePath("/admins/personnel");
    revalidatePath("/admins");
    return { success: true };
  } catch (error) {
    console.error("[breakOutTimeSheet] Error:", error);
    throw error;
  }
}
//
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------  TRUCKING CRUD  ---------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//--------- Create Truck driver Time Sheet
export async function CreateTruckDriverTimeSheet(formData: FormData) {
  try {
    // create a record to loop through
    const workTypeMapping: Record<string, WorkType> = {
      general: "LABOR",
      mechanic: "MECHANIC",
      tasco: "TASCO",
      truck: "TRUCK_DRIVER",
    };
    // create a key from the type
    const originalWorkType = formData.get("workType");
    if (
      typeof originalWorkType !== "string" ||
      !(originalWorkType in workTypeMapping)
    ) {
      throw new Error(`Invalid workType: ${originalWorkType}`);
    }
    // using the record find the type base on the user input
    const workType = workTypeMapping[originalWorkType];

    // create a catch to be starting mileage is a string
    const startingMileageStr = formData.get("startingMileage");
    if (typeof startingMileageStr !== "string") {
      throw new Error("startingMileage is required and must be a string");
    }
    // parse into an Int to the db
    const startingMileage = parseInt(startingMileageStr, 10);
    if (isNaN(startingMileage)) {
      throw new Error("startingMileage must be a valid number");
    }

    // Jobsite and User IDs
    const jobsiteId = formData.get("jobsiteId") as string;
    const userId = formData.get("userId") as string;
    const equipmentId = formData.get("equipment") as string;
    const timeSheetComments = formData.get("timeSheetComments") as string;
    const costCode = formData.get("costcode") as string;
    const laborType = formData.get("laborType") as string;
    const truck = formData.get("truck") as string;

    // Create TimeSheet and TruckingLog within a transaction

    const createdTimeSheet = await prisma.timeSheet.create({
      data: {
        date: formatISO(formData.get("date") as string),
        Jobsite: { connect: { id: jobsiteId } },
        comment: timeSheetComments || null,
        User: { connect: { id: userId } },
        CostCode: { connect: { name: costCode } },
        startTime: formatISO(formData.get("startTime") as string),
        workType,
        status: "DRAFT",
      },
    });

    await prisma.truckingLog.create({
      data: {
        laborType: laborType,
        timeSheetId: createdTimeSheet.id,
        taskName: laborType,
        equipmentId:
          laborType === "truckDriver"
            ? truck
            : laborType === "operator"
              ? equipmentId
              : null,
        startingMileage: startingMileage || null,
      },
    });

    revalidatePath("/admins/settings");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/reports");
    revalidatePath("/admins/personnel");
    revalidatePath("/admins");
    revalidatePath("/dashboard");

    return createdTimeSheet;
  } catch (error) {
    console.error(
      "[CreateTruckDriverTimeSheet] Error creating timesheet:",
      error,
    );
    throw error;
  }
}
//--------- Update Truck Driver sheet By switch Jobs
export async function updateTruckDriverTSBySwitch(formData: FormData) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized user");
    }

    const id = Number(formData.get("id"));
    const endingMileageStr = formData.get("endingMileage");
    const endingMileage = endingMileageStr
      ? parseInt(endingMileageStr as string, 10)
      : null;
    const endTimeRaw = formData.get("endTime");
    const endTime = endTimeRaw ? new Date(endTimeRaw as string) : new Date();

    // Fetch and log all EmployeeEquipmentLogs for this timesheet for debugging
    await prisma.employeeEquipmentLog.findMany({
      where: { timeSheetId: id },
    });

    // Update the TruckingLog for this timesheet with endingMileage if provided
    if (endingMileage !== null) {
      const truckingLog = await prisma.truckingLog.findFirst({
        where: { timeSheetId: id },
      });
      if (truckingLog) {
        await prisma.truckingLog.update({
          where: { id: truckingLog.id },
          data: { endingMileage },
        });
      } else {
        console.warn(
          "[updateTruckDriverTSBySwitch] No TruckingLog found for timesheet:",
          id,
        );
      }
    }

    // Build update data for timesheet
    const updateData: {
      status: "PENDING";
      updatedAt: Date;
      endTime: Date;
    } = {
      status: "PENDING",
      updatedAt: new Date(),
      endTime,
    };

    const updatedTimesheet = await prisma.timeSheet.update({
      where: { id },
      data: updateData,
    });
    return updatedTimesheet;
  } catch (error) {
    console.error("[updateTruckDriverTSBySwitch] Error:", error);
    throw error;
  }
}

/**
 * Ensures that any timesheet with an endTime is set to PENDING if it is still DRAFT.
 * This can be called after a user attempts to clock out or end day, regardless of current state.
 */
export async function forcePendingIfEnded(id: number) {
  const timesheet = await prisma.timeSheet.findUnique({ where: { id } });
  if (timesheet && timesheet.endTime && timesheet.status === "DRAFT") {
    const updated = await prisma.timeSheet.update({
      where: { id },
      data: { status: "PENDING" },
    });

    return updated;
  }
  if (timesheet && timesheet.endTime && timesheet.status !== "DRAFT") {
  }
  return timesheet;
}

//-------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------   General   CRUD  ---------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//---------- Transaction to create a new time sheet for General
export async function handleGeneralTimeSheet(formData: FormData) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized user");
    }
    let previousTimeSheetId: number | null = null;
    let previoustimeSheetComments: string | null = null;
    let endTime: string | null = null;
    let type: string | null = null;
    // Extract all needed values before transaction
    const jobsiteId = formData.get("jobsiteId") as string;
    const userId = formData.get("userId") as string;
    const clockInLat = Number(formData.get("clockInLat") as string) || null;
    const clockInLong = Number(formData.get("clockInLong") as string) || null;
    const clockOutLat = Number(formData.get("clockOutLat") as string) || null;
    const clockOutLong = Number(formData.get("clockOutLong") as string) || null;

    previoustimeSheetComments = formData.get("timeSheetComments") as string;
    const costCode = formData.get("costcode") as string;
    type = formData.get("type") as string;
    if (type === "switchJobs") {
      previousTimeSheetId = Number(formData.get("id"));
      endTime = formData.get("endTime") as string;
    }
    // Only DB operations in transaction
    const createdTimeSheet = await prisma.$transaction(async (prisma) => {
      // Step 1: Create a new TimeSheet
      const createdTimeSheet = await prisma.timeSheet.create({
        data: {
          date: formatISO(formData.get("date") as string),
          Jobsite: { connect: { id: jobsiteId } },
          User: { connect: { id: userId } },
          CostCode: { connect: { name: costCode } },
          startTime: formatISO(formData.get("startTime") as string),
          workType: "LABOR",
          status: "DRAFT",
          clockInLat: clockInLat,
          clockInLng: clockInLong,
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
          where: { id: userId },
          data: {
            clockedIn: true,
          },
        });
      }
      if (type === "switchJobs" && previousTimeSheetId && endTime) {
        await prisma.timeSheet.update({
          where: { id: previousTimeSheetId },
          data: {
            endTime: formatISO(endTime),
            comment: previoustimeSheetComments,
            status: "PENDING",
            clockOutLat: clockOutLat,
            clockOutLng: clockOutLong,
          },
        });
      }
      return createdTimeSheet;
    });

    // Revalidate paths after transaction
    revalidatePath("/");
    revalidatePath("/admins/settings");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/reports");
    revalidatePath("/admins/personnel");
    revalidatePath("/admins");
    revalidatePath("/dashboard");
    return { success: true, createdTimeSheet };
  } catch (error) {
    console.error("[handleGeneralTimeSheet] Error in transaction:", error);
    throw error;
  }
}

//-------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------   Mechanic   CRUD  ---------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//---------- Transactions for clock in to roll back if error occurs
export async function handleMechanicTimeSheet(formData: FormData) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized user");
    }
    let previousTimeSheetId: number | null = null;
    let previoustimeSheetComments: string | null = null;
    let endTime: string | null = null;
    let type: string | null = null;
    // Extract all needed values before transaction
    const jobsiteId = formData.get("jobsiteId") as string;
    const userId = formData.get("userId") as string;
    const clockInLat = Number(formData.get("clockInLat") as string) || null;
    const clockInLong = Number(formData.get("clockInLong") as string) || null;
    const clockOutLat = Number(formData.get("clockOutLat") as string) || null;
    const clockOutLong = Number(formData.get("clockOutLong") as string) || null;

    previoustimeSheetComments = formData.get("timeSheetComments") as string;
    const costCode = formData.get("costcode") as string;
    type = formData.get("type") as string;
    if (type === "switchJobs") {
      previousTimeSheetId = Number(formData.get("id"));
      endTime = formData.get("endTime") as string;
    }
    // Only DB operations in transaction
    const createdTimeCard = await prisma.$transaction(async (prisma) => {
      // Step 1: Create a new TimeSheet
      const createdTimeSheet = await prisma.timeSheet.create({
        data: {
          date: formatISO(formData.get("date") as string),
          Jobsite: { connect: { id: jobsiteId } },
          User: { connect: { id: userId } },
          CostCode: { connect: { name: costCode } },
          startTime: formatISO(formData.get("startTime") as string),
          workType: "MECHANIC",
          status: "DRAFT",
          clockInLat: clockInLat,
          clockInLng: clockInLong,
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

      if (createdTimeSheet) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            clockedIn: true,
          },
        });
      }
      if (type === "switchJobs" && previousTimeSheetId && endTime) {
        const updatedPrev = await prisma.timeSheet.update({
          where: { id: previousTimeSheetId },
          data: {
            endTime: formatISO(endTime),
            comment: previoustimeSheetComments,
            status: "PENDING",
            clockOutLat: clockOutLat,
            clockOutLng: clockOutLong,
          },
        });
      }
      return createdTimeSheet;
    });

    // Revalidate paths after transaction
    revalidatePath("/");
    revalidatePath("/admins/settings");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/reports");
    revalidatePath("/admins/personnel");
    revalidatePath("/admins");
    revalidatePath("/dashboard");
    return { success: true, createdTimeCard };
  } catch (error) {
    console.error("[handleMechanicTimeSheet] Error in transaction:", error);
    throw error;
  }
}
//-------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------   TASCO   CRUD  ---------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//---------- Transaction to create a new time sheet
export async function handleTascoTimeSheet(formData: FormData) {
  try {
    console.log("handleTascoTimeSheet called with formData:", formData);
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized user");
    }
    let previousTimeSheetId: number | null = null;
    let previousTimeSheetComments: string | null = null;
    let endTime: string | null = null;
    let type: string | null = null;
    // Extract all needed values before transaction
    const jobsiteId = formData.get("jobsiteId") as string;
    const userId = formData.get("userId") as string;
    const equipmentId = formData.get("equipment") as string;
    const clockInLat = Number(formData.get("clockInLat") as string) || null;
    const clockInLong = Number(formData.get("clockInLong") as string) || null;
    const clockOutLat = Number(formData.get("clockOutLat") as string) || null;
    const clockOutLong = Number(formData.get("clockOutLong") as string) || null;

    previousTimeSheetComments = formData.get("timeSheetComments") as string;
    const costCode = formData.get("costcode") as string;
    const shiftType = formData.get("shiftType") as string;
    type = formData.get("type") as string;
    let materialType;
    const laborType = formData.get("laborType") as string;
    if (shiftType === "ABCD Shift") {
      materialType = formData.get("materialType") as string;
    } else {
      materialType = undefined;
    }
    if (type === "switchJobs") {
      previousTimeSheetId = Number(formData.get("id"));
      endTime = formData.get("endTime") as string;
    }
    // Only DB operations in transaction
    const createdTimeCard = await prisma.$transaction(async (prisma) => {
      // Step 1: Create a new TimeSheet
      const createdTimeSheet = await prisma.timeSheet.create({
        data: {
          date: formatISO(formData.get("date") as string),
          Jobsite: { connect: { id: jobsiteId } },
          User: { connect: { id: userId } },
          CostCode: { connect: { name: costCode } },
          startTime: formatISO(formData.get("startTime") as string),
          workType: "TASCO",
          status: "DRAFT",
          clockInLat: clockInLat,
          clockInLng: clockInLong,
          TascoLogs: {
            create: {
              shiftType,
              laborType: laborType,
              ...(equipmentId && {
                Equipment: { connect: { id: equipmentId } },
              }),
              ...(materialType && {
                TascoMaterialTypes: { connect: { name: materialType } },
              }),
            },
          },
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

      if (createdTimeSheet) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            clockedIn: true,
          },
        });
      }
      if (type === "switchJobs" && previousTimeSheetId && endTime) {
        await prisma.timeSheet.update({
          where: { id: previousTimeSheetId },
          data: {
            endTime: formatISO(endTime),
            comment: previousTimeSheetComments,
            status: "PENDING",
            clockOutLat: clockOutLat,
            clockOutLng: clockOutLong,
          },
        });
      }
      return createdTimeSheet;
    });

    // Revalidate paths after transaction
    revalidatePath("/");
    revalidatePath("/admins/settings");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/reports");
    revalidatePath("/admins/personnel");
    revalidatePath("/admins");
    revalidatePath("/dashboard");
    return { success: true, createdTimeCard };
  } catch (error) {
    console.error("[handleTascoTimeSheet] Error in transaction:", error);
    throw error;
  }
}

//-------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------  TRUCKING CRUD  ---------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
// --- Transaction to handle Truck Driver TimeSheet
export async function handleTruckTimeSheet(formData: FormData) {
  try {
    let newTimeSheet = null;
    let previousTimeSheetId: number | null = null;
    let previoustimeSheetComments: string | null = null;
    let type: string | null = null;
    // Extract all needed values before transaction
    const jobsiteId = formData.get("jobsiteId") as string;
    const userId = formData.get("userId") as string;
    previoustimeSheetComments = formData.get("timeSheetComments") as string;
    const costCode = formData.get("costcode") as string;
    const clockInLat = Number(formData.get("clockInLat") as string) || null;
    const clockInLong = Number(formData.get("clockInLong") as string) || null;
    const clockOutLat = Number(formData.get("clockOutLat") as string) || null;
    const clockOutLong = Number(formData.get("clockOutLong") as string) || null;

    type = formData.get("type") as string;
    const startingMileage = parseInt(formData.get("startingMileage") as string);
    const laborType = formData.get("laborType") as string;
    const truck = formData.get("truck") as string;
    const equipmentId = formData.get("equipment") as string;
    // Get trailer value, treat empty string or 'no trailer' as null
    const trailer = formData.get("trailer");
    let trailerNumber: string | null = null;
    if (
      typeof trailer === "string" &&
      trailer.trim() !== "" &&
      trailer.trim().toLowerCase() !== "no trailer" &&
      trailer.trim().toLowerCase() !== "none"
    ) {
      trailerNumber = trailer;
    } else {
      trailerNumber = null;
    }
    if (type === "switchJobs") {
      previousTimeSheetId = Number(formData.get("id"));
      // Only use transaction if updating two timesheets
      newTimeSheet = await prisma.$transaction(async (prisma) => {
        // Step 1: Create a new TimeSheet
        const createdTimeSheet = await prisma.timeSheet.create({
          data: {
            date: formatISO(formData.get("date") as string),
            Jobsite: { connect: { id: jobsiteId } },
            User: { connect: { id: userId } },
            CostCode: { connect: { name: costCode } },
            startTime: formatISO(formData.get("startTime") as string),
            workType: "TRUCK_DRIVER",
            status: "DRAFT",
            clockInLat: clockInLat,
            clockInLng: clockInLong,
            TruckingLogs: {
              create: {
                laborType,
                truckNumber: truck,
                equipmentId: equipmentId || null,
                startingMileage,
                trailerNumber: trailerNumber,
              },
            },
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

        if (createdTimeSheet) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              clockedIn: true,
            },
          });
        }
        if (previousTimeSheetId) {
          await prisma.timeSheet.update({
            where: { id: previousTimeSheetId },
            data: {
              endTime: formatISO(formData.get("endTime") as string),
              comment: previoustimeSheetComments,
              status: "PENDING",
              clockOutLat: clockOutLat,
              clockOutLng: clockOutLong,
            },
          });
        }
        return createdTimeSheet;
      });
    } else {
      // Just create, no transaction needed
      newTimeSheet = await prisma.timeSheet.create({
        data: {
          date: formatISO(formData.get("date") as string),
          Jobsite: { connect: { id: jobsiteId } },
          User: { connect: { id: userId } },
          CostCode: { connect: { name: costCode } },
          startTime: formatISO(formData.get("startTime") as string),
          workType: "TRUCK_DRIVER",
          status: "DRAFT",
          clockInLat: clockInLat,
          clockInLng: clockInLong,
          TruckingLogs: {
            create: {
              laborType,
              truckNumber: truck,
              equipmentId: equipmentId || null,
              startingMileage,
              trailerNumber: trailerNumber || null,
            },
          },
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

      if (newTimeSheet) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            clockedIn: true,
          },
        });
      }
    }

    // Revalidate paths after DB ops
    revalidatePath("/");
    revalidatePath("/admins/settings");
    revalidatePath("/admins/assets");
    revalidatePath("/admins/reports");
    revalidatePath("/admins/personnel");
    revalidatePath("/admins");
    revalidatePath("/dashboard");
    return { success: true, createdTimeCard: newTimeSheet };
  } catch (error) {
    console.error("Error in transaction:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//--------------------------
//-- update TimeSheets - located in manager section
export async function updateTimeSheets(
  updatedSheets: TimesheetHighlights[],
  manager: string,
) {
  try {
    // Perform individual updates for each timesheet
    const updatePromises = updatedSheets.map((timesheet) => {
      return prisma.timeSheet.update({
        where: { id: timesheet.id }, // Identify the specific timesheet by its ID
        data: {
          workType: timesheet.workType as WorkType,
          startTime: timesheet.startTime,
          endTime: timesheet?.endTime,
        },
      });
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating timesheets:", error);
    throw new Error("Failed to update timesheets. Please try again.");
  }
}

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//ADMINS SERVER ACTIONS
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------
//--------- Update Time Sheet
//---------
export async function updateTimeSheet(formData: FormData) {
  try {
    // Get the ID from formData
    const idString = formData.get("id") as string;
    const id = parseInt(idString, 10);
    if (!id) {
      throw new Error("Invalid timesheet ID");
    }

    // Fetch the startTime from the database to ensure correct calculations
    const start = await prisma.timeSheet.findUnique({
      where: { id },
      select: { startTime: true },
    });

    if (!start || !start.startTime) {
      throw new Error("Start time not found for the given timesheet ID.");
    }

    // Parse endTime from the formData
    const endTimeString = formData.get("endTime") as string;
    if (!endTimeString) {
      throw new Error("End time is required");
    }

    const endTime = formatISO(endTimeString);

    // Update the timesheet with new data
    const updatedTimeSheet = await prisma.timeSheet.update({
      where: { id },
      data: {
        endTime: endTime,
        comment: (formData.get("timeSheetComments") as string) || null,
        status: "PENDING", // Set status to PENDING
        wasInjured: formData.get("wasInjured") === "true",
        clockOutLat: Number(formData.get("clockOutLat") as string) || null,
        clockOutLng: Number(formData.get("clockOutLng") as string) || null,
      },
      include: {
        User: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (updatedTimeSheet) {
      await prisma.user.update({
        where: { id: updatedTimeSheet.userId },
        data: {
          clockedIn: false,
          lastSeen: new Date().toISOString(),
        },
      });
    }
    const userFullName = `${updatedTimeSheet.User.firstName} ${updatedTimeSheet.User.lastName}`;

    // Optionally, you can handle revalidation of paths here or elsewhere
    revalidatePath(`/`);
    return {
      success: true,
      timesheetId: updatedTimeSheet.id,
      userFullName,
    };
  } catch (error) {
    console.error("Error updating timesheet:", error);
    return { success: false };
  }
}
//---------
//--------- return to prev work
//---------
export async function returnToPrevWork(formData: FormData) {
  try {
    console.log("formData received:", formData);
    const id = Number(formData.get("id"));
    const PrevTimeSheet = await prisma.timeSheet.findUnique({
      where: { id },
      select: {
        id: true,
        Jobsite: {
          select: {
            id: true,
            qrId: true,
            name: true,
          },
        },
        CostCode: {
          select: {
            id: true,
            name: true,
          },
        },
        workType: true,
        TascoLogs: {
          select: {
            shiftType: true,
            Equipment: {
              select: {
                id: true,
                qrId: true,
                name: true,
              },
            },
            laborType: true,
            materialType: true,
          },
        },
        TruckingLogs: {
          select: {
            laborType: true,
            Equipment: {
              select: {
                qrId: true,
                name: true,
              },
            },
            startingMileage: true,
          },
        },
      },
    });
    console.log("PrevTimeSheet fetched:", PrevTimeSheet);
    return PrevTimeSheet;
  } catch (error) {
    console.error("Error updating timesheet:", error);
  }
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

// Approve all pending timesheets for a user
export async function approvePendingTimesheets(
  userId: string,
  managerName?: string,
) {
  try {
    // Find all pending timesheets for the user
    const pendingTimesheets = await prisma.timeSheet.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      select: { id: true },
    });
    if (!pendingTimesheets.length) return { success: true, updated: 0 };
    const timesheetIds = pendingTimesheets.map((ts) => ts.id);
    // Update all to APPROVED
    await prisma.timeSheet.updateMany({
      where: {
        id: { in: timesheetIds },
        userId,
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
        statusComment: managerName
          ? `Approved by ${managerName}`
          : "Approved by manager",
      },
    });
    revalidatePath("/dashboard/myTeam/timecards");
    revalidatePath("/dashboard/myTeam");
    return { success: true, updated: timesheetIds.length };
  } catch (error) {
    console.error("Error approving pending timesheets:", error);
    return { success: false, error: "Failed to approve timesheets" };
  }
}

export async function ClockOutComment({ userId }: { userId: string }) {
  const timesheet = await prisma.timeSheet.findFirst({
    where: {
      userId,
      endTime: null, // Ensure timesheet is still active
    },
    orderBy: {
      createdAt: "desc", // Sort by most recent submission date
    },
    select: {
      comment: true,
    },
  });
  return timesheet?.comment || "";
}
