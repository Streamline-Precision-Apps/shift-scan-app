-- DropForeignKey
ALTER TABLE "EquipmentVehicleInfo" DROP CONSTRAINT "EquipmentVehicleInfo_id_fkey";

-- AddForeignKey
ALTER TABLE "EquipmentVehicleInfo" ADD CONSTRAINT "EquipmentVehicleInfo_id_fkey" FOREIGN KEY ("id") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
