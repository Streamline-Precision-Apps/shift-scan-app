"use client";
import { Grids } from "@/components/(reusable)/grids";
import MechanicPriority from "./MechanicPriorityList";

import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";
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

export function NonManagerView({
  projects,
  loading,
  timeSheetId,
  handleRefresh,
  isOpenProjectPreview,
  setIsOpenProjectPreview,
}: {
  projects: Project[];
  loading: boolean;
  timeSheetId: string | null;
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
            <Titles size="h2">{t("Projects")}</Titles>
          </TitleBoxes>
        </Holds>
      )}

      {/* Priority List */}

      <MechanicPriority
        loading={loading}
        projects={projects}
        timeSheetId={timeSheetId}
        handleRefresh={handleRefresh}
        isOpenProjectPreview={isOpenProjectPreview}
        setIsOpenProjectPreview={setIsOpenProjectPreview}
      />
    </Grids>
  );
}
