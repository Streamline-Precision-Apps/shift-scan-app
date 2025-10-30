import {
  updateTimesheetService,
  getUserTimesheetsByDate,
  getTimesheetDetailsManager,
} from "../services/timesheetService.js";

import Express from "express";

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
    return res
      .status(500)
      .json({
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
