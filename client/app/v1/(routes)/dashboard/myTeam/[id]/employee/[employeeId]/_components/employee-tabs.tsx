"use client";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Holds } from "@/components/(reusable)/holds";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useMemo } from "react";
import { Grids } from "@/components/(reusable)/grids";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { EmployeeTimeSheets } from "./employee-timesheet";
import EmployeeInfo from "./employeeInfo";
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
  TruckingEquipmentHaulLogData,
  TruckingStateLogData,
  TascoHaulLogData,
  TascoRefuelLogData,
  EquipmentLogsData,
  EmployeeEquipmentLogWithRefuel,
  EquipmentHauledItem,
} from "@/lib/types";
import { MaintenanceLogData } from "./TimeCardMechanicLogs";
import {
  updateTruckingHaulLogs,
  updateTimesheetHighlights,
  updateEquipmentLogs,
  updateTascoHaulLogs,
  updateTascoRefuelLogs,
  updateTruckingMaterialLogs,
  updateTruckingRefuelLogs,
  updateTruckingStateLogs,
  updateEquipmentRefuelLogs,
  updateTruckingMileage,
  updateMaintenanceLogs,
} from "@/actions/myTeamsActions";
import {
  flattenMaterialLogs,
  ProcessedMaterialLog,
} from "./TimeCardTruckingMaterialLogs";
import { TimesheetDataUnion } from "@/hooks/(ManagerHooks)/useTimesheetData";
import { useAllEquipment } from "@/hooks/useAllEquipment";

type MaintenanceLog = {
  id: string;
  startTime: Date;
  endTime: Date | null;
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

// Local type for haul log changes
interface HaulLogChange {
  TruckingLogs: TruckingEquipmentHaulLog[];
}

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

// Type guard for HaulLogChange
function isHaulLogChangeArray(arr: unknown): arr is HaulLogChange[] {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "TruckingLogs" in item &&
        Array.isArray((item as HaulLogChange).TruckingLogs) &&
        (item as HaulLogChange).TruckingLogs.every(
          (log) =>
            log &&
            typeof log === "object" &&
            "EquipmentHauled" in log &&
            Array.isArray(log.EquipmentHauled),
        ),
    )
  );
}

export default function EmployeeTabs() {
  const t = useTranslations("MyTeam");
  const router = useRouter();
  const { employeeId } = useParams();
  const { data: session } = useSession();
  const { id } = useParams();
  const urls = useSearchParams();
  const rPath = urls.get("rPath");
  const timeCard = urls.get("timeCard");

  const manager = useMemo(
    () => `${session?.user?.firstName} ${session?.user?.lastName}`,
    [session],
  );
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [activeTab, setActiveTab] = useState(1);
  const [date, setDate] = useState<string>(today);
  const [edit, setEdit] = useState(false);
  const [timeSheetFilter, setTimeSheetFilter] = useState<TimesheetFilter>(
    "timesheetHighlights",
  );

  const {
    employee,
    contacts,
    loading: loadingEmployee,
    error: errorEmployee,
  } = useEmployeeData(employeeId as string | undefined);

  const {
    data: timesheetData,
    setData: setTimesheetData,
    loading: loadingTimesheets,
    error: errorTimesheets,
    updateDate: fetchTimesheetsForDate,
    updateFilter: fetchTimesheetsForFilter,
  } = useTimesheetData(employeeId as string | undefined, date, timeSheetFilter);

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
              // Debug: Log the type and value of time properties

              // Validate date values before conversion
              let startTimeISO = undefined;
              let endTimeISO = undefined;

              try {
                if (timesheet.startTime) {
                  // Ensure we're working with a Date object
                  const startDate =
                    timesheet.startTime instanceof Date
                      ? timesheet.startTime
                      : new Date(timesheet.startTime);

                  // Validate the date
                  if (!isNaN(startDate.getTime())) {
                    startTimeISO = startDate.toISOString();
                  } else {
                    console.warn(
                      "Invalid startTime detected:",
                      timesheet.startTime,
                    );
                  }
                }
              } catch (e) {
                console.error(
                  "Error processing startTime:",
                  timesheet.startTime,
                  e,
                );
              }

              try {
                if (timesheet.endTime) {
                  // Ensure we're working with a Date object
                  const endDate =
                    timesheet.endTime instanceof Date
                      ? timesheet.endTime
                      : new Date(timesheet.endTime);

                  // Validate the date
                  if (!isNaN(endDate.getTime())) {
                    endTimeISO = endDate.toISOString();
                  } else {
                    console.warn(
                      "Invalid endTime detected:",
                      timesheet.endTime,
                    );
                  }
                }
              } catch (e) {
                console.error(
                  "Error processing endTime:",
                  timesheet.endTime,
                  e,
                );
              }

              return {
                id: timesheet.id,
                startTime: startTimeISO,
                endTime: endTimeISO,
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
            if (!isHaulLogChangeArray(changes)) {
              console.warn("No valid haul log changes to send");
              return;
            }
            const haulLogChanges = changes;
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
            break;
          }
          case "truckingMaterialHaulLogs": {
            // Accept both flat and nested structure
            let formattedChanges: ProcessedMaterialLog[] = [];
            if (
              Array.isArray(changes) &&
              changes.length > 0 &&
              "TruckingLogs" in changes[0]
            ) {
              formattedChanges = flattenMaterialLogs(
                changes as TruckingMaterialHaulLogData,
              );
            } else if (Array.isArray(changes)) {
              formattedChanges = changes as ProcessedMaterialLog[];
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
              milesAtFueling?: number | null;
            }[] = [];
            if (
              Array.isArray(changes) &&
              changes.length > 0 &&
              "TruckingLogs" in changes[0]
            ) {
              formattedChanges = flattenRefuelLogs(
                changes as TruckingRefuelLogData,
              );
            } else if (Array.isArray(changes)) {
              formattedChanges = changes as {
                id: string;
                gallonsRefueled?: number | null;
                milesAtFueling?: number | null;
              }[];
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
            if (!Array.isArray(changes)) {
              console.warn("Invalid maintenance log changes");
              return;
            }

            // Transform the MaintenanceLog data to match the server action format
            const maintenanceUpdates = (changes as MaintenanceLog[]).map(
              (log) => ({
                id: log.id,
                startTime: log.startTime ? new Date(log.startTime) : undefined,
                endTime: log.endTime ? new Date(log.endTime) : undefined,
              }),
            );

            const result = await updateMaintenanceLogs(maintenanceUpdates);

            if (result?.success) {
              await Promise.all([
                fetchTimesheetsForDate(date),
                fetchTimesheetsForFilter(timeSheetFilter),
              ]);
              setEdit(false);
            } else {
              console.error(
                "Failed to update maintenance logs:",
                result?.error,
              );
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

  // Add state for focusIds
  const [focusIds, setFocusIds] = useState<string[]>([]);

  return (
    <Holds className="h-full w-full">
      <Grids rows={"7"} gap={"5"} className="h-full w-full">
        <Holds
          background={"white"}
          className="row-start-1 row-end-2 h-full w-full"
        >
          <TitleBoxes
            onClick={() =>
              router.push(
                timeCard ? timeCard : `/dashboard/myTeam/${id}?rPath=${rPath}`,
              )
            }
          >
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
            <Holds
              position={"row"}
              className={"row-start-1 row-end-2 h-full gap-1"}
            >
              <NewTab
                onClick={() => setActiveTab(1)}
                isActive={activeTab === 1}
                isComplete={true}
                titleImage="/information.svg"
                titleImageAlt={""}
              >
                {t("ContactInfo")}
              </NewTab>
              <NewTab
                onClick={() => setActiveTab(2)}
                isActive={activeTab === 2}
                isComplete={true}
                titleImage="/form.svg"
                titleImageAlt={""}
              >
                {t("TimeCards")}
              </NewTab>
            </Holds>
            <Holds className="h-full w-full row-start-2 row-end-13">
              {activeTab === 1 && (
                <EmployeeInfo
                  employee={employee}
                  contacts={contacts}
                  loading={loading}
                />
              )}
              {activeTab === 2 && (
                <EmployeeTimeSheets
                  data={timesheetData}
                  date={date}
                  setDate={setDate}
                  edit={edit}
                  setEdit={setEdit}
                  loading={loading}
                  manager={manager}
                  timeSheetFilter={timeSheetFilter}
                  setTimeSheetFilter={setTimeSheetFilter}
                  focusIds={focusIds}
                  setFocusIds={setFocusIds}
                  isReviewYourTeam={false}
                  onSaveChanges={onSaveChanges}
                  onCancelEdits={onCancelEdits}
                  fetchTimesheetsForDate={fetchTimesheetsForDate}
                  fetchTimesheetsForFilter={fetchTimesheetsForFilter}
                  allEquipment={allEquipment}
                />
              )}
            </Holds>
          </Grids>
        </Holds>
      </Grids>
    </Holds>
  );
}

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
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  isReviewYourTeam?: boolean;
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
      | EquipmentLogChange[]
      | MaintenanceLogData,
  ) => Promise<void>;
  onCancelEdits: () => void;
  fetchTimesheetsForDate: (date: string) => Promise<void>;
  fetchTimesheetsForFilter: (filter: TimesheetFilter) => Promise<void>;
}
