"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MobileCombobox } from "@/components/ui/mobile-combobox";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/actions/mechanicActions";
import { PullToRefresh } from "@/components/(animations)/pullToRefresh";
import SlidingDiv from "@/components/(animations)/slideDelete";

type Project = {
  id: number;
  hours: number | null;
  equipmentId: string;
  description: string | null;
  Equipment: {
    id: string;
    name: string;
  };
};
type Equipment = {
  id: string;
  qrId: string | null;
  name: string | null;
  code: string | null;
};

export function MechanicDisplayList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [form, setForm] = useState({
    equipment: { id: "", name: "" },
    hours: "",
    description: "",
  });
  const [updateForm, setUpdateForm] = useState({
    id: "",
    equipment: { id: "", name: "" },
    hours: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [startProjectLoading, setStartProjectLoading] = useState(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Early return if already submitting to prevent duplicate submissions
    if (submitting) return;

    setSubmitting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      formData.append("equipmentId", form.equipment.id ?? "");
      formData.append("hours", form.hours ?? "");
      formData.append("description", form.description ?? "");
      formData.append("timecardId", timecardId ?? "");

      const result = await createProject(formData);
      if (result) {
        setModalOpen(false);
        setForm({
          equipment: { id: "", name: "" },
          hours: "",
          description: "",
        });
        // Set loading directly since this is a modal action, not a pull-to-refresh
        setLoading(true);
        setRefreshing(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      // Add error handling UI here if needed
    } finally {
      // Add a small delay before allowing re-submission to prevent accidental double-clicks
      setTimeout(() => {
        setSubmitting(false);
      }, 500);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Early return if already submitting to prevent duplicate submissions
    if (submitting) return;

    setSubmitting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      formData.append("id", updateForm.id?.toString() ?? "");
      formData.append("equipmentId", updateForm.equipment.id ?? "");
      formData.append("hours", updateForm.hours ?? "");
      formData.append("description", updateForm.description ?? "");

      const result = await updateProject(formData);
      if (result) {
        setUpdateModalOpen(false);
        setUpdateForm({
          id: "",
          equipment: { id: "", name: "" },
          hours: "",
          description: "",
        });
        // Set loading directly since this is a modal action, not a pull-to-refresh
        setLoading(true);
        setRefreshing(false);
        fetchData(); // Refresh the project list
      }
    } catch (error) {
      console.error("Error updating project:", error);
      // Add error handling UI here if needed
    } finally {
      // Add a small delay before allowing re-submission to prevent accidental double-clicks
      setTimeout(() => {
        setSubmitting(false);
      }, 500);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      // Show loading state for delete operation
      setLoadingProjectId(projectToDelete);

      const result = await deleteProject(projectToDelete);
      if (result) {
        // Close modal and refresh the list
        setDeleteModalOpen(false);
        setProjectToDelete(null);
        // Set loading to refresh the list
        setLoading(true);
        setRefreshing(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      // Add error handling UI here if needed
    } finally {
      setLoadingProjectId(null);
    }
  };

  const confirmDelete = (projectId: number) => {
    setProjectToDelete(projectId);
    setDeleteModalOpen(true);
  };

  const t = useTranslations("MechanicWidget");
  const router = useRouter();
  const [equipmentList, setEquipmentList] = useState<Equipment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timecardId, setTimeSheetId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjectId, setLoadingProjectId] = useState<number | null>(null);

  const fetchEquipmentList = useCallback(async () => {
    const EquipmentListRes = await fetch("/api/equipmentIdNameQrIdAndCode", {
      next: { tags: ["equipment-list"] },
    });
    const EquipmentList = await EquipmentListRes.json();
    setEquipmentList(EquipmentList);
  }, []);

  const fetchProjectById = useCallback(async (id: string) => {
    try {
      const projectRes = await fetch(`/api/getProjectById/${id}`, {
        next: { tags: ["maintenance-projects"] },
      });

      if (!projectRes.ok) {
        const errorData = await projectRes.json();
        throw new Error(errorData.error || `Error: ${projectRes.status}`);
      }

      const projectData = await projectRes.json();
      return projectData;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      throw error;
    }
  }, []);

  const handleEditProject = async (projectId: number) => {
    try {
      // Set loading state for this specific project
      setLoadingProjectId(projectId);

      // First clear the form
      setUpdateForm({
        id: "",
        equipment: { id: "", name: "" },
        hours: "",
        description: "",
      });

      // Then load the project data
      const projectData = await fetchProjectById(projectId.toString());

      if (projectData) {
        setUpdateForm({
          id: projectData.id.toString(),
          equipment: {
            id: projectData.equipmentId,
            name: projectData.Equipment?.name || "",
          },
          hours: projectData.hours?.toString() || "",
          description: projectData.description || "",
        });

        // Open the update modal
        setUpdateModalOpen(true);
      } else {
        console.error("No project data returned");
        // You could add error handling UI here
      }
    } catch (error) {
      console.error("Error loading project data:", error);
      // You could add error handling UI here
    } finally {
      setLoadingProjectId(null);
    }
  };

  // Fetch recent timecard, then fetch projects for that timecard
  const fetchData = useCallback(async () => {
    // Determine if this is a pull-to-refresh operation or initial load
    const isPullToRefresh = projects.length > 0;

    if (isPullToRefresh) {
      // For pull-to-refresh, don't set loading=true to avoid showing the big spinner
      setRefreshing(true);
    } else {
      // For initial load, show the big spinner
      setLoading(true);
    }

    try {
      // Add a 1-second delay to better showcase the refresh animation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // First, fetch the most recent timecard
      const timecardRes = await fetch("/api/getRecentTimecard", {
        next: { tags: ["timesheets"] },
      });
      const timecardData = await timecardRes.json();
      setTimeSheetId(timecardData.id);

      // Then, fetch projects connected to that timecard
      if (timecardData?.id) {
        const projectsRes = await fetch(
          `/api/getProjects?timecardId=${timecardData.id}`,
          {
            next: { tags: ["maintenance-projects"] },
          },
        );
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projects.length]);
  // separate function to have a useEffect and a callback
  useEffect(() => {
    fetchData();
    fetchEquipmentList();
  }, [fetchData, fetchEquipmentList]);

  return (
    <>
      {equipmentList && (
        <>
          {/* Create New Project Modal */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <span />
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md mx-auto rounded-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{t("CreateNewProject")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <MobileCombobox
                    label={t("SelectEquipment")}
                    options={equipmentList.map((e) => ({
                      label:
                        `${e.code ? `${e.code} -` : ""} ${e.name}` ||
                        "Unnamed Equipment",
                      value: e.id,
                    }))}
                    value={form.equipment.id ? [form.equipment.id] : []}
                    onChange={(selectedIds: string[]) => {
                      const selectedId = selectedIds[0] || "";
                      const selectedEquipment = equipmentList.find(
                        (e) => e.id === selectedId,
                      );
                      setForm((prev) => ({
                        ...prev,
                        equipment: {
                          id: selectedId,
                          name: selectedEquipment?.name || "",
                        },
                      }));
                    }}
                    placeholder={t("SelectEquipment")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">{t("HoursWorked")}</Label>
                  <Input
                    id="hours"
                    name="hours"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.hours}
                    onChange={handleFormChange}
                    placeholder={t("EnterHoursWorked")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("RepairDescription")}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder={t("DescribeRepair")}
                  />
                </div>
                <DialogFooter className="pt-4 flex flex-row gap-2 justify-end">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      size={"lg"}
                      variant="secondary"
                      disabled={submitting}
                    >
                      {t("Cancel")}
                    </Button>
                  </DialogClose>
                  <Button
                    size={"lg"}
                    type="submit"
                    disabled={submitting}
                    className="bg-green-500 hover:none text-white"
                  >
                    {submitting ? t("Submitting") : t("Submit")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Update Project Modal */}
          <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
            <DialogTrigger asChild>
              <span />
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md mx-auto rounded-lg">
              <form onSubmit={handleUpdate} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{t("UpdateProject")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <MobileCombobox
                    label={t("SelectEquipment")}
                    options={equipmentList.map((e) => ({
                      label: e.name || "Unnamed Equipment",
                      value: e.id,
                    }))}
                    value={
                      updateForm.equipment.id ? [updateForm.equipment.id] : []
                    }
                    onChange={(selectedIds: string[]) => {
                      const selectedId = selectedIds[0] || "";
                      const selectedEquipment = equipmentList.find(
                        (e) => e.id === selectedId,
                      );
                      setUpdateForm((prev) => ({
                        ...prev,
                        equipment: {
                          id: selectedId,
                          name: selectedEquipment?.name || "",
                        },
                      }));
                    }}
                    placeholder={t("SelectEquipment")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateHours">{t("HoursWorked")}</Label>
                  <Input
                    id="updateHours"
                    name="hours"
                    type="number"
                    min="0"
                    step="0.1"
                    value={updateForm.hours}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        hours: e.target.value,
                      }))
                    }
                    required
                    placeholder={t("EnterHoursWorked")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateDescription">
                    {t("RepairDescription")}
                  </Label>
                  <Textarea
                    id="updateDescription"
                    name="description"
                    value={updateForm.description}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                    placeholder={t("DescribeRepair")}
                  />
                </div>
                <DialogFooter className="pt-4 flex flex-row gap-2 justify-end">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      size={"lg"}
                      variant="secondary"
                      disabled={submitting}
                    >
                      {t("Cancel")}
                    </Button>
                  </DialogClose>
                  <Button
                    size={"lg"}
                    type="submit"
                    disabled={submitting}
                    className="bg-green-500 hover:none text-white"
                  >
                    {submitting ? t("Updating") : t("Update")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
      <Grids rows="7" gap="5">
        {/* Header */}
        <Holds background={"white"} className={`row-start-1 row-end-2 h-full `}>
          <TitleBoxes onClick={() => router.push("/dashboard")}>
            <Titles size="lg">{t("Projects")}</Titles>
          </TitleBoxes>
        </Holds>

        <Holds
          background={"white"}
          className={`row-start-2 row-end-8 h-full ${loading ? "animate-pulse" : ""}`}
        >
          <Contents width={"section"} className="py-3">
            {/* List of Projects with Pull-to-refresh */}
            <div className="h-full border-gray-200 bg-gray-50 border rounded-md px-2 overflow-hidden">
              <PullToRefresh
                onRefresh={fetchData}
                textColor="text-app-dark-blue"
                pullText={t("PullToRefresh")}
                releaseText={t("ReleaseToRefresh")}
                containerClassName="h-full pt-5 pb-2"
              >
                {loading && !refreshing ? (
                  <div className="flex flex-col items-center justify-center h-full  animate-pulse"></div>
                ) : projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <SlidingDiv
                        key={project.id}
                        onSwipeLeft={() => confirmDelete(project.id)}
                        confirmationMessage={t("DeleteProjectPrompt")}
                      >
                        <div className="pb-2 pl-2 pt-1 pr-1 rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col gap-1">
                          <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                              <div className="text-xs text-gray-400">
                                {t("Hours")}: {project.hours ?? t("NotSet")}
                              </div>
                              <div className="font-semibold text-md text-green-700 truncate max-w-[200px]">
                                {project.Equipment?.name ||
                                  t("UnnamedEquipment")}
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`text-xs ${loadingProjectId === project.id ? "bg-gray-100 text-gray-400" : "text-blue-600 bg-blue-50 hover:bg-blue-100"} px-2 py-1 rounded w-14 h-10 justify-center flex items-center`}
                              onClick={() => handleEditProject(project.id)}
                              disabled={loadingProjectId === project.id}
                            >
                              {loadingProjectId === project.id ? (
                                <div className="w-4 h-4 border-2 border-t-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <img
                                  src={"/formEdit.svg"}
                                  alt="Edit Icon"
                                  className="w-4 h-4"
                                />
                              )}
                            </button>
                          </div>

                          <div className="text-gray-600 text-xs">
                            {project.description || t("NoDescription")}
                          </div>
                        </div>
                      </SlidingDiv>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg
                      className="w-10 h-10 mb-2 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 12h8M12 8v8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <Texts size="md">{t("NoProjectsFound")}</Texts>
                  </div>
                )}
              </PullToRefresh>
            </div>
            <div className="h-12 mt-2 flex items-center">
              <Buttons
                shadow={"none"}
                background={"green"}
                className={`h-10 w-full ${startProjectLoading ? "opacity-70" : ""}`}
                onClick={() => setModalOpen(true)}
                disabled={startProjectLoading}
              >
                <Titles size={"md"}>{t("StartProject")}</Titles>
              </Buttons>
            </div>
          </Contents>
        </Holds>
      </Grids>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="w-[90%] max-w-md mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>{t("DeleteProject")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">{t("DeleteProjectConfirmation")}</p>
          </div>
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                size={"lg"}
                variant="secondary"
                onClick={() => setProjectToDelete(null)}
              >
                {t("Cancel")}
              </Button>
            </DialogClose>
            <Button
              size={"lg"}
              type="button"
              onClick={handleDeleteProject}
              disabled={loadingProjectId === projectToDelete}
              className="bg-red-500 hover:none text-white"
            >
              {loadingProjectId === projectToDelete ? (
                <div className="w-4 h-4 mr-2 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              ) : null}
              {loadingProjectId === projectToDelete
                ? t("Deleting")
                : t("Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
