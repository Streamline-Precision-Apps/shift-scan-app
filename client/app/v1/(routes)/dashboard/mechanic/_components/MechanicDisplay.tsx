"use client";
import { useCallback, useEffect, useState } from "react";
import { setProjectSelected } from "@/actions/mechanicActions";
import { NonManagerView } from "./NonManagerView";
import { ManagerView } from "./ManagerView";

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

export default function MechanicDisplay({ isManager }: { isManager: boolean }) {
  const [activeTab, setActiveTab] = useState(isManager ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeSheetId, setTimeSheetId] = useState<string | null>(null);
  const [isOpenProjectPreview, setIsOpenProjectPreview] = useState(false);

  // Fetch all projects
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsRes, timecardRes] = await Promise.all([
        fetch("/api/getMaintenanceProjects", {
          next: { tags: ["maintenance-projects"] },
        }),
        fetch("/api/getRecentTimecard", {
          next: { tags: ["timesheets"] },
        }),
      ]);

      const projectsData = await projectsRes.json();
      const timecardData = await timecardRes.json();

      setProjects(projectsData);
      setTimeSheetId(timecardData.id);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  // separate function to have a useEffect and a callback
  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = fetchData;

  // Handle project selection/deselection
  const handleProjectSelect = async (projectId: string, selected: boolean) => {
    // Optimistic update
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, selected } : p
    );
    setProjects(updatedProjects);

    try {
      await setProjectSelected(projectId, selected);
    } catch (error) {
      // Revert on error
      setProjects(projects);
      console.error("Failed to update project:", error);
    }
  };

  // Filter projects based on current view
  const priorityProjects = projects.filter((p) => !p.repaired);
  const selectableProjects = isManager
    ? projects
    : projects.filter((p) => p.selected);

  return (
    <>
      {!isManager ? (
        <NonManagerView
          projects={priorityProjects}
          loading={loading}
          timeSheetId={timeSheetId}
          handleRefresh={handleRefresh}
          isOpenProjectPreview={isOpenProjectPreview}
          setIsOpenProjectPreview={setIsOpenProjectPreview}
        />
      ) : (
        <ManagerView
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          priorityProjects={priorityProjects}
          selectableProjects={selectableProjects}
          loading={loading}
          timeSheetId={timeSheetId}
          onProjectSelect={handleProjectSelect}
          handleRefresh={handleRefresh}
          isOpenProjectPreview={isOpenProjectPreview}
          setIsOpenProjectPreview={setIsOpenProjectPreview}
        />
      )}
    </>
  );
}
