/*
  Warnings:

  - The `isActive` column on the `FormTemplate` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FormTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "FormTemplate" DROP COLUMN "isActive",
ADD COLUMN     "isActive" "FormTemplateStatus" NOT NULL DEFAULT 'DRAFT';
