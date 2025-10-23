-- CreateTable
CREATE TABLE "public"."TascoFLoads" (
    "id" SERIAL NOT NULL,
    "tascoLogId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "screenType" "public"."LoadType",

    CONSTRAINT "TascoFLoads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TascoFLoads" ADD CONSTRAINT "TascoFLoads_tascoLogId_fkey" FOREIGN KEY ("tascoLogId") REFERENCES "public"."TascoLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
