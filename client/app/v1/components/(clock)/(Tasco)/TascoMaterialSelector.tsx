"use client";
import React, { useEffect, useState, Suspense } from "react";
import NewCodeFinder from "@/app/v1/components/(search)/newCodeFinder";
import { Holds } from "../../(reusable)/holds";
import { Grids } from "../../(reusable)/grids";
import { Contents } from "../../(reusable)/contents";
import { TitleBoxes } from "../../(reusable)/titleBoxes";
import { Titles } from "../../(reusable)/titles";
import StepButtons from "../step-buttons";
import { useProfitStore } from "@/app/lib/store/profitStore";

type Option = {
  id: string;
  label: string;
  code: string;
};

type TascoMaterialSelectorProps = {
  handleNextStep: () => void;
  handlePrevStep: () => void;
  materialType: string;
  setMaterialType: React.Dispatch<React.SetStateAction<string>>;
  setJobsite: React.Dispatch<React.SetStateAction<Option>>;
};

const materialOptions = [
  // Database records that exist (from dataValues.ts)
  { id: "rock", code: "Rock", label: "Rock", jobsiteName: "MH2526" },
  {
    id: "elimco",
    code: "Elimco",
    label: "Elimco",
    jobsiteName: "MH2526",
  },
  { id: "coal", code: "Coal", label: "Coal", jobsiteName: "MH2526" },
  {
    id: "lime-kiln",
    code: "Lime Kiln",
    label: "Lime Kiln",
    jobsiteName: "MH2526",
  },
  {
    id: "ag-waste",
    code: "Ag Waste",
    label: "Ag Waste",
    jobsiteName: "MH2526",
  },
  {
    id: "belt-mud",
    code: "Belt Mud",
    label: "Belt Mud",
    jobsiteName: "MH2526",
  },
  {
    id: "end-of-campaign",
    code: "End Of Campaign Clean Up",
    label: "End Of Campaign Clean Up",
    jobsiteName: "MH2526",
  },

  // Additional materials that may need to be added to database
  {
    id: "mud-conditioning",
    code: "Mud Conditioning",
    label: "Mud Conditioning",
    jobsiteName: "MH2526",
  },
  {
    id: "lime-rock",
    code: "Lime Rock",
    label: "Lime Rock",
    jobsiteName: "MH2526",
  },
  {
    id: "dust-control",
    code: "Dust Control",
    label: "Dust Control",
    jobsiteName: "DC2526 - Tasco",
  },
  {
    id: "push-pcc",
    code: "Push PCC",
    label: "Push PCC",
    jobsiteName: "PCC2526 - PCC",
  },
  {
    id: "rip-west",
    code: "Rip West",
    label: "Rip West",
    jobsiteName: "PCC2526 - PCC",
  },
  {
    id: "rip-center",
    code: "Rip Center",
    label: "Rip Center",
    jobsiteName: "PCC2526 - PCC",
  },
  {
    id: "rip-east",
    code: "Rip East",
    label: "Rip East",
    jobsiteName: "PCC2526 - PCC",
  },
];

export default function TascoMaterialSelector({
  handleNextStep,
  handlePrevStep,
  materialType,
  setMaterialType,
  setJobsite,
}: TascoMaterialSelectorProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<Option | null>(null);
  const { jobsites: jobsiteResults } = useProfitStore();

  // Initialize with current materialType if it exists
  useEffect(() => {
    if (materialType) {
      const foundMaterial = materialOptions.find(
        (m) => m.code === materialType
      );
      if (foundMaterial) {
        setSelectedMaterial(foundMaterial);
      }
    }
  }, [materialType]);

  const handleMaterialSelect = (material: Option | null) => {
    setSelectedMaterial(material);

    if (material) {
      setMaterialType(material.code); // Use code instead of label for database

      // Set jobsite based on material selection using real jobsite data
      const materialOption = materialOptions.find((m) => m.id === material.id);
      if (materialOption) {
        // Find the actual jobsite from the database by name pattern (case-insensitive includes)
        const foundJobsite = jobsiteResults.find((js) =>
          js.name
            .toLowerCase()
            .includes(materialOption.jobsiteName.toLowerCase())
        );

        console.log("Found jobsite:", foundJobsite);

        if (foundJobsite) {
          setJobsite({
            id: foundJobsite.id, // Use the actual database ID
            label: foundJobsite.name,
            code: foundJobsite.qrId,
          });
        } else {
          console.error(
            `Jobsite with name pattern "${materialOption.jobsiteName}" not found in database`
          );
          // Try to find a fallback jobsite or use the first available one
          const fallbackJobsite = jobsiteResults.find(
            (js) => js.status !== "ARCHIVED"
          );
          if (fallbackJobsite) {
            console.warn(
              `Using fallback jobsite: ${fallbackJobsite.name} (${fallbackJobsite.qrId})`
            );
            setJobsite({
              id: fallbackJobsite.id,
              label: fallbackJobsite.name,
              code: fallbackJobsite.qrId,
            });
          }
        }
      }
    } else {
      setMaterialType("");
    }
  };

  return (
    <Holds background={"white"} className="h-full w-full">
      <Grids rows={"7"} gap={"5"} className="h-full w-full">
        <Holds className="row-start-1 row-end-2 h-full w-full">
          <TitleBoxes onClick={handlePrevStep}>
            <Titles size={"h4"}>Select Material Type</Titles>
          </TitleBoxes>
        </Holds>

        <Holds className="row-start-2 row-end-8 h-full w-full">
          <Contents width="section">
            <Grids rows={"7"} gap={"5"} className="h-full w-full pb-5">
              <Holds className={"row-start-1 row-end-7 h-full w-full"}>
                <Suspense fallback={<div>Loading materials...</div>}>
                  <NewCodeFinder
                    options={materialOptions}
                    selectedOption={selectedMaterial}
                    onSelect={handleMaterialSelect}
                    placeholder="Search for material type"
                    label="Select Material Type"
                  />
                </Suspense>
              </Holds>

              <Holds className="row-start-7 row-end-8 w-full justify-center">
                <StepButtons
                  handleNextStep={handleNextStep}
                  disabled={!selectedMaterial}
                />
              </Holds>
            </Grids>
          </Contents>
        </Holds>
      </Grids>
    </Holds>
  );
}
