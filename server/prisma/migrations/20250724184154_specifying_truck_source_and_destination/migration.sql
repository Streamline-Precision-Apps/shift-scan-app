/*
  Warnings:

  - You are about to drop the column `jobSiteId` on the `EquipmentHauled` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "EquipmentHauled" DROP CONSTRAINT "EquipmentHauled_jobSiteId_fkey";

-- AlterTable
ALTER TABLE "EquipmentHauled" DROP COLUMN "jobSiteId",
ADD COLUMN     "destination" TEXT,
ADD COLUMN     "source" TEXT;
