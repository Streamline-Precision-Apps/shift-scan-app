"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
/**
 * Upserts (updates or inserts) an FCM token in the database
 * - If token exists for the same user, updates lastUsedAt
 * - If token exists for different user or is invalid, updates ownership and validity
 * - If token doesn't exist, creates a new record
 */

export async function setFCMToken({ token }: { token: string }) {
  // Get the current user session
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    console.error("Cannot save FCM token: No authenticated user");
    return false;
  }

  try {
    await prisma.fCMToken.deleteMany({
      where: { userId: userId },
    });
    // Create a new token record

    await prisma.fCMToken.create({
      data: {
        token: token,
        userId: userId,
        platform: "web",
        lastUsedAt: new Date(),
        isValid: true,
      },
    });

    return true;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    return false;
  }
}

export async function getUserTopicPreferences(): Promise<{ topic: string }[]> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    console.warn(
      "Attempted to fetch topic preferences for unauthenticated user.",
    );
    return [];
  }

  try {
    const preferences = await prisma.topicSubscription.findMany({
      where: { userId: userId },
      select: {
        topic: true,
      },
    });
    return preferences;
  } catch (error) {
    console.error("Error fetching user topic preferences:", error);
    return [];
  }
}

export async function updateNotificationReadStatus({
  notificationId,
}: {
  notificationId: number;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if the read record already exists
    const existingRead = await prisma.notificationRead.findFirst({
      where: {
        notificationId: notificationId,
        userId: userId,
      },
    });

    if (!existingRead) {
      // Create a new read record
      await prisma.notificationRead.create({
        data: {
          notificationId: notificationId,
          userId: userId,
        },
      });
    } else {
      // Update the existing read record
      await prisma.notificationRead.update({
        where: {
          id: existingRead.id,
        },
        data: {
          readAt: new Date(),
        },
      });
      // Optionally: trigger a UI refresh or update local state
    }
  } catch (error) {
    console.error("Error updating notification read status:", error);
    throw new Error("Failed to update read status");
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Fetch all unread notifications for the user
    const unreadNotifications = await prisma.notification.findMany({
      where: {
        Reads: {
          none: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    // Create read records for all unread notifications
    const readRecords = unreadNotifications.map((notification) => ({
      notificationId: notification.id,
      userId: userId,
      readAt: new Date(),
    }));

    if (readRecords.length > 0) {
      await prisma.notificationRead.createMany({
        data: readRecords,
        skipDuplicates: true, // Avoid duplicates if any
      });
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Failed to mark all as read");
  }
}

export async function markBrokenEquipmentNotificationsAsRead({
  notificationId,
}: {
  notificationId: number;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        topic: "equipment-break",
        Response: {
          is: null,
        },
      },
    });

    if (notification) {
      return { success: false, message: "Notification action done" };
    }

    if (!notification) {
      await prisma.$transaction(async (tx) => {
        // Create a response record for the notification
        await tx.notificationResponse.create({
          data: {
            notificationId: notificationId,
            userId: userId,
            response: "Repaired",
            respondedAt: new Date(),
          },
        });
        // Create a read record for the notification
        await tx.notificationRead.create({
          data: {
            notificationId: notificationId,
            userId: userId,
            readAt: new Date(),
          },
        });
      });
    }
    return { success: true };
  } catch (error) {
    console.error(
      "Error marking broken equipment notifications as read:",
      error,
    );
    throw new Error("Failed to mark broken equipment notifications as read");
  }
}
