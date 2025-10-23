-- CreateTable
CREATE TABLE "public"."mechanicProjects" (
    "id" SERIAL NOT NULL,
    "timeSheetId" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION,
    "equipmentId" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "mechanicProjects_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."mechanicProjects" ADD CONSTRAINT "mechanicProjects_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "public"."TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mechanicProjects" ADD CONSTRAINT "mechanicProjects_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
