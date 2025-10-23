-- DropForeignKey
ALTER TABLE "Jobsite" DROP CONSTRAINT "Jobsite_clientId_fkey";

-- AlterTable
ALTER TABLE "Jobsite" ALTER COLUMN "clientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Jobsite" ADD CONSTRAINT "Jobsite_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
