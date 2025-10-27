import { TimesheetData } from "./useTimesheetData";

export interface ChangeRecord {
  changes: Record<string, { old: unknown; new: unknown }>;
  wasStatusChanged: boolean;
  numberOfChanges: number;
}

/**
 * Custom hook to detect and track changes between original and updated timesheet data
 * Provides detailed information about what changed, including nested values in logs
 */
export function useTimesheetChanges() {
  /**
   * Detects changes between original and updated timesheet data
   * @param originalForm Original timesheet data
   * @param form Updated timesheet data
   * @returns Object containing changes record, status change flag, and change count
   */
  const detectChanges = (
    originalForm: TimesheetData,
    form: TimesheetData,
  ): ChangeRecord => {
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    let wasStatusChanged = false;
    let numberOfChanges = 0;

    // Check for changes in basic timesheet fields
    if (JSON.stringify(form.date) !== JSON.stringify(originalForm.date)) {
      changes["date"] = {
        old: originalForm.date,
        new: form.date,
      };
      numberOfChanges++;
    }

    if (form.startTime !== originalForm.startTime) {
      changes["startTime"] = {
        old: originalForm.startTime,
        new: form.startTime,
      };
      numberOfChanges++;
    }

    if (form.endTime !== originalForm.endTime) {
      changes["endTime"] = {
        old: originalForm.endTime,
        new: form.endTime,
      };
      numberOfChanges++;
    }

    if (form.workType !== originalForm.workType) {
      changes["workType"] = {
        old: originalForm.workType,
        new: form.workType,
      };
      numberOfChanges++;
    }

    if (form.status !== originalForm.status) {
      changes["status"] = {
        old: originalForm.status,
        new: form.status,
      };
      wasStatusChanged = true;
      numberOfChanges++;
    }

    if (form.Jobsite?.id !== originalForm.Jobsite?.id) {
      changes["Jobsite"] = {
        old: originalForm.Jobsite?.name,
        new: form.Jobsite?.name,
      };
      numberOfChanges++;
    }

    if (form.CostCode?.name !== originalForm.CostCode?.name) {
      changes["CostCode"] = {
        old: originalForm.CostCode?.name,
        new: form.CostCode?.name,
      };
      numberOfChanges++;
    }

    return {
      changes,
      wasStatusChanged,
      numberOfChanges,
    };
  };

  return {
    detectChanges,
  };
}
