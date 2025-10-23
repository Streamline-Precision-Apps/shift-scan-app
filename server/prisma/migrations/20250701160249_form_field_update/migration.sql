/*
  Warnings:

  - You are about to drop the column `helperText` on the `FormField` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `FormField` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FieldType" ADD VALUE 'SEARCH_PERSON';
ALTER TYPE "FieldType" ADD VALUE 'SEARCH_ASSET';

-- AlterTable
ALTER TABLE "FormField" DROP COLUMN "helperText",
DROP COLUMN "name",
ADD COLUMN     "filter" TEXT;
