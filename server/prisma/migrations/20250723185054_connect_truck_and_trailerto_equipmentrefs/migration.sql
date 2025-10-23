-- AddForeignKey
ALTER TABLE "TruckingLog" ADD CONSTRAINT "TruckingLog_truckNumber_fkey" FOREIGN KEY ("truckNumber") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TruckingLog" ADD CONSTRAINT "TruckingLog_trailerNumber_fkey" FOREIGN KEY ("trailerNumber") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
