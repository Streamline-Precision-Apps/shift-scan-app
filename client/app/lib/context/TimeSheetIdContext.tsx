"use client";
import { getCookies, setPrevTimeSheet } from "@/app/lib/actions/cookieActions";
import { apiRequest, getUserId } from "@/app/lib/utils/api-Utils";

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
      const userId = getUserId();
      if (!userId) {
        setTimeSheetData(null);
        return;
      }
      const response = await apiRequest(
        `/api/v1/timesheet/user/${userId}/recent`,
        "GET"
      );
      if (response && response.success && response.data && response.data.id) {
        setTimeSheetData(response.data);
      } else {
        setTimeSheetData(null);
      }
    } catch (error) {
      console.error("Error fetching recent timesheet:", error);
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
