import Spinner from "@/components/(animations)/spinner";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { NewTab } from "@/components/(reusable)/newTabs";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";

export default function LoadingEquipmentLogClient() {
  const t = useTranslations("Equipment");
  return (
    <>
      <Holds
        background={"white"}
        className={"row-start-1 row-end-2 h-full animate-pulse"}
      >
        <TitleBoxes>
          <Titles size={"lg"}>{t("Current")}</Titles>
        </TitleBoxes>
      </Holds>

      <Holds className={"row-start-2 row-end-8 h-full animate-pulse"}>
        <Holds className="h-full w-full ">
          <Grids rows={"10"} className="h-full w-full ">
            <Holds
              position={"row"}
              className="w-full row-start-1 row-end-2 gap-1"
            >
              <NewTab
                isActive={true}
                titleImage="/statusOngoingFilled.svg"
                titleImageAlt="Clock"
                isComplete={true}
              >
                <Titles size={"md"}>{t("CurrentLogs")}</Titles>
              </NewTab>
              <NewTab
                isActive={false}
                titleImage="/statusApprovedFilled.svg"
                titleImageAlt="Finished logs Icon"
                isComplete={true}
              >
                <Titles size={"md"}>{t("FinishedLogs")}</Titles>
              </NewTab>
            </Holds>

            <Holds
              background={"white"}
              className="h-full w-full row-start-2 row-end-11 rounded-t-none"
            >
              <Contents width={"section"}>
                <Grids rows={"7"} gap={"5"} className="h-full w-full py-5">
                  <Holds className="row-start-1 row-end-7 h-full justify-center items-center">
                    <Spinner />
                  </Holds>
                  <Holds className="row-start-7 row-end-8 h-full w-full gap-1 ">
                    <Buttons background={"darkGray"} className="w-full py-2">
                      <Titles size={"md"}>{t("LogNew")}</Titles>
                    </Buttons>
                  </Holds>
                </Grids>
              </Contents>
            </Holds>
          </Grids>
        </Holds>
      </Holds>
    </>
  );
}
