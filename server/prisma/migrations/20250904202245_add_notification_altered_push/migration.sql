/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `TopicSubscription` table. All the data in the column will be lost.
  - The `frequency` column on the `TopicSubscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,topic]` on the table `TopicSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `TopicSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Frequency" AS ENUM ('immediate', 'hourly', 'daily');

-- DropForeignKey
ALTER TABLE "public"."TopicSubscription" DROP CONSTRAINT "TopicSubscription_subscriptionId_fkey";

-- DropIndex
DROP INDEX "public"."TopicSubscription_subscriptionId_idx";

-- AlterTable
ALTER TABLE "public"."TopicSubscription" DROP COLUMN "subscriptionId",
ADD COLUMN     "userId" TEXT NOT NULL,
DROP COLUMN "frequency",
ADD COLUMN     "frequency" "public"."Frequency" NOT NULL DEFAULT 'immediate';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "lastSeen" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "url" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pushedAt" TIMESTAMP(3),
    "pushAttempts" INTEGER NOT NULL DEFAULT 0,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "public"."Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_topic_createdAt_idx" ON "public"."Notification"("topic", "createdAt");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "public"."PushSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicSubscription_userId_topic_key" ON "public"."TopicSubscription"("userId", "topic");

-- AddForeignKey
ALTER TABLE "public"."TopicSubscription" ADD CONSTRAINT "TopicSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
