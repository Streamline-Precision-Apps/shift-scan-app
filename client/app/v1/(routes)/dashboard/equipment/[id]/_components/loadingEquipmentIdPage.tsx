import Spinner from "@/app/v1/components/(animations)/spinner";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { NewTab } from "@/app/v1/components/(reusable)/newTabs";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { useTranslations } from "next-intl";

export default function LoadingEquipmentIdPage() {
  const t = useTranslations("Equipment");
  return (
    <>
      <Holds
        background="white"
        className={"row-span-1 h-full justify-center animate-pulse"}
      >
        <TitleBoxes>
          <Titles size={"md"}>{"Loading..."}</Titles>
        </TitleBoxes>
      </Holds>
      <Holds className="row-start-2 row-end-8 h-full w-full">
        <Grids rows={"10"} className="h-full w-full ">
          <Holds
            position={"row"}
            className={`row-start-1 row-end-2 h-full w-full gap-1 animate-pulse`}
          >
            <NewTab
              isActive={true}
              titleImage="/form.svg"
              titleImageAlt=""
              isComplete={true}
              isLoading={true}
            >
              {t("UsageData")}
            </NewTab>
            <NewTab
              isActive={false}
              titleImage="/broken.svg"
              titleImageAlt=""
              isComplete={true}
              isLoading={true}
            >
              {t("MaintenanceLog")}
            </NewTab>
          </Holds>
          <Holds
            background="white"
            className={
              "row-start-2 row-end-11 h-full rounded-t-none animate-pulse"
            }
          >
            <Holds className="h-full w-full justify-center">
              <Spinner size={20} />
            </Holds>
          </Holds>
        </Grids>
      </Holds>
    </>
  );
}
