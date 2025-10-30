"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/app/v1/components/(animations)/spinner";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Images } from "@/app/v1/components/(reusable)/images";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import React, { use, useEffect, useState, Suspense } from "react";

import { z } from "zod";
import { apiRequest, apiRequestNoResCheck } from "@/app/lib/utils/api-Utils";
import { useUserStore } from "@/app/lib/store/userStore";
import { useTeamStore } from "@/app/lib/store/teamStore";
import { PullToRefresh } from "@/app/v1/components/(animations)/pullToRefresh";

const CrewMemberSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image: z.string().nullable(),
  clockedIn: z.boolean(),
});

// Zod schema for the API response
const CrewApiResponseSchema = z.tuple([
  z.array(CrewMemberSchema), // crew members array
  z.string(), // crew type
]);

type CrewMember = z.infer<typeof CrewMemberSchema>;

export default function Content({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Drop-in animation: starts above and fades in, then settles
  const animationClass = "opacity-0 drop-in-animate";
  const animationClassActive = "opacity-100 drop-in-animate-active";

  // Add drop-in animation CSS
  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes dropIn {
        0% {
          opacity: 0;
          transform: translateY(-40px);
        }
        60% {
          opacity: 1;
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .drop-in-animate {
        transition: none;
        opacity: 0;
        transform: translateY(-40px);
      }
      .drop-in-animate-active {
        animation: dropIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const { user } = useUserStore();
  const userId = user?.id;

  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [animateList, setAnimateList] = useState(false);
  const updateTeamWorkers = useTeamStore((state) => state.updateTeamWorkers);

  const [crewType, setCrewType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [titles, setTitles] = useState<string>("");
  const t = useTranslations("MyTeam");
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("rPath");

  const { id } = use(params);

  useEffect(() => {
    if (!userId || !id) return;
    let staticTeamInfo: { id: string; name: string; crewType: string } | null =
      null;
    const fetchCrewData = async () => {
      try {
        setIsLoading(true);
        setAnimateList(false);
        // Fetch Cache information (static info)
        const crewRes = await apiRequestNoResCheck(
          `/api/v1/user/${userId}/crew/${id}`,
          "GET"
        );
        const json = await crewRes.json();
        const { crewMembers, crewType } = json.data;

        // Store static team info in Zustand (only id, name, crewType)
        staticTeamInfo = { id, name: crewType + " Team", crewType };
        updateTeamWorkers(
          id,
          (crewMembers || []).map((m: CrewMember) => ({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            status: false,
          }))
        );

        // Fetch dynamic crew status (always on every render)
        const status = await apiRequestNoResCheck(
          `/api/v1/user/${userId}/crew/${id}/online`,
          "GET"
        );
        const statusData = await status.json();

        const usersArray = Array.isArray(statusData?.Users)
          ? statusData.Users
          : [];
        const membersWithStatus = (crewMembers || []).map(
          (member: CrewMember) => {
            const status = usersArray.find(
              (u: CrewMember) => u.id === member.id
            );
            return { ...member, clockedIn: status?.clockedIn ?? false };
          }
        );

        setCrewMembers(membersWithStatus);
        setCrewType(crewType || "");
        // Update worker status in Zustand store
        updateTeamWorkers(
          id,
          membersWithStatus.map((m: CrewMember) => ({
            id: m.id,
            firstName: m.firstName,
            lastName: m.lastName,
            status: m.clockedIn,
          }))
        );
        // Trigger animation after a short delay to ensure DOM update
        setTimeout(() => setAnimateList(true), 100);
      } catch (error) {
        console.error("Error fetching crew data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrewData();
  }, [userId, id]);

  // On first render, load all teams into Zustand store
  useEffect(() => {
    if (!userId) return;
    const fetchTeams = async () => {
      try {
        const data = await apiRequest(`/api/v1/user/${userId}/teams`, "GET");
        // Store all teams in Zustand (id, name, crewType, empty workers)

        // Set the title for this page
        const teamName = data.data.find((team: any) => team.id === id)?.name;
        setTitles(teamName);
      } catch (error) {
        console.error("Error fetching team name:", error);
      }
    };
    fetchTeams();
  }, [userId]);

  // Refreshes crew members, their online status, and updates Zustand store
  const refreshTeams = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!userId || !id) return;
    setIsLoading(true);
    try {
      // Fetch crew members and crew type
      const crewRes = await apiRequestNoResCheck(
        `/api/v1/user/${userId}/crew/${id}`,
        "GET"
      );
      const json = await crewRes.json();
      const { crewMembers, crewType } = json.data;

      // Fetch online status
      const status = await apiRequestNoResCheck(
        `/api/v1/user/${userId}/crew/${id}/online`,
        "GET"
      );
      const statusData = await status.json();
      const usersArray = Array.isArray(statusData?.Users)
        ? statusData.Users
        : [];
      const membersWithStatus = (crewMembers || []).map(
        (member: CrewMember) => {
          const status = usersArray.find((u: CrewMember) => u.id === member.id);
          return { ...member, clockedIn: status?.clockedIn ?? false };
        }
      );

      setCrewMembers(membersWithStatus);
      setCrewType(crewType || "");
      // Update worker status in Zustand store
      updateTeamWorkers(
        id,
        membersWithStatus.map((m: CrewMember) => ({
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          status: m.clockedIn,
        }))
      );
      // Optionally, update the team name/title if needed
      setTitles(crewType + " Team");
      setAnimateList(false);
      setTimeout(() => setAnimateList(true), 100);
    } catch (error) {
      console.error("Error refreshing crew data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="h-full">
          <Holds background={"white"} className="row-start-1 row-end-2 h-full">
            <TitleBoxes
              onClick={() => router.push(`/v1/dashboard/myTeam?rPath=${url}`)}
            >
              <Titles size={"lg"}>{titles}</Titles>
            </TitleBoxes>
          </Holds>
          <Suspense
            fallback={
              <Holds
                background={"white"}
                className="row-start-2 row-end-8 py-5  h-full"
              >
                <Contents width={"section"}>
                  <Holds className="my-auto">
                    <Spinner />
                  </Holds>
                </Contents>
              </Holds>
            }
          >
            {isLoading ? (
              <Holds
                background={"white"}
                className="row-start-2 row-end-8 py-5  h-full"
              >
                <Contents width={"section"}>
                  <Holds className="my-auto">
                    <Spinner />
                  </Holds>
                </Contents>
              </Holds>
            ) : (
              <>
                <Holds
                  background={"white"}
                  className="row-start-2 row-end-8 py-5 h-full"
                >
                  <Grids rows={"7"} gap={"5"} className="h-full w-full">
                    <Holds
                      className={`row-start-1 row-end-8 h-full w-full overflow-y-auto no-scrollbar`}
                    >
                      <PullToRefresh
                        textColor="text-darkBlue"
                        bgColor="bg-darkBlue/70"
                        onRefresh={refreshTeams}
                        refreshingText=""
                        containerClassName="h-full"
                      >
                        <Contents
                          width={"section"}
                          className={
                            `${animationClass}` +
                            (animateList ? ` ${animationClassActive}` : "")
                          }
                        >
                          {crewMembers.map((member) => (
                            <Holds key={member.id} className="w-full pb-3.5 ">
                              <Buttons
                                href={`/v1/dashboard/myTeam/${id}/employee/${member.id}?rPath=${url}`}
                                background="lightBlue"
                                className="w-full h-full py-2 relative"
                              >
                                <Holds
                                  position={"row"}
                                  className="w-full gap-x-4"
                                >
                                  <Holds className="w-24 relative">
                                    <Images
                                      titleImg={
                                        member.image
                                          ? member.image
                                          : "/profileEmpty.svg"
                                      }
                                      titleImgAlt="profileFilled"
                                      loading="lazy"
                                      className={`rounded-full max-w-12 h-auto object-contain ${
                                        member.image
                                          ? "border-[3px] border-black"
                                          : ""
                                      } `}
                                    />
                                    <Holds
                                      background={
                                        member.clockedIn ? "green" : "gray"
                                      }
                                      className="absolute top-1 right-0 w-3 h-3 rounded-full p-1.5 border-[3px] border-black"
                                    />
                                  </Holds>
                                  <Holds className="w-full">
                                    <Titles position={"left"} size="lg">
                                      {member.firstName} {member.lastName}
                                    </Titles>
                                  </Holds>
                                </Holds>
                              </Buttons>
                            </Holds>
                          ))}
                        </Contents>
                      </PullToRefresh>
                    </Holds>
                    {/* {crewType === "Mechanic" && (
                      <Holds className="row-start-7 row-end-8 ">
                        <Contents width={"section"}>
                          <Buttons
                            background={"green"}
                            className="w-full py-3"
                            href={`/dashboard/mechanic?rUrl=/dashboard/myTeam/${id}?rPath=${url}`}
                          >
                            <Titles size={"h2"}>{t("ManageProjects")}</Titles>
                          </Buttons>
                        </Contents>
                      </Holds>
                    )} */}
                  </Grids>
                </Holds>
              </>
            )}
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
