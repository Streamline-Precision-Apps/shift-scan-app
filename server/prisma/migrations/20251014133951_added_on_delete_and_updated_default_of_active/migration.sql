/*
  Warnings:

  - You are about to drop the column `isDisabledByAdmin` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Jobsite` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ActiveStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "public"."NotificationRead" DROP CONSTRAINT "NotificationRead_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."NotificationResponse" DROP CONSTRAINT "NotificationResponse_notificationId_fkey";

-- DropIndex
DROP INDEX "public"."Equipment_state_isDisabledByAdmin_idx";

-- AlterTable
ALTER TABLE "public"."Equipment" DROP COLUMN "isDisabledByAdmin",
ADD COLUMN     "status" "public"."FormTemplateStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."Jobsite" DROP COLUMN "isActive",
ADD COLUMN     "status" "public"."FormTemplateStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Equipment_status_idx" ON "public"."Equipment"("status");

-- CreateIndex
CREATE INDEX "Jobsite_status_idx" ON "public"."Jobsite"("status");

-- AddForeignKey
ALTER TABLE "public"."NotificationResponse" ADD CONSTRAINT "NotificationResponse_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationRead" ADD CONSTRAINT "NotificationRead_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
