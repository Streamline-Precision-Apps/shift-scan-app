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
  ccTags?: CCTag[];
  jobsites?: { id: string; name: string }[];
  CCTags?: { id: string; name: string }[];
};

interface CostCodeStoreState {
  costCodes: CostCode[];
  setCostCodes: (costCodes: CostCode[]) => void;
  addCostCode: (costCode: CostCode) => void;
  clearCostCodes: () => void;
}

// Helper function to sanitize cost code data
const sanitizeCostCodes = (costCodes: any[]): CostCode[] => {
  if (!Array.isArray(costCodes)) return [];
  return costCodes.map((cc) => ({
    id: cc.id,
    name: cc.name,
    isActive: cc.isActive,
    code: cc.code,
    ccTags: cc.ccTags || cc.CCTags || [],
    jobsites: cc.jobsites,
  }));
};

export const useCostCodeStore = create<CostCodeStoreState>()(
  persist<CostCodeStoreState>(
    (set, get) => ({
      costCodes: [],
      setCostCodes: (costCodes) =>
        set({ costCodes: sanitizeCostCodes(costCodes) }),
      addCostCode: (costCode) =>
        set((state) => ({ costCodes: [...state.costCodes, costCode] })),
      clearCostCodes: () => set({ costCodes: [] }),
    }),
    {
      name: "cost-code-store",
      partialize: (state: CostCodeStoreState): CostCodeStoreState => ({
        costCodes: state.costCodes,
        addCostCode: () => {},
        setCostCodes: () => {},
        clearCostCodes: () => {},
      }),
    }
  )
);
