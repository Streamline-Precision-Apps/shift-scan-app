"use client";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

type TascoLog = {
  id: string;
  shiftType: string;
  laborType: string;
  materialType: string | null;
  LoadQuantity: number;
  Equipment: {
    id: string;
    name: string;
  };
  RefuelLogs: RefuelLog[];
};

type TimeSheet = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  jobsiteId: string;
  workType: string;
  status: string;
  CostCode: {
    name: string;
  };
  Jobsite: {
    name: string;
  };
  TascoLogs: TascoLog[];
  TruckingLogs: TruckingLog[];
  EmployeeEquipmentLogs: {
    id: string;
    startTime: string;
    endTime: string;
    Equipment: {
      id: string;
      name: string;
    };
    RefuelLogs: RefuelLog[];
  }[];
};

type RefuelLog = {
  id: string;
  gallonsRefueled: number;
  milesAtFueling?: number;
};

type StateMileage = {
  id: string;
  state: string;
  stateLineMileage: number;
};

type Material = {
  id: string;
  name: string;
  quantity: number;
  loadType: string;
  unit: string;
  locationOfMaterial: string | null;
  materialWeight: number;
};

type EquipmentHauled = {
  id: string;
  source: string;
  destination: string;
  Equipment: {
    name: string;
  };
};

type TruckingLog = {
  id: string;
  laborType: string;
  startingMileage: number;
  endingMileage: number | null;
  Truck: {
    id: string;
    name: string;
  };
  Trailer: {
    id: string;
    name: string;
  };
  Equipment: {
    id: string;
    name: string;
  };
  Materials: Material[];
  EquipmentHauled: EquipmentHauled[];
  RefuelLogs: RefuelLog[];
  StateMileages: StateMileage[];
};

export default function TruckingReviewSection({
  currentTimeSheets,
}: {
  currentTimeSheets: TimeSheet[];
}) {
  const t = useTranslations("TimeCardSwiper");
  const [tabs, setTabs] = useState(1);
  // Combine all trucking logs from all timesheets
  const allTruckingLogs = currentTimeSheets.flatMap(
    (timesheet) => timesheet.TruckingLogs || [],
  );

  if (allTruckingLogs.length === 0) {
    return (
      <Holds className="h-full w-full flex items-center justify-center">
        <Texts size="p6">{t("NoTruckingDataAvailable")}</Texts>
      </Holds>
    );
  }

  // Helper to format mileage range
  const formatMileage = (log: TruckingLog) => {
    const start = log.startingMileage ?? "N/A";
    const end = log.endingMileage ?? "N/A";
    return `${start} → ${end} Mi`;
  };

  // Helper to format refuel info
  const formatRefuel = (log: TruckingLog) => {
    if (!log.RefuelLogs?.length) return "N/A";
    return log.RefuelLogs.map(
      (r: RefuelLog) => `${r.gallonsRefueled} gal`,
    ).join(", ");
  };

  // Helper to format state mileage
  const formatStateMileage = (log: TruckingLog) => {
    if (!log.StateMileages?.length) return "N/A";
    return log.StateMileages.map(
      (s: StateMileage) => `${s.state}: ${s.stateLineMileage} mi`,
    ).join(", ");
  };

  // Helper to format materials
  const formatMaterials = (log: TruckingLog) => {
    if (!log.Materials?.length) return "N/A";
    return log.Materials.map(
      (m: Material) =>
        `${m.name} (${m.quantity ?? "-"} ${m.quantity > 1 ? m.unit : m.unit.slice(0, -1)})`,
    ).join(", ");
  };

  // Helper to format equipment hauled
  const formatEquipmentHauled = (log: TruckingLog) => {
    if (!log.EquipmentHauled?.length) return "-";
    return log.EquipmentHauled.map(
      (e: EquipmentHauled) =>
        `${e.Equipment?.name ?? "-"} → ${e.destination ?? "-"}`,
    ).join(", ");
  };

  return (
    <Accordion type="single" collapsible>
      {allTruckingLogs.map((log: TruckingLog) => (
        <AccordionItem
          value={log.id}
          key={log.id}
          className="bg-white rounded-lg mb-2"
        >
          <AccordionTrigger className="p-2 focus:outline-none hover:no-underline focus:underline-none focus:border-none flex flex-row items-start gap-1">
            <p className="text-sm truncate max-w-[200px] font-semibold">
              {log.Truck?.name ?? "-"}
            </p>
            {log.Trailer && (
              <p className="text-xs font-semibold">{`- ${log.Trailer.name}`}</p>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <Holds className="p-2 bg-white flex flex-col items-start relative border-t border-gray-200">
              <Texts className="text-sm">
                {t("Trailer")}: {log.Trailer?.name ?? "N/A"}
              </Texts>
              <Texts className="text-sm mb-1">
                {t("Mileage")}: {formatMileage(log)}
              </Texts>
              <Texts className="text-sm underline">{t("Refuel")}: </Texts>
              <Texts className="text-sm mb-1">{formatRefuel(log)}</Texts>
              <Texts className="text-sm underline">{t("StateMileage")}: </Texts>
              <Texts className="text-sm mb-1">{formatStateMileage(log)}</Texts>
              <Texts className="text-sm underline">{t("Materials")}: </Texts>
              <Texts className="text-sm mb-1">{formatMaterials(log)}</Texts>
              <Texts className="text-sm underline">{t("EquipmentHauled")}: </Texts>
              <Texts className="text-sm mb-1">
                {formatEquipmentHauled(log)}
              </Texts>
            </Holds>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
