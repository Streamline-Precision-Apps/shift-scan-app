import { createRefuelLog } from "@/actions/truckingActions";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import RefuelLogsList from "./RefuelLogsList";
import { useTranslations } from "next-intl";
import { Contents } from "@/components/(reusable)/contents";
import TruckTabOptions from "../TruckTabOptions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Refueled = {
  id: string;
  employeeEquipmentLogId: string | null;
  truckingLogId: string | null;
  gallonsRefueled: number | null;
  milesAtFueling: number | null;
  tascoLogId: string | null;
};

export default function RefuelLayout({
  truckingLog,
  refuelLogs,
  setRefuelLogs,
  activeTab,
  setActiveTab,
  isLoading,
  isComplete,
  startingMileage,
}: {
  truckingLog: string | undefined;
  refuelLogs: Refueled[] | undefined;
  setRefuelLogs: React.Dispatch<React.SetStateAction<Refueled[] | undefined>>;
  activeTab: 4;
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
  const AddRefuelLog = async () => {
    const formData = new FormData();
    formData.append("truckingLogId", truckingLog ?? "");
    try {
      const tempRefuelLog = await createRefuelLog(formData);
      setRefuelLogs((prev) => [
        {
          id: tempRefuelLog.id,
          employeeEquipmentLogId: tempRefuelLog.employeeEquipmentLogId ?? "",
          truckingLogId: tempRefuelLog.truckingLogId ?? "",
          gallonsRefueled: tempRefuelLog.gallonsRefueled ?? 0,
          milesAtFueling: tempRefuelLog.milesAtFueling ?? 0,
          tascoLogId: tempRefuelLog.tascoLogId ?? "",
        },
        ...(prev ?? []),
      ]);
    } catch (error) {
      console.error(t("ErrorAddingStateMileage"), error);
    }
  };

  return (
    <Grids rows={"7"} gap={"5"} className="h-full">
      <Holds
        background={"white"}
        className={"w-full h-full rounded-t-none row-start-1 row-end-2"}
      >
        <div className="h-full w-full flex items-center justify-between px-2">
          <Texts size={"sm"}>{t("DidYouRefuel")}</Texts>

          <Button
            size={"icon"}
            className="bg-app-green hover:bg-app-green   w-10  text-black py-1.5 px-3 border-[3px] border-black rounded-[10px] shadow-none"
            onClick={() => {
              AddRefuelLog();
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
          <RefuelLogsList
            refuelLogs={refuelLogs}
            setRefuelLogs={setRefuelLogs}
            startingMileage={startingMileage}
          />
        </Contents>
      </Holds>
    </Grids>
  );
}
