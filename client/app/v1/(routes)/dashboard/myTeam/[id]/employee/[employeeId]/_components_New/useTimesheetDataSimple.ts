import { useState, useEffect, useCallback } from "react";

export interface TimesheetEntry {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  workType: string;
  Jobsite?: { name: string };
  CostCode?: { name: string };
}

export interface TimesheetDataResponse {
  timesheetData: TimesheetEntry[];
}

interface UseTimesheetDataReturn {
  data: TimesheetDataResponse | null;
  setData: (data: TimesheetDataResponse | null) => void;
  loading: boolean;
  error: string | null;
  updateDate: (newDate: string) => void;
  reset: () => Promise<void>;
}

export const useTimesheetDataSimple = (
  employeeId: string | undefined,
  initialDate: string,
): UseTimesheetDataReturn => {
  const [data, setData] = useState<TimesheetDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(initialDate);

  const fetchTimesheets = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/getTimesheetsByDateNew?employeeId=${employeeId}&date=${currentDate}`,
        {
          next: { tags: ["timesheet"] },
        },
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result: TimesheetDataResponse = await res.json();
      setData(result);
    } catch (err) {
      setError(`Failed to fetch timesheets`);
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentDate]);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  const reload = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    fetchTimesheets();
  };

  return {
    data,
    setData,
    loading,
    error,
    updateDate: setCurrentDate,
    reset: reload,
  };
};
