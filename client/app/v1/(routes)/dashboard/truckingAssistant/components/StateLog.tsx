import { createStateMileage } from "@/actions/truckingActions";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import StateMileageList from "./StateMileageList";
import { useTranslations } from "next-intl";
import { StateOptions } from "@/data/stateValues";
import { Contents } from "@/components/(reusable)/contents";
import TruckTabOptions from "../TruckTabOptions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type StateMileage = {
  id: string;
  truckingLogId: string;
  state?: string;
  stateLineMileage?: number;
  createdAt?: Date;
};
export default function StateLog({
  StateMileage,
  setStateMileage,
  truckingLog,
  activeTab,
  setActiveTab,
  isLoading,
  isComplete,
  startingMileage,
}: {
  truckingLog: string | undefined;
  StateMileage: StateMileage[] | undefined;
  setStateMileage: React.Dispatch<
    React.SetStateAction<StateMileage[] | undefined>
  >;
  activeTab: 3;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  isComplete: {
    haulingLogsTab: boolean;
    notesTab: boolean;
    stateMileageTab: boolean;
    refuelLogsTab: boolean;
  };
  startingMileage: number | null;
}) {
  const t = useTranslations("TruckingAssistant");
  const AddStateMileage = async () => {
    const formData = new FormData();
    formData.append("truckingLogId", truckingLog ?? "");
    try {
      const tempStateMileage = await createStateMileage(formData);
      setStateMileage((prev) => [
        {
          id: tempStateMileage.id,
          truckingLogId: tempStateMileage.truckingLogId ?? "",
          state: tempStateMileage.state ?? "",
          stateLineMileage: tempStateMileage.stateLineMileage ?? 0,
          createdAt: new Date(),
        },
        ...(prev ?? []),
      ]);
    } catch (error) {
      console.error(t("ErrorAddingStateMileage"), error);
    }
  };

  return (
    <>
      <Grids rows={"7"} gap={"5"} className="h-full">
        <Holds
          background={"white"}
          className={"w-full h-full rounded-t-none row-start-1 row-end-2"}
        >
          <div className="h-full w-full flex items-center justify-between px-2">
            <Texts size={"sm"}>{t("DidYouLeaveIdaho")}</Texts>

            <Button
              size={"icon"}
              className="bg-app-green w-10 hover:bg-app-green text-black py-1.5 px-3 border-[3px] border-black rounded-[10px] shadow-none"
              onClick={() => {
                AddStateMileage();
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </Holds>
        <Holds
          background={"white"}
          className={`${
            isLoading
              ? "w-full h-full row-start-2 row-end-8  animate-pulse"
              : "w-full h-full row-start-2 row-end-8 overflow-y-auto no-scrollbar pt-5 "
          }`}
        >
          <Contents width={"section"}>
            <StateMileageList
              StateOptions={StateOptions}
              StateMileage={StateMileage}
              setStateMileage={setStateMileage}
              startingMileage={startingMileage}
            />
          </Contents>
        </Holds>
      </Grids>
    </>
  );
}
