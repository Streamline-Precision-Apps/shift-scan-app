"use client";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import { TimesheetFilter, JobsiteData, EquipmentData } from "@/lib/types";
import TimeCardEquipmentLogs, {
  TimeCardEquipmentLogsRef,
} from "./TimeCardEquipmentLogs";
import TimeCardEquipmentRefuelLogs from "./TimeCardEquipmentRefuelLogs";
// import TimeCardHighlights from "./TimeCardHighlights";
import TimeCardMechanicLogs, {
  MaintenanceLogData,
} from "./TimeCardMechanicLogs";
import TimeCardTascoHaulLogs from "./TimeCardTascoHaulLogs";
import TimeCardTascoRefuelLogs from "./TimeCardTascoRefuelLogs";
import TimeCardTruckingHaulLogs from "./TimeCardTruckingHaulLogs";
import TimeCardTruckingMaterialLogs from "./TimeCardTruckingMaterialLogs";
import TimeCardTruckingRefuelLogs from "./TimeCardTruckingRefuelLogs";
import TimeCardTruckingStateMileageLogs from "./TimeCardTruckingStateMileage";
import {
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
import { useTranslations } from "next-intl";
import { RefObject } from "react";

type ProcessedMaterialLog = {
  id: string;
  name: string;
  LocationOfMaterial: string;
  materialWeight: number | null;
  lightWeight: number | null;
  grossWeight: number | null;
  logId: string;
};

type ExtendedTruckingRefuel = import("@/lib/types").TruckingRefuel & {
  truckName: string;
  truckingLogId: string;
};

type ProcessedTascoHaulLog = {
  id: string;
  shiftType: string;
  equipmentId: string | null;
  materialType: string;
  LoadQuantity: number | null;
};

type FlattenedTascoRefuelLog = {
  id: string;
  gallonsRefueled: number | null;
  truckName: string;
  tascoLogId: string;
};

type ProcessedStateMileage = {
  id: string;
  state: string;
  stateLineMileage: number;
  truckName: string;
  equipmentId: string;
  truckingLogId: string;
};

type EquipmentRefuelLog = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  gallonsRefueled: number | null;
  employeeEquipmentLogId: string;
};

type EquipmentLogUpdate = {
  id: string;
  startTime?: Date;
  endTime?: Date;
};

interface TimeSheetRendererProps {
  filter: TimesheetFilter;
  data:
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
  setData?: (
    data:
      | TimesheetHighlights[]
      | TruckingMileageData
      | TruckingEquipmentHaulLogData
      | TruckingMaterialHaulLogData
      | TruckingRefuelLogData
      | TruckingStateLogData
      | TascoHaulLogData
      | TascoRefuelLogData
      | EquipmentLogsData
      | EmployeeEquipmentLogWithRefuel[],
  ) => void;
  edit: boolean;
  manager: string;
  onDataChange:
    | ((data: TimesheetHighlights[]) => void)
    | ((data: import("@/lib/types").TruckingMileageUpdate[]) => void)
    | ((data: import("@/lib/types").TruckingEquipmentHaulLogData) => void)
    | ((data: TruckingMaterialHaulLogData) => void)
    | ((data: TruckingRefuelLogData) => void)
    | ((data: TruckingStateLogData) => void)
    | ((data: ProcessedTascoHaulLog[]) => void)
    | ((data: FlattenedTascoRefuelLog[]) => void)
    | ((data: EquipmentLogUpdate[]) => void)
    | ((data: EquipmentRefuelLog[]) => void);
  date: string;
  focusIds: string[];
  setFocusIds: (ids: string[]) => void;
  handleSelectEntity: (id: string) => void;
  isReviewYourTeam?: boolean; // NEW: optional, defaults to false
  allEquipment: { id: string; qrId: string; name: string }[];
  equipmentLogsRef?: RefObject<TimeCardEquipmentLogsRef | null>;
}

const getTypedOnDataChange = <T,>(
  handler: unknown,
): ((data: T) => void) | undefined => {
  return typeof handler === "function"
    ? (handler as (data: T) => void)
    : undefined;
};

const renderValueOrNA = (
  value: string | number | boolean | Date | null | undefined,
) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
};

export default function TimeSheetRenderer({
  filter,
  data,
  setData,
  edit,
  manager,
  onDataChange,
  date,
  focusIds,
  setFocusIds,
  handleSelectEntity,
  isReviewYourTeam = false,
  allEquipment,
  equipmentLogsRef,
}: TimeSheetRendererProps) {
  const t = useTranslations("MyTeam");
  const isEmptyData = !data || (Array.isArray(data) && data.length === 0);

  const renderContent = () => {
    if (isEmptyData) {
      return (
        <Holds className="w-full h-full flex items-center justify-center">
          <Texts size="p6" className="text-gray-500 italic">
            {`${t("NoDataFoundForCurrentDate")} `}
          </Texts>
        </Holds>
      );
    }
    switch (filter) {
      case "truckingEquipmentHaulLogs": {
        // Handle review mode data conversion
        if (isReviewYourTeam && Array.isArray(data)) {
          // Type guard for direct API format with TruckingLogs
          const hasDirectTruckingLogs = (
            item: unknown,
          ): item is { TruckingLogs: unknown[] } => {
            return (
              !!item &&
              typeof item === "object" &&
              "TruckingLogs" in item &&
              Array.isArray((item as { TruckingLogs: unknown[] }).TruckingLogs)
            );
          };

          if (data.length > 0 && hasDirectTruckingLogs(data[0])) {
            // Data is already in the expected format
            return (
              <TimeCardTruckingHaulLogs
                edit={edit}
                manager={manager}
                truckingEquipmentHaulLogs={data as TruckingEquipmentHaulLogData}
                onDataChange={
                  onDataChange as (data: TruckingEquipmentHaulLogData) => void
                }
                focusIds={focusIds}
                setFocusIds={setFocusIds}
                isReviewYourTeam={isReviewYourTeam}
                allEquipment={allEquipment}
              />
            );
          }
        }

        // Regular format from EditTeamTimeSheet
        return (
          <TimeCardTruckingHaulLogs
            edit={edit}
            manager={manager}
            truckingEquipmentHaulLogs={data as TruckingEquipmentHaulLogData}
            onDataChange={
              onDataChange as (data: TruckingEquipmentHaulLogData) => void
            }
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
            allEquipment={allEquipment}
          />
        );
      }
      case "truckingMaterialHaulLogs": {
        // Handle review mode data conversion
        if (isReviewYourTeam && Array.isArray(data)) {
          // Type guard for direct API format with TruckingLogs
          const hasDirectTruckingLogs = (
            item: unknown,
          ): item is { TruckingLogs: unknown[] } => {
            return (
              !!item &&
              typeof item === "object" &&
              "TruckingLogs" in item &&
              Array.isArray((item as { TruckingLogs: unknown[] }).TruckingLogs)
            );
          };

          if (data.length > 0 && hasDirectTruckingLogs(data[0])) {
            // Data is already in the expected format
            return (
              <TimeCardTruckingMaterialLogs
                truckingMaterialHaulLogs={data as TruckingMaterialHaulLogData}
                edit={edit}
                manager={manager}
                onDataChange={
                  getTypedOnDataChange<TruckingMaterialHaulLogData>(
                    onDataChange,
                  )!
                }
                focusIds={focusIds}
                setFocusIds={setFocusIds}
                isReviewYourTeam={isReviewYourTeam}
              />
            );
          }
        }

        // Regular format from EditTeamTimeSheet
        return (
          <TimeCardTruckingMaterialLogs
            truckingMaterialHaulLogs={data as TruckingMaterialHaulLogData}
            edit={edit}
            manager={manager}
            onDataChange={
              getTypedOnDataChange<TruckingMaterialHaulLogData>(onDataChange)!
            }
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
          />
        );
      }
      case "truckingRefuelLogs": {
        // Handle review mode data conversion
        if (isReviewYourTeam && Array.isArray(data)) {
          // Type guard for direct API format with TruckingLogs
          const hasDirectTruckingLogs = (
            item: unknown,
          ): item is { TruckingLogs: unknown[] } => {
            return (
              !!item &&
              typeof item === "object" &&
              "TruckingLogs" in item &&
              Array.isArray((item as { TruckingLogs: unknown[] }).TruckingLogs)
            );
          };

          if (data.length > 0 && hasDirectTruckingLogs(data[0])) {
            // Data is already in the expected format
            return (
              <TimeCardTruckingRefuelLogs
                truckingRefuelLogs={data as TruckingRefuelLogData}
                edit={edit}
                manager={manager}
                onDataChange={
                  getTypedOnDataChange<TruckingRefuelLogData>(onDataChange)!
                }
                focusIds={focusIds}
                setFocusIds={setFocusIds}
                isReviewYourTeam={isReviewYourTeam}
              />
            );
          }
        }

        // Regular format from EditTeamTimeSheet
        return (
          <TimeCardTruckingRefuelLogs
            truckingRefuelLogs={data as TruckingRefuelLogData}
            edit={edit}
            manager={manager}
            onDataChange={
              getTypedOnDataChange<TruckingRefuelLogData>(onDataChange)!
            }
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
          />
        );
      }
      case "truckingStateLogs": {
        // Handle review mode data conversion
        if (isReviewYourTeam && Array.isArray(data)) {
          // Type guard for direct API format with TruckingLogs
          const hasDirectTruckingLogs = (
            item: unknown,
          ): item is { TruckingLogs: unknown[] } => {
            return (
              !!item &&
              typeof item === "object" &&
              "TruckingLogs" in item &&
              Array.isArray((item as { TruckingLogs: unknown[] }).TruckingLogs)
            );
          };

          if (data.length > 0 && hasDirectTruckingLogs(data[0])) {
            // Data is already in the expected format
            return (
              <TimeCardTruckingStateMileageLogs
                truckingStateLogs={data as TruckingStateLogData}
                edit={edit}
                manager={manager}
                onDataChange={
                  getTypedOnDataChange<TruckingStateLogData>(onDataChange)!
                }
                focusIds={focusIds}
                setFocusIds={setFocusIds}
                isReviewYourTeam={isReviewYourTeam}
              />
            );
          }
        }

        // Regular format from EditTeamTimeSheet
        return (
          <TimeCardTruckingStateMileageLogs
            truckingStateLogs={data as TruckingStateLogData}
            edit={edit}
            manager={manager}
            onDataChange={
              getTypedOnDataChange<TruckingStateLogData>(onDataChange)!
            }
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
          />
        );
      }
      case "tascoHaulLogs": {
        // Handle review mode data conversion
        if (isReviewYourTeam && Array.isArray(data)) {
          // NEW FIX: Handle direct API format from useTimesheetData with pendingOnly=true
          // This format is [{TascoLogs:[...]}] instead of [{id:string, TascoLogs:[...]}]

          // Type guard for ReviewYourTeam format (directly from API)
          const hasDirectTascoLogs = (
            item: unknown,
          ): item is { TascoLogs: unknown[] } => {
            return (
              !!item &&
              typeof item === "object" &&
              "TascoLogs" in item &&
              Array.isArray((item as { TascoLogs: unknown[] }).TascoLogs)
            );
          };

          let formattedData: TascoHaulLogData;

          // NEW LOGIC: Check if data is already in the [{TascoLogs:[...]}] format
          if (data.length > 0 && hasDirectTascoLogs(data[0])) {
            // Already in correct format, use as is
            formattedData = data as TascoHaulLogData;
          } else {
            // Original logic for EditTeamTimesheet format
            interface ReviewTascoLog {
              id: string;
              timeSheetId: string;
              shiftType: string;
              equipmentId: string;
              laborType: string;
              materialType: string;
              LoadQuantity: number;
              Equipment?: {
                id: string;
                name: string;
              };
            }

            interface ReviewTimesheet {
              id: string;
              TascoLogs?: ReviewTascoLog[];
            }

            // Type guard for EditTeamTimeSheet format
            const hasTascoLogs = (
              item: unknown,
            ): item is ReviewTimesheet & { TascoLogs: ReviewTascoLog[] } => {
              return (
                !!item &&
                typeof item === "object" &&
                "id" in item &&
                "TascoLogs" in item &&
                Array.isArray((item as ReviewTimesheet).TascoLogs) &&
                (item as ReviewTimesheet).TascoLogs!.length > 0
              );
            };

            // Convert data with proper type checking
            const validTimesheets = (data as unknown[]).filter(hasTascoLogs);

            formattedData = [
              {
                TascoLogs: validTimesheets.flatMap((ts) =>
                  ts.TascoLogs.map((tl) => ({
                    id: tl.id,
                    timeSheetId: tl.timeSheetId,
                    shiftType: tl.shiftType || "ABCD Shift",
                    equipmentId: tl.equipmentId,
                    laborType: tl.laborType || "",
                    materialType: tl.materialType || "",
                    LoadQuantity: tl.LoadQuantity || 0,
                    Equipment: tl.Equipment || null,
                  })),
                ),
              },
            ];
          }

          return (
            <TimeCardTascoHaulLogs
              tascoHaulLogs={formattedData}
              edit={edit}
              manager={manager}
              onDataChange={
                getTypedOnDataChange<TascoHaulLogData>(onDataChange)!
              }
              focusIds={focusIds}
              setFocusIds={setFocusIds}
              isReviewYourTeam={isReviewYourTeam}
            />
          );
        }

        // Regular format from EditTeamTimeSheet
        return (
          <TimeCardTascoHaulLogs
            tascoHaulLogs={data as TascoHaulLogData}
            edit={edit}
            manager={manager}
            onDataChange={getTypedOnDataChange<TascoHaulLogData>(onDataChange)!}
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
          />
        );
      }
      case "tascoRefuelLogs": {
        // Handle review mode data conversion
        if (isReviewYourTeam && Array.isArray(data)) {
          // NEW FIX: Handle direct API format from useTimesheetData with pendingOnly=true
          // This format is [{TascoLogs:[...]}] instead of [{id:string, TascoLogs:[...]}]

          // Type guard for ReviewYourTeam format (directly from API)
          const hasDirectTascoLogs = (
            item: unknown,
          ): item is { TascoLogs: unknown[] } => {
            return (
              !!item &&
              typeof item === "object" &&
              "TascoLogs" in item &&
              Array.isArray((item as { TascoLogs: unknown[] }).TascoLogs)
            );
          };

          let formattedData: TascoRefuelLogData;
          // Check if data is already in [{TascoLogs:[...]}] format
          if (data.length > 0 && hasDirectTascoLogs(data[0])) {
            // Original API data can be used directly after filtering for refuel logs
            formattedData = [
              {
                TascoLogs: (data[0].TascoLogs || [])
                  .filter(
                    (log: unknown): log is TascoLog =>
                      !!log &&
                      typeof log === "object" &&
                      Array.isArray((log as TascoLog).RefuelLogs) &&
                      (log as TascoLog).RefuelLogs!.length > 0,
                  )
                  .map((tl) => {
                    const tascoLog = tl as TascoLog;
                    return {
                      id: tascoLog.id,
                      Equipment: tascoLog.Equipment ?? null,
                      RefuelLogs: (tascoLog.RefuelLogs || []).map(
                        (refuel: unknown) => {
                          const refuelLog = refuel as RefuelLog;
                          return {
                            id: refuelLog.id,
                            tascoLogId: refuelLog.tascoLogId || tascoLog.id,
                            gallonsRefueled: refuelLog.gallonsRefueled || 0,
                          };
                        },
                      ),
                    };
                  }),
              },
            ];
          } else {
            // Original logic for EditTeamTimesheet format
            interface ReviewRefuelLog {
              id: string;
              gallonsRefueled: number;
              tascoLogId: string;
            }

            interface ReviewTascoLog {
              id: string;
              Equipment: {
                id: string;
                name: string;
              } | null;
              RefuelLogs: ReviewRefuelLog[];
            }

            interface ReviewTimesheet {
              id: string;
              TascoLogs?: ReviewTascoLog[];
            }

            // Type guard to check if object has TascoLogs with RefuelLogs
            const hasTascoRefuelLogs = (
              item: unknown,
            ): item is ReviewTimesheet & { TascoLogs: ReviewTascoLog[] } => {
              return (
                !!item &&
                typeof item === "object" &&
                "id" in item &&
                "TascoLogs" in item &&
                Array.isArray((item as ReviewTimesheet).TascoLogs) &&
                (item as ReviewTimesheet).TascoLogs!.length > 0 &&
                (item as ReviewTimesheet).TascoLogs!.some(
                  (log: ReviewTascoLog) =>
                    !!log &&
                    Array.isArray(log.RefuelLogs) &&
                    log.RefuelLogs.length > 0,
                )
              );
            };

            // Convert data with proper type checking
            const validTimesheets = (data as unknown[]).filter(
              hasTascoRefuelLogs,
            );
            formattedData = [
              {
                TascoLogs: validTimesheets.flatMap((ts) =>
                  ts.TascoLogs.filter(
                    (tl) => tl.RefuelLogs && tl.RefuelLogs.length > 0,
                  ).map((tl) => ({
                    id: tl.id,
                    Equipment: tl.Equipment,
                    RefuelLogs: tl.RefuelLogs.map((refuel) => ({
                      id: refuel.id,
                      tascoLogId: refuel.tascoLogId || tl.id,
                      gallonsRefueled: refuel.gallonsRefueled || 0,
                    })),
                  })),
                ),
              },
            ];
          }

          return (
            <TimeCardTascoRefuelLogs
              tascoRefuelLog={formattedData}
              edit={edit}
              manager={manager}
              onDataChange={
                getTypedOnDataChange<TascoRefuelLogData>(onDataChange)!
              }
              focusIds={focusIds}
              setFocusIds={setFocusIds}
              isReviewYourTeam={isReviewYourTeam}
            />
          );
        }

        // Regular format from EditTeamTimeSheet
        return (
          <TimeCardTascoRefuelLogs
            tascoRefuelLog={data as TascoRefuelLogData}
            edit={edit}
            manager={manager}
            onDataChange={
              getTypedOnDataChange<TascoRefuelLogData>(onDataChange)!
            }
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
          />
        );
      }
      case "equipmentLogs": {
        // Handle review mode data conversion
        if (isReviewYourTeam && Array.isArray(data)) {
          // Type guard for direct API format with EmployeeEquipmentLogs
          const hasDirectEmployeeEquipmentLogs = (
            item: unknown,
          ): item is { EmployeeEquipmentLogs: unknown[] } => {
            return (
              !!item &&
              typeof item === "object" &&
              "EmployeeEquipmentLogs" in item &&
              Array.isArray(
                (item as { EmployeeEquipmentLogs: unknown[] })
                  .EmployeeEquipmentLogs,
              )
            );
          };

          let formattedData: EquipmentLogsData;

          // Check if data is already in [{EmployeeEquipmentLogs:[...]}] format from API
          if (data.length > 0 && hasDirectEmployeeEquipmentLogs(data[0])) {
            formattedData = data as EquipmentLogsData;
          } else {
            // Original logic for EditTeamTimesheet format
            interface ReviewEquipmentLog {
              id: string;
              Equipment: EquipmentData;
              startTime: string;
              endTime: string;
              Jobsite: JobsiteData;
              employeeId: string; // Required field for EmployeeEquipmentLogData
            }

            interface ReviewTimesheet {
              id: string;
              EmployeeEquipmentLogs?: ReviewEquipmentLog[];
            }

            // Build formatted data from timesheet objects
            formattedData = [
              {
                EmployeeEquipmentLogs: (data as ReviewTimesheet[])
                  .filter(
                    (
                      ts,
                    ): ts is ReviewTimesheet & {
                      EmployeeEquipmentLogs: ReviewEquipmentLog[];
                    } =>
                      ts.EmployeeEquipmentLogs != null &&
                      ts.EmployeeEquipmentLogs.length > 0,
                  )
                  .flatMap((ts) => ts.EmployeeEquipmentLogs)
                  .map((log) => ({
                    id: log.id,
                    Equipment: log.Equipment,
                    startTime: log.startTime,
                    endTime: log.endTime,
                    Jobsite: log.Jobsite,
                    employeeId: log.employeeId,
                  })),
              },
            ];
          }

          return (
            <TimeCardEquipmentLogs
              ref={equipmentLogsRef}
              equipmentLogs={formattedData}
              edit={edit}
              manager={manager}
              onDataChange={
                getTypedOnDataChange<EquipmentLogUpdate[]>(onDataChange)!
              }
              focusIds={focusIds}
              setFocusIds={setFocusIds}
              isReviewYourTeam={isReviewYourTeam}
            />
          );
        }

        // Regular format from EditTeamTimeSheet
        return (
          <TimeCardEquipmentLogs
            ref={equipmentLogsRef}
            equipmentLogs={data as EquipmentLogsData}
            edit={edit}
            manager={manager}
            onDataChange={
              getTypedOnDataChange<EquipmentLogUpdate[]>(onDataChange)!
            }
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
          />
        );
      }
      case "equipmentRefuelLogs": {
        // Type guard to check if an array is EquipmentRefuelLog[]
        const isEquipmentRefuelLogArray = (
          arr: unknown[],
        ): arr is EquipmentRefuelLog[] => {
          return (
            arr.length > 0 &&
            arr[0] !== null &&
            typeof arr[0] === "object" &&
            "equipmentId" in arr[0] &&
            "equipmentName" in arr[0] &&
            "gallonsRefueled" in arr[0] &&
            "employeeEquipmentLogId" in arr[0]
          );
        };

        // Type guard for the specific API format with EmployeeEquipmentLogs
        const hasEmployeeEquipmentLogs = (
          item: unknown,
        ): item is { EmployeeEquipmentLogs: unknown[] } => {
          return (
            !!item &&
            typeof item === "object" &&
            "EmployeeEquipmentLogs" in item &&
            Array.isArray(
              (item as { EmployeeEquipmentLogs: unknown[] })
                .EmployeeEquipmentLogs,
            )
          );
        };

        let logs: EquipmentRefuelLog[] = [];

        if (Array.isArray(data)) {
          if (isEquipmentRefuelLogArray(data)) {
            logs = data;
          } else if (data.length > 0 && hasEmployeeEquipmentLogs(data[0])) {
            // Handle the specific API format: [{ EmployeeEquipmentLogs: [...] }]
            logs = data.flatMap((item) => {
              const equipmentLogsContainer = item as {
                EmployeeEquipmentLogs: unknown[];
              };
              return equipmentLogsContainer.EmployeeEquipmentLogs.map(
                (equipmentLog: unknown) => {
                  const log = equipmentLog as {
                    id: string;
                    equipmentId: string;
                    RefuelLog?: {
                      id: string;
                      gallonsRefueled: number | null;
                    };
                    Equipment?: {
                      id: string;
                      name: string;
                    };
                  };

                  const equipmentId =
                    log.Equipment?.id || log.equipmentId || "";
                  const equipmentName = log.Equipment?.name || "";

                  if (log.RefuelLog) {
                    return {
                      id: log.RefuelLog.id,
                      equipmentId,
                      equipmentName,
                      gallonsRefueled: log.RefuelLog.gallonsRefueled ?? null,
                      employeeEquipmentLogId: log.id,
                    };
                  } else {
                    return {
                      id: "",
                      equipmentId,
                      equipmentName,
                      gallonsRefueled: null,
                      employeeEquipmentLogId: log.id,
                    };
                  }
                },
              );
            });
          } else {
            // Handle other array formats (existing logic)
            logs = (data as unknown[]).flatMap((log) => {
              const equipmentLog = log as EquipmentLog;
              const equipmentId =
                equipmentLog.Equipment?.id || equipmentLog.equipmentId || "";
              const equipmentName =
                equipmentLog.Equipment?.name ||
                equipmentLog.equipmentName ||
                "";
              if (equipmentLog && Array.isArray(equipmentLog.RefuelLogs)) {
                return equipmentLog.RefuelLogs.map((refuel: unknown) => {
                  const refuelLog = refuel as RefuelLog;
                  return {
                    id: refuelLog.id,
                    equipmentId,
                    equipmentName,
                    gallonsRefueled: refuelLog.gallonsRefueled ?? null,
                    employeeEquipmentLogId: equipmentLog.id,
                  };
                });
              } else if (
                equipmentLog &&
                equipmentLog.RefuelLogs &&
                !Array.isArray(equipmentLog.RefuelLogs) &&
                typeof equipmentLog.RefuelLogs === "object"
              ) {
                const refuel = equipmentLog.RefuelLogs as RefuelLog;
                return [
                  {
                    id: refuel.id,
                    equipmentId,
                    equipmentName,
                    gallonsRefueled: refuel.gallonsRefueled ?? null,
                    employeeEquipmentLogId: equipmentLog.id,
                  },
                ];
              } else {
                return [
                  {
                    id: "",
                    equipmentId,
                    equipmentName,
                    gallonsRefueled: null,
                    employeeEquipmentLogId: equipmentLog.id,
                  },
                ];
              }
            });
          }
        } else if (data && typeof data === "object") {
          const log = data as unknown;
          if (log && Array.isArray((log as EquipmentLog).RefuelLogs)) {
            logs = ((log as EquipmentLog).RefuelLogs ?? []).map(
              (refuel: unknown) => {
                const refuelLog = refuel as RefuelLog;
                return {
                  id: refuelLog.id,
                  equipmentId:
                    refuelLog.equipmentId ||
                    (log as EquipmentLog).equipmentId ||
                    "",
                  equipmentName:
                    refuelLog.equipmentName ||
                    (log as EquipmentLog).equipmentName ||
                    "",
                  gallonsRefueled: refuelLog.gallonsRefueled ?? null,
                  employeeEquipmentLogId: (log as EquipmentLog).id,
                };
              },
            );
          } else if (
            log &&
            (log as EquipmentLog).RefuelLogs &&
            !Array.isArray((log as EquipmentLog).RefuelLogs) &&
            typeof (log as EquipmentLog).RefuelLogs === "object"
          ) {
            const refuelObj = (log as EquipmentLog).RefuelLogs;
            // Defensive: Only treat as RefuelLog if it has an id property
            if (
              refuelObj &&
              typeof refuelObj === "object" &&
              "id" in refuelObj
            ) {
              const refuel = refuelObj as RefuelLog;
              logs = [
                {
                  id: refuel.id,
                  equipmentId:
                    refuel.equipmentId ||
                    (log as EquipmentLog).equipmentId ||
                    "",
                  equipmentName:
                    refuel.equipmentName ||
                    (log as EquipmentLog).equipmentName ||
                    "",
                  gallonsRefueled: refuel.gallonsRefueled ?? null,
                  employeeEquipmentLogId: (log as EquipmentLog).id,
                },
              ];
            } else {
              logs = [];
            }
          } else {
            logs = [
              {
                id: "",
                equipmentId: (log as EquipmentLog).equipmentId || "",
                equipmentName: (log as EquipmentLog).equipmentName || "",
                gallonsRefueled: null,
                employeeEquipmentLogId: (log as EquipmentLog).id,
              },
            ];
          }
        }

        return (
          <TimeCardEquipmentRefuelLogs
            edit={edit}
            manager={manager}
            equipmentRefuelLogs={logs}
            onDataChange={
              getTypedOnDataChange<EquipmentRefuelLog[]>(onDataChange)!
            }
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
          />
        );
      }
      // case "timesheetHighlights":
      //   return (
      //     <TimeCardHighlights
      //       highlightTimesheet={(data as TimesheetHighlights[]).map((item) => ({
      //         ...item,
      //         startTime: renderValueOrNA(item.startTime),
      //         endTime: renderValueOrNA(item.endTime),
      //         costcode: renderValueOrNA(item.costcode),
      //         Jobsite: {
      //           ...item.Jobsite,
      //           name: renderValueOrNA(item.Jobsite?.name),
      //         },
      //       }))}
      //       edit={edit}
      //       manager={manager}
      //       onDataChange={
      //         getTypedOnDataChange<TimesheetHighlights[]>(onDataChange)!
      //       }
      //       date={date}
      //       focusIds={focusIds}
      //       setFocusIds={setFocusIds}
      //       isReviewYourTeam={isReviewYourTeam}
      //     />
      //   );
      case "mechanicLogs":
        return (
          <TimeCardMechanicLogs
            maintenanceLogs={data as MaintenanceLogData}
            edit={edit}
            manager={manager}
            onDataChange={
              getTypedOnDataChange<MaintenanceLogData>(onDataChange)!
            }
            focusIds={focusIds}
            setFocusIds={setFocusIds}
            isReviewYourTeam={isReviewYourTeam}
            allEquipment={allEquipment}
          />
        );
      default:
        return null;
    }
  };
  return (
    <Holds
      className={`${
        isReviewYourTeam ? "bg-orange-200" : "row-start-2 row-end-7"
      } h-full w-full overflow-y-auto no-scrollbar`}
      background={isReviewYourTeam ? null : "white"}
    >
      {renderContent()}
    </Holds>
  );
}

// --- Define local interfaces for type safety ---
interface RefuelLog {
  id: string;
  tascoLogId?: string;
  gallonsRefueled?: number;
  equipmentId?: string;
  equipmentName?: string;
}
interface TascoLog {
  id: string;
  Equipment?: { id: string; name: string } | null;
  RefuelLogs?: RefuelLog[];
}
interface EquipmentLog {
  id: string;
  Equipment?: { id: string; name: string } | null;
  equipmentId?: string;
  equipmentName?: string;
  RefuelLogs?: RefuelLog[];
}
