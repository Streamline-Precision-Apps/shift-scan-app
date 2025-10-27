"use server";

import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function updateTimesheetServerAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const editorId = formData.get("editorId") as string;
  const changesJson = formData.get("changes") as string;
  const changeReason = formData.get("changeReason") as string;
  const numberOfChanges = Number(formData.get("numberOfChanges")) || 0;
  // Form Values
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string | null;
  const jobsite = formData.get("Jobsite") as string;
  const costCode = formData.get("CostCode") as string;
  const comment = formData.get("comment") as string | null;
  try {
    if (!id) {
      throw new Error("Timesheet ID is required for update.");
    }

    if (!editorId) {
      throw new Error("Editor ID is required for tracking changes.");
    }

    const changes = changesJson ? JSON.parse(changesJson) : {};

    const transactionResult = await prisma.$transaction(async (tx) => {
      let editorLog = null;
      let userFullname = null;
      let editorFullName = null;

      if (Object.keys(changes).length > 0) {
        editorLog = await tx.timeSheetChangeLog.create({
          data: {
            timeSheetId: id,
            changedBy: editorId,
            changes: changes,
            changeReason: changeReason || "No reason provided",
            numberOfChanges: numberOfChanges,
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

      const updated = await tx.timeSheet.update({
        where: { id },
        data: {
          startTime: startTime,
          endTime: endTime ? new Date(endTime) : undefined,
          comment: comment ?? undefined,
          Jobsite: jobsite ? { connect: { id: jobsite } } : undefined,
          CostCode: costCode ? { connect: { name: costCode } } : undefined,
        },
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

    revalidateTag("timesheet");
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
