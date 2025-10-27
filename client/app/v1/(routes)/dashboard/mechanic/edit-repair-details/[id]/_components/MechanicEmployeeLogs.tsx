"use client";
import { useState, useEffect } from "react";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Texts } from "@/components/(reusable)/texts";
import { Contents } from "@/components/(reusable)/contents";
import { formatTimeHHMM } from "@/utils/formatDateAmPm";
import { Titles } from "@/components/(reusable)/titles";
import { TextAreas } from "@/components/(reusable)/textareas";
import { useTranslations } from "next-intl";
import { Images } from "@/components/(reusable)/images";
import Spinner from "@/components/(animations)/spinner";

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

export default function MechanicEmployeeLogs({
  logs: initialLogs,
  loading,
  totalHours,
}: {
  logs: LogItem[] | undefined;
  loading: boolean;
  totalHours: number;
}) {
  const [logs, setLogs] = useState<LogItem[] | undefined>(initialLogs);
  const t = useTranslations("MechanicWidget");
  const [selectedLogIsOpen, setSelectedLogIsOpen] = useState("");
  // Update local logs state when initialLogs changes.
  // If initialLogs is null or undefined, set logs to an empty array.
  useEffect(() => {
    if (initialLogs) {
      setLogs(initialLogs);
    } else {
      setLogs([]);
    }
  }, [initialLogs]);
  function convertHoursToHoursAndMinutes(hoursFloat: number) {
    // Convert the decimal hours into total minutes
    const totalMinutes = Math.round(hoursFloat * 60);

    // Calculate the hours and remaining minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Return the formatted string in the desired format
    return `${hours} hrs ${minutes} mins`;
  }

  const formattedTotalHours = convertHoursToHoursAndMinutes(totalHours);

  if (loading) {
    return (
      <Holds className="no-scrollbar overflow-y-auto">
        <Contents width={"section"} className="h-full">
          <Holds position={"row"} className="w-full justify-between py-2 ">
            <Titles size={"h4"} position={"left"}>
              {t("TotalLaborHours")}
            </Titles>
            <Holds
              background={"lightBlue"}
              className="w-1/2 h-full justify-center py-1 border-[3px] border-black rounded-[10px]"
            >
              <Spinner size={20} />
            </Holds>
          </Holds>
          {Array.from({ length: 6 }).map((_, index) => (
            <Holds
              key={index}
              background="lightGray"
              className="h-1/6 my-2 py-7 animate-pulse"
            />
          ))}
        </Contents>
      </Holds>
    );
  }

  // Otherwise, display the logs and add placeholder skeletons
  // to ensure each log has up to 6 boxes (maintenance logs).
  return (
    <Holds className=" h-full ">
      <Contents width={"section"} className=" h-full">
        <Holds position={"row"} className="w-full justify-between py-2">
          <Titles size={"h4"} position={"left"}>
            {t("TotalLaborHours")}
          </Titles>
          <Holds
            background={"lightBlue"}
            className="w-1/2 py-1 border-[3px] border-black rounded-[10px]"
          >
            <Texts size={"p6"}>{formattedTotalHours}</Texts>
          </Holds>
        </Holds>
        <Holds className="no-scrollbar overflow-y-auto h-full pt-2 ">
          {logs &&
            logs.map((log) => {
              const actualCount = log.MaintenanceLogs.length;
              const placeholders = Math.max(5 - actualCount, 0);
              return (
                <Holds key={log.id} className="w-full h-full">
                  {/* Render actual maintenance logs */}
                  {log.MaintenanceLogs.map((mLog) => (
                    <Grids
                      key={mLog.id}
                      onClick={
                        selectedLogIsOpen === mLog.id
                          ? () => setSelectedLogIsOpen("")
                          : () => setSelectedLogIsOpen(mLog.id)
                      }
                      rows={"3"}
                      className="mb-3 bg-app-gray rounded-[10px] p-1 px-3 "
                    >
                      <Holds
                        position={"row"}
                        className={`w-full h-full justify-between ${
                          selectedLogIsOpen === mLog.id
                            ? "row-start-1 row-end-2"
                            : "row-start-1 row-end-2"
                        }`}
                      >
                        <Titles size={"h5"} position={"left"}>
                          {`${mLog.User.firstName} ${mLog.User.lastName}`}
                        </Titles>

                        <Texts size={"p6"}>
                          {formatTimeHHMM(mLog.startTime)}
                          {" - "}
                          {mLog.endTime
                            ? formatTimeHHMM(mLog.endTime)
                            : "Active"}
                        </Texts>
                      </Holds>
                      {selectedLogIsOpen === mLog.id ? (
                        <Holds className={`row-start-2 row-end-4 pb-3`}>
                          <Holds className="flex flex-row items-center pb-3 gap-3">
                            <Texts size={"p6"}>{t("Comment")}</Texts>
                            <Images
                              titleImg="/comment.svg"
                              titleImgAlt="comment icon"
                              className="w-5 h-5 justify-center items-center"
                            />
                          </Holds>

                          <TextAreas
                            className={`${mLog.comment} ? 'text-xs' : text-xs font-bold `}
                            disabled
                            defaultValue={
                              mLog.comment === ""
                                ? t("NoComment")
                                : mLog.comment
                            }
                          />
                        </Holds>
                      ) : (
                        <Holds className={`row-start-2 row-end-4`}>
                          <Holds
                            position={"row"}
                            className={"row-span-1 w-full gap-3"}
                          >
                            <Texts size={"p6"}>{t("Comment")}</Texts>
                            <Images
                              titleImg="/comment.svg"
                              titleImgAlt="comment icon"
                              className="w-5 h-5"
                            />
                          </Holds>
                        </Holds>
                      )}
                    </Grids>
                  ))}

                  {/* If no Logs, render a placeholder */}
                  {actualCount === 0 && (
                    <Holds className="h-3/4">
                      <Holds className="h-full justify-center">
                        <Texts size={"p4"} className="italic text-gray-500">
                          {t("NoLogsFound")}
                        </Texts>
                      </Holds>
                    </Holds>
                  )}

                  {/* Render placeholders for remaining items */}
                  {actualCount > 0 &&
                    Array.from({ length: placeholders }).map((_, idx) => (
                      <Holds
                        background="lightGray"
                        className="h-1/6 my-2 py-10 flex items-center justify-center"
                        key={idx}
                      >
                        <Texts size={"p5"}></Texts>
                      </Holds>
                    ))}
                </Holds>
              );
            })}
        </Holds>
      </Contents>
    </Holds>
  );
}
