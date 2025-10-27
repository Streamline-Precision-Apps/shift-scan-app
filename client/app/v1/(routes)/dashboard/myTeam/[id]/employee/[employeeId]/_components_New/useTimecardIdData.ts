import { updateTimesheetServerAction } from "@/actions/updateTimesheetServerAction";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";

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
  const [original, setOriginal] = useState<Timesheet | null>(null);
  const [edited, setEdited] = useState<Timesheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [costCodes, setCostCodes] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [jobSites, setJobSites] = useState<{ id: string; name: string }[]>([]);
  const { data: session } = useSession();
  const editorId = session?.user?.id;
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
    [],
  );

  // Fetch timesheet data and jobsites by timesheetId
  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch timesheet
        const res = await fetch(`/api/getTimesheetDetailsManager/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        if (!isMounted) return;

        // Ensure that dates are properly formatted as Date objects
        if (data.timesheet) {
          // Convert string dates to Date objects if needed
          if (
            data.timesheet.startTime &&
            typeof data.timesheet.startTime === "string"
          ) {
            data.timesheet.startTime = new Date(data.timesheet.startTime);
          }

          if (
            data.timesheet.endTime &&
            typeof data.timesheet.endTime === "string"
          ) {
            data.timesheet.endTime = new Date(data.timesheet.endTime);
          }
        }

        setOriginal(data.timesheet ?? null);
        setEdited(data.timesheet ?? null);

        // Fetch jobsites for this timesheetId
        const jobsitesRes = await fetch(`/api/getJobsiteSummary`);
        if (jobsitesRes.ok) {
          const jobsites = await jobsitesRes.json();
          setJobSites(jobsites);
        } else {
          setJobSites([]);
        }
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
  }, [id]);

  // Fetch cost codes when Jobsite changes
  useEffect(() => {
    async function fetchCostCodes() {
      const jobsiteId = edited?.Jobsite?.id;
      if (!jobsiteId) {
        setCostCodes([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/getAllCostCodesByJobSites?jobsiteId=${jobsiteId}`,
        );
        if (!res.ok) {
          setCostCodes([]);
          return;
        }
        const codes = await res.json();
        setCostCodes(codes);
      } catch {
        setCostCodes([]);
      }
    }
    fetchCostCodes();
  }, [edited?.Jobsite?.id]);

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
      const formData = new FormData();
      formData.append("id", id);

      if (!editorId) {
        throw new Error("No user detected");
      }
      formData.append("editorId", editorId);

      if (!changeReason) {
        throw new Error("Change reason is required");
      }
      formData.append("changeReason", changeReason);

      // Only include fields that have values
      if (edited.startTime) {
        const startTimeStr =
          typeof edited.startTime === "string"
            ? edited.startTime
            : edited.startTime.toISOString();
        formData.append("startTime", startTimeStr);
      }

      if (edited.endTime) {
        const endTimeStr =
          typeof edited.endTime === "string"
            ? edited.endTime
            : edited.endTime.toISOString();
        formData.append("endTime", endTimeStr);
      }

      if (edited.Jobsite) {
        formData.append("Jobsite", edited.Jobsite.id);
      }

      if (edited.CostCode) {
        formData.append("CostCode", edited.CostCode.name);
      }

      if (edited.comment !== null) {
        formData.append("comment", edited.comment);
      }

      // Add changes object for logging
      const { changes, numberOfChanges } = getChanges();
      formData.append("changes", JSON.stringify(changes));
      formData.append("numberOfChanges", numberOfChanges.toString());

      const result = await updateTimesheetServerAction(formData);

      // Update the original record with the saved changes
      if (result?.success) {
        setOriginal(edited);

        const response = await fetch("/api/notifications/send-multicast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: "timecards-changes",
            title: "Timecard Modified ",
            message: `${result.editorFullName} made ${numberOfChanges} changes to ${result.userFullname}'s timesheet #${id}.`,
            link: `/admins/timesheets?id=${id}`,
            referenceId: id,
          }),
        });
        await response.json();
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
