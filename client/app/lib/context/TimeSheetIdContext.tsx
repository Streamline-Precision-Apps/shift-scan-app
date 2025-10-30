"use client";
import { getCookies, setPrevTimeSheet } from "@/app/lib/actions/cookieActions";

import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";

type TimeSheetData = {
  id: number;
};

type TimeSheetDataContextType = {
  savedTimeSheetData: TimeSheetData | null;
  setTimeSheetData: (timesheetData: TimeSheetData | null) => void;
  refetchTimesheet: () => Promise<void>;
};

const TimeSheetDataContext = createContext<
  TimeSheetDataContextType | undefined
>(undefined);

export const TimeSheetDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [savedTimeSheetData, setTimeSheetData] = useState<TimeSheetData | null>(
    null
  );

  // Load from localStorage on mount
  useEffect(() => {
    const loadTimesheetData = async () => {
      const stored = localStorage.getItem("timesheetId");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.id === "number") {
            setTimeSheetData(parsed);
          }
        } catch {}
      } else if (!stored) {
        try {
          const timesheetId = await getCookies({ cookieName: "timeSheetId" });
          if (timesheetId) {
            setTimeSheetData({ id: parseInt(timesheetId, 10) });
          }
        } catch {}
      } else {
        refetchTimesheet();
      }
    };

    loadTimesheetData();
  }, []);

  // Save to localStorage whenever timesheet changes
  useEffect(() => {
    if (savedTimeSheetData) {
      localStorage.setItem("timesheetId", JSON.stringify(savedTimeSheetData));
    } else {
      localStorage.removeItem("timesheetId");
    }
  }, [savedTimeSheetData]);

  // Manual trigger to refetch timesheet data
  const refetchTimesheet = async () => {
    try {
      const prevTimeSheet = await fetch("/api/getRecentTimecard");
      if (!prevTimeSheet.ok) {
        throw new Error(
          `Failed to fetch recent timecard: ${prevTimeSheet.statusText}`
        );
      }

      const data = await prevTimeSheet.json();
      if (data && data.id) {
        setTimeSheetData(data);
      } else {
        setTimeSheetData(null);
      }
    } catch (error) {
      console.error("Error fetching recent timecard:", error);
      setTimeSheetData(null);
    }
  };

  return (
    <TimeSheetDataContext.Provider
      value={{ savedTimeSheetData, setTimeSheetData, refetchTimesheet }}
    >
      {children}
    </TimeSheetDataContext.Provider>
  );
};

export const useTimeSheetData = () => {
  const context = useContext(TimeSheetDataContext);
  if (!context) {
    throw new Error(
      "useTimeSheetData must be used within a TimeSheetDataProvider"
    );
  }
  return context;
};
