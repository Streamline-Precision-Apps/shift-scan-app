"use client";
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

export const CostCodeOptions = (
  dataType: string,
  searchTerm?: string,
): Option[] => {
  const { jobsiteResults } = useDBJobsite();
  // const { recentlyUsedJobCodes } = useRecentDBJobsite();
  const { costcodeResults } = useDBCostcode();
  // const { recentlyUsedCostCodes } = useRecentDBCostcode();
  const { equipmentResults } = useDBEquipment();
  // const { recentlyUsedEquipment } = useRecentDBEquipment();

  let options: Option[] = [];

  switch (dataType) {
    case "costcode":
      if (!costcodeResults) throw new Error("costcodeResults is undefined");

      // // Get recently used first, remove nulls
      // const recentCostCodes = recentlyUsedCostCodes
      //   .filter((costcode) => costcode !== null)
      //   .map((costcode: CostCodes) => ({
      //     code: costcode.name,
      //     label: costcode.name,
      //   }));

      // Append all cost codes while avoiding duplicates
      const allCostCodes = costcodeResults
        .filter((costcode) => costcode !== null)
        .map((costcode: CostCodes) => ({
          code: costcode.name,
          label: costcode.name,
        }));
      // .filter(
      //   (costcode) =>
      //     !recentCostCodes.some((recent) => recent.code === costcode.code)
      // );

      // options = [...recentCostCodes, ...allCostCodes];
      options = allCostCodes;
      break;

    case "jobsite":
      if (!jobsiteResults) throw new Error("jobsiteResults is undefined");

      // Recently used jobsites first
      // const recentJobsites = recentlyUsedJobCodes.map((jobcode: JobCodes) => ({
      //   code: jobcode.qrId,
      //   label: jobcode.name,
      // }));

      // Append other jobsites while avoiding duplicates
      const allJobsites = jobsiteResults
        .filter((jobcode) => jobcode !== null)
        .map((jobcode: JobCodes) => ({
          code: jobcode.qrId,
          label: jobcode.name,
        }));
      // .filter(
      //   (jobcode) =>
      //     !recentJobsites.some((recent) => recent.code === jobcode.code)
      // );

      // options = [...recentJobsites, ...allJobsites];
      options = allJobsites;
      break;

    case "equipment-operator":
    case "equipment":
      if (!equipmentResults) throw new Error("equipmentResults is undefined");

      // Recently used equipment first
      // const recentEquipment = recentlyUsedEquipment.map(
      //   (equipment: EquipmentCode) => ({
      //     code: equipment.qrId,
      //     label: equipment.name,
      //   })
      // );

      // Append other equipment while avoiding duplicates
      const allEquipment = equipmentResults.map((equipment: EquipmentCode) => ({
        code: equipment.qrId,
        label: equipment.name,
      }));
      // .filter(
      //   (equipment) =>
      //     !recentEquipment.some((recent) => recent.code === equipment.code)
      // );

      // options = [...recentEquipment, ...allEquipment];
      options = allEquipment;
      break;

    default:
      throw new Error("Invalid data type");
  }

  // Filter options based on the search term
  if (searchTerm) {
    options = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  return options;
};
