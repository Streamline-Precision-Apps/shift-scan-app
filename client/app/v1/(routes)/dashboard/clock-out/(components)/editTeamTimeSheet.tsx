"use client";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Holds } from "@/components/(reusable)/holds";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Grids } from "@/components/(reusable)/grids";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { NewTab } from "@/components/(reusable)/newTabs";
import { Titles } from "@/components/(reusable)/titles";
import { useTimesheetData } from "@/hooks/(ManagerHooks)/useTimesheetData";
import { useEmployeeData } from "@/hooks/(ManagerHooks)/useEmployeeData";
import {
  TimesheetHighlights,
  TimesheetFilter,
  TruckingMileageUpdate,
  TruckingEquipmentHaulLog,
  TruckingMaterialHaulLogData,
  TruckingRefuelLogData,
  TruckingMileageData,
  EquipmentHauledItem,
} from "@/lib/types";
import { MaintenanceLogData } from "../../myTeam/[id]/employee/[employeeId]/_components/TimeCardMechanicLogs";
import {
  updateTruckingHaulLogs,
  updateTimesheetHighlights,
  updateEquipmentLogs,
  updateTascoHaulLogs,
  updateTascoRefuelLogs,
  updateTruckingMaterialLogs,
  updateTruckingRefuelLogs,
  updateEquipmentRefuelLogs,
  updateTruckingMileage,
} from "@/actions/myTeamsActions";
import { TimesheetDataUnion } from "@/hooks/(ManagerHooks)/useTimesheetData";

import { flattenMaterialLogs } from "../../myTeam/[id]/employee/[employeeId]/_components/TimeCardTruckingMaterialLogs";
import { z } from "zod";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Buttons } from "@/components/(reusable)/buttons";
import { useAllEquipment } from "@/hooks/useAllEquipment";
import { EmployeeTimeSheets } from "../../myTeam/[id]/employee/[employeeId]/_components/employee-timesheet";

// Zod schema for Team data
const countSchema = z.object({
  Users: z.number(),
});

// Define the main schema
const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  _count: countSchema,
});

// Zod schema for the response containing an array of Teams
const TeamsResponseSchema = z.array(TeamSchema);

type Team = z.infer<typeof TeamSchema>;

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
          result.push({
            id: refuel.id,
            gallonsRefueled: refuel.gallonsRefueled,
            milesAtFueling: refuel.milesAtFueling,
          });
        }
      });
    });
  });
  return result;
};

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
// Type guard for EquipmentLogChange
function isEquipmentLogChange(
  obj:
    | EquipmentLogChange
    | TruckingMaterialHaulLog
    | TimesheetHighlights
    | TruckingMileageUpdate
    | TruckingEquipmentHaulLog
    | {
        id: string;
        gallonsRefueled?: number | null;
        milesAtFueling?: number | null;
      }
    | { id: string; state?: string; stateLineMileage?: number }
    | {
        id: string;
        shiftType?: string;
        equipmentId?: string | null;
        materialType?: string;
        LoadQuantity?: number | null;
      }
    | { id: string; gallonsRefueled?: number | null },
): obj is EquipmentLogChange {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "startTime" in obj &&
    "endTime" in obj &&
    obj["startTime"] instanceof Date &&
    obj["endTime"] instanceof Date
  );
}

interface EditTeamTimeSheetProps {
  prevStep: () => void;
  employeeId?: string;
  editFilter?: TimesheetFilter;
  focusIds?: string[];
  setFocusIds?: (ids: string[]) => void;
}

const EditTeamTimeSheet: React.FC<EditTeamTimeSheetProps> = ({
  prevStep,
  employeeId,
  editFilter,
  focusIds,
  setFocusIds,
}) => {
  const t = useTranslations("MyTeam");
  const { data: session } = useSession();

  const manager = useMemo(
    () => `${session?.user?.firstName} ${session?.user?.lastName}`,
    [session],
  );
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [date, setDate] = useState<string>(today);
  const [edit, setEdit] = useState(false);

  const [timeSheetFilter, setTimeSheetFilter] = useState<TimesheetFilter>(
    editFilter || "timesheetHighlights",
  );

  const {
    employee,
    loading: loadingEmployee,
    error: errorEmployee,
  } = useEmployeeData(employeeId);

  const {
    data: timesheetData,
    setData: setTimesheetData,
    loading: loadingTimesheets,
    error: errorTimesheets,
    updateDate: fetchTimesheetsForDate,
    updateFilter: fetchTimesheetsForFilter,
  } = useTimesheetData(employeeId, date, timeSheetFilter);

  const allEquipment = useAllEquipment();

  const loading = loadingEmployee || loadingTimesheets;

  useEffect(() => {
    if (date && date !== today) {
      fetchTimesheetsForDate(date);
    }
  }, [date, fetchTimesheetsForDate, today]);

  useEffect(() => {
    fetchTimesheetsForFilter(timeSheetFilter);
  }, [timeSheetFilter, fetchTimesheetsForFilter]);

  const onSaveChanges = useCallback(
    async (
      changes:
        | TimesheetHighlights[]
        | TimesheetHighlights
        | TruckingMileageUpdate[]
        | TruckingEquipmentHaulLog[]
        | TruckingMaterialHaulLogData
        | TruckingRefuelLogData
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
        | EquipmentLogChange[]
        | TruckingMileageData,
    ) => {
      try {
        switch (timeSheetFilter) {
          case "timesheetHighlights":
            const timesheetChanges = changes as
              | TimesheetHighlights[]
              | TimesheetHighlights;
            const changesArray = Array.isArray(timesheetChanges)
              ? timesheetChanges
              : [timesheetChanges];
            const serializedChanges = changesArray.map((timesheet) => {
              // Safely convert to ISO string with validation
              const safeToISOString = (
                dateValue: Date | string | null | undefined,
              ) => {
                if (!dateValue) return undefined;

                try {
                  // Ensure we're working with a valid Date object
                  const date =
                    dateValue instanceof Date ? dateValue : new Date(dateValue);

                  // Check if date is valid before converting
                  if (isNaN(date.getTime())) {
                    console.warn(`Invalid date detected: ${dateValue}`);
                    return undefined;
                  }

                  return date.toISOString();
                } catch (error) {
                  console.error(
                    `Error converting date to ISO string: ${error}`,
                  );
                  return undefined;
                }
              };

              return {
                id: timesheet.id,
                startTime: safeToISOString(timesheet.startTime),
                endTime: safeToISOString(timesheet.endTime),
                jobsiteId: timesheet.jobsiteId,
                costcode: timesheet.costcode,
              };
            });

            const validChanges = serializedChanges.filter(
              (timesheet) => timesheet.id && timesheet.startTime !== undefined,
            );

            if (validChanges.length === 0) return;

            const result = await updateTimesheetHighlights(validChanges);
            if (result?.success) {
              await Promise.all([
                fetchTimesheetsForDate(date),
                fetchTimesheetsForFilter(timeSheetFilter),
              ]);
              setEdit(false);
            }
            break;

          case "truckingMileage": {
            const mileageChanges = changes as TruckingMileageUpdate[];
            if (mileageChanges.length === 0) {
              console.warn("No valid mileage changes to save");
              return;
            }

            const formData = new FormData();
            mileageChanges.forEach((change, index) => {
              formData.append(`changes[${index}]`, JSON.stringify(change));
            });
            const result = await updateTruckingMileage(formData);

            if (result?.success) {
              await Promise.all([
                fetchTimesheetsForDate(date),
                fetchTimesheetsForFilter(timeSheetFilter),
              ]);
              setEdit(false);
            }
            break;
          }

          case "truckingEquipmentHaulLogs": {
            if (
              Array.isArray(changes) &&
              changes.every(
                (item) =>
                  typeof item === "object" &&
                  Array.isArray(
                    (item as { TruckingLogs?: unknown[] }).TruckingLogs,
                  ),
              )
            ) {
              const haulLogChanges = changes as unknown as Array<{
                TruckingLogs: TruckingEquipmentHaulLog[];
              }>;

              const updates = haulLogChanges.flatMap((item) =>
                (item.TruckingLogs || []).flatMap(
                  (log: TruckingEquipmentHaulLog) =>
                    (log.EquipmentHauled || []).map(
                      (hauledItem: EquipmentHauledItem) => ({
                        id: hauledItem.id,
                        equipmentId: hauledItem.Equipment?.id,
                        jobSiteId: hauledItem.JobSite?.id,
                      }),
                    ),
                ),
              );

              if (updates.length === 0) {
                console.warn("No haul log updates to send");
                return;
              }

              const haulingResult = await updateTruckingHaulLogs(updates);
              if (haulingResult?.success) {
                await Promise.all([
                  fetchTimesheetsForDate(date),
                  fetchTimesheetsForFilter(timeSheetFilter),
                ]);
                setEdit(false);
              }
            }
            break;
          }

          case "truckingMaterialHaulLogs": {
            let formattedChanges: ProcessedMaterialLog[] = [];
            if (
              Array.isArray(changes) &&
              changes.length > 0 &&
              "TruckingLogs" in changes[0]
            ) {
              formattedChanges = flattenMaterialLogs(
                changes as unknown as TruckingMaterialHaulLogData,
              );
            } else if (Array.isArray(changes)) {
              formattedChanges = changes as unknown as ProcessedMaterialLog[];
            }
            if (
              Array.isArray(formattedChanges) &&
              formattedChanges.length > 0
            ) {
              await updateTruckingMaterialLogs(formattedChanges);
            }
            break;
          }
          case "truckingRefuelLogs": {
            // Accept both flat and nested structure
            let formattedChanges: {
              id: string;
              gallonsRefueled?: number | null;
            }[] = [];
            if (
              Array.isArray(changes) &&
              changes.length > 0 &&
              "TruckingLogs" in changes[0]
            ) {
              formattedChanges = flattenRefuelLogs(
                changes as TruckingRefuelLogData,
              );
            } else if (isRefuelLogArray(changes)) {
              formattedChanges = changes;
            } else {
              formattedChanges = [];
            }
            if (
              Array.isArray(formattedChanges) &&
              formattedChanges.length > 0
            ) {
              await updateTruckingRefuelLogs(formattedChanges);
            }
            break;
          }

          case "tascoHaulLogs":
            if (
              Array.isArray(changes) &&
              changes.every(
                (change) =>
                  "id" in change &&
                  "shiftType" in change &&
                  "equipmentId" in change &&
                  "materialType" in change &&
                  "LoadQuantity" in change,
              )
            ) {
              await updateTascoHaulLogs(
                changes as {
                  id: string;
                  shiftType?: string | undefined;
                  equipmentId?: string | null | undefined;
                  materialType?: string | undefined;
                  LoadQuantity?: number | null | undefined;
                }[],
              );
            } else {
              console.error("Invalid changes type");
            }
            break;

          case "tascoRefuelLogs":
            if (
              Array.isArray(changes) &&
              changes.every(
                (change) =>
                  "id" in change &&
                  ("gallonsRefueled" in change ||
                    !("gallonsRefueled" in change)),
              )
            ) {
              await updateTascoRefuelLogs(
                changes as { id: string; gallonsRefueled?: number | null }[],
              );
            } else {
              console.error("Invalid changes type");
            }
            break;

          case "equipmentLogs": {
            if (
              Array.isArray(changes) &&
              changes.length > 0 &&
              typeof changes[0] === "object" &&
              "startTime" in changes[0] &&
              "endTime" in changes[0]
            ) {
              const validChanges = (changes as EquipmentLogChange[]).filter(
                (change) => change.id && change.startTime && change.endTime,
              );
              if (validChanges.length > 0) {
                await updateEquipmentLogs(
                  validChanges.map((change) => ({
                    id: change.id,
                    startTime: change.startTime,
                    endTime: change.endTime,
                  })),
                );
              }
            } else {
              console.error("Invalid changes type for equipmentLogs");
            }
            break;
          }

          case "equipmentRefuelLogs":
            if (
              Array.isArray(changes) &&
              changes.every(
                (change) => "id" in change && "gallonsRefueled" in change,
              )
            ) {
              updateEquipmentRefuelLogs(
                changes as { id: string; gallonsRefueled?: number | null }[],
              );
            } else {
              console.error("Invalid changes type");
            }
            break;

          // Handle mechanicLogs (MaintenanceLog data)
          case "mechanicLogs": {
            const updateMaintenanceLogs = async (
              logs: MaintenanceLogData,
            ): Promise<{ success: boolean }> => {
              const formData = new FormData();
              logs.forEach((log, index) => {
                formData.append(`logs[${index}].id`, log.id);
                formData.append(
                  `logs[${index}].startTime`,
                  log.startTime ? new Date(log.startTime).toISOString() : "",
                );
                formData.append(
                  `logs[${index}].endTime`,
                  log.endTime ? new Date(log.endTime).toISOString() : "",
                );
              });
              // ...existing code for submitting the formData...
              // Simulate a successful response for now:
              return { success: true };
            };

            if (
              Array.isArray(changes) &&
              changes.every(
                (log) =>
                  typeof log === "object" &&
                  "id" in log &&
                  "maintenanceId" in log &&
                  "startTime" in log &&
                  "endTime" in log &&
                  "Maintenance" in log,
              )
            ) {
              const result = await updateMaintenanceLogs(
                changes as unknown as MaintenanceLogData,
              );

              if (result?.success) {
                await Promise.all([
                  fetchTimesheetsForDate(date),
                  fetchTimesheetsForFilter(timeSheetFilter),
                ]);
                setEdit(false);
              }
            } else {
              console.warn("Invalid maintenance log changes");
              return;
            }
            break;
          }
        }

        await Promise.all([
          fetchTimesheetsForDate(date),
          fetchTimesheetsForFilter(timeSheetFilter),
        ]);

        setEdit(false);
      } catch (error) {
        console.error("Failed to save changes:", error);
        setEdit(false);
        throw error;
      }
    },
    [
      date,
      timeSheetFilter,
      fetchTimesheetsForDate,
      fetchTimesheetsForFilter,
      setTimesheetData,
    ],
  );

  const onCancelEdits = useCallback(() => {
    fetchTimesheetsForDate(date);
    fetchTimesheetsForFilter(timeSheetFilter);
    setEdit(false);
  }, [date, fetchTimesheetsForDate, fetchTimesheetsForFilter, timeSheetFilter]);

  const handleProceed = () => {
    setFocusIds?.([]);
    prevStep();
  };

  return (
    <Bases>
      <Contents>
        <Holds className="h-full w-full">
          <Grids rows={"7"} gap={"5"} className="h-full w-full">
            <Holds
              background={"white"}
              className="row-start-1 row-end-2 h-full w-full"
            >
              <TitleBoxes onClick={() => prevStep()}>
                <Titles size={"h2"}>
                  {loading
                    ? t("Loading")
                    : `${employee?.firstName} ${employee?.lastName}`}
                </Titles>
              </TitleBoxes>
            </Holds>

            <Holds
              className={`w-full h-full row-start-2 row-end-8 ${
                loading ? "animate-pulse" : ""
              }`}
            >
              <Grids rows={"12"} className="h-full w-full">
                <Holds className="h-full w-full row-start-1 row-end-12">
                  <EmployeeTimeSheets
                    data={timesheetData}
                    date={date}
                    setDate={setDate}
                    edit={edit}
                    setEdit={setEdit}
                    loading={loading}
                    manager={manager}
                    focusIds={focusIds || []}
                    setFocusIds={setFocusIds || ((ids) => {})}
                    timeSheetFilter={timeSheetFilter}
                    setTimeSheetFilter={setTimeSheetFilter}
                    onSaveChanges={onSaveChanges}
                    onCancelEdits={onCancelEdits}
                    fetchTimesheetsForDate={fetchTimesheetsForDate}
                    fetchTimesheetsForFilter={fetchTimesheetsForFilter}
                    allEquipment={allEquipment}
                  />
                </Holds>
                <Holds className="h-full w-full row-start-12 row-end-13">
                  <Buttons
                    onClick={handleProceed}
                    disabled={edit}
                    background={"green"}
                    className="w-full h-full"
                  >
                    {t("Continue")}
                  </Buttons>
                </Holds>
              </Grids>
            </Holds>
          </Grids>
        </Holds>
      </Contents>
    </Bases>
  );
};

export default EditTeamTimeSheet;

// In EmployeeTimesheetProps (or EmployeeTimesheetData type), allow null:
export type EmployeeTimesheetData = TimesheetDataUnion;

export interface EmployeeTimeSheetsProps {
  data: EmployeeTimesheetData;
  date: string;
  setDate: (date: string) => void;
  edit: boolean;
  setEdit: (edit: boolean) => void;
  loading: boolean;
  manager: string;
  timeSheetFilter: TimesheetFilter;
  setTimeSheetFilter: React.Dispatch<React.SetStateAction<TimesheetFilter>>;
  onSaveChanges: (
    changes:
      | TimesheetHighlights[]
      | TimesheetHighlights
      | TruckingMileageUpdate[]
      | TruckingEquipmentHaulLog[]
      | TruckingMaterialHaulLogData
      | TruckingRefuelLogData
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
      | EquipmentLogChange[],
  ) => Promise<void>;
  onCancelEdits: () => void;
  fetchTimesheetsForDate: (date: string) => Promise<void>;
  fetchTimesheetsForFilter: (filter: TimesheetFilter) => Promise<void>;
}

// Define ProcessedMaterialLog locally (copy from TimeCardTruckingMaterialLogs.tsx)
type ProcessedMaterialLog = {
  id: string;
  name: string;
  LocationOfMaterial: string;
  materialWeight: number | null;
  lightWeight: number | null;
  grossWeight: number | null;
  logId: string;
};

// Helper type guard for refuel log array
function isRefuelLogArray(
  arr: unknown,
): arr is { id: string; gallonsRefueled?: number | null }[] {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "id" in item &&
        typeof (item as { id: unknown }).id === "string",
    )
  );
}
