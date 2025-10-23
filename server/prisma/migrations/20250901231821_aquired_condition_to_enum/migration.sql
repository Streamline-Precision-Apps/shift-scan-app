/*
  Warnings:

  - The `acquiredCondition` column on the `Equipment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Condition" AS ENUM ('NEW', 'USED');

-- AlterTable
ALTER TABLE "public"."Equipment" DROP COLUMN "acquiredCondition",
ADD COLUMN     "acquiredCondition" "public"."Condition";
