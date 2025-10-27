import { Holds } from "@/components/(reusable)/holds";
import { NewTab } from "@/components/(reusable)/newTabs";
import { Titles } from "@/components/(reusable)/titles";
import { TimesheetFilter } from "@/lib/types";
import { useTranslations } from "next-intl";

type TabType = {
  value: TimesheetFilter;
  label: string;
  icon: string;
};

interface ReviewTabOptionsProps {
  activeTab: TimesheetFilter;
  setActiveTab: (tab: TimesheetFilter) => void;
  tabs: TabType[];
  isLoading: boolean;
}

export default function ReviewTabOptions({
  activeTab,
  setActiveTab,
  tabs,
  isLoading,
}: ReviewTabOptionsProps) {
  const t = useTranslations("Clock");

  return (
    <Holds position={"row"} className="h-full w-full gap-x-1.5">
      {tabs.map((tab) => (
        <NewTab
          key={tab.value}
          titleImage={tab.icon}
          titleImageAlt={tab.label}
          onClick={() => setActiveTab(tab.value)}
          isActive={activeTab === tab.value}
          isComplete={true}
          isLoading={isLoading}
          animatePulse={isLoading}
          activeColor="white"
          inActiveColor="lightGray"
          activeBorder="default"
          inActiveBorder="transparent"
        >
          <Titles size={"h4"}>{tab.label}</Titles>
        </NewTab>
      ))}
    </Holds>
  );
}
