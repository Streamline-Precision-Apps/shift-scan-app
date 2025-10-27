"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { TascoRefuelLog, TascoRefuelLogData } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

// Define the type for flattened refuel logs
type FlattenedTascoRefuelLog = {
  id: string;
  gallonsRefueled: number | null;
  truckName: string;
  tascoLogId: string;
};

type TimeCardTascoRefuelLogsProps = {
  edit: boolean;
  manager: string;
  tascoRefuelLog: TascoRefuelLogData;
  onDataChange: (data: TascoRefuelLogData) => void;
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
};

// Helper to reconstruct the nested TascoRefuelLogData structure
const reconstructTascoRefuelLogData = (
  original: TascoRefuelLogData,
  updated: FlattenedTascoRefuelLog[]
): TascoRefuelLogData => {
  return original.map((item) => ({
    ...item,
    TascoLogs: (item.TascoLogs ?? []).map((log) => ({
      ...log,
      RefuelLogs: (log.RefuelLogs ?? []).map((refuel) => {
        const found = updated.find(
          (u) => u.id === refuel.id && u.tascoLogId === log.id
        );
        return found
          ? { ...refuel, gallonsRefueled: found.gallonsRefueled ?? 0 }
          : refuel;
      }),
    })),
  }));
};

export default function TimeCardTascoRefuelLogs({
  edit,
  manager,
  tascoRefuelLog,
  onDataChange,
  focusIds,
  setFocusIds,
  isReviewYourTeam,
}: TimeCardTascoRefuelLogsProps) {
  const t = useTranslations("MyTeam.TimeCardTascoRefuelLogs");

  // Add state to store local input values to prevent losing focus while typing
  const [inputValues, setInputValues] = useState<
    Record<string, string | number | null>
  >({});

  // Create a unique key for each input field
  const getInputKey = (
    tascoLogId: string,
    refuelId: string,
    fieldName: string
  ) => {
    return `${tascoLogId}-${refuelId}-${fieldName}`;
  };

  // Get the current value from local state or use the original value
  const getDisplayValue = (
    tascoLogId: string,
    refuelId: string,
    fieldName: string,
    originalValue: string | number | null
  ) => {
    const key = getInputKey(tascoLogId, refuelId, fieldName);
    return key in inputValues ? inputValues[key] : originalValue;
  };

  // Update local state without triggering parent update (and thus avoiding re-render)
  const handleLocalChange = (
    tascoLogId: string,
    refuelId: string,
    fieldName: string,
    value: string | number | null
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [getInputKey(tascoLogId, refuelId, fieldName)]: value,
    }));
  }; // Update parent state only when field loses focus (onBlur)
  const handleBlur = (refuelId: string, tascoLogId: string, field: string) => {
    const key = getInputKey(tascoLogId, refuelId, field);

    if (key in inputValues) {
      const value = inputValues[key] ?? null;
      // Make sure value is not null before passing to handleRefuelChange
      if (value !== null) {
        handleRefuelChange(refuelId, tascoLogId, value);
      }

      // Clear from local state to avoid duplicate processing
      setInputValues((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  // Process the tasco refuel logs
  const allTascoLogs: FlattenedTascoRefuelLog[] = tascoRefuelLog
    .flatMap((item) => item.TascoLogs)
    .filter(
      (log): log is TascoRefuelLog =>
        log !== null && log?.id !== undefined && log?.RefuelLogs !== undefined
    )
    .flatMap((log) =>
      log.RefuelLogs.map((refuel) => ({
        id: refuel.id,
        gallonsRefueled: refuel.gallonsRefueled,
        truckName: log.Equipment?.name || t("NoEquipmentFound"),
        tascoLogId: log.id,
      }))
    );

  const [editedTascoRefuelLogs, setEditedTascoRefuelLogs] =
    useState<FlattenedTascoRefuelLog[]>(allTascoLogs);
  const [changesWereMade, setChangesWereMade] = useState(false);

  // Reset when edit mode is turned off or when new data comes in
  useEffect(() => {
    setEditedTascoRefuelLogs(allTascoLogs);
    setChangesWereMade(false);
  }, [tascoRefuelLog]);

  // If you use local state, sync it here
  // setEditedTascoRefuelLogs(tascoRefuelLog ?? []);

  const handleRefuelChange = useCallback(
    (id: string, tascoLogId: string, gallonsRefueled: string | number) => {
      const updatedLogs = editedTascoRefuelLogs.map((log) => {
        if (log.id === id && log.tascoLogId === tascoLogId) {
          return {
            ...log,
            gallonsRefueled:
              typeof gallonsRefueled === "string"
                ? gallonsRefueled
                  ? Number(gallonsRefueled)
                  : null
                : gallonsRefueled,
          };
        }
        return log;
      });

      setChangesWereMade(true);
      setEditedTascoRefuelLogs(updatedLogs);
      // Send the nested structure to the parent
      const nested = reconstructTascoRefuelLogData(tascoRefuelLog, updatedLogs);
      onDataChange(nested);
    },
    [editedTascoRefuelLogs, onDataChange, tascoRefuelLog]
  );

  const isEmptyData = editedTascoRefuelLogs.length === 0;

  return (
    <Holds className="w-full h-full">
      <Grids rows={"7"}>
        <Holds className="row-start-1 row-end-7 overflow-y-scroll no-scrollbar h-full w-full">
          {!isEmptyData ? (
            <>
              <Grids cols={"2"} className="w-full h-fit mb-1">
                <Holds className="col-start-1 col-end-2 w-full h-full pr-1">
                  <Titles position={"left"} size={"h6"}>
                    {t("EquipmentID")}
                  </Titles>
                </Holds>
                <Holds className="col-start-2 col-end-3 w-full h-full pr-1">
                  <Titles position={"right"} size={"h6"}>
                    {t("GallonUsage")}
                  </Titles>
                </Holds>
              </Grids>

              {editedTascoRefuelLogs.map((log) => {
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
                    key={`${log.tascoLogId}-${log.id}`}
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
                      <Grids cols={"2"} className="w-full h-full">
                        <Holds className="col-start-1 col-end-2 w-full h-full">
                          {" "}
                          <Inputs
                            value={log.truckName}
                            disabled={true}
                            background={isFocused ? "orange" : "white"}
                            className="w-full h-full border-none rounded-none rounded-tl-md rounded-bl-md py-2 text-xs"
                            readOnly
                          />
                        </Holds>
                        <Holds className="col-start-2 col-end-3 w-full h-full border-l-[3px] border-black">
                          {" "}
                          <Inputs
                            type="number"
                            value={
                              getDisplayValue(
                                log.tascoLogId,
                                log.id,
                                "gallonsRefueled",
                                log.gallonsRefueled?.toString() || ""
                              ) ?? ""
                            }
                            background={isFocused ? "orange" : "white"}
                            onChange={(e) =>
                              handleLocalChange(
                                log.tascoLogId,
                                log.id,
                                "gallonsRefueled",
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              handleBlur(
                                log.id,
                                log.tascoLogId,
                                "gallonsRefueled"
                              )
                            }
                            disabled={!edit}
                            className="w-full h-full border-none rounded-none rounded-tr-md rounded-br-md py-2 text-xs text-center"
                          />
                        </Holds>
                      </Grids>
                    </Buttons>
                  </Holds>
                );
              })}
            </>
          ) : (
            <Holds className="w-full h-full flex items-center justify-center">
              <Texts size="p6" className="text-gray-500 italic">
                {t("NoTascoFuelingLogsAvailable")}
              </Texts>
            </Holds>
          )}
        </Holds>
      </Grids>
    </Holds>
  );
}
