import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Equipment = {
  id: string;
  name: string;
  qrId: string;
  status: string;
  equipmentTag: string;
  code?: string;
  approvalStatus?: string;
};

interface EquipmentStoreState {
  equipments: Equipment[];
  setEquipments: (equipments: Equipment[]) => void;
  addEquipment: (equipment: Equipment) => void;
  clearEquipments: () => void;
}

// Helper function to sanitize equipment data
const sanitizeEquipments = (equipments: any[]): Equipment[] => {
  if (!Array.isArray(equipments)) return [];
  return equipments.map((eq) => ({
    id: eq.id,
    name: eq.name,
    qrId: eq.qrId,
    status: eq.status,
    equipmentTag: eq.equipmentTag,
    code: eq.code,
    approvalStatus: eq.approvalStatus,
  }));
};

export const useEquipmentStore = create<EquipmentStoreState>()(
  persist(
    (set) => ({
      equipments: [],
      setEquipments: (equipments) =>
        set({ equipments: sanitizeEquipments(equipments) }),
      addEquipment: (equipment) =>
        set((state) => ({ equipments: [...state.equipments, equipment] })),
      clearEquipments: () => set({ equipments: [] }),
    }),
    {
      name: "equipment-store",
      partialize: (state) => ({
        equipments: state.equipments,
        addEquipment: () => {},
        setEquipments: () => {},
        clearEquipments: () => {},
      }),
    }
  )
);
