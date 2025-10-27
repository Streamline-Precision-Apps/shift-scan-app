import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import RefuelLogsList from "./RefuelLogsList";
import { createRefuelLog } from "@/actions/tascoActions";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import Spinner from "@/components/(animations)/spinner";

export type Refueled = {
  id: string;
  tascoLogId: string;
  gallonsRefueled: number;
};
export default function RefuelLayout({
  tascoLog,
  refuelLogs,
  setRefuelLogs,
}: {
  tascoLog: string | undefined;
  refuelLogs: Refueled[] | undefined;
  setRefuelLogs: React.Dispatch<React.SetStateAction<Refueled[] | undefined>>;
}) {
  const t = useTranslations("Tasco");
  const AddRefuelLog = async () => {
    if (!tascoLog) return;

    try {
      const newRefuelLog = await createRefuelLog({
        type: "tasco",
        parentId: tascoLog,
      });

      setRefuelLogs((prev) => [
        ...(prev ?? []),
        {
          id: newRefuelLog.id,
          employeeEquipmentLogId: newRefuelLog.employeeEquipmentLogId ?? "",
          tascoLogId: newRefuelLog.tascoLogId ?? "",
          gallonsRefueled: newRefuelLog.gallonsRefueled ?? 0,
          milesAtFueling: newRefuelLog.milesAtFueling ?? 0,
        },
      ]);
    } catch (error) {
      console.error("Error adding refuel log:", error);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <Grids rows={"8"} className="h-full w-full">
        <Holds
          background={"white"}
          className={
            "w-full h-full rounded-none row-start-1 row-end-2 border-b-[2px] border-neutral-200"
          }
        >
          <div className="h-full w-full flex items-center justify-between px-2">
            <Texts size={"sm"} className="">
              {t("DidYouRefuel?")}
            </Texts>

            <Button
              size={"icon"}
              className="bg-app-green hover:bg-app-green  w-10  text-black py-1.5 px-3 border-[3px] border-black rounded-[10px] shadow-none"
              onClick={AddRefuelLog}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </Holds>
        <Suspense
          fallback={
            <div className="w-[90%] mx-auto flex-1 row-start-2 row-end-9 overflow-hidden">
              <div className="flex flex-col overflow-y-auto h-full no-scrollbar pt-5 pb-5">
                <div className="w-full">
                  <div className="flex flex-col justify-center items-center p-4 text-gray-500">
                    <Spinner size={40} />
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <div className="w-[90%] mx-auto flex-1 row-start-2 row-end-9 overflow-hidden">
            <div className="flex flex-col overflow-y-auto h-full no-scrollbar pt-3 pb-5">
              <RefuelLogsList
                refuelLogs={refuelLogs}
                setRefuelLogs={setRefuelLogs}
              />
            </div>
          </div>
        </Suspense>
      </Grids>
    </div>
  );
}
