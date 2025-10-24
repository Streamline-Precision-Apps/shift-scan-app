"use client";
import { useMemo } from "react";
import {
  useDBJobsite,
  useDBCostcode,
  useDBEquipment,
} from "@/app/context/dbCodeContext";
import { EquipmentTags } from "../../../prisma/generated/prisma/client";
// import {
//   useRecentDBJobsite,
//   useRecentDBCostcode,
//   useRecentDBEquipment,
// } from "@/app/context/dbRecentCodesContext";

export type JobCodes = {
  id: string;
  qrId: string;
  name: string;
};

export type CostCodes = {
  id: string;
  name: string;
};

export type EquipmentCode = {
  id: string;
  qrId: string;
  name: string;
  equipmentTag: EquipmentTags;
};

interface Option {
  code: string;
  label: string;
}

export const useCostCodeOptions = (
  dataType: string,
  searchTerm?: string,
): Option[] => {
  const { jobsiteResults } = useDBJobsite();
  // const { recentlyUsedJobCodes } = useRecentDBJobsite();
  const { costcodeResults } = useDBCostcode();
  // const { recentlyUsedCostCodes } = useRecentDBCostcode();
  const { equipmentResults } = useDBEquipment();
  // const { recentlyUsedEquipment } = useRecentDBEquipment();

  const options = useMemo(() => {
    let opts: Option[] = [];

    switch (dataType) {
      case "costcode":
        if (!costcodeResults) throw new Error("costcodeResults is undefined");

        opts = costcodeResults.map((costcode: CostCodes) => ({
          code: costcode.name,
          label: `${costcode.name}`,
          // isRecent: recentlyUsedCostCodes.some(
          //   (recent) => recent?.name === costcode.name
          // ),
        }));
        break;

      case "jobsite":
        if (!jobsiteResults) throw new Error("jobsiteResults is undefined");

        opts = jobsiteResults.map((jobcode: JobCodes) => ({
          code: jobcode.qrId,
          label: jobcode.name,
          // isRecent: recentlyUsedJobCodes.some(
          //   (recent) => recent?.qrId === jobcode.qrId
          // ),
        }));
        break;

      case "equipment-operator":
      case "equipment":
        if (!equipmentResults) throw new Error("equipmentResults is undefined");

        opts = equipmentResults.map((equipment: EquipmentCode) => ({
          code: equipment.qrId,
          label: equipment.name,
          // isRecent: recentlyUsedEquipment.some(
          //   (recent) => recent?.qrId === equipment.qrId
          // ),
        }));
        break;
      case "truck":
        if (!equipmentResults) throw new Error("equipmentResults is undefined");
        opts = equipmentResults.map((equipment: EquipmentCode) => ({
          code: equipment.qrId,
          label: equipment.name,
        }));
        break;

      default:
        throw new Error("Invalid data type");
    }

    // Filter based on search term if provided
    if (searchTerm) {
      opts = opts.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return opts;
  }, [
    dataType,
    searchTerm,
    jobsiteResults,
    // recentlyUsedJobCodes,
    costcodeResults,
    // recentlyUsedCostCodes,
    equipmentResults,
    // recentlyUsedEquipment,
  ]);

  return options;
};
