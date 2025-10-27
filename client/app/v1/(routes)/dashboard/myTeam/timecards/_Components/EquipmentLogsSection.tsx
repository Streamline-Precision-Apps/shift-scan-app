"use client";
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
  TascoLogs: {
    id: string;
    shiftType: string;
    laborType: string;
    materialType: string | null;
    LoadQuantity: number;
    Equipment: {
      id: string;
      name: string;
    };
    RefuelLogs: {
      id: string;
      gallonsRefueled: number;
    }[];
  }[];
  TruckingLogs: {
    id: string;
    laborType: string;
    startingMileage: number;
    endingMileage: number | null;
    Equipment: {
      id: string;
      name: string;
    };
    Materials: {
      id: string;
      name: string;
      quantity: number;
      loadType: string;
      unit: string;
      locationOfMaterial: string | null;
      materialWeight: number;
    }[];
    EquipmentHauled: {
      id: string;
      source: string;
      destination: string;
      Equipment: {
        name: string;
      };
    }[];
    RefuelLogs: {
      id: string;
      gallonsRefueled: number;
      milesAtFueling?: number;
    }[];
    StateMileages: {
      id: string;
      state: string;
      stateLineMileage: number;
    }[];
  }[];
  EmployeeEquipmentLogs: {
    id: string;
    startTime: string;
    endTime: string;
    Equipment: {
      id: string;
      name: string;
    };
    RefuelLogs: {
      id: string;
      gallonsRefueled: number;
    }[];
  }[];
};

import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { formatDurationStrings } from "@/utils/formatDurationStrings";
import { useTranslations } from "next-intl";

export default function EquipmentLogsSection({
  currentTimeSheets,
}: {
  currentTimeSheets: TimeSheet[];
}) {
  const t = useTranslations("TimeCardSwiper");
  const allEquipmentLogs = currentTimeSheets.flatMap(
    (timesheet) => timesheet.EmployeeEquipmentLogs || [],
  );

  const hasAnyEquipmentData = allEquipmentLogs.length > 0;

  if (!hasAnyEquipmentData) {
    return (
      <Holds className="h-full w-full flex items-center justify-center">
        <Texts size="p6">{t("NoEquipmentDataAvailable")}</Texts>
      </Holds>
    );
  }

  return (
    <Holds
      className="h-full w-full overflow-y-auto no-scrollbar"
      style={{ touchAction: "pan-y" }}
    >
      <Grids rows={"9"} className="w-full h-full">
        <Holds
          background={"white"}
          className="row-start-1 row-end-10 h-full border-[3px] border-black"
        >
          <Holds className="w-full h-full ">
            <Holds>
              <Grids
                cols={"3"}
                gap={"2"}
                className="p-2 border-b-[3px] border-black"
              >
                <Titles position={"left"} size={"h7"}>
                  {t("Equipment")}
                </Titles>
                <Titles size={"h7"}>{t("UsageTime")}</Titles>
                <Titles position={"right"} size={"h7"}>
                  {t("Labor")}
                </Titles>
              </Grids>
            </Holds>
            <Holds className="overflow-y-auto no-scrollbar">
              {allEquipmentLogs.map((log) => (
                <Grids
                  key={log.id}
                  cols={"3"}
                  gap={"2"}
                  className="p-2 border-b-[3px] border-black"
                >
                  <Texts position={"left"} size={"p7"}>
                    {log.Equipment?.name || "-"}
                  </Texts>
                  <Texts size={"p7"}>
                    {formatDurationStrings(log.startTime, log.endTime)}
                  </Texts>

                  {log.RefuelLogs ? (
                    <Texts position={"right"} size={"p7"}>
                      {`${
                        log.RefuelLogs.map((log) => log.gallonsRefueled).reduce(
                          (a, b) => a + b,
                          0,
                        ) || "0"
                      } gal`}
                    </Texts>
                  ) : (
                    <Texts position={"right"} size={"p7"}>
                      {t("NA")}
                    </Texts>
                  )}
                </Grids>
              ))}
            </Holds>
          </Holds>
        </Holds>
      </Grids>
    </Holds>
  );
}
