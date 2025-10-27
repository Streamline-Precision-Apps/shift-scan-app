"use client";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Labels } from "@/components/(reusable)/labels";
import { NModals } from "@/components/(reusable)/newmodals";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Texts } from "@/components/(reusable)/texts";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { Inputs } from "@/components/(reusable)/inputs";
import { getFormattedDuration } from "@/utils/getFormattedDuration";
import { startEngineerProject } from "@/actions/mechanicActions";

import { useSession } from "next-auth/react";
import { setMechanicProjectID } from "@/actions/cookieActions";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Images } from "@/components/(reusable)/images";
import Spinner from "@/components/(animations)/spinner";
import { PullToRefresh } from "@/components/(animations)/pullToRefresh";

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

export default function MechanicPriority({
  loading,
  projects,
  timeSheetId,
  handleRefresh,
  isOpenProjectPreview,
  setIsOpenProjectPreview,
}: {
  loading: boolean;
  projects: Project[];
  timeSheetId: string | null;
  handleRefresh: () => Promise<void>;
  isOpenProjectPreview: boolean;
  setIsOpenProjectPreview: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [activeUsers, setActiveUsers] = useState<
    {
      id: string;
      name: string;
      image: string;
      startTime: string;
    }[]
  >([]);
  const FilteredProject = projects.filter(
    (project) => project.selected && !project.repaired,
  );

  const [projectPreviewId, setProjectPreviewId] = useState<string | null>(null);
  const [previewedProjectData, setPreviewedProjectData] = useState<
    Project | undefined
  >(undefined);
  const t = useTranslations("MechanicWidget");
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [currentPage, setCurrentPage] = useState(1);
  const workersPerPage = 1;
  const [endTime] = useState<string>(new Date().toISOString());

  // Update previewed project data when projectPreviewId changes
  useEffect(() => {
    if (projectPreviewId) {
      const project = projects.find((p) => p.id === projectPreviewId);
      setPreviewedProjectData(project);

      if (project) {
        const activeUsersList = project.MaintenanceLogs.filter(
          (log) => log.startTime && !log.endTime,
        ) // Only logs with an active session
          .map((log) => ({
            id: log.userId,
            name: `${log.User.firstName} ${log.User.lastName}`,
            image: log.User.image,
            startTime: new Date(log.startTime).toISOString(),
          }));
        setActiveUsers(activeUsersList);
      }
    }
  }, [projectPreviewId, projects]);

  // // Ensure there are at least 7 projects for layout purposes
  // while (projects.length < 7) {
  //   projects.push({ id: "" } as Projects);
  // }

  // Pagination constants
  const startIndex = (currentPage - 1) * workersPerPage;
  const currentWorker = activeUsers.slice(
    startIndex,
    startIndex + workersPerPage,
  );

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && currentPage < activeUsers.length) {
      setCurrentPage(currentPage + 1); // Swipe left
    }
    if (distance < -minSwipeDistance && currentPage > 1) {
      setCurrentPage(currentPage - 1); // Swipe right
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Start project action
  const StartLogAndSaveProject = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("maintenanceId", previewedProjectData?.id ?? "");
      formData.append("timeSheetId", timeSheetId ?? "");
      formData.append("userId", userId ?? "");
      await setMechanicProjectID(previewedProjectData?.id ?? "");

      const res = await startEngineerProject(formData);
      if (res) {
        router.push(`/dashboard/mechanic/projects/${previewedProjectData?.id}`);
      } else {
        console.error(t("ErrorStartingProject"), res);
      }
    } catch (error) {
      console.error(t("ErrorSavingProject"), error);
    }
  };

  useEffect(() => {
    // Clear any existing interval
    const interval = setInterval(() => {
      setCurrentPage((prevPage) =>
        prevPage < activeUsers.length ? prevPage + 1 : 1,
      );
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount or page change
  }, [activeUsers.length, currentPage]); // Dependency includes currentPage to reset on change

  // Render loading state if still fetching projects
  if (loading) {
    return (
      <Holds
        background="white"
        className="row-start-2 row-end-8 rounded-t-none h-full "
      >
        <Holds className="h-full no-scrollbar overflow-y-auto">
          <Contents width="section" className="mb-5">
            <Holds className="h-3/4 justify-center items-center">
              <Spinner size={50} />
            </Holds>
          </Contents>
        </Holds>
      </Holds>
    );
  }

  return (
    <Holds
      background="white"
      className="row-start-2 row-end-8 rounded-t-none h-full "
    >
      <Holds className="h-full w-full no-scrollbar overflow-y-auto ">
        <PullToRefresh
          onRefresh={handleRefresh}
          bgColor="bg-darkBlue/70"
          textColor="text-app-dark-blue"
          pullText={"Pull To Refresh"}
          releaseText={"Release To Refresh"}
          refreshingText="Loading..."
          containerClassName="h-full"
        >
          <Contents width="section" className="pt-3 pb-5 ">
            {FilteredProject.length === 0 ? (
              <Holds className="h-3/4 w-full flex items-center justify-center px-6">
                <Texts size="p5" className="text-center italic text-gray-500">
                  {t("NoProjectsFound")}
                </Texts>
              </Holds>
            ) : (
              FilteredProject.map((project: Project, index) => {
                const isActive = project.MaintenanceLogs.some(
                  (log) => log.startTime && !log.endTime,
                );
                return (
                  <Holds
                    key={`placeholder-${index}`}
                    className="h-fit relative pt-2"
                  >
                    {isActive && !project.delay && (
                      <Holds
                        background="green"
                        className="absolute top-0 left-4 w-1/4 rounded-[10px] border-[3px] border-black flex items-center justify-center"
                      >
                        <Texts size="p7" className="text-center">
                          {t("Active")}
                        </Texts>
                      </Holds>
                    )}
                    {project.delay !== null && (
                      <Holds
                        background="orange"
                        className="absolute top-0 left-4 w-1/4  rounded-[10px] border-[3px] border-black flex items-center justify-center"
                      >
                        <Texts size="p6" className="text-center">
                          {t("Delayed")}
                        </Texts>
                      </Holds>
                    )}
                    <Buttons
                      background={
                        project.delay === null ? "lightBlue" : "darkGray"
                      }
                      onClick={() => {
                        setProjectPreviewId(project.id);
                        setIsOpenProjectPreview(true);
                      }}
                      className="w-full py-3 rounded-[10px]"
                      disabled={project.delay !== null}
                    >
                      <Titles size="h5">
                        {project.Equipment?.name.length > 45
                          ? project?.Equipment?.name.slice(0, 45) + "..."
                          : project?.Equipment?.name}
                      </Titles>
                    </Buttons>
                  </Holds>
                );
              })
            )}
          </Contents>
        </PullToRefresh>

        {/* Project Preview Modal */}
        <NModals
          size="screen"
          background="takeABreak"
          isOpen={isOpenProjectPreview}
          handleClose={() => {
            setIsOpenProjectPreview(false);
          }}
        >
          <Holds background="white" className="h-full pb-5">
            <Grids rows="7" gap="5">
              {/* Modal Header */}
              <Holds className="row-span-1 h-full w-full justify-center ">
                <TitleBoxes
                  onClick={() => {
                    setIsOpenProjectPreview(false);
                  }}
                >
                  <Holds>
                    <Titles size="h2">
                      {previewedProjectData?.Equipment?.name
                        ? `${previewedProjectData?.Equipment?.name.slice(
                            0,
                            20,
                          )}...`
                        : t("ProjectPreview")}
                    </Titles>
                  </Holds>
                </TitleBoxes>
              </Holds>

              {/* Modal Content */}
              <Holds className="flex justify-center items-center h-full w-full row-start-2 row-end-7">
                <Contents width="section">
                  <Labels position="left" size="p6">
                    {t("ActiveWorkers")}
                  </Labels>
                  <Holds
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    background={
                      currentWorker.length > 0 ? `white` : `lightGray`
                    }
                    className={`w-full relative rounded-[10px] border-[3px] border-black `}
                  >
                    {currentWorker.length > 0 ? (
                      currentWorker.map((user, index) => (
                        <Holds key={user.id || index} className="w-full h-full">
                          <Holds className="py-3 flex items-center gap-2 ">
                            <img
                              src={user.image || "/person.svg"}
                              alt={user.name}
                              className={
                                user.image
                                  ? "w-20 h-20 rounded-full object-cover mx-auto border-[3px] border-black"
                                  : "w-16 h-16 rounded-full object-cover mx-auto"
                              }
                              title={user.name}
                            />
                            <Titles size="h4">{user.name}</Titles>
                            <Holds className="flex flex-col w-3/4 mx-auto">
                              <Labels
                                position="left"
                                size="p6"
                                htmlFor="totalTime"
                              >
                                {t("ProjectTotalTime")}
                              </Labels>
                              <Inputs
                                name="totalTime"
                                readOnly
                                className="text-center text-sm"
                                type="text"
                                value={getFormattedDuration(
                                  user.startTime,
                                  endTime,
                                )}
                              />

                              {activeUsers.length > 1 && (
                                <Holds
                                  position="row"
                                  className={`flex items-center justify-center gap-2 `}
                                >
                                  {Array.from({
                                    length: activeUsers.length,
                                  }).map((_, index) => (
                                    <Holds
                                      key={index}
                                      className={`w-2 h-2 rounded-full border-2 border-black  ${
                                        index + 1 === currentPage
                                          ? "bg-app-blue"
                                          : "bg-white"
                                      }
                                        `}
                                    />
                                  ))}
                                </Holds>
                              )}
                            </Holds>
                          </Holds>
                        </Holds>
                      ))
                    ) : (
                      <Holds>
                        <Holds background="lightGray" className="p-10">
                          <Texts size="p6">{t("NoActiveWorkers")} </Texts>
                        </Holds>
                      </Holds>
                    )}
                  </Holds>

                  {/* Problem Received */}
                  <Holds className="relative">
                    <Labels htmlFor="equipmentIssue" size="p5">
                      {t("ProblemReceived")}
                    </Labels>
                    <TextAreas
                      disabled
                      id="equipmentIssue"
                      name="equipmentIssue"
                      value={previewedProjectData?.equipmentIssue}
                      rows={4}
                      className="text-sm"
                    />
                    {previewedProjectData?.createdBy && (
                      <span className="absolute top-4 right-2 text-[8px]">
                        {`
                      ${t("CreatedBy")} ${previewedProjectData?.createdBy}
                      ${t("On")}
                      ${format(
                        new Date(previewedProjectData?.createdAt ?? ""),
                        "MM/dd/yy",
                      )}  
                      `}
                      </span>
                    )}
                  </Holds>

                  {/* Additional Info */}
                  <Holds>
                    <Labels htmlFor="additionalInfo" size="p5">
                      {t("AdditionalNotes")}
                    </Labels>
                    <TextAreas
                      disabled
                      id="additionalInfo"
                      name="additionalInfo"
                      value={previewedProjectData?.additionalInfo}
                      rows={3}
                      className="text-sm"
                    />
                    {previewedProjectData?.delay && (
                      <span className="absolute top-4 right-2 text-[8px]">
                        {`
                      was previously delayed by ${previewedProjectData?.delay}
                      `}
                      </span>
                    )}
                  </Holds>
                </Contents>
              </Holds>
              {/* Modal Footer with Start Project Button */}
              <Holds className="flex justify-center items-center row-start-7 row-end-8 h-full w-full">
                <Contents width="section">
                  {activeUsers.length === 0 ? (
                    <Buttons
                      background="green"
                      className="py-3"
                      onClick={StartLogAndSaveProject}
                    >
                      <Titles size="h2">{t("StartProject")}</Titles>
                    </Buttons>
                  ) : (
                    <Buttons
                      background="orange"
                      className="py-3"
                      onClick={StartLogAndSaveProject}
                    >
                      <Titles size="h2">{t("JoinProject")}</Titles>
                    </Buttons>
                  )}
                </Contents>
              </Holds>
            </Grids>
          </Holds>
        </NModals>
      </Holds>
    </Holds>
  );
}
