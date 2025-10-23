/*
  Warnings:

  - You are about to drop the column `headerSize` on the `FormField` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormField" DROP COLUMN "headerSize",
ADD COLUMN     "multiple" BOOLEAN DEFAULT false;
