"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Selects } from "@/components/(reusable)/selects";
import { SearchAndCheck } from "./SearchAndCheck";

// Import your UI components

type Equipment = {
  id: string;
  name: string;
};

type MaintenanceLog = {
  id: string;
  startTime: string;
  endTime: string;
  userId: string;
  timeSheetId: string;
  User: {
    firstName: string;
    lastName: string;
    image: string;
  };
};

type Project = {
  id: string;
  equipmentId: string;
  selected: boolean;
  priority: Priority;
  delay: Date | null;
  equipmentIssue: string;
  additionalInfo: string;
  repaired: boolean;
  createdBy: string;
  createdAt: string | undefined;
  MaintenanceLogs: MaintenanceLog[];
  Equipment: Equipment;
};

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  DELAYED = "DELAYED",
  PENDING = "PENDING",
  TODAY = "TODAY",
}

export default function MechanicSelectList({
  projects,
  loading,
  onProjectSelect,
  handleRefresh
}: {
  projects: Project[];
  loading: boolean;
  onProjectSelect: (id: string, selected: boolean) => Promise<void>;
  handleRefresh: () => Promise<void>;
}) {
  const t = useTranslations("MechanicWidget");
  const [selectedFilter, setSelectedFilter] = useState<string>("");

  const PriorityOptions = [
    { label: t("SelectFilter"), value: "" },
    { label: t("Pending"), value: "PENDING" },
    { label: t("Delayed"), value: "DELAYED" },
    { label: t("HighPriority"), value: "HIGH" },
    { label: t("MediumPriority"), value: "MEDIUM" },
    { label: t("LowPriority"), value: "LOW" },
    { label: t("Today"), value: "TODAY" },
    { label: t("Repaired"), value: "REPAIRED" },
  ];

  const filteredProjects = useMemo(() => {
    if (!selectedFilter) return projects.filter((p) => !p.repaired);

    switch (selectedFilter) {
      case "DELAYED":
        return projects.filter((p) => p.delay && !p.repaired);
      case "REPAIRED":
        return projects.filter((p) => p.repaired);
      default:
        return projects.filter(
          (p) => p.priority === selectedFilter && !p.delay && !p.repaired
        );
    }
  }, [projects, selectedFilter]);

  return (
    <Holds background="white" className="h-full rounded-t-none">
      <Grids rows="9" cols="5" gap="4" className="h-full p-3">
        {/* Add New Repair Button */}
        <Holds className="col-start-1 col-end-2 row-start-1 row-end-2 h-full">
          <Buttons
            href="/dashboard/mechanic/new-repair"
            background="green"
            className="h-full justify-center items-center"
          >
            <Images
              titleImg="/plus.svg"
              titleImgAlt={t("AddNewRepair")}
              className="mx-auto p-1"
            />
          </Buttons>
        </Holds>

        {/* Filter Dropdown */}
        <Holds className="col-start-2 col-end-6 row-start-1 row-end-2 h-full">
          <Selects
            className="w-full h-full text-center justify-center items-center"
            onChange={(e) => setSelectedFilter(e.target.value)}
            value={selectedFilter}
          >
            {PriorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Selects>
        </Holds>

        {/* Project List */}
        <Holds className="col-start-1 col-end-6 row-start-2 row-end-10 h-full w-full border-[3px] border-black rounded-[10px]">
          <SearchAndCheck
            projects={filteredProjects}
            loading={loading}
            onProjectSelect={onProjectSelect}
            handleRefresh={handleRefresh}
          />
        </Holds>
      </Grids>
    </Holds>
  );
}
