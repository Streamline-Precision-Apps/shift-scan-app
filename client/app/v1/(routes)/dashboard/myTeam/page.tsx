"use client";

import Spinner from "@/app/v1/components/(animations)/spinner";
import { Suspense } from "react";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequestNoResCheck } from "@/app/lib/utils/api-Utils";
import { useUserStore } from "@/app/lib/store/userStore";
import { useTeamStore } from "@/app/lib/store/teamStore";
import { PullToRefresh } from "@/app/v1/components/(animations)/pullToRefresh";

// Zod schema for Team data
const countSchema = z.object({
  Users: z.number(),
});

// Define the main schema
const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  _count: countSchema,
});

// Zod schema for the response containing an array of Teams
const TeamsResponseSchema = z.array(TeamSchema);

// Local type for what we store and render
type TeamListItem = {
  id: string;
  name: string;
  userCount: number;
};

export default function MyTeam() {
  const { user } = useUserStore();
  const userId = user?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("rPath");
  const t = useTranslations("MyTeam");
  const [myTeams, setMyTeams] = useState<TeamListItem[]>([]);
  const { teams } = useTeamStore();
  const setTeams = useTeamStore((state) => state.setTeams);
  const [isLoading, setIsLoading] = useState(true);
  const [animateList, setAnimateList] = useState(false);

  const animationClass =
    "transition-all duration-700 ease-out opacity-0 translate-y-[-30px]";
  const animationClassActive = "opacity-100 translate-y-0";

  const refreshTeams = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    fetchTeamsFromApi();
  };
  // Extracted API fetch logic for reuse (normal load and pull-to-refresh)
  const fetchTeamsFromApi = useCallback(async () => {
    if (!userId) return;
    setAnimateList(false);
    setIsLoading(true);
    try {
      const response = await apiRequestNoResCheck(
        `/api/v1/user/${userId}/teams`,
        "GET"
      );
      if (response.ok) {
        const myTeamsData = await response.json();
        // Validate fetched data using Zod
        try {
          TeamsResponseSchema.parse(myTeamsData.data);
          // Store only id, name, and user count in Zustand
          const teamsForStore = myTeamsData.data.map((team: any) => ({
            id: team.id,
            name: team.name,
            userCount: team._count?.Users ?? 0,
          }));
          setTeams(teamsForStore);
          setMyTeams(teamsForStore);
          setTimeout(() => setAnimateList(true), 100);
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error("Validation error in team data:", error);
            return;
          }
        }
      } else {
        console.error("Failed to fetch crew data");
      }
    } catch (error) {
      console.error("Error fetching crew data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, setTeams]);

  useEffect(() => {
    if (!userId) return;
    // Try Zustand store first
    if (teams && teams.length > 0) {
      setMyTeams(teams);
      setIsLoading(false);
      return;
    }
    // Fallback to API if store is empty
    fetchTeamsFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="h-full w-full">
          <Holds
            background={"white"}
            className="row-start-1 row-end-2 h-full w-full"
          >
            <TitleBoxes
              onClick={() => {
                if (url) {
                  router.push(url);
                }
              }}
              position={"row"}
              className="w-full h-full justify-center items-center"
            >
              <Titles position="right" size={"xl"}>
                {t("Teams-Title")}
              </Titles>
              <img
                src={"/team.svg"}
                alt={`${t("Teams-Logo-Title")}`}
                className="h-7 w-7 object-contain "
              />
            </TitleBoxes>
          </Holds>
          <Suspense
            fallback={
              <Holds
                background={"white"}
                className="row-start-2 row-end-8 h-full"
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
                className="row-start-2 row-end-8 h-full"
              >
                <Contents width={"section"}>
                  <Holds className="my-auto">
                    <Spinner />
                  </Holds>
                </Contents>
              </Holds>
            ) : (
              <Holds
                background={"white"}
                className="row-start-2 row-end-8 h-full py-5"
              >
                <Contents
                  width={"section"}
                  className={
                    `row-start-2 row-end-8 w-[90%] h-full  ${animationClass} ` +
                    (animateList ? animationClassActive : "")
                  }
                >
                  <Grids rows={"7"} gap={"5"} className="h-full w-full">
                    <Holds className="row-start-1 row-end-7 h-full w-full ">
                      <PullToRefresh
                        textColor="text-darkBlue"
                        bgColor="bg-darkBlue/70"
                        onRefresh={refreshTeams}
                        refreshingText=""
                        containerClassName="w-full h-full px-2 "
                      >
                        {myTeams.map((team) => (
                          <Buttons
                            key={team.id}
                            background="lightBlue"
                            href={`/v1/dashboard/myTeam/${team.id}?rPath=${url}`}
                            className="py-3 w-full relative"
                          >
                            <Titles size="lg">{team.name}</Titles>
                            <Texts
                              size="md"
                              className="absolute top-1/2 transform -translate-y-1/2 right-2"
                            >
                              ({team.userCount})
                            </Texts>
                          </Buttons>
                        ))}
                      </PullToRefresh>
                    </Holds>
                    <Holds className="row-start-7 row-end-8 w-full ">
                      <Buttons
                        background="green"
                        href={`/dashboard/myTeam/timecards?rPath=${url}`}
                        className=" w-full py-3"
                      >
                        <Titles size="lg">{t("TimeCards")}</Titles>
                      </Buttons>
                    </Holds>
                  </Grids>
                </Contents>
              </Holds>
            )}
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
