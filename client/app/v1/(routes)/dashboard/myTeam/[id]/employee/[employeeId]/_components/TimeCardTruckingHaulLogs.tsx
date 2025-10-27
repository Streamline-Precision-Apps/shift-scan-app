"use client";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import {
  TruckingEquipmentHaulLog,
  TruckingEquipmentHaulLogData,
  EquipmentHauledItem,
} from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { NModals } from "@/components/(reusable)/newmodals";
import { JobsiteSelector } from "@/components/(clock)/(General)/jobsiteSelector";
import { EquipmentSelector } from "@/components/(clock)/(General)/equipmentSelector";
import { useTranslations } from "next-intl";
import { Buttons } from "@/components/(reusable)/buttons";

type TimeCardTruckingHaulLogsProps = {
  edit: boolean;
  manager: string;
  truckingEquipmentHaulLogs: TruckingEquipmentHaulLogData;
  onDataChange: (data: TruckingEquipmentHaulLogData) => void; // FIX: expects nested structure
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
  allEquipment: { id: string; qrId: string; name: string }[]; // <-- Add this
};

export default function TimeCardTruckingHaulLogs({
  edit,
  manager,
  truckingEquipmentHaulLogs,
  onDataChange,
  focusIds,
  setFocusIds,
  isReviewYourTeam,
  allEquipment, // <-- Add this
}: TimeCardTruckingHaulLogsProps) {
  const t = useTranslations("MyTeam.TimeCardTruckingHaulLogs");

  // Add state to store local input values to prevent losing focus while typing
  const [inputValues, setInputValues] = useState<
    Record<string, string | number | { id: string; name: string } | null>
  >({});

  // Create a unique key for each input field
  const getInputKey = (logId: string, hauledId: string, fieldName: string) => {
    return `${logId}-${hauledId}-${fieldName}`;
  };

  // Get the current value from local state or use the original value
  const getDisplayValue = (
    logId: string,
    hauledId: string,
    fieldName: string,
    originalValue: string | number | null
  ) => {
    const key = getInputKey(logId, hauledId, fieldName);
    return key in inputValues ? inputValues[key] : originalValue;
  };

  // Update local state without triggering parent update (and thus avoiding re-render)
  const handleLocalChange = (
    logId: string,
    hauledId: string,
    fieldName: string,
    value: string | number | { id: string; name: string } | null
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [getInputKey(logId, hauledId, fieldName)]: value,
    }));
  };

  // Update parent state only when field loses focus (onBlur)
  const handleBlur = (
    itemIdx: number,
    logIdx: number,
    hauledIdx: number,
    field: keyof EquipmentHauledItem,
    logId: string,
    hauledId: string
  ) => {
    const key = getInputKey(logId, hauledId, field);

    if (key in inputValues) {
      const value = inputValues[key] as
        | string
        | number
        | { id: string; name: string }
        | null;
      handleEquipmentHauledChange(itemIdx, logIdx, hauledIdx, field, value);

      // Clear from local state to avoid duplicate processing
      setInputValues((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  // Handler to update the TruckingEquipmentHaulLogData structure
  const handleHaulLogChange = (
    itemIndex: number,
    logId: string,
    field: keyof TruckingEquipmentHaulLog,
    value: string | number | { id: string; name: string } | null
  ) => {
    const updated = truckingEquipmentHaulLogs.map((item, idx) => {
      if (idx === itemIndex) {
        return {
          ...item,
          TruckingLogs: item.TruckingLogs.map((log) => {
            if (log && log.id === logId) {
              // Only update fields that exist on TruckingEquipmentHaulLog
              if (field in log) {
                return { ...log, [field]: value };
              }
            }
            return log;
          }),
        };
      }
      return item;
    });
    onDataChange(updated);
  };

  // When updating a job site or equipment, update the correct EquipmentHauled item inside the EquipmentHauled array of the TruckingEquipmentHaulLog.
  // Do not use 'JobSite' as a field for handleHaulLogChange. Instead, write a handler like:
  const handleEquipmentHauledChange = (
    itemIdx: number,
    logIdx: number,
    hauledIdx: number,
    field: keyof EquipmentHauledItem,
    value: string | number | { id: string; name: string } | null
  ) => {
    const updated = truckingEquipmentHaulLogs.map((item, i) => {
      if (i !== itemIdx) return item;
      return {
        ...item,
        TruckingLogs: item.TruckingLogs.map((log, j) => {
          if (!log || j !== logIdx) return log;
          return {
            ...log,
            EquipmentHauled: log.EquipmentHauled.map((hauled, k) => {
              if (k !== hauledIdx) return hauled;
              return {
                ...hauled,
                [field]: value,
              };
            }),
          };
        }),
      };
    });
    onDataChange(updated);
  };

  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [jobsiteModalOpen, setJobsiteModalOpen] = useState(false);
  const [currentEditingLog, setCurrentEditingLog] = useState<{
    itemIdx: number;
    logIdx: number;
    hauledIdx: number;
  } | null>(null);
  const [tempEquipment, setTempEquipment] = useState<{
    code: string;
    label: string;
  } | null>(null);

  const openJobsiteModal = (
    itemIdx: number,
    logIdx: number,
    hauledIdx: number
  ) => {
    if (!edit) return;
    setCurrentEditingLog({ itemIdx, logIdx, hauledIdx });
    setJobsiteModalOpen(true);
  };

  const openEquipmentModal = (
    itemIdx: number,
    logIdx: number,
    hauledIdx: number
  ) => {
    if (!edit) return;
    setCurrentEditingLog({ itemIdx, logIdx, hauledIdx });
    setEquipmentModalOpen(true);
  };

  const handleJobsiteSelect = (
    jobsite: { code: string; label: string } | null
  ) => {
    if (currentEditingLog && jobsite) {
      handleEquipmentHauledChange(
        currentEditingLog.itemIdx,
        currentEditingLog.logIdx,
        currentEditingLog.hauledIdx,
        "JobSite",
        { id: jobsite.code, name: jobsite.label }
      );
    }
    setJobsiteModalOpen(false);
  };

  const handleEquipmentSelect = (
    equipment: { code: string; label: string } | null
  ) => {
    if (currentEditingLog && equipment) {
      // Find the Equipment by qrId (code)
      const found = allEquipment.find((eq) => eq.qrId === equipment.code);
      if (!found) {
        setEquipmentModalOpen(false);
        return;
      }
      handleEquipmentHauledChange(
        currentEditingLog.itemIdx,
        currentEditingLog.logIdx,
        currentEditingLog.hauledIdx,
        "Equipment",
        { id: found.id, name: found.name }
      );
    }
    setEquipmentModalOpen(false);
  };

  const isEmptyData = truckingEquipmentHaulLogs.length === 0;

  return (
    <Holds className="w-full">
      {" "}
      {/* removed h-full */}
      <Grids rows={"7"}>
        <Holds className="row-start-1 row-end-7 overflow-y-scroll no-scrollbar h-full w-full items-start">
          {" "}
          {/* added items-start */}
          {!isEmptyData ? (
            <>
              <Grids cols={"3"} className="w-full h-fit">
                <Holds className="col-start-1 col-end-2 w-full h-full pl-1">
                  <Titles position={"left"} size={"h6"}>
                    {t("Truck")}
                  </Titles>
                </Holds>
                <Holds className="col-start-2 col-end-3 w-full h-full pr-1">
                  <Titles position={"center"} size={"h6"}>
                    {t("HauledEQ")}
                  </Titles>
                </Holds>
                <Holds className="col-start-3 col-end-4 w-full h-full pr-1">
                  <Titles position={"right"} size={"h6"}>
                    {t("JobSite")}
                  </Titles>
                </Holds>
              </Grids>

              {truckingEquipmentHaulLogs.map((item, itemIdx) =>
                (item.TruckingLogs || []).map((log, logIdx) => {
                  if (!log) return null;
                  
                  // Only show logs that have actual equipment hauls
                  if (!log.EquipmentHauled || log.EquipmentHauled.length === 0) {
                    return null;
                  }

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
                      key={`${log.id}-${logIdx}`}
                      background={isFocused ? "orange" : "white"}
                      className={`relative border-black border-[3px] rounded-lg mb-2 ${
                        isReviewYourTeam ? "cursor-pointer" : ""
                      }`}
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
                        shadow="none"
                        background="none"
                        className="w-full h-full text-left"
                      >
                        <Grids cols={"3"} className="w-full h-full">
                          <Holds className="w-full h-full col-start-1 col-end-2 border-r-[3px] border-black">
                            <Inputs
                              type="text"
                              value={log.Equipment?.name || ""}
                              className="pl-1 py-2 w-full h-full text-xs border-none rounded-none rounded-tl-md rounded-bl-md"
                              background={isFocused ? "orange" : "white"}
                              disabled={true}
                              readOnly
                            />
                          </Holds>
                          <Holds className="w-full h-full col-start-2 col-end-3 border-r-[3px] border-black">
                            <Inputs
                              type="text"
                              value={
                                log.EquipmentHauled?.[0]?.Equipment?.name || ""
                              }
                              className="py-2 w-full h-full text-xs border-none rounded-none text-center"
                              background={isFocused ? "orange" : "white"}
                              onClick={() =>
                                openEquipmentModal(itemIdx, logIdx, 0)
                              }
                              disabled={!edit}
                              readOnly
                            />
                          </Holds>
                          <Holds className="w-full h-full col-start-3 col-end-4">
                            <Inputs
                              type="text"
                              value={
                                log.EquipmentHauled?.[0]?.JobSite?.name || ""
                              }
                              className="py-2 w-full h-full text-xs border-none rounded-none rounded-tr-md rounded-br-md text-right"
                              background={isFocused ? "orange" : "white"}
                              onClick={() =>
                                openJobsiteModal(itemIdx, logIdx, 0)
                              }
                              disabled={!edit}
                              readOnly
                            />
                          </Holds>
                        </Grids>
                      </Buttons>
                    </Holds>
                  );
                })
              )}
            </>
          ) : (
            <Holds className="w-full flex items-center justify-center">
              <Texts size="p6" className="text-gray-500 italic">
                {t("NoHaulLogsAvailable")}
              </Texts>
            </Holds>
          )}
        </Holds>
      </Grids>
      {/* Jobsite Selector Modal */}
      <NModals
        background={"white"}
        size={"xlW"}
        isOpen={jobsiteModalOpen}
        handleClose={() => setJobsiteModalOpen(false)}
      >
        <Holds background={"white"} className="w-full h-full p-2">
          <JobsiteSelector
            useJobSiteId={true}
            onJobsiteSelect={handleJobsiteSelect}
            initialValue={
              currentEditingLog
                ? {
                    id:
                      truckingEquipmentHaulLogs[currentEditingLog.itemIdx]
                        ?.TruckingLogs[currentEditingLog.logIdx]
                        ?.EquipmentHauled[currentEditingLog.hauledIdx]?.JobSite
                        ?.id || "",
                    code:
                      truckingEquipmentHaulLogs[currentEditingLog.itemIdx]
                        ?.TruckingLogs[currentEditingLog.logIdx]
                        ?.EquipmentHauled[currentEditingLog.hauledIdx]?.JobSite
                        ?.id || "",
                    label:
                      truckingEquipmentHaulLogs[currentEditingLog.itemIdx]
                        ?.TruckingLogs[currentEditingLog.logIdx]
                        ?.EquipmentHauled[currentEditingLog.hauledIdx]?.JobSite
                        ?.name || "",
                  }
                : undefined
            }
          />
        </Holds>
      </NModals>
      {/* Equipment Selector Modal */}
      <NModals
        background={"white"}
        size={"xlW"}
        isOpen={equipmentModalOpen}
        handleClose={() => setEquipmentModalOpen(false)}
      >
        <Holds background={"white"} className="w-full h-full p-2">
          <EquipmentSelector
            onEquipmentSelect={handleEquipmentSelect}
            initialValue={
              currentEditingLog
                ? {
                    id:
                      truckingEquipmentHaulLogs[currentEditingLog.itemIdx]
                        ?.TruckingLogs[currentEditingLog.logIdx]
                        ?.EquipmentHauled[currentEditingLog.hauledIdx]
                        ?.Equipment?.id || "",
                    code:
                      truckingEquipmentHaulLogs[currentEditingLog.itemIdx]
                        ?.TruckingLogs[currentEditingLog.logIdx]
                        ?.EquipmentHauled[currentEditingLog.hauledIdx]
                        ?.Equipment?.id || "",
                    label:
                      truckingEquipmentHaulLogs[currentEditingLog.itemIdx]
                        ?.TruckingLogs[currentEditingLog.logIdx]
                        ?.EquipmentHauled[currentEditingLog.hauledIdx]
                        ?.Equipment?.name || "",
                  }
                : undefined
            }
          />
        </Holds>
      </NModals>
    </Holds>
  );
}
