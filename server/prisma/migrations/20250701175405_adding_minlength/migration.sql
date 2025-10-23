/*
  Warnings:

  - You are about to drop the column `defaultValue` on the `FormField` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormField" DROP COLUMN "defaultValue",
ADD COLUMN     "minLength" INTEGER;
