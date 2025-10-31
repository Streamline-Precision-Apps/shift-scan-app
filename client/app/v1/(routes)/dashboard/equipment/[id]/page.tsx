"use client";
import { updateEmployeeEquipmentLog } from "@/app/lib/actions/equipmentActions";
import { useNotification } from "@/app/lib/context/NotificationContext";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { useRouter } from "next/navigation";
import { Suspense, use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { differenceInSeconds, parseISO } from "date-fns";
import {
  deleteEmployeeEquipmentLog,
  deleteRefuelLog,
  updateRefuelLog,
} from "@/app/lib/actions/truckingActions";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { apiRequest } from "@/app/lib/utils/api-Utils";

import {
  UnifiedEquipmentState,
  EmployeeEquipmentLogData,
  EquipmentLog,
  RefuelLogData,
  Refueled,
  EquipmentState,
} from "./types";

import EquipmentIdClientPage from "./_components/EquipmentIdClientPage";
import LoadingEquipmentIdPage from "./_components/loadingEquipmentIdPage";

export type FormStatus = "DRAFT" | "PENDING" | "APPROVED" | "DENIED";

// Helper function to transform API response to form state
function transformApiToFormState(
  apiData: EmployeeEquipmentLogData
): EquipmentLog {
  return {
    id: apiData.id,
    equipmentId: apiData.equipmentId,
    startTime: apiData.startTime || "",
    endTime: apiData.endTime || "",
    comment: apiData.comment || "",
    isFinished: apiData.isFinished,
    equipment: {
      name: apiData.Equipment.name,
      status: apiData.Equipment.state,
    },
    maintenanceId: apiData.MaintenanceId
      ? {
          id: apiData.MaintenanceId.id,
          equipmentIssue: apiData.MaintenanceId.equipmentIssue,
          additionalInfo: apiData.MaintenanceId.additionalInfo,
        }
      : null,
    refuelLogs: apiData.RefuelLog
      ? {
          id: apiData.RefuelLog.id,
          gallonsRefueled: apiData.RefuelLog.gallonsRefueled,
        }
      : null,

    fullyOperational: !apiData.MaintenanceId && apiData.isFinished,
  };
}

// Initial state factory
function createInitialState(): UnifiedEquipmentState {
  return {
    isLoading: true,
    hasChanged: false,
    formState: {
      id: "",
      equipmentId: "",
      startTime: "",
      endTime: "",
      comment: "",
      isFinished: false,
      equipment: {
        name: "",
        status: "OPERATIONAL" as EquipmentState, // Default to OPERATIONAL
      },
      maintenanceId: null,
      refuelLogs: null,
      fullyOperational: true,
    },
    markedForRefuel: false,
    error: null,
  };
}

export default function CombinedForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const id = use(params).id;
  const { setNotification } = useNotification();
  const t = useTranslations("Equipment");
  const [state, setState] = useState<UnifiedEquipmentState>(
    createInitialState()
  );

  // Fetch equipment log data
  useEffect(() => {
    const fetchEqLog = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await apiRequest(
          `/api/v1/timesheet/equipment-log/${id}`,
          "GET"
        );

        const apiData = response.data as EmployeeEquipmentLogData;
        const formState = transformApiToFormState(apiData);

        // If the log isn't finished AND there's no end time, set the end time to now when opening the form
        if (!apiData.isFinished && !apiData.endTime) {
          formState.endTime = new Date().toISOString();
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          formState: formState,
          markedForRefuel: Boolean(formState.refuelLogs),
        }));
      } catch (error) {
        console.error("Error fetching equipment log:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch equipment log",
        }));
      }
    };

    fetchEqLog();
  }, [id]);

  // Show error state
  if (state.error) {
    return (
      <Bases>
        <Contents>
          <Holds className="h-full w-full justify-center items-center">
            <Titles size="h3">Error: {state.error}</Titles>
            <Buttons
              onClick={() => router.push("/v1/dashboard/equipment")}
              background="lightBlue"
            >
              <Titles size="h5">{t("BacktoEquipment")}</Titles>
            </Buttons>
          </Holds>
        </Contents>
      </Bases>
    );
  }

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="h-full w-full ">
          <Suspense fallback={<LoadingEquipmentIdPage />}>
            <EquipmentIdClientPage id={id} />
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
