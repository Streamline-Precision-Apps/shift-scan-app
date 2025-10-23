/*
  Warnings:

  - A unique constraint covering the columns `[street,city,state,zipCode]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Address_street_city_state_zipCode_key" ON "Address"("street", "city", "state", "zipCode");
