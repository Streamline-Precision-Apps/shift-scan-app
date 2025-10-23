/*
  Warnings:

  - A unique constraint covering the columns `[notificationId]` on the table `NotificationResponse` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."NotificationResponse_notificationId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "NotificationResponse_notificationId_key" ON "public"."NotificationResponse"("notificationId");
