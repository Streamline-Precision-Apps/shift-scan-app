import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import Sliders from "@/components/(reusable)/sliders";

import { EndingMileage } from "./EndingMileage";
// import TruckDriverNotes from "./TruckDriverNotes";
import { Contents } from "@/components/(reusable)/contents";
import { useState } from "react";
import TruckDriverNotes from "./TruckDriverNotes";
import { useTranslations } from "next-intl";
import { set } from "lodash";
import { setStartingMileage } from "@/actions/cookieActions";

type StateMileage = {
  id: string;
  truckingLogId: string;
  state?: string;
  stateLineMileage?: number;
  createdAt?: Date;
};

type Refueled = {
  id: string;
  employeeEquipmentLogId: string | null;
  truckingLogId: string | null;
  gallonsRefueled: number | null;
  milesAtFueling: number | null;
  tascoLogId: string | null;
};

type LaborType = {
  id: string;
  type: string | null;
  startTime: string;
  endTime: string | null;
};

export default function WorkDetails({
  notes,
  setNotes,
  endMileage,
  setEndMileage,
  isLoading,
  timeSheetId,
  startingMileage,
  setStartingMileage,
  stateMileage,
  refuelLogs,
}: {
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  endMileage: number | null;
  setEndMileage: React.Dispatch<React.SetStateAction<number | null>>;
  isLoading: boolean;
  timeSheetId: string | undefined;
  startingMileage: number | null;
  setStartingMileage: React.Dispatch<React.SetStateAction<number | null>>;
  stateMileage?: StateMileage[];
  refuelLogs?: Refueled[];
}) {
  const t = useTranslations("TruckingAssistant");

  // Add state for activeTab (default to 1)
  const [activeTab, setActiveTab] = useState(1);

  return (
    <Holds background={"white"} className={"w-full h-full rounded-t-none"}>
      <Contents width={"section"} className="h-full">
        <div className="flex flex-col gap-3 py-3 overflow-y-auto no-scrollbar h-full">
          <EndingMileage
            truckingLog={timeSheetId}
            endMileage={endMileage ?? null}
            setEndMileage={setEndMileage}
            startingMileage={startingMileage}
            setStartingMileage={setStartingMileage}
            stateMileage={stateMileage}
            refuelLogs={refuelLogs}
          />

          <TruckDriverNotes
            truckingLog={timeSheetId}
            notes={notes}
            setNotes={setNotes}
          />
        </div>
      </Contents>
    </Holds>
  );
}
