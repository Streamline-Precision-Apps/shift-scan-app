"use client";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import ClockOutBtn from "../_buttons/clockOutBtn";
import GeneratorBtn from "../_buttons/generatorBtn";
import MyTeamWidget from "../_buttons/myTeamBtn";
import SwitchJobsBtn from "../_buttons/switchJobsBtn";
import { Dispatch, SetStateAction, use, useEffect } from "react";
import TascoBtn from "../_buttons/TascoBtn";

import EquipmentBtn from "../_buttons/equipmentBtn";
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

export default function TascoDashboardView({
  verifyLogsCompletion,
  permission,
  logs,
  laborType,
  mechanicProjectID,
}: {
  isModalOpen: boolean;
  isModal2Open: boolean;
  setIsModal2Open: Dispatch<SetStateAction<boolean>>;
  comment: string;
  setComment: Dispatch<SetStateAction<string>>;
  handleCloseModal: () => void;
  verifyLogsCompletion: () => void;
  permission: string;
  currentView: string | null;
  logs: LogItem[];
  laborType: string;
  mechanicProjectID: string;
}) {
  const modalState = useModalState();

  if (laborType === "tascoAbcdLabor") {
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
  } else {
    return (
      <>
        <Contents width={"section"} className="py-5">
          <Grids cols={"2"} rows={"3"} gap={"5"}>
            <>
              <TascoBtn
                permission={permission}
                view={"tasco"}
                laborType={laborType}
              />
              <SwitchJobsBtn
                {...modalState}
                permission={permission}
                logs={logs}
                laborType={laborType}
                view={"tasco"}
              />
              {permission !== "USER" && <GeneratorBtn />}
              {permission !== "USER" && <MyTeamWidget />}

              <ClockOutBtn
                permission={permission}
                laborType={laborType}
                mechanicProjectID={mechanicProjectID}
                logs={logs}
                View={"tasco"}
              />
            </>
          </Grids>
        </Contents>
      </>
    );
  }
}
