"use client";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import ClockOutBtn from "../_buttons/clockOutBtn";
import EquipmentBtn from "../_buttons/equipmentBtn";
import GeneratorBtn from "../_buttons/generatorBtn";
import MyTeamWidget from "../_buttons/myTeamBtn";
import SwitchJobsBtn from "../_buttons/switchJobsBtn";
import { Dispatch, SetStateAction } from "react";
import useModalState from "@/app/lib/hooks/useModalState";

export type LogItem = {
  id: string;
  userId: string;
  submitted: boolean;
  type: "equipment" | "mechanic" | "Trucking Assistant";
} & (
  | {
      type: "equipment";
      equipment: {
        id: string;
        qrId: string;
        name: string;
      };
      maintenanceId?: never;
      laborType?: never;
      stateMileage?: never;
      refueled?: never;
      material?: never;
      equipmentHauled?: never;
    }
  | {
      type: "mechanic";
      maintenanceId: string;
      equipment?: never;
      laborType?: never;
      stateMileage?: never;
      refueled?: never;
      material?: never;
      equipmentHauled?: never;
    }
  | {
      type: "trucking";
      laborType: string;
      comment: string | null;
      endingMileage: number | null;
      stateMileage: boolean;
      refueled: boolean;
      material: boolean;
      equipmentHauled: boolean;
      equipment?: never;
      maintenanceId?: never;
    }
);

export default function GeneralDashboardView({
  verifyLogsCompletion,
  permission,
  logs,
  mechanicProjectID,
}: {
  isModalOpen: boolean;
  isModal2Open: boolean;
  setIsModal2Open: Dispatch<SetStateAction<boolean>>;
  comment: string;
  setComment: Dispatch<SetStateAction<string>>;
  verifyLogsCompletion: () => void;
  permission: string;
  logs: LogItem[];
  mechanicProjectID: string;
}) {
  const modalState = useModalState();
  return (
    <>
      <Contents width={"section"} className="py-5">
        <Grids cols={"2"} rows={"3"} gap={"5"}>
          <>
            <EquipmentBtn permission={permission} />

            <SwitchJobsBtn
              {...modalState}
              permission={permission}
              logs={logs}
              laborType={"general"}
              view={"general"}
            />

            {permission !== "USER" && <GeneratorBtn />}

            {permission !== "USER" && <MyTeamWidget />}

            <ClockOutBtn
              permission={permission}
              logs={logs}
              mechanicProjectID={mechanicProjectID}
              View={"general"}
              laborType="general"
            />
          </>
        </Grids>
      </Contents>
    </>
  );
}
