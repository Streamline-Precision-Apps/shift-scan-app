"use client";

import Spinner from "@/components/(animations)/spinner";
import { Suspense } from "react";
import { Bases } from "@/components/(reusable)/bases";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";
import { Texts } from "@/components/(reusable)/texts";
import { useRouter, useSearchParams } from "next/navigation";

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

type Team = z.infer<typeof TeamSchema>;

export default function Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("rPath");
  const t = useTranslations("MyTeam");
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/getTeam");

        if (response.ok) {
          const myTeamsData = await response.json();

          // Validate fetched data using Zod
          try {
            TeamsResponseSchema.parse(myTeamsData);
            setMyTeams(myTeamsData);
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
    };

    if (sessionStatus === "authenticated") {
      fetchCrew();
    }
  }, [sessionStatus]);

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
                <Contents width={"section"}>
                  <Grids rows={"7"} gap={"5"}>
                    <Holds className="row-start-1 row-end-7 h-full w-full">
                      {myTeams.map((teams) => (
                        <Holds className="w-full" key={teams.id}>
                          <Buttons
                            background="lightBlue"
                            href={`/dashboard/myTeam/${teams.id}?rPath=${url}`}
                            className="py-3 w-full relative"
                          >
                            <Titles size="lg">{teams.name}</Titles>
                            <Texts
                              size="md"
                              className="absolute top-1/2 transform -translate-y-1/2 right-2"
                            >
                              ({teams._count.Users})
                            </Texts>
                          </Buttons>
                        </Holds>
                      ))}
                    </Holds>
                    <Holds className="row-start-7 row-end-8 w-full">
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
