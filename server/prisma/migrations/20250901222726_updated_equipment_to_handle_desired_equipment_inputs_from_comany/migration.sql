/*
  Warnings:

  - You are about to drop the `EquipmentVehicleInfo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Equipment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialNumber]` on the table `Equipment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."OwnershipType" AS ENUM ('OWNED', 'LEASED');

-- DropForeignKey
ALTER TABLE "public"."EquipmentVehicleInfo" DROP CONSTRAINT "EquipmentVehicleInfo_id_fkey";

-- AlterTable
ALTER TABLE "public"."Equipment" ADD COLUMN     "acquiredCondition" TIMESTAMP(3),
ADD COLUMN     "acquiredDate" TIMESTAMP(3),
ADD COLUMN     "code" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "licensePlate" TEXT,
ADD COLUMN     "licenseState" TEXT,
ADD COLUMN     "make" TEXT,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "ownershipType" "public"."OwnershipType",
ADD COLUMN     "registrationExpiration" TIMESTAMP(3),
ADD COLUMN     "serialNumber" TEXT,
ADD COLUMN     "year" TEXT;

-- DropTable
DROP TABLE "public"."EquipmentVehicleInfo";

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_code_key" ON "public"."Equipment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_serialNumber_key" ON "public"."Equipment"("serialNumber");
