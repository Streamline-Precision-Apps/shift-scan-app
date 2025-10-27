import { Holds } from "@/components/(reusable)/holds";
import { NewTab } from "@/components/(reusable)/newTabs";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";

export default function TruckTabOptions({
  activeTab,
  setActiveTab,
  isLoading,
  isComplete,
}: {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  isLoading: boolean;
  isComplete: {
    haulingLogsTab: boolean;
    notesTab: boolean;
    stateMileageTab: boolean;
    refuelLogsTab: boolean;
  };
}) {
  const t = useTranslations("TruckingAssistant");

  return (
    <Holds position={"row"} className=" h-full w-full gap-x-1">
      <NewTab
        titleImageSize="6"
        titleImage="/haulingFilled.svg"
        titleImageAlt="Truck"
        onClick={() => setActiveTab(1)}
        isActive={activeTab === 1}
        isComplete={isComplete.haulingLogsTab}
        isLoading={isLoading}
      >
        <Titles size={"xs"}>{t("HaulingLogs")}</Titles>
      </NewTab>
      <NewTab
        titleImageSize="6"
        titleImage="/comments.svg"
        titleImageAlt={t("WorkDetails")}
        onClick={() => setActiveTab(2)}
        isActive={activeTab === 2}
        isComplete={isComplete.notesTab}
        isLoading={isLoading}
      >
        <Titles size={"xs"}>{t("WorkDetails")}</Titles>
      </NewTab>
      <NewTab
        titleImageSize="6"
        titleImage="/stateFilled.svg"
        titleImageAlt="State Mileage"
        onClick={() => setActiveTab(3)}
        isActive={activeTab === 3}
        isComplete={isComplete.stateMileageTab}
        isLoading={isLoading}
      >
        <Titles size={"xs"}>{t("StateMileage")}</Titles>
      </NewTab>
      <NewTab
        titleImageSize="6"
        titleImage="/refuelFilled.svg"
        titleImageAlt="Refuel"
        onClick={() => setActiveTab(4)}
        isActive={activeTab === 4}
        isComplete={isComplete.refuelLogsTab}
        isLoading={isLoading}
      >
        <Titles size={"xs"}>{t("RefuelLogs")}</Titles>
      </NewTab>
    </Holds>
  );
}
