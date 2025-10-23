/*
  Warnings:

  - The primary key for the `FormSubmission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FormSubmission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `clientId` on the `Jobsite` table. All the data in the column will be lost.
  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TimeSheet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TimeSheet` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `timeSheetId` on the `EmployeeEquipmentLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `formSubmissionId` on the `FormApproval` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `timeSheetId` on the `MaintenanceLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `reportId` on the `ReportRun` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `timeSheetId` on the `TascoLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `timeSheetId` on the `TruckingLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."Client" DROP CONSTRAINT "Client_addressId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Client" DROP CONSTRAINT "Client_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Client" DROP CONSTRAINT "Client_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."EmployeeEquipmentLog" DROP CONSTRAINT "EmployeeEquipmentLog_timeSheetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormApproval" DROP CONSTRAINT "FormApproval_formSubmissionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Jobsite" DROP CONSTRAINT "Jobsite_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MaintenanceLog" DROP CONSTRAINT "MaintenanceLog_timeSheetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ReportRun" DROP CONSTRAINT "ReportRun_reportId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TascoLog" DROP CONSTRAINT "TascoLog_timeSheetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TruckingLog" DROP CONSTRAINT "TruckingLog_timeSheetId_fkey";

-- DropIndex
DROP INDEX "public"."Jobsite_clientId_idx";

-- AlterTable
ALTER TABLE "public"."EmployeeEquipmentLog" DROP COLUMN "timeSheetId",
ADD COLUMN     "timeSheetId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."FormApproval" DROP COLUMN "formSubmissionId",
ADD COLUMN     "formSubmissionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."FormSubmission" DROP CONSTRAINT "FormSubmission_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."Jobsite" DROP COLUMN "clientId";

-- AlterTable
ALTER TABLE "public"."MaintenanceLog" DROP COLUMN "timeSheetId",
ADD COLUMN     "timeSheetId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Report" DROP CONSTRAINT "Report_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."ReportRun" DROP COLUMN "reportId",
ADD COLUMN     "reportId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."TascoLog" DROP COLUMN "timeSheetId",
ADD COLUMN     "timeSheetId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."TimeSheet" DROP CONSTRAINT "TimeSheet_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "TimeSheet_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."TruckingLog" DROP COLUMN "timeSheetId",
ADD COLUMN     "timeSheetId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Client";

-- CreateIndex
CREATE INDEX "EmployeeEquipmentLog_timeSheetId_equipmentId_maintenanceId_idx" ON "public"."EmployeeEquipmentLog"("timeSheetId", "equipmentId", "maintenanceId");

-- AddForeignKey
ALTER TABLE "public"."EmployeeEquipmentLog" ADD CONSTRAINT "EmployeeEquipmentLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "public"."TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormApproval" ADD CONSTRAINT "FormApproval_formSubmissionId_fkey" FOREIGN KEY ("formSubmissionId") REFERENCES "public"."FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReportRun" ADD CONSTRAINT "ReportRun_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "public"."TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TascoLog" ADD CONSTRAINT "TascoLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "public"."TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TruckingLog" ADD CONSTRAINT "TruckingLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "public"."TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
