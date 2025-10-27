"use client";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { useTranslations } from "next-intl";
import { Grids } from "@/components/(reusable)/grids";
import { Contents } from "@/components/(reusable)/contents";
import { Selects } from "@/components/(reusable)/selects";
import { Buttons } from "@/components/(reusable)/buttons";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import Spinner from "@/components/(animations)/spinner";
import {
  TimesheetFilter,
  TimesheetHighlights,
  TruckingMileageData,
  TruckingEquipmentHaulLogData,
  TruckingMaterialHaulLogData,
  TruckingRefuelLogData,
  TruckingStateLogData,
  TascoHaulLogData,
  TascoRefuelLogData,
  EquipmentLogsData,
  EmployeeEquipmentLogWithRefuel,
} from "@/lib/types";
import { MaintenanceLogData } from "./TimeCardMechanicLogs";
import TimeSheetRenderer from "./timeSheetRenderer";
import { set } from "date-fns";
import { flattenMaterialLogs } from "./TimeCardTruckingMaterialLogs";
import { updateTruckingMaterialLogs } from "@/actions/myTeamsActions";
import { updateTruckingRefuelLogs } from "@/actions/myTeamsActions";
import { updateTruckingStateLogs } from "@/actions/myTeamsActions";
import { updateTascoHaulLogs } from "@/actions/myTeamsActions";
import { updateTascoRefuelLogs } from "@/actions/myTeamsActions";
import { updateEquipmentRefuelLogs } from "@/actions/myTeamsActions";
import { TimeCardEquipmentLogsRef } from "./TimeCardEquipmentLogs";

// Add a type for material haul log changes
interface TruckingMaterialHaulLog {
  id: string;
  name: string;
  LocationOfMaterial: string;
  materialWeight?: number;
  lightWeight?: number;
  grossWeight?: number;
}
// Add a type for equipment log changes
interface EquipmentLogChange {
  id: string;
  startTime: Date;
  endTime: Date;
}

export type EmployeeTimesheetData =
  | TimesheetHighlights[]
  | TruckingMileageData
  | TruckingEquipmentHaulLogData
  | TruckingMaterialHaulLogData
  | TruckingRefuelLogData
  | TruckingStateLogData
  | TascoHaulLogData
  | TascoRefuelLogData
  | EquipmentLogsData
  | EmployeeEquipmentLogWithRefuel[]
  | MaintenanceLogData
  | null;

export interface EmployeeTimeSheetsProps {
  data: EmployeeTimesheetData;
  date: string;
  setDate: (date: string) => void;
  edit: boolean;
  setEdit: (edit: boolean) => void;
  loading: boolean;
  manager: string;
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
  timeSheetFilter: TimesheetFilter;
  setTimeSheetFilter: React.Dispatch<React.SetStateAction<TimesheetFilter>>;
  onSaveChanges: (
    changes:
      | TimesheetHighlights[]
      | TimesheetHighlights
      | TruckingMaterialHaulLog[]
      | TruckingMaterialHaulLogData
      | TruckingRefuelLogData
      | EquipmentLogChange[]
      | {
          id: string;
          gallonsRefueled?: number | null;
          milesAtFueling?: number | null;
        }[]
      | { id: string; state?: string; stateLineMileage?: number }[]
      | {
          id: string;
          shiftType?: string;
          equipmentId?: string | null;
          materialType?: string;
          LoadQuantity?: number | null;
        }[]
      | { id: string; gallonsRefueled?: number | null }[]
      | TruckingMileageData
      | MaintenanceLogData,
  ) => Promise<void>;
  onCancelEdits: () => void;
  fetchTimesheetsForDate: (date: string) => Promise<void>;
  fetchTimesheetsForFilter: (filter: TimesheetFilter) => Promise<void>;
  allEquipment: { id: string; qrId: string; name: string }[]; // <-- Add this
}

export function EmployeeTimeSheets({
  data,
  date,
  setDate,
  edit,
  setEdit,
  loading,
  manager,
  focusIds,
  setFocusIds,
  isReviewYourTeam = false,
  timeSheetFilter,
  setTimeSheetFilter,
  onSaveChanges: parentOnSaveChanges,
  onCancelEdits,
  fetchTimesheetsForDate,
  fetchTimesheetsForFilter,
  allEquipment,
}: EmployeeTimeSheetsProps) {
  // --- State ---
  const t = useTranslations("MyTeam");
  const equipmentLogsRef = useRef<TimeCardEquipmentLogsRef>(null);
  const [changes, setChanges] = useState<
    | TimesheetHighlights[]
    | TruckingMaterialHaulLog[]
    | TruckingMaterialHaulLogData
    | TruckingRefuelLogData
    | EquipmentLogChange[]
    | {
        id: string;
        gallonsRefueled?: number | null;
        milesAtFueling?: number | null;
      }[]
    | { id: string; state?: string; stateLineMileage?: number }[]
    | {
        id: string;
        shiftType?: string;
        equipmentId?: string | null;
        materialType?: string;
        LoadQuantity?: number | null;
      }[]
    | { id: string; gallonsRefueled?: number | null }[]
    | TruckingMileageData
    | MaintenanceLogData
  >([]);
  const [originalData, setOriginalData] = useState<typeof data | null>(
    data ? JSON.parse(JSON.stringify(data)) : null,
  );
  const [newData, setNewData] = useState<typeof data | null>(
    data ? JSON.parse(JSON.stringify(data)) : null,
  );
  const newDataRef = useRef(newData);
  const [isSaving, setIsSaving] = useState(false);

  // --- Effects ---
  useEffect(() => {
    setOriginalData(data ? JSON.parse(JSON.stringify(data)) : null);
    setNewData(data ? JSON.parse(JSON.stringify(data)) : null);
  }, [timeSheetFilter, data]);
  useEffect(() => {
    if (data && originalData === null && newData === null) {
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setNewData(JSON.parse(JSON.stringify(data)));
    }
  }, [data]);

  // --- Helpers ---
  const isString = (val: unknown): val is string => typeof val === "string";
  const toNumberOrNull = (
    val: string | number | null | undefined,
  ): number | null => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed === "" ? null : parseFloat(trimmed);
    }
    return null;
  };

  // Helper to flatten nested refuel logs for server submission
  const flattenRefuelLogs = (logs: TruckingRefuelLogData) => {
    const result: {
      id: string;
      gallonsRefueled?: number | null;
      milesAtFueling?: number | null;
    }[] = [];
    logs.forEach((item) => {
      (item.TruckingLogs ?? []).forEach((log) => {
        if (!log) return;
        (log.RefuelLogs ?? []).forEach((refuel) => {
          if (refuel && refuel.id) {
            const gallons = toNumberOrNull(refuel.gallonsRefueled);
            const miles = toNumberOrNull(refuel.milesAtFueling);
            result.push({
              id: refuel.id,
              gallonsRefueled: gallons,
              milesAtFueling: miles,
            });
          }
        });
      });
    });
    return result;
  };

  // Helper to flatten nested state mileage logs for server submission
  const flattenStateMileageLogs = (logs: TruckingStateLogData) => {
    const result: { id: string; state: string; stateLineMileage: number }[] =
      [];
    logs.forEach((item) => {
      (item.TruckingLogs ?? []).forEach((log) => {
        if (!log) return;
        (log.StateMileages ?? []).forEach((mileage) => {
          if (mileage && mileage.id) {
            result.push({
              id: mileage.id,
              state: mileage.state,
              stateLineMileage: mileage.stateLineMileage,
            });
          }
        });
      });
    });
    return result;
  };

  // Helper to flatten nested tasco haul logs for server submission
  const flattenTascoHaulLogs = (logs: TascoHaulLogData) => {
    const result: {
      id: string;
      shiftType: string;
      equipmentId: string | null;
      materialType: string;
      LoadQuantity: number;
    }[] = [];
    logs.forEach((item) => {
      (item.TascoLogs ?? []).forEach((log) => {
        if (log && log.id) {
          result.push({
            id: log.id,
            shiftType: log.shiftType,
            equipmentId:
              !log.equipmentId || log.equipmentId === ""
                ? null
                : log.equipmentId,
            materialType: log.materialType,
            LoadQuantity: log.LoadQuantity ?? 0,
          });
        }
      });
    });
    return result;
  };

  // Helper to flatten nested tasco refuel logs for server submission
  const flattenTascoRefuelLogs = (logs: TascoRefuelLogData) => {
    const result: { id: string; gallonsRefueled: number | null }[] = [];
    logs.forEach((item) => {
      (item.TascoLogs ?? []).forEach((log) => {
        (log.RefuelLogs ?? []).forEach((refuel) => {
          if (refuel && refuel.id) {
            result.push({
              id: refuel.id,
              gallonsRefueled:
                typeof refuel.gallonsRefueled === "number"
                  ? refuel.gallonsRefueled
                  : refuel.gallonsRefueled
                    ? Number(refuel.gallonsRefueled)
                    : null,
            });
          }
        });
      });
    });
    return result;
  };

  // --- Handlers ---
  const handleDateChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    if (fetchTimesheetsForDate) {
      await fetchTimesheetsForDate(newDate);
    }
  };
  const handleFilterChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value as TimesheetFilter;
    setTimeSheetFilter(newFilter);
    if (fetchTimesheetsForFilter) {
      await fetchTimesheetsForFilter(newFilter);
    }
  };

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      if (timeSheetFilter === "truckingMaterialHaulLogs") {
        const flattened = flattenMaterialLogs(
          changes as TruckingMaterialHaulLogData,
        );
        const updates = flattened.filter(
          (mat) =>
            mat &&
            mat.id &&
            (mat.name ||
              mat.LocationOfMaterial ||
              mat.materialWeight !== null ||
              mat.lightWeight !== null ||
              mat.grossWeight !== null),
        );
        if (updates.length === 0) {
          console.warn("No valid material logs to update.");
          return;
        }
        await updateTruckingMaterialLogs(updates);
        setOriginalData(JSON.parse(JSON.stringify(newData)));
        setChanges([]);
        setEdit(false);
        return;
      }
      if (timeSheetFilter === "truckingRefuelLogs") {
        const flattened = flattenRefuelLogs(changes as TruckingRefuelLogData);
        const updates = flattened.filter(
          (refuel) =>
            refuel &&
            refuel.id &&
            refuel.gallonsRefueled !== null &&
            refuel.gallonsRefueled !== undefined,
        );
        if (updates.length === 0) {
          console.warn("No valid refuel logs to update.");
          return;
        }
        await updateTruckingRefuelLogs(updates);
        setOriginalData(JSON.parse(JSON.stringify(newData)));
        setChanges([]);
        setEdit(false);
        return;
      }
      if (timeSheetFilter === "truckingStateLogs") {
        const flattened = flattenStateMileageLogs(
          changes as TruckingStateLogData,
        );
        const updates = flattened.filter(
          (mileage) =>
            mileage &&
            mileage.id &&
            mileage.state &&
            mileage.stateLineMileage !== null &&
            mileage.stateLineMileage !== undefined,
        );
        if (updates.length === 0) {
          console.warn("No valid state mileage logs to update.");
          return;
        }
        await updateTruckingStateLogs(updates);

        setOriginalData(JSON.parse(JSON.stringify(newData)));
        setChanges([]);
        setEdit(false);
        return;
      }
      const isTascoHaulLogData = (data: unknown): data is TascoHaulLogData => {
        return (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0] === "object" &&
          data[0] !== null &&
          "TascoLogs" in data[0]
        );
      };
      if (timeSheetFilter === "tascoHaulLogs") {
        if (!isTascoHaulLogData(changes)) {
          console.warn("Invalid changes type for tascoHaulLogs");
          return;
        }
        const flattened = flattenTascoHaulLogs(changes);
        const updates = flattened.filter(
          (log) =>
            log &&
            log.id &&
            log.shiftType &&
            log.materialType &&
            log.LoadQuantity !== null &&
            log.LoadQuantity !== undefined,
        );
        if (updates.length === 0) {
          console.warn("No valid tasco haul logs to update.");
          return;
        }
        await updateTascoHaulLogs(updates);

        setOriginalData(JSON.parse(JSON.stringify(newData)));
        setChanges([]);
        setEdit(false);
        return;
      }
      const isTascoRefuelLogData = (
        data: unknown,
      ): data is TascoRefuelLogData => {
        return (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0] === "object" &&
          data[0] !== null &&
          "TascoLogs" in data[0]
        );
      };
      if (timeSheetFilter === "tascoRefuelLogs") {
        if (!isTascoRefuelLogData(changes)) {
          console.warn("Invalid changes type for tascoRefuelLogs");
          return;
        }
        const flattened = flattenTascoRefuelLogs(changes);
        const updates = flattened.filter(
          (log) =>
            log &&
            log.id &&
            log.gallonsRefueled !== null &&
            log.gallonsRefueled !== undefined,
        );
        if (updates.length === 0) {
          console.warn("No valid tasco refuel logs to update.");
          return;
        }
        await updateTascoRefuelLogs(updates);

        setOriginalData(JSON.parse(JSON.stringify(newData)));
        setChanges([]);
        setEdit(false);
        return;
      }
      if (timeSheetFilter === "equipmentLogs") {
        // Get current updates from the equipment logs component using ref
        const equipmentUpdates = equipmentLogsRef.current?.getCurrentUpdates();
        if (!equipmentUpdates || equipmentUpdates.length === 0) {
          console.warn("No equipment logs updates found.");
          return;
        }

        const validUpdates = equipmentUpdates.filter(
          (log) => log && log.id && log.startTime && log.endTime,
        );

        if (validUpdates.length === 0) {
          console.warn("No valid equipment logs to update.");
          return;
        }
        await parentOnSaveChanges(validUpdates);
        setOriginalData(JSON.parse(JSON.stringify(newData)));
        setChanges([]);
        setEdit(false);
        return;
      }
      if (timeSheetFilter === "equipmentRefuelLogs") {
        // Handle EquipmentRefuelLog[] directly (already flattened from TimeCardEquipmentRefuelLogs)
        const equipmentRefuelUpdates = Array.isArray(changes)
          ? (changes as { id: string; gallonsRefueled?: number | null }[])
          : [];

        if (equipmentRefuelUpdates.length === 0) {
          console.warn("No valid equipment refuel logs to update.");
          return;
        }

        await updateEquipmentRefuelLogs(equipmentRefuelUpdates);
        setOriginalData(JSON.parse(JSON.stringify(newData)));
        setChanges([]);
        setEdit(false);
        return;
      }
      if (!Array.isArray(changes) || changes.length === 0) {
        return;
      }

      // Check if all items have properties matching TimesheetHighlights
      const isTimesheetHighlights =
        Array.isArray(changes) &&
        changes.every(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "jobsiteId" in item &&
            "startTime" in item,
        );

      // Type guard for TimesheetHighlights
      function isTimesheetHighlightsArray(
        arr: unknown,
      ): arr is TimesheetHighlights[] {
        return (
          Array.isArray(arr) &&
          arr.every(
            (item) =>
              item &&
              typeof item === "object" &&
              "id" in item &&
              "jobsiteId" in item &&
              "startTime" in item,
          )
        );
      }

      if (isTimesheetHighlightsArray(changes)) {
        // Handle as TimesheetHighlights
        const validatedTimesheets = (changes as TimesheetHighlights[]).map(
          (item) => {
            const timesheet = item;
            const result: Partial<TimesheetHighlights> = {
              id: timesheet.id,
              jobsiteId: timesheet.jobsiteId,
              costcode: timesheet.costcode,
            };

            // Process startTime
            if (timesheet.startTime) {
              try {
                const startDate =
                  timesheet.startTime instanceof Date
                    ? timesheet.startTime
                    : new Date(timesheet.startTime as string);

                if (!isNaN(startDate.getTime())) {
                  result.startTime = startDate;
                }
              } catch (error) {
                console.warn(
                  `Invalid startTime for timesheet ${timesheet.id}`,
                  error,
                );
              }
            }

            // Process endTime
            if (timesheet.endTime) {
              try {
                const endDate =
                  timesheet.endTime instanceof Date
                    ? timesheet.endTime
                    : new Date(timesheet.endTime as string);

                if (!isNaN(endDate.getTime())) {
                  result.endTime = endDate;
                }
              } catch (error) {
                console.warn(
                  `Invalid endTime for timesheet ${timesheet.id}`,
                  error,
                );
              }
            }

            return result as TimesheetHighlights;
          },
        );
        await parentOnSaveChanges(validatedTimesheets as TimesheetHighlights[]);
      } else {
        // For other types, pass through as-is
        await parentOnSaveChanges(changes);
      }

      // After save, update state
      if (newData) {
        setOriginalData(structuredClone(newData));
      }
      setChanges([]);
      setOriginalData(JSON.parse(JSON.stringify(newData)));
      setChanges([]); // Clear changes after save
      setEdit(false); // Exit edit mode after save
    } catch (error: unknown) {
      console.error("Error saving changes:", error);
      if (
        error instanceof Error &&
        (error.message.includes("Invalid time value") ||
          error.message.includes("Invalid Date"))
      ) {
        console.error(
          "Detected invalid date format in the data. Please check all date values.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }, [changes, parentOnSaveChanges, timeSheetFilter, newData, setEdit]);

  const handleCancel = () => {
    onCancelEdits();
    setChanges([]);
    if (originalData) {
      setNewData(JSON.parse(JSON.stringify(originalData)));
    }
  };

  const handleDataChange = (
    updatedData:
      | TimesheetHighlights[]
      | TimesheetHighlights
      | TruckingMaterialHaulLogData
      | TruckingRefuelLogData
      | EquipmentLogChange[]
      | {
          id: string;
          gallonsRefueled?: number | null;
          milesAtFueling?: number | null;
        }[]
      | { id: string; state?: string; stateLineMileage?: number }[]
      | {
          id: string;
          shiftType?: string;
          equipmentId?: string | null;
          materialType?: string;
          LoadQuantity?: number | null;
        }[]
      | { id: string; gallonsRefueled?: number | null }[]
      | TruckingMileageData
      | MaintenanceLogData,
  ) => {
    if (timeSheetFilter === "truckingMaterialHaulLogs") {
      setChanges(updatedData as TruckingMaterialHaulLogData);
      setNewData(updatedData as TruckingMaterialHaulLogData);
      return;
    }
    if (timeSheetFilter === "truckingRefuelLogs") {
      setChanges(updatedData as TruckingRefuelLogData);
      setNewData(updatedData as TruckingRefuelLogData);
      return;
    }
    if (timeSheetFilter === "equipmentRefuelLogs") {
      // Handle EquipmentRefuelLog[] - only keep id and gallonsRefueled for saving
      const equipmentRefuelChanges = Array.isArray(updatedData)
        ? (updatedData as { id: string; gallonsRefueled?: number | null }[])
        : [];
      setChanges(equipmentRefuelChanges);
      setNewData(updatedData as typeof newData);
      return;
    }
    if (timeSheetFilter === "mechanicLogs") {
      // Handle MaintenanceLogData
      setChanges(updatedData as MaintenanceLogData);
      setNewData(updatedData as typeof newData);
      return;
    }
    const changesArray = Array.isArray(updatedData)
      ? updatedData
      : [updatedData];
    const newChanges = changesArray.map((item) =>
      JSON.parse(JSON.stringify(item)),
    );
    setChanges(newChanges);
    setNewData((prevData) => {
      if (
        timeSheetFilter === "truckingMileage" &&
        Array.isArray(updatedData) &&
        updatedData.length > 0 &&
        "TruckingLogs" in updatedData[0]
      ) {
        return updatedData as typeof prevData;
      }
      return newChanges as typeof prevData;
    });
  };

  const handleSelectEntity = (id: string) => {
    if (focusIds.includes(id)) {
      setFocusIds(focusIds.filter((fid: string) => fid !== id));
    } else {
      setFocusIds([...focusIds, id]);
    }
  };

  // --- Render ---
  return (
    <Grids rows={"3"} gap={"3"} className="h-full w-full">
      <Holds
        background={"white"}
        className={"row-start-1 row-end-2 h-full w-full rounded-t-none"}
      >
        <Contents width={"section"} className="h-full pt-1 pb-5">
          <Grids rows={"3"} className="h-full w-full">
            <Holds className="row-start-1 row-end-1">
              <label htmlFor="date" className="text-xs">
                {t("SelectDate")}
              </label>
              <Inputs
                type="date"
                name="date"
                id="date"
                value={date}
                className="text-xs text-center border-[3px] py-2 border-black"
                onChange={handleDateChange}
                disabled={loading}
              />
            </Holds>
            <Holds className="row-start-2 row-end-3">
              <Selects
                onChange={handleFilterChange}
                value={timeSheetFilter}
                className="text-center text-xs py-2"
                disabled={loading}
              >
                <option value="timesheetHighlights">
                  {t("timesheetHighlights")}
                </option>
                <option value="truckingMileage">{t("truckingMileage")}</option>
                <option value="truckingEquipmentHaulLogs">
                  {t("truckingEquipmentHaulLogs")}
                </option>
                <option value="truckingMaterialHaulLogs">
                  {t("truckingMaterialHaulLogs")}
                </option>
                <option value="truckingRefuelLogs">
                  {t("truckingRefuelLogs")}
                </option>
                <option value="truckingStateLogs">
                  {t("truckingStateLogs")}
                </option>
                <option value="tascoHaulLogs">{t("tascoHaulLogs")}</option>
                <option value="tascoRefuelLogs">{t("tascoRefuelLogs")}</option>
                <option value="equipmentLogs">{t("equipmentLogs")}</option>
                <option value="equipmentRefuelLogs">
                  {t("equipmentRefuelLogs")}
                </option>
                <option value="mechanicLogs">{t("mechanicLogs")}</option>
              </Selects>
            </Holds>
            <Holds
              position={"row"}
              className="row-start-3 row-end-4 justify-between"
            >
              {edit ? (
                <>
                  <Buttons
                    background={"green"}
                    className="w-1/4"
                    onClick={handleSave}
                    disabled={
                      loading ||
                      isSaving ||
                      (timeSheetFilter !== "equipmentLogs" &&
                        (!Array.isArray(changes) || changes.length === 0))
                    }
                  >
                    {isSaving ? (
                      <Spinner size={24} />
                    ) : (
                      <Images
                        titleImg={"/formSave.svg"}
                        titleImgAlt={"Save"}
                        className="w-6 h-6 mx-auto"
                      />
                    )}
                  </Buttons>
                  <Buttons
                    background={"red"}
                    className="w-1/4"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    <Images
                      titleImg={"/formUndo.svg"}
                      titleImgAlt={"Cancel"}
                      className="w-6 h-6 mx-auto"
                    />
                  </Buttons>
                </>
              ) : (
                <Buttons
                  background={"orange"}
                  className="text-center text-base"
                  onClick={() => setEdit(true)}
                  disabled={loading}
                >
                  <Images
                    titleImg="/formEdit.svg"
                    titleImgAlt="Edit Icon"
                    className="w-6 h-6 mx-auto"
                  />
                </Buttons>
              )}
            </Holds>
          </Grids>
        </Contents>
      </Holds>

      <Holds
        background={"white"}
        className={"row-start-2 row-end-4 h-full w-full"}
      >
        <Contents width={"section"} className="pt-2 pb-5">
          {loading ? (
            <Holds className="w-full h-full flex items-center justify-center">
              <Spinner size={70} />
              <Texts size="p6" className="mt-2">
                {t("LoadingTimesheetData")}
              </Texts>
            </Holds>
          ) : (
            <TimeSheetRenderer
              key={`${edit}-${JSON.stringify(newData)}`}
              filter={timeSheetFilter}
              data={newData}
              setData={setNewData}
              edit={edit}
              manager={manager}
              onDataChange={handleDataChange}
              date={date}
              focusIds={focusIds}
              setFocusIds={setFocusIds}
              handleSelectEntity={handleSelectEntity}
              isReviewYourTeam={isReviewYourTeam}
              allEquipment={allEquipment}
              equipmentLogsRef={equipmentLogsRef}
            />
          )}
        </Contents>
      </Holds>
    </Grids>
  );
}
