"use client";

import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import { useTranslations } from "next-intl";
import { NewTab } from "@/components/(reusable)/newTabs";
import { Titles } from "@/components/(reusable)/titles";
import { Contents } from "@/components/(reusable)/contents";
import { Buttons } from "@/components/(reusable)/buttons";
import Sliders from "@/components/(reusable)/sliders";

export default function TruckDriverSkeleton() {
  const t = useTranslations("TruckingAssistant");

  return (
    <Grids rows={"10"} className="h-full w-full animate-pulse">
      <Holds className={"w-full h-full rounded-t-none row-start-1 row-end-2"}>
        <Holds position={"row"} className=" h-full w-full gap-x-1">
          <NewTab
            titleImageSize="6"
            titleImage="/haulingFilled.svg"
            titleImageAlt="Truck"
            isActive={true}
            isComplete={false}
            isLoading={true}
          >
            <Titles size={"xs"}>{t("HaulingLogs")}</Titles>
          </NewTab>
          <NewTab
            titleImageSize="6"
            titleImage="/comments.svg"
            titleImageAlt={t("WorkDetails")}
            isActive={false}
            isComplete={false}
            isLoading={true}
          >
            <Titles size={"xs"}>{t("WorkDetails")}</Titles>
          </NewTab>
          <NewTab
            titleImageSize="6"
            titleImage="/stateFilled.svg"
            titleImageAlt="State Mileage"
            isActive={false}
            isComplete={false}
            isLoading={true}
          >
            <Titles size={"xs"}>{t("StateMileage")}</Titles>
          </NewTab>
          <NewTab
            titleImageSize="6"
            titleImage="/refuelFilled.svg"
            titleImageAlt="Refuel"
            isActive={false}
            isComplete={false}
            isLoading={true}
          >
            <Titles size={"xs"}>{t("RefuelLogs")}</Titles>
          </NewTab>
        </Holds>
      </Holds>

      <Holds
        className={
          "w-full h-full rounded-t-none rounded-lg row-start-2 row-end-11"
        }
      >
        <Grids rows={"7"} gap={"5"} className="h-full">
          <Holds
            background={"white"}
            className={"w-full h-full rounded-t-none row-start-1 row-end-2"}
          >
            <Contents width={"section"} className="h-full">
              <Holds position={"row"} className="h-full gap-2">
                <Holds size={"80"}>
                  <Sliders
                    leftTitle={"Material"}
                    rightTitle={"Equipment"}
                    activeTab={1}
                    setActiveTab={() => {}}
                  />
                </Holds>
                <Holds size={"20"} className="my-auto">
                  <Buttons
                    background={"green"}
                    className="py-1.5"
                    disabled={true}
                    shadow={"none"}
                  >
                    +
                  </Buttons>
                </Holds>
              </Holds>
            </Contents>
          </Holds>
          <Holds
            className={`w-full h-full row-start-2 row-end-8 bg-white rounded-lg animate-pulse`}
          ></Holds>
        </Grids>
      </Holds>
    </Grids>
  );
}
