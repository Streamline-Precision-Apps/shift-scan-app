"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import {
  EquipmentLogsData,
  EmployeeEquipmentLogData,
  JobsiteData,
  EquipmentRefuelLogItem,
} from "@/lib/types";
import {
  differenceInHours,
  differenceInMinutes,
  format,
  parse,
} from "date-fns";
import { useTranslations } from "next-intl";

// Define a type that represents a valid equipment log with all required properties
type ValidEquipmentLog = EmployeeEquipmentLogData & {
  Equipment: {
    id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  Jobsite?: JobsiteData; // Make optional since it's not in the API response
  RefuelLog?: EquipmentRefuelLogItem; // Use singular, matching the actual API response
};

type ProcessedEquipmentLog = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  usageTime: string;
  startTime: string; // Display format (HH:mm)
  endTime: string; // Display format (HH:mm)
  jobsite: string;
  fullStartTime: string | null;
  fullEndTime: string | null;
  originalStart: Date; // Full DateTime for updates
  originalEnd: Date; // Full DateTime for updates
};

type EquipmentLogUpdate = {
  id: string;
  startTime?: Date;
  endTime?: Date;
};

// Add interface for ref methods
export interface TimeCardEquipmentLogsRef {
  getCurrentUpdates: () => EquipmentLogUpdate[];
}

// Add focusIds to props
type TimeCardEquipmentLogsProps = {
  edit: boolean;
  manager: string;
  equipmentLogs: EquipmentLogsData;
  onDataChange?: (data: EquipmentLogUpdate[]) => void; // Make optional
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
};

const TimeCardEquipmentLogs = forwardRef<
  TimeCardEquipmentLogsRef,
  TimeCardEquipmentLogsProps
>(
  (
    {
      edit,
      manager,
      equipmentLogs,
      onDataChange,
      focusIds,
      setFocusIds,
      isReviewYourTeam,
    },
    ref,
  ) => {
    const t = useTranslations("MyTeam.TimeCardEquipmentLogs");

    // Add state to store local input values to prevent losing focus while typing
    const [inputValues, setInputValues] = useState<
      Record<string, string | number | null>
    >({});

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

    // Update parent state only when field loses focus (onBlur)
    const handleBlur = (logId: string, field: string) => {
      const key = getInputKey(logId, field);

      if (key in inputValues) {
        const value = inputValues[key];
        // Find the log and update it with the local value
        const log = editedEquipmentLogs.find((l) => l.id === logId);
        if (log) {
          if (field === "startTime" || field === "endTime") {
            handleTimeChange(logId, field, value as string);
          }
        }

        // Clear from local state to avoid duplicate processing
        setInputValues((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }
    };

    const [editedEquipmentLogs, setEditedEquipmentLogs] = useState<
      ProcessedEquipmentLog[]
    >([]);
    // Helper function to safely create date objects
    const createSafeDate = (
      dateString: string,
    ): { date: Date | null; formatted: string } => {
      try {
        // Check if dateString is valid and not empty
        if (!dateString || dateString === "Invalid Date") {
          console.error("Invalid date string provided:", dateString);
          return { date: null, formatted: "N/A" };
        }

        // Ensure Z is appended for UTC parsing
        const utcString = dateString.endsWith("Z")
          ? dateString
          : dateString + "Z";
        const dateUTC = new Date(utcString);

        // Verify the date is valid
        if (isNaN(dateUTC.getTime())) {
          console.error("Date parsing resulted in invalid date:", dateString);
          return { date: null, formatted: "N/A" };
        }

        // Convert to local time
        const localDate = new Date(
          dateUTC.getTime() +
            dateUTC.getTimezoneOffset() * 60000 -
            new Date().getTimezoneOffset() * 60000,
        );

        // Format the date
        const formattedTime = localDate ? format(localDate, "HH:mm") : "N/A";

        return { date: localDate, formatted: formattedTime };
      } catch (error) {
        console.error("Error parsing date:", dateString, error);
        return { date: null, formatted: "N/A" };
      }
    };
    const processLogs = useCallback((): ProcessedEquipmentLog[] => {
      // If equipmentLogs is nested, flatten it. If it's flat, use as is.
      let logs: EmployeeEquipmentLogData[] = [];
      if (
        Array.isArray(equipmentLogs) &&
        equipmentLogs.length > 0 &&
        typeof equipmentLogs[0] === "object" &&
        "EmployeeEquipmentLogs" in equipmentLogs[0]
      ) {
        // Nested structure
        logs = equipmentLogs
          .filter(
            (log) =>
              log &&
              typeof log === "object" &&
              "EmployeeEquipmentLogs" in log &&
              Array.isArray(log.EmployeeEquipmentLogs),
          )
          .flatMap((log) => log.EmployeeEquipmentLogs || []);
      } else if (Array.isArray(equipmentLogs)) {
        // Flat array - this shouldn't happen with EquipmentLogsData type, but handle it
        logs = [];
      }

      // Only process logs with valid Equipment object
      return logs
        .filter((log) => {
          return (
            log !== null &&
            log.Equipment &&
            typeof log.Equipment.id === "string" &&
            typeof log.Equipment.name === "string" &&
            typeof log.startTime === "string" &&
            typeof log.endTime === "string"
          );
        })
        .map((log) => {
          // Safely parse dates
          const { date: start, formatted: formattedStart } = createSafeDate(
            log.startTime!,
          );
          const { date: end, formatted: formattedEnd } = createSafeDate(
            log.endTime!,
          );

          // Calculate duration only if both dates are valid
          let usageTime = "N/A";
          if (start && end) {
            try {
              const durationMinutes = differenceInMinutes(end, start);
              const durationHours = differenceInHours(end, start);
              const remainingMinutes = durationMinutes % 60;

              usageTime = `${
                durationHours > 0 ? `${durationHours} hrs ` : ""
              }${remainingMinutes} min`;
            } catch (error) {
              console.error("Error calculating duration:", error);
              usageTime = "N/A";
            }
          }

          return {
            id: log.id,
            equipmentId: log.Equipment!.id,
            equipmentName: log.Equipment!.name,
            usageTime: usageTime,
            startTime: formattedStart,
            endTime: formattedEnd,
            jobsite: log.Jobsite?.name || "N/A",
            fullStartTime: log.startTime,
            fullEndTime: log.endTime,
            originalStart: start || new Date(), // Use default date if null
            originalEnd: end || new Date(), // Use default date if null
          };
        });
    }, [equipmentLogs]);

    useEffect(() => {
      // Always try to process the logs if we have data
      if (equipmentLogs && equipmentLogs.length > 0) {
        const processedLogs = processLogs();
        setEditedEquipmentLogs(processedLogs);
      } else {
        setEditedEquipmentLogs([]);
      }
    }, [equipmentLogs, processLogs]);

    // If you use local state, sync it here
    // setEditedEquipmentLogs(equipmentLogs ?? []);
    const handleTimeChange = useCallback(
      (id: string, field: "startTime" | "endTime", timeString: string) => {
        const updatedLogs = editedEquipmentLogs.map((log) => {
          if (log.id === id) {
            try {
              // Validate that originalStart is a valid date before using it for formatting
              if (!log.originalStart || isNaN(log.originalStart.getTime())) {
                console.error("Invalid originalStart date:", log.originalStart);
                return log;
              }

              // Extract date part safely
              const datePart = format(log.originalStart, "yyyy-MM-dd");

              // Validate timeString
              if (
                !timeString ||
                !timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
              ) {
                console.error("Invalid time string:", timeString);
                return log;
              }

              // Parse new date time safely
              const newDateTime = parse(
                `${datePart} ${timeString}`,
                "yyyy-MM-dd HH:mm",
                new Date(),
              );

              // Validate parsing result
              if (isNaN(newDateTime.getTime())) {
                console.error(
                  "Failed to parse new date time:",
                  datePart,
                  timeString,
                );
                return log;
              }

              // Determine start and end dates safely
              const start =
                field === "startTime" ? newDateTime : log.originalStart;
              const end = field === "endTime" ? newDateTime : log.originalEnd;

              // Ensure both dates are valid before calculating duration
              if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.error("Invalid date for duration calculation:", {
                  start,
                  end,
                });
                return {
                  ...log,
                  [field]: timeString,
                  usageTime: "N/A", // Use N/A for invalid duration
                  originalStart: start,
                  originalEnd: end,
                };
              }

              // Calculate duration
              const durationMinutes = differenceInMinutes(end, start);
              const durationHours = differenceInHours(end, start);
              const remainingMinutes = durationMinutes % 60;

              return {
                ...log,
                [field]: timeString,
                usageTime: `${
                  durationHours > 0 ? `${durationHours} hrs ` : ""
                }${remainingMinutes} min`,
                originalStart: start,
                originalEnd: end,
              };
            } catch (error) {
              console.error("Error updating time:", error);
              return log;
            }
          }
          return log;
        });
        setEditedEquipmentLogs(updatedLogs);

        // Don't call onDataChange here - let the parent handle updates differently
        // The parent should not replace the entire equipmentLogs structure
      },
      [editedEquipmentLogs],
    );

    // Function to get current updates - can be called by parent when needed
    const getCurrentUpdates = useCallback((): EquipmentLogUpdate[] => {
      const updates = editedEquipmentLogs.map((log) => ({
        id: log.id,
        startTime: log.originalStart,
        endTime: log.originalEnd,
      }));
      return updates;
    }, [editedEquipmentLogs]);

    // Expose the getCurrentUpdates function to parent using useImperativeHandle
    useImperativeHandle(
      ref,
      () => ({
        getCurrentUpdates,
      }),
      [getCurrentUpdates],
    );

    const isEmptyData = editedEquipmentLogs.length === 0;

    return (
      <Holds className="w-full h-full">
        <Grids rows={"7"}>
          <Holds className="row-start-1 row-end-7 overflow-y-scroll no-scrollbar h-full w-full">
            {!isEmptyData ? (
              <>
                <Grids cols={"4"} className="w-full h-fit">
                  <Holds className="col-start-1 col-end-3 w-full h-full">
                    <Titles position={"center"} size={"h6"}>
                      {t("EquipmentID")}
                    </Titles>
                  </Holds>
                  {!edit ? (
                    <Holds className="col-start-3 col-end-5 w-full h-full">
                      <Titles position={"center"} size={"h6"}>
                        {t("Duration")}
                      </Titles>
                    </Holds>
                  ) : (
                    <>
                      <Holds className="col-start-3 col-end-4 w-full h-full pr-1">
                        <Titles position={"center"} size={"h6"}>
                          {t("Start")}
                        </Titles>
                      </Holds>
                      <Holds className="col-start-4 col-end-5 w-full h-full pr-1">
                        <Titles position={"center"} size={"h6"}>
                          {t("End")}
                        </Titles>
                      </Holds>
                    </>
                  )}
                </Grids>

                {/* For each row, if isReviewYourTeam is true, wrap in a button that toggles the id in focusIds */}
                {editedEquipmentLogs.map((log) => {
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
                        <Grids cols={"4"} className="w-full h-full">
                          <Holds className="col-start-1 col-end-3 w-full h-full">
                            {" "}
                            <Inputs
                              value={log.equipmentName}
                              disabled={true}
                              className="text-xs border-none h-full rounded-none rounded-bl-md rounded-tl-md justify-center text-center pl-1"
                              background={isFocused ? "orange" : "white"}
                              readOnly
                            />
                          </Holds>
                          {!edit ? (
                            <Holds className="col-start-3 col-end-5 w-full h-full border-l-black border-l-[3px]">
                              {" "}
                              <Inputs
                                value={log.usageTime}
                                disabled={true}
                                className="text-xs border-none h-full rounded-none rounded-br-md rounded-tr-md justify-center text-center"
                                background={isFocused ? "orange" : "white"}
                                readOnly
                              />
                            </Holds>
                          ) : (
                            <>
                              <Holds className="col-start-3 col-end-4 w-full h-full border-l-black border-l-[3px]">
                                {" "}
                                <Inputs
                                  type="time"
                                  value={
                                    getDisplayValue(
                                      log.id,
                                      "startTime",
                                      log.startTime,
                                    ) ?? ""
                                  }
                                  onChange={(e) =>
                                    handleLocalChange(
                                      log.id,
                                      "startTime",
                                      e.target.value,
                                    )
                                  }
                                  onBlur={() => handleBlur(log.id, "startTime")}
                                  disabled={!edit}
                                  background={isFocused ? "orange" : "white"}
                                  className="text-xs border-none h-full rounded-none justify-center text-center"
                                />
                              </Holds>
                              <Holds className="col-start-4 col-end-5 w-full h-full border-l-black border-l-[3px]">
                                {" "}
                                <Inputs
                                  type="time"
                                  value={
                                    getDisplayValue(
                                      log.id,
                                      "endTime",
                                      log.endTime,
                                    ) ?? ""
                                  }
                                  background={isFocused ? "orange" : "white"}
                                  onChange={(e) =>
                                    handleLocalChange(
                                      log.id,
                                      "endTime",
                                      e.target.value,
                                    )
                                  }
                                  onBlur={() => handleBlur(log.id, "endTime")}
                                  disabled={!edit}
                                  className="text-xs border-none h-full rounded-none rounded-br-md rounded-tr-md justify-center text-center"
                                />
                              </Holds>
                            </>
                          )}
                        </Grids>
                      </Buttons>
                    </Holds>
                  );
                })}
              </>
            ) : (
              <Holds className="w-full h-full flex items-center justify-center">
                <Texts size="p6" className="text-gray-500 italic">
                  {t("NoEquipmentLogsAvailable")}
                </Texts>
              </Holds>
            )}
          </Holds>
        </Grids>
      </Holds>
    );
  },
);

TimeCardEquipmentLogs.displayName = "TimeCardEquipmentLogs";

export default TimeCardEquipmentLogs;
