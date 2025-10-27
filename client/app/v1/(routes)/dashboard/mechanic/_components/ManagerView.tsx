import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { NewTab } from "@/components/(reusable)/newTabs";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";
import MechanicPriority from "./MechanicPriorityList";
import { useState } from "react";
import MechanicSelectList from "./mangerFunctions/MechanicSelectList";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useRouter } from "next/navigation";

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

export function ManagerView({
  activeTab,
  setActiveTab,
  priorityProjects,
  selectableProjects,
  loading,
  timeSheetId,
  onProjectSelect,
  handleRefresh,
  isOpenProjectPreview,
  setIsOpenProjectPreview,
}: {
  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>;
  priorityProjects: Project[];
  selectableProjects: Project[];
  loading: boolean;
  timeSheetId: string | null;
  onProjectSelect: (projectId: string, selected: boolean) => Promise<void>;
  handleRefresh: () => Promise<void>;
  isOpenProjectPreview: boolean;
  setIsOpenProjectPreview: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const t = useTranslations("MechanicWidget");
  const router = useRouter();
  return (
    <Grids rows="7" gap="5">
      {/* Header */}
      {!isOpenProjectPreview && (
        <Holds background={"white"} className="row-start-1 row-end-2 h-full">
          <TitleBoxes onClick={() => router.push("/dashboard")}>
            <Titles size="h2">
              {activeTab === 1 ? t("PriorityList") : t("Projects")}{" "}
            </Titles>
          </TitleBoxes>
        </Holds>
      )}

      {/* Tab Content */}
      <Holds className="row-start-2 row-end-8 h-full">
        {/* Tabs */}
        <Holds position="row" className="h-fit gap-1.5">
          <NewTab
            isActive={activeTab === 1}
            onClick={() => setActiveTab(1)}
            titleImage="/statusOngoingFilled.svg"
            titleImageAlt="List Tab"
            isComplete={true}
            isLoading={loading}
          >
            {t("Todays")}
          </NewTab>
          <NewTab
            isActive={activeTab === 2}
            onClick={() => setActiveTab(2)}
            titleImage="/formList.svg"
            titleImageAlt="Manager Tab"
            isComplete={true}
            animatePulse={loading}
          >
            {t("All")}
          </NewTab>
        </Holds>

        <Grids rows="1" className="h-full ">
          {/* Content */}
          <Holds className={`rounded-t-none row-span-1 h-full `}>
            {activeTab === 1 ? (
              <MechanicPriority
                projects={selectableProjects}
                loading={loading}
                timeSheetId={timeSheetId}
                handleRefresh={handleRefresh}
                isOpenProjectPreview={isOpenProjectPreview}
                setIsOpenProjectPreview={setIsOpenProjectPreview}
              />
            ) : (
              <MechanicSelectList
                projects={selectableProjects}
                loading={loading}
                onProjectSelect={onProjectSelect}
                handleRefresh={handleRefresh}
              />
            )}
          </Holds>
        </Grids>
      </Holds>
    </Grids>
  );
}
