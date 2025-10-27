"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export type DashboardData = {
  clockedInUsers: number;
  totalPendingTimesheets: number;
  pendingForms: number;
  equipmentAwaitingApproval: number;
  jobsitesAwaitingApproval: number;
};

interface DashboardDataContextType {
  data?: DashboardData;
  refresh: () => Promise<void>;
  loading: boolean;
}

const DashboardDataContext = createContext<
  DashboardDataContextType | undefined
>(undefined);

export const useDashboardData = () => {
  const ctx = useContext(DashboardDataContext);
  if (!ctx)
    throw new Error(
      "useDashboardData must be used within DashboardDataProvider",
    );
  return ctx;
};

export const DashboardDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DashboardData | undefined>();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/getDashboard");
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DashboardDataContext.Provider value={{ data, refresh, loading }}>
      {children}
    </DashboardDataContext.Provider>
  );
};
