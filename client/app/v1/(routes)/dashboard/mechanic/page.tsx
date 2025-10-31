"use client";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MechanicDisplayList } from "./_components/mechanic-display-list";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { getTranslations } from "next-intl/server";

export default async function Mechanic() {
  // const permission = session.user.permission;
  // const isManager = ["ADMIN", "SUPERADMIN", "MANAGER"].includes(permission);
  const t = await getTranslations("MechanicWidget");

  return (
    <Bases>
      <Contents>
        {/* <MechanicDisplay isManager={isManager} /> */}
        <Suspense
          fallback={
            <Grids rows="7" gap="5">
              {/* Header */}
              <Holds
                background={"white"}
                className={`row-start-1 row-end-2 h-full `}
              >
                <TitleBoxes>
                  <Titles size="lg">{t("Projects")}</Titles>
                </TitleBoxes>
              </Holds>

              <Holds
                background={"white"}
                className={`row-start-2 row-end-8 h-full animate-pulse`}
              >
                <Contents width={"section"} className="py-3">
                  {/* List of Projects with Pull-to-refresh */}
                  <div className="h-full border-gray-200 bg-gray-50 border rounded-md px-2 overflow-hidden"></div>
                  <div className="h-12 mt-2 flex items-center">
                    <Buttons
                      shadow={"none"}
                      background={"green"}
                      className={`h-10 w-full opacity-70`}
                    >
                      <Titles size={"md"}>{t("StartProject")}</Titles>
                    </Buttons>
                  </div>
                </Contents>
              </Holds>
            </Grids>
          }
        >
          <MechanicDisplayList />
        </Suspense>
      </Contents>
    </Bases>
  );
}
