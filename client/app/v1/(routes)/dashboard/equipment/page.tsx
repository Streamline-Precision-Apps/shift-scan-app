"use client";
import { Buttons } from "@/app/v1/components/(reusable)/buttons";
import { useTranslations } from "next-intl";
import { Holds } from "@/app/v1/components/(reusable)/holds";
import { Suspense, useEffect, useState } from "react";
import Spinner from "@/app/v1/components/(animations)/spinner";
import { Contents } from "@/app/v1/components/(reusable)/contents";
import { useRouter } from "next/navigation";
import { Grids } from "@/app/v1/components/(reusable)/grids";
import { TitleBoxes } from "@/app/v1/components/(reusable)/titleBoxes";
import { Titles } from "@/app/v1/components/(reusable)/titles";
import { differenceInSeconds, parseISO } from "date-fns";
import { NewTab } from "@/app/v1/components/(reusable)/newTabs";
import SlidingDiv from "@/app/v1/components/(animations)/slideDelete";
import { Texts } from "@/app/v1/components/(reusable)/texts";
import { Bases } from "@/app/v1/components/(reusable)/bases";
import LoadingEquipmentLogClient from "./_components/LoadingEquipmentLogClient";
import { apiRequest } from "@/app/lib/utils/api-Utils";
import { useUserStore } from "@/app/lib/store/userStore";
import { deleteEmployeeEquipmentLog } from "@/app/lib/actions/truckingActions";

export type EmployeeEquipmentLogs = {
  id: string;
  date: Date;
  equipmentId: string;
  jobsiteId: string;
  employeeId: string;
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
  isRefueled: boolean;
  fuelUsed?: number | null;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
  isFinished: boolean;
  status: "DRAFT" | "PENDING" | "APPROVED" | "DENIED";
  Equipment?: Equipment | null;
};

export type Equipment = {
  id: string;
  qrId: string;
  name: string;
  description?: string;
  equipmentTag: string;
  lastInspection?: Date | null;
  lastRepair?: Date | null;
  status?: string;
  make?: string | null;
  model?: string | null;
  year?: string | null;
  licensePlate?: string | null;
  registrationExpiration?: Date | null;
  mileage?: number | null | undefined;
  isActive?: boolean;
  inUse?: boolean;
};

export default function EquipmentLogClient() {
  const { user } = useUserStore();
  const userId = user?.id;
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<EmployeeEquipmentLogs[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const t = useTranslations("Equipment");
  const [active, setActive] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(
          `/api/v1/timesheet/user/${userId}/equipmentLogs`,
          "GET"
        );

        if (response?.success && response.data) {
          setLogs(response.data);
        } else {
          console.error("Failed to fetch logs");
        }
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredLogs =
    active === 1
      ? logs.filter((log) => !log.endTime)
      : logs.filter((log) => !!log.endTime);

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployeeEquipmentLog(id);
      setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
    } catch (error) {
      console.error("Error deleting equipment log:", error);
    }
  };

  return (
    <Bases>
      <Contents>
        <Grids rows={"7"} gap={"5"} className="relative size-full">
          <Suspense fallback={<LoadingEquipmentLogClient />}>
            <Holds
              background={"white"}
              className={
                loading
                  ? "row-start-1 row-end-2 h-full animate-pulse"
                  : "row-start-1 row-end-2 h-full "
              }
            >
              <TitleBoxes onClick={() => router.push("/v1/dashboard")}>
                <Titles size={"lg"}>{t("Current")}</Titles>
              </TitleBoxes>
            </Holds>

            <Holds
              className={
                loading
                  ? "row-start-2 row-end-8 h-full animate-pulse"
                  : "row-start-2 row-end-8 h-full"
              }
            >
              <Holds className="h-full w-full ">
                <Grids rows={"10"} className="h-full w-full ">
                  <Holds
                    position={"row"}
                    className="w-full row-start-1 row-end-2 gap-1"
                  >
                    <NewTab
                      onClick={() => setActive(1)}
                      isActive={active === 1}
                      titleImage="/statusOngoingFilled.svg"
                      titleImageAlt="Clock"
                      isComplete={true}
                    >
                      <Titles size={"md"}>{t("CurrentLogs")}</Titles>
                    </NewTab>
                    <NewTab
                      onClick={() => setActive(2)}
                      isActive={active === 2}
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
                      <Grids
                        rows={"7"}
                        gap={"5"}
                        className="h-full w-full py-5"
                      >
                        <Suspense
                          fallback={
                            <Holds className="row-start-1 row-end-7 h-full justify-center items-center">
                              <Spinner />
                            </Holds>
                          }
                        >
                          {loading ? (
                            <Holds className="row-start-1 row-end-7 h-full justify-center items-center">
                              <Spinner />
                            </Holds>
                          ) : (
                            <>
                              {filteredLogs.length === 0 ? (
                                <>
                                  <Holds className="row-start-1 row-end-7 h-full justify-center">
                                    <Texts
                                      size="p6"
                                      className="text-gray-500 italic"
                                    >
                                      {t("NoCurrent")}
                                    </Texts>
                                  </Holds>
                                </>
                              ) : (
                                <Holds className="row-start-1 row-end-7 h-full overflow-y-auto no-scrollbar">
                                  {filteredLogs.map((log) => {
                                    const start = parseISO(
                                      log.startTime.toString()
                                    );
                                    let diffInSeconds = 0;
                                    if (log.endTime !== null) {
                                      const end = parseISO(
                                        log.endTime
                                          ? log.endTime.toString()
                                          : new Date().toString()
                                      );
                                      diffInSeconds = differenceInSeconds(
                                        end,
                                        start
                                      );
                                    } else {
                                      diffInSeconds = differenceInSeconds(
                                        currentTime,
                                        start
                                      );
                                    }
                                    const hours = Math.floor(
                                      diffInSeconds / 3600
                                    );
                                    const minutes = Math.floor(
                                      (diffInSeconds % 3600) / 60
                                    );
                                    const seconds = diffInSeconds % 60;
                                    const formattedTime = `${
                                      log.endTime !== null
                                        ? hours === 0
                                          ? `${minutes} min`
                                          : `${hours} hrs ${minutes} min`
                                        : `${hours
                                            .toString()
                                            .padStart(2, "0")}:${minutes
                                            .toString()
                                            .padStart(2, "0")}:${seconds
                                            .toString()
                                            .padStart(2, "0")}`
                                    }`;
                                    return (
                                      <Holds key={log.id}>
                                        <SlidingDiv
                                          onSwipeLeft={() =>
                                            handleDelete(log.id)
                                          }
                                          confirmationMessage={t(
                                            "DeletePrompt"
                                          )}
                                        >
                                          <Buttons
                                            background={
                                              log.endTime !== null
                                                ? "lightBlue"
                                                : "orange"
                                            }
                                            shadow={"none"}
                                            href={`/v1/dashboard/equipment/${log.id}`}
                                            className="py-0.5"
                                          >
                                            <Titles size={"h4"}>
                                              {log.Equipment?.name}
                                            </Titles>
                                            <Titles className="text-xs">
                                              {formattedTime}
                                            </Titles>
                                          </Buttons>
                                        </SlidingDiv>
                                      </Holds>
                                    );
                                  })}
                                </Holds>
                              )}
                            </>
                          )}
                        </Suspense>
                        <Holds className="row-start-7 row-end-8 h-full w-full gap-1 ">
                          <Buttons
                            background={loading ? "darkGray" : "green"}
                            className="w-full py-2"
                            onClick={() =>
                              router.push("/v1/dashboard/equipment/log-new")
                            }
                            disabled={loading}
                          >
                            <Titles size={"md"}>{t("LogNew")}</Titles>
                          </Buttons>
                        </Holds>
                      </Grids>
                    </Contents>
                  </Holds>
                </Grids>
              </Holds>
            </Holds>
          </Suspense>
        </Grids>
      </Contents>
    </Bases>
  );
}
