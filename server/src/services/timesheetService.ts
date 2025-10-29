import type { Prisma } from "../../generated/prisma/client.js";
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
