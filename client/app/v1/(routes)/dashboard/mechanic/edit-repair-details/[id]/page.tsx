"use client";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { use, useEffect, useRef, useState } from "react";
import MechanicEditPage from "./_components/MechanicEditPage";
import MechanicEmployeeLogs from "./_components/MechanicEmployeeLogs";
import { useTranslations } from "next-intl";
import { Titles } from "@/components/(reusable)/titles";
import { useRouter } from "next/navigation";
import { NewTab } from "@/components/(reusable)/newTabs";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";

type Equipment = {
  id: string;
  name: string;
};
type RepairDetails = {
  id: string;
  equipmentId: string;
  equipmentIssue: string;
  additionalInfo: string;
  problemDiagnosis: string;
  solution: string;
  location: string;
  priority: string;
  createdBy: string;
  createdAt: Date;
  hasBeenDelayed: boolean;
  repaired: boolean;
  delay: Date | null;
  delayReasoning?: string;
  totalHoursLaboured: number;
  Equipment: Equipment;
};
type User = {
  firstName: string;
  lastName: string;
};
type MaintenanceLog = {
  id: string;
  startTime: string;
  endTime: string;
  comment: string;
  User: User;
};
type LogItem = {
  id: string;
  MaintenanceLogs: MaintenanceLog[];
};

export default function EditRepairDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [activeTab, setActiveTab] = useState(1);
  const [repairDetails, setRepairDetails] = useState<RepairDetails>();
  const [logs, setLogs] = useState<LogItem[]>();
  const previousLogsRef = useRef<LogItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalHours, setTotalHours] = useState<number>(0);
  const t = useTranslations("MechanicWidget");
  const router = useRouter();
  const id = use(params).id;

  const fetchRepairDetails = async () => {
    setLoading(true);

    try {
      const [repairDetailsRes, logsRes] = await Promise.all([
        fetch(`/api/getRepairDetails/${id}`).then((res) => res.json()),
        fetch(`/api/getMaintenanceLogs/${id}`).then((res) => res.json()),
      ]);

      // ✅ Check if logs have changed
      if (!areLogsEqual(previousLogsRef.current, logsRes)) {
        setRepairDetails(repairDetailsRes);
        setLogs(logsRes);
        previousLogsRef.current = logsRes;

        // ✅ Calculate total hours
        const totalHours = logsRes.reduce((total: number, log: LogItem) => {
          return (
            total +
            log.MaintenanceLogs.reduce(
              (
                subTotal: number,
                log: { startTime: string; endTime: string | null },
              ) => {
                const startTime = new Date(log.startTime);
                const endTime = log.endTime
                  ? new Date(log.endTime)
                  : new Date();
                const hours =
                  (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                return subTotal + hours;
              },
              0,
            )
          );
        }, 0);

        setTotalHours(totalHours);
      }
    } catch (error) {
      console.error("Error fetching repair details:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Deep comparison function for logs
  const areLogsEqual = (prevLogs: LogItem[] | null, newLogs: LogItem[]) => {
    if (!prevLogs) return false;
    return JSON.stringify(prevLogs) === JSON.stringify(newLogs);
  };

  useEffect(() => {
    fetchRepairDetails(); // Initial fetch
  }, [id, activeTab === 2]);

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="h-full">
          <Holds
            background={"white"}
            className={
              repairDetails?.Equipment
                ? "row-start-1 row-end-2 h-full justify-center p-3  "
                : "row-start-1 row-end-2 h-full justify-center p-3 animate-pulse"
            }
          >
            <TitleBoxes onClick={() => router.push("/dashboard/mechanic")}>
              <Titles size={"h4"}>
                {repairDetails?.Equipment
                  ? `${
                      repairDetails.Equipment.name.length > 20
                        ? repairDetails.Equipment.name.slice(0, 20) + "..."
                        : repairDetails.Equipment.name
                    }`
                  : ""}
              </Titles>
            </TitleBoxes>
          </Holds>
          <Holds
            className={
              repairDetails?.Equipment
                ? "row-start-2 row-end-8 h-full "
                : "row-start-2 row-end-8 h-full animate-pulse"
            }
          >
            <Holds className="h-full">
              <Holds position={"row"} className="h-fit gap-1.5">
                <NewTab
                  onClick={() => setActiveTab(1)}
                  isActive={activeTab === 1}
                  titleImage="/information.svg"
                  titleImageAlt={""}
                  isComplete={true}
                  animatePulse={loading}
                >
                  {t("ProjectInfo")}
                </NewTab>
                <NewTab
                  onClick={() => setActiveTab(2)}
                  isActive={activeTab === 2}
                  titleImage="/statusOngoing.svg"
                  titleImageAlt={""}
                  isComplete={true}
                  animatePulse={loading}
                >
                  {t("Logs")}
                </NewTab>
              </Holds>

              <Holds
                background={"white"}
                className={`rounded-t-none h-full pt-3 pb-5 overflow-y-scroll ${
                  loading ? "animate-pulse" : ""
                }`}
              >
                {activeTab === 1 && (
                  <MechanicEditPage
                    repairDetails={repairDetails}
                    setRepairDetails={setRepairDetails}
                    totalLogs={logs ? logs[0].MaintenanceLogs.length : 0}
                  />
                )}
                {activeTab === 2 && (
                  <MechanicEmployeeLogs
                    logs={logs}
                    loading={loading}
                    totalHours={totalHours}
                  />
                )}
              </Holds>
            </Holds>
          </Holds>
        </Grids>
      </Contents>
    </Bases>
  );
}
