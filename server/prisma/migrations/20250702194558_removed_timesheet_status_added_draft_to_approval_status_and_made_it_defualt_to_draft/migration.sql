/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `ApprovalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApprovalStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "Client" ALTER COLUMN "approvalStatus" DROP DEFAULT;
ALTER TABLE "Equipment" ALTER COLUMN "approvalStatus" DROP DEFAULT;
ALTER TABLE "Jobsite" ALTER COLUMN "approvalStatus" DROP DEFAULT;
ALTER TABLE "TimeSheet" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Client" ALTER COLUMN "approvalStatus" TYPE "ApprovalStatus_new" USING ("approvalStatus"::text::"ApprovalStatus_new");
ALTER TABLE "Equipment" ALTER COLUMN "approvalStatus" TYPE "ApprovalStatus_new" USING ("approvalStatus"::text::"ApprovalStatus_new");
ALTER TABLE "Jobsite" ALTER COLUMN "approvalStatus" TYPE "ApprovalStatus_new" USING ("approvalStatus"::text::"ApprovalStatus_new");
ALTER TABLE "TimeSheet" ALTER COLUMN "status" TYPE "ApprovalStatus_new" USING ("status"::text::"ApprovalStatus_new");
ALTER TYPE "ApprovalStatus" RENAME TO "ApprovalStatus_old";
ALTER TYPE "ApprovalStatus_new" RENAME TO "ApprovalStatus";
DROP TYPE "ApprovalStatus_old";
ALTER TABLE "Client" ALTER COLUMN "approvalStatus" SET DEFAULT 'PENDING';
ALTER TABLE "Equipment" ALTER COLUMN "approvalStatus" SET DEFAULT 'PENDING';
ALTER TABLE "Jobsite" ALTER COLUMN "approvalStatus" SET DEFAULT 'PENDING';
ALTER TABLE "TimeSheet" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "TimeSheet" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- DropEnum
DROP TYPE "TimeSheetStatus";
