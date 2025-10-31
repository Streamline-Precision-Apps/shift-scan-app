import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Equipment {
  id: string;
  name: string;
  qrId?: string;
}

interface EmployeeEquipmentLog {
  id: string;
  startTime: string;
  endTime?: string | null;
  equipment: Equipment;
}

interface TascoLog {
  shiftType: string;
  laborType: string | null;
  equipment?: Equipment;
}

interface TruckingLog {
  laborType: string;
  equipment: Equipment;
}

interface Jobsite {
  id: string;
  qrId: string;
  name: string;
}

interface CostCode {
  id: string;
  name: string;
}

interface BannerData {
  id: string;
  startTime: string;
  jobsite: Jobsite | null;
  costCode: CostCode | null;
  tascoLogs: TascoLog[];
  truckingLogs: TruckingLog[];
  employeeEquipmentLogs: EmployeeEquipmentLog[];
}

type BannerDataStore = {
  bannerData: BannerData | null;
  setBannerData: (data: BannerData) => void;
  clearBannerData: () => void;
};

export const useBannerDataStore = create<BannerDataStore>()(
  persist(
    (set) => ({
      bannerData: null,
      setBannerData: (data) => set({ bannerData: data }),
      clearBannerData: () => set({ bannerData: null }),
    }),
    {
      name: "banner-data-store",
      partialize: (state) => ({ bannerData: state.bannerData }),
    }
  )
);
