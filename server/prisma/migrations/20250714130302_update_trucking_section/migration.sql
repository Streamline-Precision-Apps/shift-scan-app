/*
  Warnings:

  - You are about to drop the column `grossWeight` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `lightWeight` on the `Material` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "materialUnit" AS ENUM ('TONS', 'YARDS');

-- AlterTable
ALTER TABLE "EquipmentHauled" ADD COLUMN     "endMileage" INTEGER,
ADD COLUMN     "startMileage" INTEGER;

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "grossWeight",
DROP COLUMN "lightWeight",
ADD COLUMN     "unit" "materialUnit",
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TruckingLog" ADD COLUMN     "trailerNumber" TEXT,
ADD COLUMN     "truckNumber" TEXT;
