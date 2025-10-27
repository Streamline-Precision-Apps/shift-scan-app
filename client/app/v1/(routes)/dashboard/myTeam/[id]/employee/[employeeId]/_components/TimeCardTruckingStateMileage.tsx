"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { US_STATES } from "@/data/stateValues";
import { TruckingStateLog, TruckingStateLogData } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

type TimeCardTruckingStateMileageLogsProps = {
  edit: boolean;
  manager: string;
  truckingStateLogs: TruckingStateLogData;
  onDataChange: (data: TruckingStateLogData) => void;
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
};

type ProcessedStateMileage = {
  id: string;
  state: string;
  stateLineMileage: number;
  truckName: string;
  equipmentId: string;
  truckingLogId: string;
};

export default function TimeCardTruckingStateMileageLogs({
  edit,
  manager,
  truckingStateLogs,
  onDataChange,
  focusIds,
  setFocusIds,
  isReviewYourTeam,
}: TimeCardTruckingStateMileageLogsProps) {
  const t = useTranslations("MyTeam.TimeCardTruckingStateMileageLogs");

  // Add state to store local input values to prevent losing focus while typing
  const [inputValues, setInputValues] = useState<
    Record<string, string | number | null>
  >({});

  // Create a unique key for each input field
  const getInputKey = (logId: string, mileageId: string, fieldName: string) => {
    return `${logId}-${mileageId}-${fieldName}`;
  };

  // Get the current value from local state or use the original value
  const getDisplayValue = (
    logId: string,
    mileageId: string,
    fieldName: string,
    originalValue: string | number | null,
  ) => {
    const key = getInputKey(logId, mileageId, fieldName);
    return key in inputValues ? inputValues[key] : originalValue;
  };

  // Update local state without triggering parent update (and thus avoiding re-render)
  const handleLocalChange = (
    logId: string,
    mileageId: string,
    fieldName: string,
    value: string | number | null,
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [getInputKey(logId, mileageId, fieldName)]: value,
    }));
  };

  // Update parent state only when field loses focus (onBlur)
  const handleBlur = (
    logId: string,
    mileageId: string,
    field: keyof ProcessedStateMileage,
  ) => {
    const key = getInputKey(logId, mileageId, field);

    if (key in inputValues) {
      const value = inputValues[key];
      // Make sure value is not null before passing to handleStateMileageChange
      if (value !== null) {
        handleStateMileageChange(
          mileageId,
          logId,
          field,
          value as string | number,
        );
      }

      // Clear from local state to avoid duplicate processing
      setInputValues((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  // Process the data to combine state mileages with their truck info
  const allStateMileages = truckingStateLogs
    .flatMap((item) => item.TruckingLogs)
    .filter(
      (log): log is TruckingStateLog =>
        log !== null &&
        log?.Equipment !== undefined &&
        log?.StateMileages !== undefined,
    )
    .flatMap((log) =>
      log.StateMileages.map((mileage) => ({
        id: mileage.id, // Use the actual database ID
        state: mileage.state,
        stateLineMileage: mileage.stateLineMileage,
        truckName: log.Equipment.name,
        equipmentId: log.Equipment.id,
        truckingLogId: log.id, // Use the actual trucking log ID
      })),
    );

  const [editedStateMileages, setEditedStateMileages] =
    useState<ProcessedStateMileage[]>(allStateMileages);
  const [changesWereMade, setChangesWereMade] = useState(false);

  // Reset when edit mode is turned off or when new data comes in
  useEffect(() => {
    setEditedStateMileages(allStateMileages);
    setChangesWereMade(false);
  }, [truckingStateLogs]);

  const handleStateMileageChange = useCallback(
    (
      id: string,
      truckingLogId: string,
      field: keyof ProcessedStateMileage,
      value: string | number,
    ) => {
      const updated = editedStateMileages.map((item) => {
        if (item.id === id && item.truckingLogId === truckingLogId) {
          return {
            ...item,
            [field]:
              field === "stateLineMileage"
                ? value
                  ? Number(value)
                  : 0
                : value,
          };
        }
        return item;
      });
      setChangesWereMade(true);
      setEditedStateMileages(updated);
      // Convert the flat array back to the nested TruckingStateLogData structure
      const nested: TruckingStateLogData = truckingStateLogs.map((item) => ({
        ...item,
        TruckingLogs: (item.TruckingLogs ?? []).map((log) => {
          if (!log) return log;
          return {
            ...log,
            StateMileages: (log.StateMileages ?? []).map((mileage) => {
              const found = updated.find(
                (u) => u.id === mileage.id && u.truckingLogId === log.id,
              );
              return found
                ? {
                    ...mileage,
                    state: found.state,
                    stateLineMileage: found.stateLineMileage,
                  }
                : mileage;
            }),
          };
        }),
      }));
      onDataChange(nested);
    },
    [editedStateMileages, onDataChange, truckingStateLogs],
  );

  const isEmptyData = editedStateMileages.length === 0;

  return (
    <Holds className="w-full h-full">
      <Grids rows={"7"}>
        <Holds className="row-start-1 row-end-7 overflow-y-scroll no-scrollbar h-full w-full">
          {!isEmptyData ? (
            <>
              <Grids cols={"4"} className="w-full h-fit mb-1">
                <Holds className="col-start-1 col-end-3 w-full h-full pr-1">
                  <Titles position={"left"} size={"h6"}>
                    {t("TruckID")}
                  </Titles>
                </Holds>
                <Holds className="col-start-3 col-end-4 w-full h-full">
                  <Titles position={"center"} size={"h6"}>
                    {t("State")}
                  </Titles>
                </Holds>
                <Holds className="col-start-4 col-end-5 w-full h-full pr-1">
                  <Titles position={"right"} size={"h6"}>
                    {t("Mileage")}
                  </Titles>
                </Holds>
              </Grids>{" "}
              {editedStateMileages.map((mileage: ProcessedStateMileage) => {
                const isFocused = focusIds.includes(mileage.id);
                const handleToggleFocus = () => {
                  if (isFocused) {
                    setFocusIds(
                      focusIds.filter((id: string) => id !== mileage.id),
                    );
                  } else {
                    setFocusIds([...focusIds, mileage.id]);
                  }
                };
                return (
                  <Holds
                    key={`${mileage.truckingLogId}-${mileage.id}`}
                    background={isFocused ? "orange" : "white"}
                    className={`relative border-black border-[3px] rounded-lg mb-2 ${
                      isReviewYourTeam ? "cursor-pointer" : ""
                    }`}
                    onClick={isReviewYourTeam ? handleToggleFocus : undefined}
                  >
                    {isReviewYourTeam && (
                      <div
                        className="absolute top-0 left-0 w-full h-full z-0 cursor-pointer"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
                        <Holds className="col-start-1 col-end-3 w-full h-full border-r-[3px] border-black">
                          <Inputs
                            value={mileage.truckName}
                            disabled={true}
                            background={isFocused ? "orange" : "white"}
                            className="w-full h-full border-none rounded-none rounded-tl-md rounded-bl-md text-left text-xs"
                            readOnly
                          />
                        </Holds>
                        <Holds className="col-start-3 col-end-4 w-full h-full">
                          {edit ? (
                            <select
                              value={
                                getDisplayValue(
                                  mileage.truckingLogId,
                                  mileage.id,
                                  "state",
                                  mileage.state,
                                ) ?? ""
                              }
                              onChange={(e) =>
                                handleLocalChange(
                                  mileage.truckingLogId,
                                  mileage.id,
                                  "state",
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                handleBlur(
                                  mileage.truckingLogId,
                                  mileage.id,
                                  "state",
                                )
                              }
                              className="w-full h-full border-none rounded-none text-center text-xs bg-white"
                            >
                              <option value="">{t("SelectState")}</option>
                              {US_STATES.map((state) => (
                                <option key={state.code} value={state.code}>
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Inputs
                              value={
                                US_STATES.find(
                                  (state) => state.code === mileage.state,
                                )?.name || mileage.state
                              }
                              disabled={true}
                              background={isFocused ? "orange" : "white"}
                              className="w-full h-full border-none rounded-none text-center text-xs"
                              readOnly
                            />
                          )}
                        </Holds>{" "}
                        <Holds className="col-start-4 col-end-5 w-full h-full border-l-[3px] border-black">
                          <Inputs
                            type="number"
                            value={
                              getDisplayValue(
                                mileage.truckingLogId,
                                mileage.id,
                                "stateLineMileage",
                                mileage.stateLineMileage?.toString() ?? "",
                              ) ?? ""
                            }
                            background={isFocused ? "orange" : "white"}
                            onChange={(e) =>
                              handleLocalChange(
                                mileage.truckingLogId,
                                mileage.id,
                                "stateLineMileage",
                                e.target.value,
                              )
                            }
                            disabled={!edit}
                            className="w-full h-full py-2 border-none rounded-none rounded-tr-md rounded-br-md text-right text-xs"
                            onBlur={() =>
                              handleBlur(
                                mileage.truckingLogId,
                                mileage.id,
                                "stateLineMileage",
                              )
                            }
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
                {t("NoStateMileageDataAvailable")}
              </Texts>
            </Holds>
          )}
        </Holds>
      </Grids>
    </Holds>
  );
}
