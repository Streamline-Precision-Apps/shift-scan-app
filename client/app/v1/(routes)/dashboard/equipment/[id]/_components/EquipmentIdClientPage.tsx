"use client";
import { updateEmployeeEquipmentLog } from "@/actions/equipmentActions";
import { useNotification } from "@/app/context/NotificationContext";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { differenceInSeconds, parseISO } from "date-fns";
import {
  deleteEmployeeEquipmentLog,
  deleteRefuelLog,
  updateRefuelLog,
} from "@/actions/truckingActions";
import Spinner from "@/components/(animations)/spinner";
import { NewTab } from "@/components/(reusable)/newTabs";
import UsageData from "./../_components/UsageData";
import { Buttons } from "@/components/(reusable)/buttons";
import { Titles } from "@/components/(reusable)/titles";

import {
  UnifiedEquipmentState,
  EmployeeEquipmentLogData,
  EquipmentLog,
  RefuelLogData,
  Refueled,
  EquipmentState,
} from "./../types";
import { FormStatus } from "../../../../../../../prisma/generated/prisma/client";

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

export default function CombinedForm({ id }: { id: string }) {
  const router = useRouter();

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

        // If the log isn't finished, set the end time to now when opening the form
        if (!apiData.isFinished) {
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
      // Check if we need to disconnect/delete an existing refuel log
      if (state.formState.refuelLogs === null) {
        // If refuelLogs is null, we want to disconnect any existing refuel log
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
      await updateEmployeeEquipmentLog(formData);

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
    // Equipment is always valid now that we've removed the maintenance requirement
    return true;
  }, []);

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
      <>
        <Holds className="h-full w-full justify-center items-center row-span-1">
          <Titles size="lg">Error: {state.error}</Titles>
          <Buttons
            onClick={() => router.push("/dashboard/equipment")}
            background="lightBlue"
          >
            <Titles size="h5">{t("BacktoEquipment")}</Titles>
          </Buttons>
        </Holds>
        <Holds className="row-start-2 row-end-8 h-full w-full bg-white"></Holds>
      </>
    );
  }

  return (
    <>
      <Holds
        background="white"
        className={
          state.isLoading
            ? "row-span-1 h-full justify-center animate-pulse"
            : "row-span-1 h-full justify-center"
        }
      >
        <TitleBoxes onClick={() => router.push("/dashboard/equipment")}>
          <Titles size={"md"}>
            {state.isLoading
              ? "Loading..."
              : `${state.formState.equipment.name.slice(0, 16)}${
                  state.formState.equipment.name.length > 16 ? "..." : ""
                }`}
          </Titles>
        </TitleBoxes>
      </Holds>
      <Holds className="row-start-2 row-end-8 h-full w-full">
        <Grids rows={"10"} className="h-full w-full ">
          <Holds
            background="white"
            className={
              state.isLoading
                ? "row-start-1 row-end-11 h-full  animate-pulse"
                : "row-start-1 row-end-11 h-full "
            }
          >
            {state.isLoading ? (
              <Holds className="h-full w-full justify-center">
                <Spinner />
              </Holds>
            ) : (
              <Contents width={"section"}>
                <Grids rows={"8"} className="h-full w-full border-gray-200">
                  <UsageData
                    formState={state.formState}
                    refuelLog={state.formState.refuelLogs}
                    setRefuelLog={setRefuelLog}
                    handleFieldChange={handleFieldChange}
                    formattedTime={formattedTime}
                    isRefueled={state.markedForRefuel}
                    handleChangeRefueled={handleChangeRefueled}
                    AddRefuelLog={addRefuelLog}
                    handleFullOperational={handleFullOperational}
                    t={t}
                    deleteLog={deleteLog}
                    saveEdits={saveEdits}
                    isFormValid={isFormValid}
                  />
                  <Holds
                    position={"row"}
                    background="white"
                    className="w-full gap-x-4 row-start-8 row-end-9 border-t border-t-gray-200 py-2 rounded-none"
                  >
                    <Buttons
                      shadow={"none"}
                      onClick={deleteEquipmentLog}
                      background="red"
                      className="w-full "
                    >
                      <Titles size="sm">{t("DeleteLog")}</Titles>
                    </Buttons>

                    {state.hasChanged && (
                      <Buttons
                        shadow={"none"}
                        onClick={() => {
                          if (!isFormValid()) {
                            setNotification(
                              "Please complete maintenance requirements",
                              "error",
                            );
                            return;
                          }
                          saveEdits();
                        }}
                        background={isFormValid() ? "lightBlue" : "darkGray"}
                        className="w-full "
                        disabled={!isFormValid()}
                      >
                        <Titles size="sm">{t("FinishLogs")}</Titles>
                      </Buttons>
                    )}
                  </Holds>
                </Grids>
              </Contents>
            )}
          </Holds>
        </Grids>
      </Holds>
    </>
  );
}
