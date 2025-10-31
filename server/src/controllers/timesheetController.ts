import type { Prisma } from "../../generated/prisma/client.js";
import {
  createGeneralTimesheetService,
  approveTimesheetsBatchService,
  updateTimesheetService,
  getUserTimesheetsByDate,
  getTimesheetDetailsManager,
  getManagerCrewTimesheets,
  createMechanicTimesheetService,
  createTascoTimesheetService,
  createTruckDriverTimesheetService,
  getRecentTimeSheetForUser,
  getTimesheetActiveStatus,
  getBannerDataForTimesheet,
} from "../services/timesheetService.js";
// GET /v1/timesheet/user/:userId/active-status
export async function getTimesheetActiveStatusController(
  req: Express.Request,
  res: Express.Response
) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId parameter is required." });
    }
    const status = await getTimesheetActiveStatus({ userId });
    return res.json({ success: true, data: status });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch active timesheet status." });
  }
}

import Express from "express";

// GET /v1/timesheet/user/:userId/recent
export async function getRecentTimesheetController(
  req: Express.Request,
  res: Express.Response
) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId parameter is required." });
    }
    const timesheet = await getRecentTimeSheetForUser(userId);
    if (!timesheet) {
      return res.status(404).json({ error: "No recent timesheet found." });
    }
    return res.json({ success: true, data: timesheet });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch recent timesheet." });
  }
}

// PUT /v1/timesheet/:id
export async function updateTimesheet(
  req: Express.Request,
  res: Express.Response
) {
  try {
    const id = Number(req.params.id);
    const {
      editorId,
      changes,
      changeReason,
      numberOfChanges,
      startTime,
      endTime,
      Jobsite,
      CostCode,
      comment,
    } = req.body;

    console.log("[UpdateTimesheet] PUT /v1/timesheet/:id", {
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
    });

    if (!id) {
      console.error("[UpdateTimesheet] Missing timesheet id", req.params.id);
      return res
        .status(400)
        .json({ error: "Timesheet ID is required for update." });
    }
    if (!editorId) {
      console.error("[UpdateTimesheet] Missing editorId");
      return res
        .status(400)
        .json({ error: "Editor ID is required for tracking changes." });
    }

    const result = await updateTimesheetService({
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
    });

    if (result.error) {
      console.error("[UpdateTimesheet] Service error:", result.error);
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (error) {
    console.error("[UpdateTimesheet] Unexpected error:", error);
    return res.status(500).json({
      error: "Failed to update timesheet.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

// GET /v1/timesheet/user/:userId?date=YYYY-MM-DD
export async function getUserTimesheetsByDateController(
  req: Express.Request,
  res: Express.Response
) {
  try {
    const userId = req.params.userId;
    const date = req.query.date as string | undefined;

    console.log("Fetching timesheets for userId:", userId, "date:", date);
    if (!userId) {
      return res.status(400).json({ error: "userId parameter is required." });
    }
    const timesheets = await getUserTimesheetsByDate({
      employeeId: userId,
      dateParam: date,
    });
    if (!timesheets || timesheets.length === 0) {
      return res.status(204).send();
    }
    return res.json({ success: true, data: timesheets });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user timesheets." });
  }
}

// GET /v1/timesheet/:id/details
export async function getTimesheetDetailsManagerController(
  req: Express.Request,
  res: Express.Response
) {
  try {
    const timesheetId = Number(req.params.id);
    if (!timesheetId) {
      return res.status(400).json({ error: "Timesheet ID is required." });
    }
    const details = await getTimesheetDetailsManager({ timesheetId });
    if (!details) {
      return res.status(404).json({ error: "Timesheet not found." });
    }
    return res.json({ success: true, data: details });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch timesheet details." });
  }
}

// GET /v1/timesheet/manager/:managerId/crew-timesheets
export async function getManagerCrewTimesheetsController(
  req: Express.Request,
  res: Express.Response
) {
  try {
    const managerId = req.params.managerId;
    if (!managerId) {
      return res
        .status(400)
        .json({ error: "managerId parameter is required." });
    }
    // Call the service to get all timesheets for all users in the manager's crew
    const crewTimesheets = await getManagerCrewTimesheets({ managerId });
    return res.json({ success: true, data: crewTimesheets });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch crew timesheets." });
  }
}

// POST /v1/timesheet/approve-batch
export async function approveTimesheetsBatchController(
  req: Express.Request,
  res: Express.Response
) {
  try {
    let { id: userId, timesheetIds, statusComment, editorId } = req.body;
    // Log incoming body for debugging
    console.log("[approveTimesheetsBatchController] Incoming body:", req.body);
    // If timesheetIds is a string (from FormData), try to parse it
    if (typeof timesheetIds === "string") {
      try {
        timesheetIds = JSON.parse(timesheetIds);
      } catch (e) {
        return res.status(400).json({ error: "Invalid timesheetIds format." });
      }
    }
    // Coerce all timesheetIds to numbers
    if (Array.isArray(timesheetIds)) {
      timesheetIds = timesheetIds.map((id) => Number(id));
    }
    if (
      !userId ||
      !Array.isArray(timesheetIds) ||
      timesheetIds.length === 0 ||
      !editorId
    ) {
      return res.status(400).json({
        error: "userId, timesheetIds (array), and editorId are required.",
      });
    }
    const result = await approveTimesheetsBatchService({
      userId,
      timesheetIds,
      statusComment: statusComment || "",
      editorId,
    });
    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.error || "Failed to approve timesheets." });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error(
      "[approveTimesheetsBatchController] Unexpected error:",
      error
    );
    return res.status(500).json({ error: "Failed to approve timesheets." });
  }
}

export interface GeneralTimesheetInput {
  date: string;
  jobsiteId: string;
  workType: string;
  userId: string;
  costCode: string;
  startTime: string;
  clockInLat?: number | null;
  clockInLong?: number | null;
  type?: string;
  previousTimeSheetId?: number;
  endTime?: string;
  previoustimeSheetComments?: string;
  clockOutLat?: number | null;
  clockOutLong?: number | null;
}

// POST /v1/timesheet/create
export async function createTimesheetAndSwitchJobsController(
  req: Express.Request,
  res: Express.Response
) {
  try {
    const body = req.body as {
      type: string;
    } & GeneralTimesheetInput;
    const { workType, type, ...rest } = body;
    let result;
    switch (workType) {
      case "general":
        result = await createGeneralTimesheetService({
          data: { ...rest, workType },
          type,
        });
        break;
      case "mechanic":
        result = await createMechanicTimesheetService({ ...rest, type });
        break;
      case "tasco":
        result = await createTascoTimesheetService({ ...rest, type });
        break;
      case "truck":
        result = await createTruckDriverTimesheetService({ ...rest, type });
        break;
      default:
        return res.status(400).json({ error: "Invalid workType" });
    }

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("[createTimesheetController] Error:", error);
    return res.status(500).json({ error: "Failed to create timesheet." });
  }
}
// GET /v1/timesheet/:id/user/:userId
export async function getBannerDataController(
  req: Express.Request,
  res: Express.Response
) {
  try {
    const timesheetId = Number(req.params.id);
    const userId = req.params.userId;
    if (!timesheetId || !userId) {
      return res
        .status(400)
        .json({ error: "Both timesheet id and userId are required." });
    }
    const bannerData = await getBannerDataForTimesheet(timesheetId, userId);
    return res.json({ success: true, data: bannerData });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch banner data." });
  }
}
