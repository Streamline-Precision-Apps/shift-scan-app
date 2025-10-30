"use client";

import { apiRequest } from "../utils/api-Utils";

export async function ApproveUsersTimeSheets(formData: FormData) {
  const id = formData.get("id") as string;
  const statusComment = formData.get("statusComment") as string;
  const timesheetIdsString = formData.get("timesheetIds") as string;
  // Parse and ensure timesheetIds is an array of numbers
  let timesheetIds: number[] = [];
  try {
    const parsed = JSON.parse(timesheetIdsString);
    if (Array.isArray(parsed)) {
      timesheetIds = parsed.map((v) => Number(v));
    }
  } catch (e) {
    console.error("Failed to parse timesheetIds", timesheetIdsString);
    return { success: false, error: "Invalid timesheetIds format" };
  }
  const editorId = formData.get("editorId") as string;

  try {
    await apiRequest("/api/v1/timesheet/approve-batch", "POST", {
      id,
      timesheetIds,
      statusComment,
      editorId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating timesheets via API:", error);
    return { success: false, error: "Failed to update timesheets" };
  }
}
