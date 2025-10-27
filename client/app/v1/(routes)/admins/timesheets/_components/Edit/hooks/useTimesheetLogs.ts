/**
 * Custom hook for handling add, remove, update, and undo logic for all timesheet log types and nested logs.
 * Keeps all log manipulation logic out of the main modal/component for maintainability.
 *
 * @module hooks/useTimesheetLogs
 */
import { useCallback } from "react";
import {
  TimesheetData,
  TruckingLog,
  TascoLog,
  EmployeeEquipmentLog,
  TruckingNestedType,
  TascoNestedType,
  TruckingNestedTypeMap,
  TascoNestedTypeMap,
} from "../types";
import { MechanicProject } from "../EditMechanicProjects";

export function useTimesheetLogs(
  form: TimesheetData | null,
  setForm: (
    updater: (prev: TimesheetData | null) => TimesheetData | null,
  ) => void,
  originalForm?: TimesheetData | null,
) {
  // General field change handler
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value } = e.target;
      setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    },
    [setForm],
  );

  // Log field change handler (for nested logs)
  const handleLogChange = useCallback(
    <T extends object>(
      logType: keyof TimesheetData,
      logIndex: number,
      field: keyof T,
      value: string | number | null | { id: string; name: string },
    ) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              [logType]: (prev[logType] as T[]).map((log, idx) =>
                idx === logIndex ? { ...log, [field]: value } : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );

  // Nested array change handler (e.g., Materials in TruckingLogs)
  const handleNestedLogChange = useCallback(
    <T extends TruckingNestedType>(
      logType: keyof TimesheetData,
      logIndex: number,
      nestedType: T,
      nestedIndex: number,
      field: keyof TruckingNestedTypeMap[T],
      value: string | number | null,
    ) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              [logType]: (prev[logType] as TruckingLog[]).map((log, idx) =>
                idx === logIndex
                  ? {
                      ...log,
                      [nestedType]: (
                        log[nestedType] as TruckingNestedTypeMap[T][]
                      ).map((item, nidx) =>
                        nidx === nestedIndex
                          ? { ...item, [field]: value }
                          : item,
                      ),
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );

  // Add/Remove handlers for each log type
  const addMechanicProject = useCallback(() => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            Maintenance: [
              ...prev.Maintenance,
              {
                id: -Date.now(), // Temporary negative ID to distinguish from existing records
                timeSheetId: prev.id, // Add required timeSheetId
                equipmentId: "",
                hours: null,
                description: null,
              },
            ],
          }
        : prev,
    );
  }, [setForm]);

  const removeMechanicProject = useCallback(
    (idx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              Maintenance: prev.Maintenance.filter((_, i) => i !== idx),
            }
          : prev,
      );
    },
    [setForm],
  );

  // Trucking log handlers
  const addEquipmentHauled = useCallback(
    (logIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      EquipmentHauled: [
                        ...log.EquipmentHauled,
                        {
                          id: Date.now().toString(),
                          equipmentId: "",
                          source: "",
                          destination: "",
                          startMileage: "",
                          endMileage: "",
                        },
                      ],
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  const deleteEquipmentHauled = useCallback(
    (logIdx: number, eqIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      EquipmentHauled: log.EquipmentHauled.filter(
                        (_, i) => i !== eqIdx,
                      ),
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  const addMaterial = useCallback(
    (logIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      Materials: [
                        ...log.Materials,
                        {
                          id: Date.now().toString(),
                          LocationOfMaterial: "",
                          name: "",
                          quantity: "",
                          unit: "",
                          loadType: "",
                        },
                      ],
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  const deleteMaterial = useCallback(
    (logIdx: number, matIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      Materials: log.Materials.filter((_, i) => i !== matIdx),
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  const addRefuelLog = useCallback(
    (logIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      RefuelLogs: [
                        ...log.RefuelLogs,
                        {
                          id: Date.now().toString(),
                          gallonsRefueled: 0,
                          milesAtFueling: 0,
                        },
                      ],
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  const deleteRefuelLog = useCallback(
    (logIdx: number, refIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      RefuelLogs: log.RefuelLogs.filter((_, i) => i !== refIdx),
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  const addStateMileage = useCallback(
    (logIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      StateMileages: [
                        ...log.StateMileages,
                        {
                          id: Date.now().toString(),
                          state: "",
                          stateLineMileage: 0,
                        },
                      ],
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  const deleteStateMileage = useCallback(
    (logIdx: number, smIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      StateMileages: log.StateMileages.filter(
                        (_, i) => i !== smIdx,
                      ),
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );

  // Tasco log handlers
  const addTascoLog = useCallback(() => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            TascoLogs: [
              ...prev.TascoLogs,
              {
                id: Date.now().toString(),
                shiftType: "",
                laborType: "",
                materialType: "",
                LoadQuantity: 0,
                RefuelLogs: [],
                Equipment: null,
              },
            ],
          }
        : prev,
    );
  }, [setForm]);
  const removeTascoLog = useCallback(
    (idx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TascoLogs: prev.TascoLogs.filter((_, i) => i !== idx),
            }
          : prev,
      );
    },
    [setForm],
  );
  const addTascoRefuelLog = useCallback(
    (logIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TascoLogs: prev.TascoLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      RefuelLogs: [
                        ...log.RefuelLogs,
                        { id: Date.now().toString(), gallonsRefueled: 0 },
                      ],
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  const deleteTascoRefuelLog = useCallback(
    (logIdx: number, refIdx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TascoLogs: prev.TascoLogs.map((log, idx) =>
                idx === logIdx
                  ? {
                      ...log,
                      RefuelLogs: log.RefuelLogs.filter((_, i) => i !== refIdx),
                    }
                  : log,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );
  // Tasco nested log change handler (alias)
  const handleTascoNestedLogChange = handleNestedLogChange;

  // Employee Equipment log handlers
  const addEmployeeEquipmentLog = useCallback(() => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            EmployeeEquipmentLogs: [
              ...prev.EmployeeEquipmentLogs,
              {
                id: Date.now().toString(),
                equipmentId: "",
                startTime: "",
                endTime: "",
                Equipment: null,
              },
            ],
          }
        : prev,
    );
  }, [setForm]);
  const removeEmployeeEquipmentLog = useCallback(
    (idx: number) => {
      setForm((prev) =>
        prev
          ? {
              ...prev,
              EmployeeEquipmentLogs: prev.EmployeeEquipmentLogs.filter(
                (_, i) => i !== idx,
              ),
            }
          : prev,
      );
    },
    [setForm],
  );

  // Undo handler for general fields
  const handleUndoField = useCallback(
    (field: keyof TimesheetData) => {
      if (!originalForm) return;
      setForm((prev) =>
        prev ? { ...prev, [field]: originalForm[field] } : prev,
      );
    },
    [originalForm, setForm],
  );

  // Granular undo for nested TruckingLogs fields
  const handleUndoTruckingNestedField = useCallback(
    <T extends TruckingNestedType, K extends keyof TruckingNestedTypeMap[T]>(
      logIdx: number,
      nestedType: T,
      nestedIdx: number,
      field: K,
    ) => {
      if (!originalForm) return;
      setForm((prev) =>
        prev
          ? {
              ...prev,
              TruckingLogs: prev.TruckingLogs.map((log, i) => {
                if (i !== logIdx) return log;
                const nestedArr = log[nestedType] as TruckingNestedTypeMap[T][];
                const originalArr = originalForm.TruckingLogs[logIdx]?.[
                  nestedType
                ] as TruckingNestedTypeMap[T][];
                if (!Array.isArray(nestedArr) || !Array.isArray(originalArr))
                  return log;
                return {
                  ...log,
                  [nestedType]: nestedArr.map((item, j) =>
                    j === nestedIdx
                      ? { ...item, [field]: originalArr[nestedIdx]?.[field] }
                      : item,
                  ),
                };
              }),
            }
          : prev,
      );
    },
    [originalForm, setForm],
  );

  // Undo handler for a specific TruckingLog field
  const handleUndoTruckingLogField = useCallback(
    (idx: number, field: keyof TruckingLog) => {
      if (!originalForm) return;
      setForm((prev) => {
        if (!prev) return prev;
        const updatedLogs = prev.TruckingLogs.map((log, i) =>
          i === idx
            ? { ...log, [field]: originalForm.TruckingLogs[idx]?.[field] }
            : log,
        );
        return { ...prev, TruckingLogs: updatedLogs };
      });
    },
    [originalForm, setForm],
  );

  // Undo handler for a specific TascoLog field
  const handleUndoTascoLogField = useCallback(
    (idx: number, field: keyof TascoLog) => {
      if (!originalForm) return;
      setForm((prev) => {
        if (!prev) return prev;
        const updatedLogs = prev.TascoLogs.map((log, i) =>
          i === idx
            ? { ...log, [field]: originalForm.TascoLogs[idx]?.[field] }
            : log,
        );
        return { ...prev, TascoLogs: updatedLogs };
      });
    },
    [originalForm, setForm],
  );

  // Undo handler for a specific MechanicProject field
  const handleUndoMechanicProjectField = useCallback(
    (idx: number, field: keyof MechanicProject) => {
      if (!originalForm || !originalForm.Maintenance[idx]) return;

      // Handle special case for Equipment separately
      if (field === "Equipment") {
        // Since Equipment is not a direct field in the database schema
        // We set equipmentId which is the actual field
        setForm((prev) =>
          prev
            ? {
                ...prev,
                Maintenance: prev.Maintenance.map((project, i) =>
                  i === idx
                    ? {
                        ...project,
                        equipmentId: originalForm.Maintenance[idx].equipmentId,
                      }
                    : project,
                ),
              }
            : prev,
        );
        return;
      }

      setForm((prev) =>
        prev
          ? {
              ...prev,
              Maintenance: prev.Maintenance.map((project, i) =>
                i === idx
                  ? {
                      ...project,
                      [field]:
                        originalForm.Maintenance[idx][
                          field as keyof (typeof originalForm.Maintenance)[0]
                        ],
                    }
                  : project,
              ),
            }
          : prev,
      );
    },
    [originalForm, setForm],
  );

  return {
    handleChange,
    handleLogChange,
    handleNestedLogChange,
    addMechanicProject,
    removeMechanicProject,
    handleUndoMechanicProjectField,
    addEquipmentHauled,
    deleteEquipmentHauled,
    addMaterial,
    deleteMaterial,
    addRefuelLog,
    deleteRefuelLog,
    addStateMileage,
    deleteStateMileage,
    addTascoLog,
    removeTascoLog,
    addTascoRefuelLog,
    deleteTascoRefuelLog,
    addEmployeeEquipmentLog,
    removeEmployeeEquipmentLog,
    handleTascoNestedLogChange,
    handleUndoField,
    handleUndoTruckingNestedField,
    handleUndoTruckingLogField,
    handleUndoTascoLogField,
    // ...add other log/nested log handlers as needed
  };
}
