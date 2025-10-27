"use server";
import { Suspense } from "react";
import EquipmentLogClient from "./_components/EquipmentLogClient";
import { FormStatus } from "../../../../../prisma/generated/prisma/client";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import LoadingEquipmentLogClient from "./_components/LoadingEquipmentLogClient";

export type EmployeeEquipmentLogs = {
  id: string;
  date: Date;
  equipmentId: string;
  jobsiteId: string;
  employeeId: string;
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
  isRefueled: boolean;
  fuelUsed?: number | null;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
  isFinished: boolean;
  status: FormStatus;
  Equipment?: Equipment | null;
};

export type Equipment = {
  id: string;
  qrId: string;
  name: string;
  description?: string;
  equipmentTag: string;
  lastInspection?: Date | null;
  lastRepair?: Date | null;
  status?: string;
  make?: string | null;
  model?: string | null;
  year?: string | null;
  licensePlate?: string | null;
  registrationExpiration?: Date | null;
  mileage?: number | null | undefined;
  isActive?: boolean;
  inUse?: boolean;
};

export default async function EquipmentLogContent() {
  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="relative size-full">
          <Suspense fallback={<LoadingEquipmentLogClient />}>
            <EquipmentLogClient />
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
