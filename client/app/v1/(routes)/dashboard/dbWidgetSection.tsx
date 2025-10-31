"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import React from "react";

import { useCurrentView } from "@/app/lib/context/CurrentViewContext";
import TascoDashboardView from "./UI/_dashboards/tascoDashboardView";
import TruckDriverDashboardView from "./UI/_dashboards/truckDriverDashboardView";
import MechanicDashboardView from "./UI/_dashboards/mechanicDashboardView";
import GeneralDashboardView from "./UI/_dashboards/generalDashboardView";

import { useUserStore } from "@/app/lib/store/userStore";
import useModalState from "@/app/lib/hooks/useModalState";
import { apiRequest } from "@/app/lib/utils/api-Utils";

type props = {
  view: string;
  mechanicProjectID: string;
  laborType: string;
};

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

// Verifies if there are any unSubmitted logs
const useFetchLogs = (
  setLogs: React.Dispatch<React.SetStateAction<LogItem[]>>
) => {
  const e = useTranslations("Err-Msg");
  const { user } = useUserStore();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        if (!user?.id) {
          console.warn("User ID not available");
          return;
        }

        const response = await apiRequest(
          `/api/v1/timesheet/user/${user.id}/dashboard-logs`,
          "GET"
        );

        if (response.success && response.data) {
          setLogs(response.data);
        }
      } catch (error) {
        console.error(e("Logs-Fetch"), error);
      }
    };
    fetchLogs();
  }, [e, setLogs, user?.id]);
};

export default function DbWidgetSection({
  view,
  mechanicProjectID,
  laborType,
}: props) {
  const { user } = useUserStore();
  const permission = user?.permission as string;
  const [logs, setLogs] = useState<LogItem[]>([]);

  const [comment, setComment] = useState("");

  const router = useRouter();
  const { currentView } = useCurrentView();

  useFetchLogs(setLogs);
  const modalState = useModalState();

  const verifyLogsCompletion = useCallback(() => {
    if (logs.length === 0) {
      router.push("/v1/dashboard/clock-out");
    } else {
      modalState.handleOpenModal();
    }
  }, [logs, router, modalState]);

  // Use switch for better readability in rendering views
  switch (view) {
    case "tasco":
      return (
        <TascoDashboardView
          {...modalState}
          comment={comment}
          setComment={setComment}
          verifyLogsCompletion={verifyLogsCompletion}
          logs={logs}
          permission={permission}
          currentView={currentView}
          mechanicProjectID={mechanicProjectID}
          laborType={laborType}
        />
      );
    case "truck":
      return (
        <TruckDriverDashboardView
          {...modalState}
          comment={comment}
          setComment={setComment}
          verifyLogsCompletion={verifyLogsCompletion}
          logs={logs}
          permission={permission}
          mechanicProjectID={mechanicProjectID}
          laborType={laborType}
        />
      );
    case "mechanic":
      return (
        <MechanicDashboardView
          {...modalState}
          comment={comment}
          setComment={setComment}
          verifyLogsCompletion={verifyLogsCompletion}
          logs={logs}
          permission={permission}
          mechanicProjectID={mechanicProjectID}
          laborType={laborType}
        />
      );
    case "general":
      return (
        <GeneralDashboardView
          {...modalState}
          comment={comment}
          setComment={setComment}
          verifyLogsCompletion={verifyLogsCompletion}
          logs={logs}
          mechanicProjectID={mechanicProjectID}
          permission={permission}
        />
      );
    default:
      return null;
  }
}
