import { apiRequest } from "@/app/lib/utils/api-Utils";
import { useUserStore } from "@/app/lib/store/userStore";
import { useEffect, useState, useCallback, useRef } from "react";
import { sendNotification } from "@/app/lib/actions/generatorActions";
import { useProfitStore } from "@/app/lib/store/profitStore";
import { useCostCodeStore } from "@/app/lib/store/costCodeStore";

export interface Timesheet {
  id: string;
  comment: string | null;
  startTime: Date | string;
  endTime: Date | string | null;
  Jobsite: {
    id: string;
    name: string;
  } | null;
  CostCode: {
    id: string;
    name: string;
  } | null;
}

interface ChangeLogEntry {
  id: string;
  changedBy: string;
  changedAt: string | Date;
  changes: Record<string, { old: unknown; new: unknown }>;
  changeReason?: string;
  User?: {
    firstName: string;
    lastName: string;
  };
}

/**
 * Hook to fetch timesheet data by ID, track changes, and prepare changed fields for submission.
 * @param id Timesheet ID
 */
export function useTimecardIdData(id: string) {
  const { jobsites } = useProfitStore();
  const { costCodes: costCodeList } = useCostCodeStore();

  const [original, setOriginal] = useState<Timesheet | null>(null);
  const [edited, setEdited] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [costCodes, setCostCodes] = useState<{ id: string; name: string }[]>(
    []
  );
  const [jobSites, setJobSites] = useState<{ id: string; name: string }[]>([]);
  const { user } = useUserStore();
  const editorId = user?.id;
  const [changeReason, setChangeReason] = useState<string>("");

  // Use a ref to track if we have an ongoing update
  const isUpdating = useRef(false);

  // Custom setter that prevents excessive updates
  const safeSetEdited = useCallback(
    (updater: React.SetStateAction<Timesheet | null>) => {
      if (isUpdating.current) return;

      isUpdating.current = true;
      setEdited(updater);

      // Reset the flag after a small delay
      setTimeout(() => {
        isUpdating.current = false;
      }, 50);
    },
    []
  );

  // Fetch timesheet data by timesheetId and set jobSites and costCodes from store
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch timesheet using new API route and apiRequest
        const data = await apiRequest(`/api/v1/timesheet/${id}/details`, "GET");
        if (!isMounted) return;
        const timesheet = data?.data ?? null;
        // Convert string dates to Date objects if needed
        if (timesheet) {
          if (timesheet.startTime && typeof timesheet.startTime === "string") {
            timesheet.startTime = new Date(timesheet.startTime);
          }
          if (timesheet.endTime && typeof timesheet.endTime === "string") {
            timesheet.endTime = new Date(timesheet.endTime);
          }
        }
        setOriginal(timesheet);
        setEdited(timesheet);
        // Set jobSites and costCodes from store
        setJobSites(jobsites || []);
        setCostCodes(costCodeList.map(({ id, name }) => ({ id, name })));
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to fetch timesheet");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, jobsites, costCodeList]);

  // Save the entire edited form to the server
  // Compare original and edited, return changes object
  const getChanges = useCallback(() => {
    if (!original || !edited) return { changes: {}, numberOfChanges: 0 };
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    let numberOfChanges = 0;

    if (original.startTime?.toString() !== edited.startTime?.toString()) {
      changes.startTime = { old: original.startTime, new: edited.startTime };
      numberOfChanges++;
    }
    if (original.endTime?.toString() !== edited.endTime?.toString()) {
      changes.endTime = { old: original.endTime, new: edited.endTime };
      numberOfChanges++;
    }
    if (original.Jobsite?.id !== edited.Jobsite?.id) {
      changes.Jobsite = {
        old: original.Jobsite?.name,
        new: edited.Jobsite?.name,
      };
      numberOfChanges++;
    }
    if (original.CostCode?.id !== edited.CostCode?.id) {
      changes.CostCode = {
        old: original.CostCode?.name,
        new: edited.CostCode?.name,
      };
      numberOfChanges++;
    }
    return { changes, numberOfChanges };
  }, [original, edited]);

  const save = useCallback(async () => {
    if (!id || !edited) return;
    try {
      const body: Record<string, string | number> = {};
      const formData = new FormData();
      body.id = id;

      if (!editorId) {
        throw new Error("No user detected");
      }
      body.editorId = editorId;

      if (!changeReason) {
        throw new Error("Change reason is required");
      }
      body.changeReason = changeReason;

      // Only include fields that have values
      if (edited.startTime) {
        const startTimeStr =
          typeof edited.startTime === "string"
            ? edited.startTime
            : edited.startTime.toISOString();
        body.startTime = startTimeStr;
      }

      if (edited.endTime) {
        const endTimeStr =
          typeof edited.endTime === "string"
            ? edited.endTime
            : edited.endTime.toISOString();
        body.endTime = endTimeStr;
      }

      if (edited.Jobsite) {
        body.Jobsite = edited.Jobsite.id;
      }

      if (edited.CostCode) {
        body.CostCode = edited.CostCode.name;
      }

      if (edited.comment !== null) {
        body.comment = edited.comment;
      }

      // Add changes object for logging
      const { changes, numberOfChanges } = getChanges();
      body.changes = JSON.stringify(changes);
      body.numberOfChanges = numberOfChanges;

      const result = await apiRequest(`/api/v1/timesheet/${id}`, "PUT", body);

      // Update the original record with the saved changes
      if (result?.success) {
        setOriginal(edited);
        await sendNotification({
          topic: "timecards-changes",
          title: "Timecard Modified ",
          message: `${result.editorFullName} made ${numberOfChanges} changes to ${result.userFullname}'s timesheet #${id}.`,
          link: `/admins/timesheets?id=${id}`,
          referenceId: id,
        });
      }

      return result;
    } catch (error) {
      console.error("Error saving timesheet:", error);
      return { success: false, error: String(error) };
    }
  }, [id, edited, changeReason, editorId, getChanges]);

  /**
   * Reset the edited state to the original state, discarding unsaved changes.
   */
  const reset = useCallback(() => {
    setEdited(original);
  }, [original]);

  return {
    data: edited,
    setEdited: safeSetEdited, // Use our safer setter
    loading,
    error,
    save,
    costCodes,
    jobSites,
    reset,
    setChangeReason,
  };
}
