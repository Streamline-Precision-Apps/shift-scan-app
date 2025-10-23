/*
  Warnings:

  - You are about to drop the column `fieldName` on the `TimeSheetChangeLog` table. All the data in the column will be lost.
  - You are about to drop the column `newValue` on the `TimeSheetChangeLog` table. All the data in the column will be lost.
  - You are about to drop the column `oldValue` on the `TimeSheetChangeLog` table. All the data in the column will be lost.
  - Added the required column `changes` to the `TimeSheetChangeLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TimeSheetChangeLog" DROP COLUMN "fieldName",
DROP COLUMN "newValue",
DROP COLUMN "oldValue",
ADD COLUMN     "changeReason" TEXT,
ADD COLUMN     "changes" JSONB NOT NULL;
