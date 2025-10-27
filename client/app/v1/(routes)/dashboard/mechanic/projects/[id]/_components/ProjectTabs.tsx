"use client";
import { Holds } from "@/components/(reusable)/holds";
import { NewTab } from "@/components/(reusable)/newTabs";
import { useTranslations } from "next-intl";

export default function ProjectTabs({
  activeTab,
  setActiveTab,
  loading,
}: {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  loading: boolean;
}) {
  const t = useTranslations("MechanicWidget");
  return (
    <Holds position="row" className="row-span-1 gap-1">
      <NewTab
        onClick={() => setActiveTab(1)}
        isActive={activeTab === 1}
        titleImage="/information.svg"
        titleImageAlt=""
        isComplete={true}
      >
        {t("ReceivedInfo")}
      </NewTab>
      <NewTab
        onClick={() => setActiveTab(2)}
        isActive={activeTab === 2}
        titleImage="/comment.svg"
        titleImageAlt=""
        isComplete={true}
      >
        {t("MyComments")}
      </NewTab>
    </Holds>
  );
}
