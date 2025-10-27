"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { TascoHaulLogs, TascoHaulLogData, MaterialType } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";

// Define the type for processed haul logs
type ProcessedTascoHaulLog = {
  id: string;
  shiftType: string;
  equipmentId: string | null;
  materialType: string;
  LoadQuantity: number | null;
};

type TimeCardTascoHaulLogsProps = {
  edit: boolean;
  manager: string;
  tascoHaulLogs: TascoHaulLogData;
  onDataChange: (data: TascoHaulLogData) => void;
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
};

// Helper to reconstruct the nested TascoHaulLogData structure
const reconstructTascoHaulLogData = (
  original: TascoHaulLogData,
  updated: ProcessedTascoHaulLog[],
): TascoHaulLogData => {
  return original.map((item) => ({
    ...item,
    TascoLogs: (item.TascoLogs ?? []).map((log) => {
      const found = updated.find((u) => u.id === log.id);
      return found
        ? {
            ...log,
            shiftType: found.shiftType,
            equipmentId: found.equipmentId ?? "", // ensure string
            materialType: found.materialType,
            LoadQuantity: found.LoadQuantity ?? 0, // ensure number
          }
        : log;
    }),
  }));
};

export default function TimeCardTascoHaulLogs({
  edit,
  manager,
  tascoHaulLogs,
  onDataChange,
  focusIds,
  setFocusIds,
  isReviewYourTeam,
}: TimeCardTascoHaulLogsProps) {
  const t = useTranslations("MyTeam.TimeCardTascoHaulLogs");

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
  const handleBlur = (logId: string, field: keyof ProcessedTascoHaulLog) => {
    const key = getInputKey(logId, field);
    if (key in inputValues) {
      const value = inputValues[key];
      // Make sure value is not null before passing to handleTascoHaulChange
      if (value !== null) {
        handleTascoHaulChange(logId, field, value as string | number);
      }

      // Clear from local state to avoid duplicate processing
      setInputValues((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  // Defensive: Ensure tascoHaulLogs is always an array before calling flatMap
  const safeTascoHaulLogs = Array.isArray(tascoHaulLogs) ? tascoHaulLogs : [];

  // Process the tasco haul logs
  const allTascoHaulLogs: ProcessedTascoHaulLog[] = safeTascoHaulLogs
    .flatMap((log) => log.TascoLogs)
    .filter(
      (log): log is TascoHaulLogs => log !== null && log?.id !== undefined,
    )
    .map((log) => ({
      id: log.id,
      shiftType: log.shiftType,
      equipmentId: log.equipmentId,
      materialType: log.materialType,
      LoadQuantity: log.LoadQuantity,
    }));

  const [editedTascoHaulLogs, setEditedTascoHaulLogs] =
    useState<ProcessedTascoHaulLog[]>(allTascoHaulLogs);
  const [changesWereMade, setChangesWereMade] = useState(false);
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);

  // Define shift type options
  const SHIFT_TYPES = [
    { value: "ABCD Shift", label: t("ABCDShift") },
    { value: "E Shift", label: t("EShift") },
  ];

  useEffect(() => {
    const fetchMaterialTypes = async () => {
      try {
        const materialTypesResponse = await fetch("/api/getMaterialTypes");
        const materialTypesData = await materialTypesResponse.json();
        setMaterialTypes(materialTypesData);
      } catch {
        console.error("Error fetching material types");
      }
    };

    fetchMaterialTypes();
  }, []);

  // Reset when edit mode is turned off or when new data comes in
  useEffect(() => {
    setEditedTascoHaulLogs(allTascoHaulLogs);
    setChangesWereMade(false);
  }, [tascoHaulLogs]);

  // If you use local state, sync it here
  // setEditedTascoHaulLogs(tascoHaulLogs ?? []);

  const handleTascoHaulChange = useCallback(
    (
      id: string,
      field: keyof ProcessedTascoHaulLog,
      value: string | number,
    ) => {
      const updatedLogs = editedTascoHaulLogs.map((log) => {
        if (log.id === id) {
          return {
            ...log,
            [field]:
              field === "LoadQuantity" ? (value ? Number(value) : null) : value,
          };
        }
        return log;
      });

      setChangesWereMade(true);
      setEditedTascoHaulLogs(updatedLogs);
      // Send the nested structure to the parent
      const nested = reconstructTascoHaulLogData(tascoHaulLogs, updatedLogs);
      onDataChange(nested);
    },
    [editedTascoHaulLogs, onDataChange, tascoHaulLogs],
  );

  const isEmptyData = editedTascoHaulLogs.length === 0;

  return (
    <Holds className="w-full h-full">
      <Grids rows={"7"}>
        <Holds className="row-start-1 row-end-8 overflow-y-scroll no-scrollbar h-full w-full">
          {!isEmptyData ? (
            <>
              <Grids cols={"2"} className="w-full h-fit mb-1">
                <Holds className="col-start-1 col-end-2 w-full h-full pr-1">
                  <Titles position={"left"} size={"h6"}>
                    {t("ShiftTypeEquipmentID")}
                  </Titles>
                </Holds>
                <Holds className="col-start-2 col-end-3 w-full h-full pr-1">
                  <Titles position={"right"} size={"h6"}>
                    {t("MaterialLoads")}
                  </Titles>
                </Holds>
              </Grids>

              {editedTascoHaulLogs.map((log) => {
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
                      className="size-full"
                    >
                      <Grids cols={"2"} rows={"2"} className="w-full h-full">
                        <Holds className="size-full col-start-1 col-end-2 row-start-1 row-end-2 border-b-[3px] border-r-[3px] border-black">
                          {edit ? (
                            <select
                              value={log.shiftType}
                              onChange={(e) =>
                                handleTascoHaulChange(
                                  log.id,
                                  "shiftType",
                                  e.target.value,
                                )
                              }
                              className="w-full h-full text-xs text-center border-none rounded-none rounded-tl-md py-2 bg-white"
                            >
                              {SHIFT_TYPES.map((shift) => (
                                <option key={shift.value} value={shift.value}>
                                  {shift.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Inputs
                              value={log.shiftType}
                              disabled={true}
                              background={isFocused ? "orange" : "white"}
                              className="size-full text-xs text-center border-none rounded-none rounded-tl-md py-2"
                              readOnly
                            />
                          )}
                        </Holds>
                        <Holds className="size-full col-start-1 col-end-2 row-start-2 row-end-3 border-r-[3px] border-black">
                          {" "}
                          <Inputs
                            value={log.equipmentId || "N/A"}
                            onChange={(e) =>
                              handleTascoHaulChange(
                                log.id,
                                "equipmentId",
                                e.target.value,
                              )
                            }
                            disabled={true}
                            background={isFocused ? "orange" : "white"}
                            className="size-full text-xs text-center border-none rounded-none rounded-bl-md py-2"
                          />
                        </Holds>
                        <Holds className="size-full col-start-2 col-end-3 row-start-1 row-end-2 border-b-[3px] border-black">
                          {edit ? (
                            <select
                              value={log.materialType}
                              onChange={(e) =>
                                handleTascoHaulChange(
                                  log.id,
                                  "materialType",
                                  e.target.value,
                                )
                              }
                              className="w-full h-full text-xs text-center border-none rounded-none rounded-tr-md py-2 bg-white"
                            >
                              <option value="">{t("SelectMaterial")}</option>
                              {materialTypes.map((material) => (
                                <option
                                  key={material.name}
                                  value={material.name}
                                >
                                  {material.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Inputs
                              value={log.materialType}
                              disabled={true}
                              background={isFocused ? "orange" : "white"}
                              className="size-full text-xs text-center border-none rounded-none rounded-tr-md py-2"
                              readOnly
                            />
                          )}
                        </Holds>
                        <Holds className="size-full col-start-2 col-end-3 row-start-2 row-end-3">
                          {" "}
                          <Inputs
                            type="number"
                            value={
                              getDisplayValue(
                                log.id,
                                "LoadQuantity",
                                log.LoadQuantity?.toString() || "",
                              ) ?? ""
                            }
                            background={isFocused ? "orange" : "white"}
                            onChange={(e) =>
                              handleLocalChange(
                                log.id,
                                "LoadQuantity",
                                e.target.value,
                              )
                            }
                            onBlur={() => handleBlur(log.id, "LoadQuantity")}
                            disabled={!edit}
                            className="size-full text-xs text-center border-none rounded-none rounded-br-md py-2"
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
                {t("NoTascoHaulingLogsAvailable")}
              </Texts>
            </Holds>
          )}
        </Holds>
      </Grids>
    </Holds>
  );
}
