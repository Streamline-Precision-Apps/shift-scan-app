"use client";
import { updateEmployeeEquipmentLog } from "@/actions/equipmentActions";
import { useNotification } from "@/app/context/NotificationContext";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { useRouter } from "next/navigation";
import { Suspense, use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { differenceInSeconds, parseISO } from "date-fns";
import {
  deleteEmployeeEquipmentLog,
  deleteRefuelLog,
  updateRefuelLog,
} from "@/actions/truckingActions";
import { Buttons } from "@/components/(reusable)/buttons";
import { Titles } from "@/components/(reusable)/titles";

import {
  UnifiedEquipmentState,
  EmployeeEquipmentLogData,
  EquipmentLog,
  RefuelLogData,
  Refueled,
  EquipmentState,
} from "./types";
import { FormStatus } from "../../../../../../prisma/generated/prisma/client";
import EquipmentIdClientPage from "./_components/EquipmentIdClientPage";
import LoadingEquipmentIdPage from "./_components/loadingEquipmentIdPage";

// Helper function to transform API response to form state
function transformApiToFormState(
  apiData: EmployeeEquipmentLogData,
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
  const [state, setState] =
    useState<UnifiedEquipmentState>(createInitialState());

  // Fetch equipment log data
  useEffect(() => {
    const fetchEqLog = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`/api/getEqUserLogs/${id}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch equipment log: ${response.statusText}`,
          );
        }

        const apiData = (await response.json()) as EmployeeEquipmentLogData;
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

  const handleFieldChange = (
    field: string,
    value:
      | string
      | number
      | boolean
      | FormStatus
      | EquipmentState
      | Refueled
      | null,
  ) => {
    setState((prev) => {
      if (field.startsWith("equipment.")) {
        const equipmentField = field.split(".")[1];
        return {
          ...prev,
          hasChanged: true,
          formState: {
            ...prev.formState,
            equipment: {
              ...prev.formState.equipment,
              [equipmentField]: value,
            },
          },
        };
      }

      if (field.startsWith("maintenanceId.")) {
        const maintenanceField = field.split(".")[1];
        return {
          ...prev,
          hasChanged: true,
          formState: {
            ...prev.formState,
            maintenanceId: {
              ...(prev.formState.maintenanceId || {
                id: "",
                equipmentIssue: "",
                additionalInfo: null,
              }),
              [maintenanceField]: value,
            },
          },
        };
      }

      return {
        ...prev,
        hasChanged: true,
        formState: {
          ...prev.formState,
          [field]: value,
        },
      };
    });
  };

  const addRefuelLog = async (gallons: number, existingLogId?: string) => {
    if (!state.formState.id) {
      setNotification(t("NoEquipmentLog"), "error");
      return;
    }

    try {
      // If an existingLogId is provided, update the existing log
      if (existingLogId) {
        const formData = new FormData();
        formData.append("id", existingLogId);
        formData.append("gallonsRefueled", gallons.toString());

        const response = await updateRefuelLog(formData);

        if (response) {
          // Update the existing log in state
          setState((prev) => ({
            ...prev,
            formState: {
              ...prev.formState,
              refuelLogs: {
                ...prev.formState.refuelLogs!,
                gallonsRefueled: gallons,
              },
            },
            hasChanged: true,
          }));

          setNotification("Refuel log updated successfully", "success");
        }
      }
    } catch (error) {
      console.error("Error managing refuel log:", error);
      setNotification("Failed to save refuel log", "error");
    }
  };

  const handleChangeRefueled = () => {
    setState((prev) => ({
      ...prev,
      markedForRefuel: !prev.markedForRefuel,
      hasChanged: true,
    }));
  };
  const handleFullOperational = () => {
    setState((prev) => ({
      ...prev,
      formState: {
        ...prev.formState,
        fullyOperational: !prev.formState.fullyOperational,
      },
      hasChanged: true,
    }));
  };
  const deleteLog = async () => {
    try {
      // Check if there's a refuel log to delete
      if (state.formState.refuelLogs) {
        // Call the deleteRefuelLog server action with the ID of the refuel log
        await deleteRefuelLog(state.formState.refuelLogs.id);

        // Update the state to reflect the deletion
        setState((prev) => ({
          ...prev,
          formState: {
            ...prev.formState,
            refuelLogs: null, // Set to null since we've deleted the refuel log
          },
          hasChanged: true,
        }));

        setNotification("Refuel log removed", "success");
      }
    } catch (error) {
      console.error("Error deleting refuel log:", error);
      setNotification("Failed to delete refuel log", "error");
    }
  };

  const deleteEquipmentLog = async () => {
    try {
      await deleteEmployeeEquipmentLog(state.formState.id);
      setNotification(t("Deleted"), "success");
      router.replace("/dashboard/equipment");
    } catch (error) {
      console.error("Error deleting equipment log:", error);
      setNotification(t("FailedToDelete"), "error");
    }
  };

  const saveEdits = async () => {
    try {
      const formData = new FormData();

      // Add basic form field data
      Object.entries(state.formState).forEach(([key, value]) => {
        if (
          key === "equipment" ||
          key === "maintenanceId" ||
          key === "refuelLogs"
        ) {
          // Handle these separately
        } else {
          formData.append(key, String(value));
        }
      });

      // Add equipment status
      formData.append("Equipment.status", state.formState.equipment.status);

      // Handle maintenance data
      if (!state.formState.fullyOperational) {
        if (state.formState.maintenanceId) {
          // Add maintenance fields
          if (state.formState.maintenanceId.id) {
            formData.append("maintenanceId", state.formState.maintenanceId.id);
          }
          formData.append(
            "equipmentIssue",
            state.formState.maintenanceId.equipmentIssue || "",
          );
          formData.append(
            "additionalInfo",
            state.formState.maintenanceId.additionalInfo || "",
          );
        }
      }

      // Handle refuel log data
      if (
        state.formState.refuelLogs === null &&
        state.markedForRefuel === false
      ) {
        formData.append("disconnectRefuelLog", "true");
      } else if (state.formState.refuelLogs) {
        formData.append(
          "refuelLogId",
          state.formState.refuelLogs.id.startsWith("temp-")
            ? "__NULL__" // This indicates we need to create a new log
            : state.formState.refuelLogs.id,
        );
        formData.append(
          "gallonsRefueled",
          state.formState.refuelLogs.gallonsRefueled?.toString() || "__NULL__",
        );
      }

      // Add standard fields
      formData.append("priority", "LOW");
      formData.append("repaired", String(false));

      // Make a single server call to update everything
      const res = await updateEmployeeEquipmentLog(formData);

      if (res.success && res.data.id !== null && res.data.name !== undefined) {
        // Handle success case equipment-break if equipment is marked broken
        await fetch("/api/notifications/send-multicast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: "equipment-break",
            title: "Broken Equipment",
            message: `${res.data.name ? res.data.name : "An equipment"} has been reported broken by ${res.data?.name ? res.data.name : "a user"}.`,
            link: "/admins/equipment?id=" + res.data?.id,
            referenceId: res.data?.id,
          }),
        });
      }

      setState((prev) => ({
        ...prev,
        hasChanged: false,
      }));

      router.replace("/dashboard/equipment");
      setNotification(t("Saved"), "success");
    } catch (error) {
      console.error("Error saving equipment log:", error);
      setNotification(t("FailedToSave"), "error");
    }
  };

  // Calculate formatted time
  const formattedTime = (() => {
    if (!state.formState.startTime) return "00:00:00";

    const start = parseISO(state.formState.startTime);
    const end = state.formState.endTime
      ? parseISO(state.formState.endTime)
      : new Date();
    const diffInSeconds = differenceInSeconds(end, start);

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  })();

  // Validation function
  const isFormValid = useCallback(() => {
    return (
      // Either equipment is fully operational
      state.formState.fullyOperational ||
      // OR maintenance request is properly filled out
      (state.formState.maintenanceId?.equipmentIssue &&
        state.formState.maintenanceId?.equipmentIssue.length > 0 &&
        state.formState.maintenanceId?.additionalInfo &&
        state.formState.maintenanceId?.additionalInfo.length > 0 &&
        state.formState.equipment.status !== "OPERATIONAL")
    );
  }, [
    state.formState.fullyOperational,
    state.formState.maintenanceId?.equipmentIssue,
    state.formState.maintenanceId?.additionalInfo,
    state.formState.equipment.status,
  ]);

  const setTab = (newTab: number) => {
    setState((prev) => ({ ...prev, tab: newTab }));
  };

  const setRefuelLog = (
    updater:
      | ((prev: RefuelLogData | null) => RefuelLogData | null)
      | RefuelLogData
      | null,
  ) => {
    setState((prev) => {
      const newRefuelLog =
        typeof updater === "function"
          ? updater(prev.formState.refuelLogs)
          : updater;

      return {
        ...prev,
        formState: {
          ...prev.formState,
          refuelLogs: newRefuelLog,
        },
        refueledLogs: Boolean(newRefuelLog), // Update the refueledLogs flag based on whether there is a refuel log
        hasChanged: true,
      };
    });
  };

  // Show error state
  if (state.error) {
    return (
      <Bases>
        <Contents>
          <Holds className="h-full w-full justify-center items-center">
            <Titles size="h3">Error: {state.error}</Titles>
            <Buttons
              onClick={() => router.push("/dashboard/equipment")}
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
