/*
  Warnings:

  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `TopicSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `inApp` on the `TopicSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `push` on the `TopicSubscription` table. All the data in the column will be lost.
  - You are about to drop the `PushSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PushSubscription" DROP CONSTRAINT "PushSubscription_userId_fkey";

-- DropIndex
DROP INDEX "public"."Notification_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."TopicSubscription" DROP COLUMN "frequency",
DROP COLUMN "inApp",
DROP COLUMN "push";

-- DropTable
DROP TABLE "public"."PushSubscription";

-- DropEnum
DROP TYPE "public"."Frequency";

-- CreateTable
CREATE TABLE "public"."FCMToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FCMToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FCMToken_token_key" ON "public"."FCMToken"("token");

-- CreateIndex
CREATE INDEX "FCMToken_userId_idx" ON "public"."FCMToken"("userId");

-- CreateIndex
CREATE INDEX "FCMToken_token_idx" ON "public"."FCMToken"("token");

-- AddForeignKey
ALTER TABLE "public"."FCMToken" ADD CONSTRAINT "FCMToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
