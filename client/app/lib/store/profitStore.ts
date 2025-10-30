import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProfitJobsite = {
  id: string;
  code?: string;
  qrId: string;
  name: string;
  status?: string;
  approvalStatus?: string;
  archiveDate?: string | null;
};

interface ProfitStoreState {
  jobsites: ProfitJobsite[];
  setJobsites: (jobsites: ProfitJobsite[]) => void;
  addJobsite: (jobsite: ProfitJobsite) => void;
  clearJobsites: () => void;
}

// Helper function to sanitize jobsite data
const sanitizeJobsites = (jobsites: any[]): ProfitJobsite[] => {
  if (!Array.isArray(jobsites)) return [];
  return jobsites.map((site) => ({
    id: site.id,
    code: site.code,
    qrId: site.qrId,
    name: site.name,
    status: site.status,
    approvalStatus: site.approvalStatus,
    archiveDate: site.archiveDate,
  }));
};

export const useProfitStore = create<ProfitStoreState>()(
  persist(
    (set) => ({
      jobsites: [],
      setJobsites: (jobsites) => set({ jobsites: sanitizeJobsites(jobsites) }),
      addJobsite: (jobsite) =>
        set((state) => ({ jobsites: [...state.jobsites, jobsite] })),
      clearJobsites: () => set({ jobsites: [] }),
    }),
    {
      name: "profit-store",
      partialize: (state: ProfitStoreState): ProfitStoreState => ({
        jobsites: state.jobsites,
        addJobsite: () => {},
        setJobsites: () => {},
        clearJobsites: () => {},
      }),
    }
  )
);
