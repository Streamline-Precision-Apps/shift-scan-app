"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { EmployeeEquipmentLogWithRefuel } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

// Define the type for flattened refuel logs with equipment info
type EquipmentRefuelLog = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  gallonsRefueled: number | null;
  employeeEquipmentLogId: string;
};

type TimeCardEquipmentRefuelLogsProps = {
  edit: boolean;
  manager: string;
  equipmentRefuelLogs: EquipmentRefuelLog[] | null;
  onDataChange: (data: EquipmentRefuelLog[]) => void;
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
};

export default function TimeCardEquipmentRefuelLogs({
  edit,
  manager,
  equipmentRefuelLogs,
  onDataChange,
  focusIds,
  setFocusIds,
  isReviewYourTeam,
}: TimeCardEquipmentRefuelLogsProps) {
  const t = useTranslations("MyTeam.TimeCardEquipmentRefuelLogs");

  // Add state to store local input values to prevent losing focus while typing
  const [inputValues, setInputValues] = useState<
    Record<string, string | number | null>
  >({});

  // Create a unique key for each input field
  const getInputKey = (refuelId: string, logId: string, fieldName: string) => {
    return `${refuelId}-${logId}-${fieldName}`;
  };

  // Get the current value from local state or use the original value
  const getDisplayValue = (
    refuelId: string,
    logId: string,
    fieldName: string,
    originalValue: string | number | null
  ) => {
    const key = getInputKey(refuelId, logId, fieldName);
    return key in inputValues ? inputValues[key] : originalValue;
  };

  // Update local state without triggering parent update (and thus avoiding re-render)
  const handleLocalChange = (
    refuelId: string,
    logId: string,
    fieldName: string,
    value: string | number | null
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [getInputKey(refuelId, logId, fieldName)]: value,
    }));
  };
  // Remove flattenRefuelLogs and reconstructEquipmentRefuelLogs, and update usages to work directly with EquipmentRefuelLog[]

  const [flattenedLogs, setFlattenedLogs] = useState<EquipmentRefuelLog[]>([]);
  const [changesWereMade, setChangesWereMade] = useState(false);

  // Reset when edit mode is turned off or when new data comes in
  useEffect(() => {
    if (equipmentRefuelLogs) {
      setFlattenedLogs(equipmentRefuelLogs);
      setChangesWereMade(false);
    } else {
      setFlattenedLogs([]);
    }
  }, [equipmentRefuelLogs]);

  // Update the value in the flat array and notify parent
  const handleRefuelChange = useCallback(
    (id: string, employeeEquipmentLogId: string, value: string) => {
      const updatedLogs = flattenedLogs.map((log) => {
        if (
          log.id === id &&
          log.employeeEquipmentLogId === employeeEquipmentLogId
        ) {
          // Only update gallonsRefueled, keep other fields the same
          return {
            ...log,
            gallonsRefueled:
              value !== "" && value !== null ? Number(value) : null,
          };
        }
        return log;
      });
      setChangesWereMade(true);
      setFlattenedLogs(updatedLogs);
      // Do NOT call onDataChange(updatedLogs) here, only call onBlur to avoid UI disappearing on every keystroke
    },
    [flattenedLogs]
  );

  // Only notify parent on blur (when editing is done)
  const handleBlur = (refuelId: string, logId: string, field: string) => {
    const key = getInputKey(refuelId, logId, field);
    if (key in inputValues) {
      const value = inputValues[key];
      if (value !== null) {
        // Update local state first
        handleRefuelChange(refuelId, logId, value as string);
        // Then notify parent with the latest flattenedLogs
        setTimeout(() => {
          onDataChange(
            flattenedLogs.map((log) =>
              log.id === refuelId && log.employeeEquipmentLogId === logId
                ? {
                    ...log,
                    gallonsRefueled:
                      value !== "" && value !== null ? Number(value) : null,
                  }
                : log
            )
          );
        }, 0);
      }
      setInputValues((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const isEmptyData = flattenedLogs.length === 0;

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

                <Holds className="col-start-3 col-end-5 w-full h-full pr-1">
                  <Titles position={"center"} size={"h6"}>
                    {t("GallonsRefueled")}
                  </Titles>
                </Holds>
              </Grids>

              {flattenedLogs.map((log) => {
                const isFocused = focusIds.includes(log.id);
                const handleToggleFocus = () => {
                  if (isFocused) {
                    setFocusIds(focusIds.filter((id) => id !== log.id));
                  } else {
                    setFocusIds([...focusIds, log.id]);
                  }
                };
                const rowContent = (
                  <Holds
                    key={`${log.employeeEquipmentLogId}-${log.id}`}
                    background={isFocused ? "orange" : "white"}
                    className="border-black border-[3px] rounded-lg mb-2"
                  >
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
                            background={isFocused ? "orange" : "white"}
                            className="text-xs border-none h-full rounded-none rounded-bl-md rounded-tl-md justify-center text-center pl-1"
                            readOnly
                          />
                        </Holds>

                        <Holds className="col-start-3 col-end-5 w-full h-full border-l-black border-l-[3px]">
                          {" "}
                          <Inputs
                            type="number"
                            value={
                              getDisplayValue(
                                log.id,
                                log.employeeEquipmentLogId,
                                "gallonsRefueled",
                                log.gallonsRefueled?.toString() || ""
                              ) ?? ""
                            }
                            background={isFocused ? "orange" : "white"}
                            onChange={(e) =>
                              handleLocalChange(
                                log.id,
                                log.employeeEquipmentLogId,
                                "gallonsRefueled",
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              handleBlur(
                                log.id,
                                log.employeeEquipmentLogId,
                                "gallonsRefueled"
                              )
                            }
                            disabled={!edit}
                            className="text-xs border-none h-full rounded-none rounded-br-md rounded-tr-md justify-center text-center"
                          />
                        </Holds>
                      </Grids>
                    </Buttons>
                  </Holds>
                );
                return isReviewYourTeam ? (
                  <button
                    key={`${log.employeeEquipmentLogId}-${log.id}`}
                    type="button"
                    className="w-full h-full bg-transparent p-0 border-none"
                    onClick={handleToggleFocus}
                    tabIndex={0}
                    aria-label={isFocused ? "Unselect row" : "Select row"}
                  >
                    {rowContent}
                  </button>
                ) : (
                  rowContent
                );
              })}
            </>
          ) : (
            <Holds className="w-full h-full flex items-center justify-center">
              <Texts size="p6" className="text-gray-500 italic">
                {t("NoEquipmentRefuelLogsAvailable")}
              </Texts>
            </Holds>
          )}
        </Holds>
      </Grids>
    </Holds>
  );
}
