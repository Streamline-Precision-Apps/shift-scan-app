-- AlterTable
ALTER TABLE "public"."EmployeeEquipmentLog" ADD COLUMN     "rental" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."TimeSheetChangeLog" (
    "id" TEXT NOT NULL,
    "timeSheetId" INTEGER NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,

    CONSTRAINT "TimeSheetChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimeSheetChangeLog_timeSheetId_idx" ON "public"."TimeSheetChangeLog"("timeSheetId");

-- CreateIndex
CREATE INDEX "TimeSheetChangeLog_changedBy_idx" ON "public"."TimeSheetChangeLog"("changedBy");

-- CreateIndex
CREATE INDEX "TimeSheetChangeLog_changedAt_idx" ON "public"."TimeSheetChangeLog"("changedAt");

-- AddForeignKey
ALTER TABLE "public"."TimeSheetChangeLog" ADD CONSTRAINT "TimeSheetChangeLog_timeSheetId_fkey" FOREIGN KEY ("timeSheetId") REFERENCES "public"."TimeSheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimeSheetChangeLog" ADD CONSTRAINT "TimeSheetChangeLog_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
