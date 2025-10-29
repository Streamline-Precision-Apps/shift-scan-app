import { updateTimesheetService } from "../services/timesheetService.js";
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

    if (!id) {
      return res
        .status(400)
        .json({ error: "Timesheet ID is required for update." });
    }
    if (!editorId) {
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
      return res.status(400).json({ error: result.error });
    }
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update timesheet." });
  }
}
