"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export type MaintenanceLogData = Array<{
  id: string;
  maintenanceId: string;
  startTime: Date | string | null;
  endTime: Date | string | null;
  Maintenance: {
    id: string;
    Equipment: {
      id: string;
      name: string;
    };
  };
}>;

interface TimeCardMechanicLogsProps {
  edit: boolean;
  manager: string;
  maintenanceLogs: MaintenanceLogData;
  onDataChange: (data: MaintenanceLogData) => void;
  focusIds?: string[];
  setFocusIds?: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
  allEquipment: { id: string; qrId: string; name: string }[];
}

export default function TimeCardMechanicLogs({
  edit,
  manager,
  maintenanceLogs,
  onDataChange,
  focusIds = [],
  setFocusIds = () => {},
  isReviewYourTeam,
  allEquipment,
}: TimeCardMechanicLogsProps) {
  const t = useTranslations("MyTeam.TimeCardMechanicLogs");

  // Add state to store local input values to prevent losing focus while typing
  const [inputValues, setInputValues] = useState<
    Record<string, string | number | null>
  >({});

  // Type guard to check for MaintenanceLogs property
  function hasMaintenanceLogs(
    obj: unknown,
  ): obj is { MaintenanceLogs: MaintenanceLogData } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "MaintenanceLogs" in obj &&
      Array.isArray((obj as { MaintenanceLogs: unknown }).MaintenanceLogs)
    );
  }

  // Normalize maintenanceLogs to handle both API shapes
  const normalizedLogs: MaintenanceLogData =
    Array.isArray(maintenanceLogs) &&
    maintenanceLogs.length > 0 &&
    hasMaintenanceLogs(maintenanceLogs[0])
      ? maintenanceLogs[0].MaintenanceLogs
      : maintenanceLogs;

  // Local state for editing mechanic logs
  const [editedMechanicLogs, setEditedMechanicLogs] =
    useState<MaintenanceLogData>(normalizedLogs);

  // Create a unique key for each input field
  const getInputKey = (logId: string, fieldName: string) => {
    return `${logId}-${fieldName}`;
  };

  // Get the current value from local state or use the original value
  const getDisplayValue = (
    logId: string,
    fieldName: string,
    originalValue: string | number | null,
  ) => {
    const key = getInputKey(logId, fieldName);
    return key in inputValues ? inputValues[key] : originalValue;
  };

  // Update local state without triggering parent update (and thus avoiding re-render)
  const handleLocalChange = (
    logId: string,
    fieldName: string,
    value: string | number | null,
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [getInputKey(logId, fieldName)]: value,
    }));
  };

  // Format time value for display (HH:MM)
  const formatTimeForDisplay = (timeValue: Date | string | null): string => {
    if (!timeValue) return "";

    try {
      const date =
        typeof timeValue === "string" ? new Date(timeValue) : timeValue;
      if (isNaN(date.getTime())) return "";

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  // Update parent state only when field loses focus (onBlur)
  const handleBlur = (logId: string, field: "startTime" | "endTime") => {
    const key = getInputKey(logId, field);

    if (key in inputValues) {
      const timeString = inputValues[key] as string;
      handleTimeChange(logId, field, timeString);

      // Clear from local state to avoid duplicate processing
      setInputValues((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const isEmptyData = !normalizedLogs || normalizedLogs.length === 0;

  // Keep local state in sync with normalizedLogs
  useEffect(() => {
    setEditedMechanicLogs(normalizedLogs);
  }, [normalizedLogs]);

  // Handler to update the MaintenanceLogData structure
  const handleTimeChange = (
    id: string,
    field: "startTime" | "endTime",
    timeString: string,
  ) => {
    if (!timeString) return;

    const updated = editedMechanicLogs.map((log) => {
      if (log.id === id) {
        try {
          // Extract time components
          const [hours, minutes] = timeString
            .split(":")
            .map((part) => parseInt(part, 10));

          // Create a new date using the original date components but with new time
          let baseDate;

          // Try to use the existing date if possible
          if (log[field] && typeof log[field] === "object") {
            baseDate = new Date(log[field] as Date);
          } else if (log[field] && typeof log[field] === "string") {
            baseDate = new Date(log[field] as string);
          } else {
            // Fallback to current date
            baseDate = new Date();
          }

          // Ensure we have a valid base date
          if (isNaN(baseDate.getTime())) {
            baseDate = new Date();
          }

          // Create a completely new date object to avoid reference issues
          const newDate = new Date(baseDate);

          // Set only the time portion, keeping the date intact
          newDate.setHours(hours || 0);
          newDate.setMinutes(minutes || 0);
          newDate.setSeconds(0);
          newDate.setMilliseconds(0);

          return {
            ...log,
            [field]: newDate,
          };
        } catch (error) {
          return log;
        }
      }
      return log;
    });

    setEditedMechanicLogs(updated);
    onDataChange(updated);
  };
  // Define a more specific type for the equipment in maintenance logs
  interface EquipmentWithOptionalFields {
    id?: string;
    qrId?: string;
    name?: string;
  }

  interface MaintenanceWithEquipment {
    id?: string;
    equipmentId?: string;
    Equipment?: EquipmentWithOptionalFields;
  }

  interface MechanicLogWithOptionalFields {
    id: string;
    Maintenance?: MaintenanceWithEquipment;
    startTime?: Date | string | null;
    endTime?: Date | string | null;
  }

  // Find equipment name from allEquipment by id or qrId, checking all possible fields
  const getEquipmentName = (log: MechanicLogWithOptionalFields): string => {
    const eqId = log.Maintenance?.Equipment?.id;
    const eqQrId = log.Maintenance?.Equipment?.qrId;
    const maintenanceEquipmentId = log.Maintenance?.equipmentId;
    // Try to match by all possible ids/qrIds
    const found = allEquipment.find(
      (eq) =>
        eq.id === eqId ||
        eq.id === maintenanceEquipmentId ||
        eq.qrId === eqId ||
        eq.qrId === maintenanceEquipmentId ||
        eq.qrId === eqQrId ||
        eq.id === eqQrId,
    );
    return found?.name || log.Maintenance?.Equipment?.name || "";
  };

  return (
    <Holds className="w-full h-full">
      <Grids rows={"7"}>
        <Holds className="row-start-1 row-end-8 overflow-y-scroll no-scrollbar h-full w-full">
          {isEmptyData ? (
            <Holds className="w-full h-full flex items-center justify-center">
              {" "}
              <Texts size="p6" className="text-gray-500 italic">
                {t("NoMechanicLogsAvailable")}
              </Texts>
            </Holds>
          ) : (
            <>
              <Grids cols={"6"} className="w-full h-fit">
                {" "}
                <Holds className="col-start-1 col-end-3 w-full h-full pl-1">
                  <Titles position={"left"} size={"h6"}>
                    {t("Equipment")}
                  </Titles>
                </Holds>
                <Holds className="col-start-3 col-end-5 w-full h-full pr-1">
                  <Titles position={"center"} size={"h6"}>
                    {t("StartTime")}
                  </Titles>
                </Holds>
                <Holds className="col-start-5 col-end-7 w-full h-full pr-1">
                  <Titles position={"right"} size={"h6"}>
                    {t("EndTime")}
                  </Titles>
                </Holds>
              </Grids>

              {editedMechanicLogs.map((log) => {
                const isFocused = focusIds.includes(log.id);
                const handleToggleFocus = () => {
                  if (isFocused) {
                    setFocusIds(focusIds.filter((id) => id !== log.id));
                  } else {
                    setFocusIds([...focusIds, log.id]);
                  }
                };

                return (
                  <Holds
                    key={log.id}
                    background={isFocused ? "orange" : "white"}
                    className={`relative border-black border-[3px] rounded-lg mb-2
                    ${isReviewYourTeam ? "cursor-pointer" : ""}`}
                    onClick={isReviewYourTeam ? handleToggleFocus : undefined}
                  >
                    {isReviewYourTeam && (
                      <div
                        className="absolute top-0 left-0 w-full h-full z-10 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleFocus();
                        }}
                      />
                    )}
                    <Buttons
                      shadow={"none"}
                      background={"none"}
                      className="w-full h-full text-left"
                    >
                      <Grids cols={"6"} className="w-full h-full">
                        <Holds className="col-start-1 col-end-3 h-full w-full">
                          <Inputs
                            type={"text"}
                            value={getEquipmentName(log)}
                            className="text-xs border-none h-full w-full rounded-md rounded-tr-none rounded-br-none justify-center"
                            background={isFocused ? "orange" : "white"}
                            disabled={true} // Equipment name should not be editable
                            readOnly
                          />
                        </Holds>
                        <Holds className="col-start-3 col-end-5 border-x-[3px] border-black h-full">
                          <Holds className="h-full justify-left">
                            <Inputs
                              type={"time"}
                              value={
                                getDisplayValue(
                                  log.id,
                                  "startTime",
                                  formatTimeForDisplay(log.startTime),
                                ) ?? ""
                              }
                              className="text-xs border-none h-full rounded-none justify-left"
                              background={isFocused ? "orange" : "white"}
                              disabled={!edit}
                              onChange={(e) =>
                                handleLocalChange(
                                  log.id,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                              onBlur={() => handleBlur(log.id, "startTime")}
                            />
                          </Holds>
                        </Holds>

                        <Holds className="col-start-5 col-end-7 h-full">
                          <Holds className="h-full justify-left">
                            <Inputs
                              type={"time"}
                              value={
                                getDisplayValue(
                                  log.id,
                                  "endTime",
                                  formatTimeForDisplay(log.endTime),
                                ) ?? ""
                              }
                              className="text-xs border-none h-full rounded-md rounded-tl-none rounded-bl-none justify-center text-right"
                              background={isFocused ? "orange" : "white"}
                              disabled={!edit}
                              onChange={(e) =>
                                handleLocalChange(
                                  log.id,
                                  "endTime",
                                  e.target.value,
                                )
                              }
                              onBlur={() => handleBlur(log.id, "endTime")}
                            />
                          </Holds>
                        </Holds>
                      </Grids>
                    </Buttons>
                  </Holds>
                );
              })}
            </>
          )}
        </Holds>
      </Grids>
    </Holds>
  );
}
