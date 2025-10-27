import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CCTag = {
  id: string;
  name: string;
  description?: string;
};

export type CostCode = {
  id: string;
  name: string;
  isActive: boolean;
  code?: string | null;
  ccTags: CCTag[];
  jobsites: { id: string; name: string }[];
};

interface CostCodeStoreState {
  costCodes: CostCode[];
  setCostCodes: (costCodes: CostCode[]) => void;
  addCostCode: (costCode: CostCode) => void;
  clearCostCodes: () => void;
}

export const useCostCodeStore = create<CostCodeStoreState>()(
  persist(
    (set) => ({
      costCodes: [],
      setCostCodes: (costCodes) => set({ costCodes }),
      addCostCode: (costCode) =>
        set((state) => ({ costCodes: [...state.costCodes, costCode] })),
      clearCostCodes: () => set({ costCodes: [] }),
    }),
    { name: "cost-code-store" }
  )
);
