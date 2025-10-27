"use client";
import { use, useState } from "react";
import useProjectData from "./_components/useProjectData";

import ProjectTabs from "./_components/ProjectTabs";
import ReceivedInfoTab from "./_components/receivedInfo";
import CommentsTab from "./_components/myComment";
import FinishProjectModal from "./_components/FinishProjectModal";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Texts } from "@/components/(reusable)/texts";
import { useRouter } from "next/navigation";
import { PullToRefresh } from "@/components/(animations)/pullToRefresh";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [activeTab, setActiveTab] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const id = use(params).id; // Use the id from the params promise

  const {
    loading,
    projectData,
    laborHours,
    activeUsers,
    myMaintenanceLogs,
    myComment,
    setMyComment,
    handleLeaveProject,
    handleFinishProject,
    setSolution,
    solution,
    diagnosedProblem,
    setDiagnosedProblem,
    handleRefresh,
  } = useProjectData(id);

  const router = useRouter();
  return (
    <Bases>
      <Contents>
        <Grids rows="7" gap="5" className="h-full">
          {!modalOpen && (
            <Holds background="white" className="row-span-1 h-full">
              <TitleBoxes onClick={() => router.push("/dashboard")}>
                <Texts>{projectData?.title || ""}</Texts>
              </TitleBoxes>
            </Holds>
          )}
          <Holds className="h-full row-span-6">
            <ProjectTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              loading={loading}
            />
            <PullToRefresh
              onRefresh={handleRefresh}
              textColor="text-app-dark-blue"
            >
              {/* Tab Content */}
              {activeTab === 1 && (
                <ReceivedInfoTab
                  loading={loading}
                  problemReceived={projectData?.problemReceived || ""}
                  additionalNotes={projectData?.additionalNotes || ""}
                  myComment={myComment}
                  hasBeenDelayed={projectData?.hasBeenDelayed || false}
                  onLeaveProject={handleLeaveProject}
                />
              )}

              {activeTab === 2 && (
                <CommentsTab
                  activeUsers={activeUsers}
                  myComment={myComment}
                  setMyComment={setMyComment}
                  loading={loading}
                  onFinishProject={() => setModalOpen(true)}
                  myMaintenanceLogs={myMaintenanceLogs}
                />
              )}
            </PullToRefresh>
            <FinishProjectModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title={projectData?.title || ""}
              laborHours={laborHours}
              onSubmit={handleFinishProject}
              solution={solution}
              diagnosedProblem={diagnosedProblem}
              setDiagnosedProblem={setDiagnosedProblem}
              setSolution={setSolution}
            />
          </Holds>
        </Grids>
      </Contents>
    </Bases>
  );
}
