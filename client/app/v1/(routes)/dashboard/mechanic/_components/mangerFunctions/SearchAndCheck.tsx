"use client";
import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Spinner from "@/components/(animations)/spinner";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { SearchBar } from "./SearchBar";
import { ProjectList } from "./ProjectList";

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
export const SearchAndCheck = ({
  projects,
  loading,
  onProjectSelect,
  handleRefresh,
}: {
  projects: Project[];
  loading: boolean;
  onProjectSelect: (id: string, selected: boolean) => Promise<void>;
  handleRefresh: () => Promise<void>;
}) => {
  const router = useRouter();
  const t = useTranslations("MechanicWidget");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const priorityOrder: Priority[] = [
    Priority.TODAY,
    Priority.HIGH,
    Priority.MEDIUM,
    Priority.LOW,
    Priority.PENDING,
  ];

  const filteredProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const indexA = priorityOrder.indexOf(a.priority);
        const indexB = priorityOrder.indexOf(b.priority);
        return indexA - indexB;
      })
      .filter((project) =>
        project.Equipment?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [projects, searchTerm]);

  const handleToggle = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    setUpdatingId(projectId);
    try {
      await onProjectSelect(projectId, !project.selected);
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Holds className="row-start-2 row-end-9 h-full w-full justify-center items-center rounded-none">
          <Spinner />
        </Holds>
      </>
    );
  }

  return (
    <Grids rows="8" className="h-full w-full">
      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        inputRef={inputRef}
      />

      {/* Project List */}
      <ProjectList
        projects={filteredProjects}
        updatingId={updatingId}
        handleToggle={handleToggle}
        router={router}
        onRefresh={handleRefresh}
      />
    </Grids>
  );
};
