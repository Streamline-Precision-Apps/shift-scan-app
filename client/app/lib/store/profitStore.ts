import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProfitJobsite = {
  id: string;
  code: string;
  qrId: string;
  name: string;
};

interface ProfitStoreState {
  jobsites: ProfitJobsite[];
  setJobsites: (jobsites: ProfitJobsite[]) => void;
  addJobsite: (jobsite: ProfitJobsite) => void;
  clearJobsites: () => void;
}

export const useProfitStore = create<ProfitStoreState>()(
  persist(
    (set) => ({
      jobsites: [],
      setJobsites: (jobsites) => set({ jobsites }),
      addJobsite: (jobsite) =>
        set((state) => ({ jobsites: [...state.jobsites, jobsite] })),
      clearJobsites: () => set({ jobsites: [] }),
    }),
    { name: "profit-jobsites-store" }
  )
);
