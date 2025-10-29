"use client";

import { Bases } from "@/app/v1/components/(reusable)/bases";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { Forms } from "@/app/v1/components/(reusable)/forms";
import { Label } from "@/app/v1/components/ui/label";
import { Input } from "@/app/v1/components/ui/input";
import Spinner from "@/app/v1/components/(animations)/spinner";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import ViewTimesheets from "@/app/v1/(routes)/timesheets/view-timesheets";
import { useUserStore } from "@/app/lib/store/userStore";
import { useTranslations } from "next-intl";

export default function Timesheets() {
  const { user } = useUserStore();

  const id = user?.id;

  function LoadingSkeleton() {
    const t = useTranslations("TimeSheet");
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

  if (!id)
    return (
      <Bases>
        <Contents>
          <Grids rows={"7"} gap={"5"} className="h-full w-full">
            <LoadingSkeleton />
          </Grids>
        </Contents>
      </Bases>
    );

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="h-full w-full">
          <ViewTimesheets user={id} />
        </Grids>
      </Contents>
    </Bases>
  );
}
