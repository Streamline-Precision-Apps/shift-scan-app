import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Equipment = {
  id: string;
  name: string;
  qrId: string;
  status: string;
};

interface EquipmentStoreState {
  equipments: Equipment[];
  setEquipments: (equipments: Equipment[]) => void;
  addEquipment: (equipment: Equipment) => void;
  clearEquipments: () => void;
}

export const useEquipmentStore = create<EquipmentStoreState>()(
  persist(
    (set) => ({
      equipments: [],
      setEquipments: (equipments) => set({ equipments }),
      addEquipment: (equipment) =>
        set((state) => ({ equipments: [...state.equipments, equipment] })),
      clearEquipments: () => set({ equipments: [] }),
    }),
    { name: "equipment-store" }
  )
);
