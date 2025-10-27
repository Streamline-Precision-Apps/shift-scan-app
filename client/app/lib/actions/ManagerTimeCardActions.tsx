"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function ApproveUsersTimeSheets(formData: FormData) {
  const id = formData.get("id") as string;
  const statusComment = formData.get("statusComment") as string;
  const timesheetIdsString = formData.get("timesheetIds") as string;
  const stringIds = JSON.parse(timesheetIdsString) as number[];
  const timesheetIds = stringIds.map((id) => id);
  const editorId = formData.get("editorId") as string;

  try {
    // Update all matching timesheets with the same values
    await prisma.timeSheet.updateMany({
      where: {
        id: { in: timesheetIds }, // Use 'in' operator for multiple IDs
        userId: id,
      },
      data: {
        status: "APPROVED",
        statusComment, // Same comment for all
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
      await prisma.$transaction(async (tx) => {
        await tx.notificationRead.createMany({
          data: notifications.map((n) => ({
            notificationId: n.id,
            userId: editorId,
            readAt: new Date(),
          })),
        });
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
    revalidatePath("/dashboard/myTeam/timecards");
    return { success: true };
  } catch (error) {
    console.error("Error updating timesheets:", error);
    return { success: false, error: "Failed to update timesheets" };
  }
}
