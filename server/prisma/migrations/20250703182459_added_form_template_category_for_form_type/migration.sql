/*
  Warnings:

  - The `formType` column on the `FormTemplate` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FormTemplateCategory" AS ENUM ('GENERAL', 'MAINTENANCE', 'SAFETY', 'INSPECTION', 'INCIDENT', 'FINANCE', 'OTHER');

-- AlterTable
ALTER TABLE "FormTemplate" DROP COLUMN "formType",
ADD COLUMN     "formType" "FormTemplateCategory" NOT NULL DEFAULT 'GENERAL';
