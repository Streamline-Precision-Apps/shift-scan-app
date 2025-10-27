"use server";
import { auth } from "@/auth";
import ViewTimeSheets from "@/app/(routes)/timesheets/view-timesheets";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { redirect } from "next/navigation";
import { Grids } from "@/components/(reusable)/grids";
import { Suspense } from "react";
import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { Forms } from "@/components/(reusable)/forms";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/(animations)/spinner";
import { Texts } from "@/components/(reusable)/texts";
import { getTranslations } from "next-intl/server";

export default async function Timesheets() {
  const session = await auth();
  if (!session) {
    redirect("/signin");
  }
  const id = session?.user.id;

  async function LoadingSkeleton() {
    const t = await getTranslations("TimeSheet");
    return (
      <>
        <Holds
          position={"row"}
          background={"white"}
          className="row-span-1 w-full h-full"
        >
          <TitleBoxes>
            <Holds
              position={"row"}
              className="w-full justify-center items-center gap-x-2"
            >
              <Titles size={"lg"}>{t("MyTimecards")}</Titles>
              <img
                src={"/timecards.svg"}
                alt={t("MyTimecards")}
                className="w-8 h-8"
              />
            </Holds>
          </TitleBoxes>
        </Holds>
        <Holds className="row-start-2 row-end-8 h-full bg-app-dark-blue rounded-[10px]">
          <Holds
            background={"darkBlue"}
            className={`px-4 h-20 row-start-1 row-end-2 rounded-b-none`}
          >
            <Forms className=" h-full">
              <div className="flex flex-col gap-2 w-full justify-center items-center">
                <Label htmlFor="date" className="text-white">
                  {t("EnterDate")}
                </Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  className="text-center w-full max-w-[220px] bg-white"
                />
              </div>
            </Forms>
          </Holds>

          <Holds
            background={"white"}
            size={"full"}
            className="h-full animate-pulse border-8 border-app-dark-blue"
          >
            <Holds
              position={"center"}
              size={"50"}
              className="h-full flex flex-col justify-center items-center "
            >
              <Spinner />
              <Texts size={"sm"} className="mt-4">
                {t("LoadingTimecards")}
              </Texts>
            </Holds>
          </Holds>
        </Holds>
      </>
    );
  }

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="h-full w-full">
          <Suspense fallback={<LoadingSkeleton />}>
            <ViewTimeSheets user={id} />
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
