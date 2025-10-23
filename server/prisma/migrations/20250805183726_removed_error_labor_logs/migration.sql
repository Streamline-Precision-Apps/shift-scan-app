/*
  Warnings:

  - You are about to drop the `Error` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TruckLaborLogs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TruckLaborLogs" DROP CONSTRAINT "TruckLaborLogs_truckingLogId_fkey";

-- DropTable
DROP TABLE "public"."Error";

-- DropTable
DROP TABLE "public"."TruckLaborLogs";
