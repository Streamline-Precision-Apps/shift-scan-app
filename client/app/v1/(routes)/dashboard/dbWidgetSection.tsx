"use client";
import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { Session } from "next-auth";
import { useCurrentView } from "@/app/context/CurrentViewContext";
import TascoDashboardView from "./UI/_dashboards/tascoDashboardView";
import TruckDriverDashboardView from "./UI/_dashboards/truckDriverDashboardView";
import MechanicDashboardView from "./UI/_dashboards/mechanicDashboardView";
import GeneralDashboardView from "./UI/_dashboards/generalDashboardView";
import { LogItem } from "@/lib/types";
import { useModalState } from "@/hooks/(dashboard)/useModalState";

type props = {
  session: Session;
  view: string;
  mechanicProjectID: string;
  laborType: string;
};

// Verifies if there are any unSubmitted logs
const useFetchLogs = (
  setLogs: React.Dispatch<React.SetStateAction<LogItem[]>>,
) => {
  const e = useTranslations("Err-Msg");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("/api/getLogs");
        const logsData = await response.json();
        setLogs(logsData);
      } catch (error) {
        console.error(e("Logs-Fetch"));
      }
    };
    fetchLogs();
  }, [e, setLogs]);
};

export default function DbWidgetSection({
  session,
  view,
  mechanicProjectID,
  laborType,
}: props) {
  const permission = session.user.permission;
  const [logs, setLogs] = useState<LogItem[]>([]);

  const [comment, setComment] = useState("");

  const router = useRouter();
  const { currentView } = useCurrentView();

  useFetchLogs(setLogs);
  const modalState = useModalState();

  const verifyLogsCompletion = useCallback(() => {
    if (logs.length === 0) {
      router.push("/dashboard/clock-out");
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
