import Spinner from "@/components/(animations)/spinner";
import { Bases } from "@/components/(reusable)/bases";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { now } from "lodash";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

export type TimeSheet = {
  submitDate: string;
  date: Date | string;
  id: string;
  userId: string;
  jobsiteId: string;
  costcode: string;
  startTime: string;
  endTime: string | null;
  workType: string;
  Jobsite: {
    name: string;
  };
};

export default function ReviewYourDay({
  handleClick,
  prevStep,
  loading,
  timesheets,
  setReviewYourTeam,
  currentTimesheetId,
}: {
  loading: boolean;
  timesheets: TimeSheet[];
  handleClick: () => void;
  prevStep: () => void;
  setReviewYourTeam: Dispatch<SetStateAction<boolean>>;
  currentTimesheetId: number | undefined;
}) {
  const t = useTranslations("ClockOut");
  const t2 = useTranslations("MyTeam");

  return (
    <Bases>
      <Contents>
        <Holds background={"white"} className="row-span-1 h-full ">
          <Holds className="h-full w-full flex flex-col justify-center items-center">
            <TitleBoxes onClick={prevStep} className="h-24 flex-shrink-0">
              <Holds className="h-full justify-end">
                <Titles size={"md"}>{t("ReviewYourDay")}</Titles>
              </Holds>
            </TitleBoxes>
            <Texts size={"sm"} className="p-2 flex-shrink-0">
              {t("ReviewYourDayDirections")}
            </Texts>
            <div className="w-[90%] flex-grow flex flex-col pb-5">
              <Holds className="flex flex-col border-[3px] rounded-[10px] border-black h-full">
                <Holds
                  position={"row"}
                  className="border-b-[3px] border-black py-1 px-2 flex-shrink-0"
                >
                  <Grids cols={"3"} gap={"2"} className="w-full">
                    <Titles position={"left"} size={"h6"}>
                      {t2("StartEnd")}
                    </Titles>
                    <Titles position={"center"} size={"h6"}>
                      {t("Jobsite")}
                    </Titles>
                    <Titles position={"right"} size={"h6"}>
                      {t("CostCode")}
                    </Titles>
                  </Grids>
                  <Holds className="w-4"></Holds>
                </Holds>
                {loading ? (
                  <Holds className="flex-grow w-full justify-center">
                    <Spinner />
                  </Holds>
                ) : (
                  <div className="flex-grow overflow-y-auto no-scrollbar min-h-0 max-h-[calc(100%-40px)]">
                    <Accordion type="single" collapsible className="w-full">
                      {timesheets
                        .slice()
                        .sort((a, b) => {
                          const startTimeA = new Date(a.startTime).getTime();
                          const startTimeB = new Date(b.startTime).getTime();
                          return startTimeA - startTimeB;
                        })
                        .map((timesheet, index) => (
                          <AccordionItem
                            value={timesheet.id}
                            key={timesheet.id}
                          >
                            <AccordionTrigger className="w-full px-2 py-2 border-b border-gray-200">
                              <div className="w-full flex flex-row">
                                <Grids cols={"3"} gap={"3"} className="w-full">
                                  <div className="flex flex-col items-left ">
                                    <Texts size="sm" className="text-xs">
                                      {timesheet.startTime
                                        ? new Date(
                                            timesheet.startTime,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          })
                                        : "-"}
                                    </Texts>

                                    <Texts size="sm" className="text-xs">
                                      {"-"}{" "}
                                      {timesheet.endTime
                                        ? new Date(
                                            timesheet.endTime,
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          })
                                        : !timesheet.endTime &&
                                            currentTimesheetId ===
                                              Number(timesheet.id)
                                          ? `(${t("Now")})`
                                          : "-"}
                                    </Texts>
                                  </div>
                                  <Texts
                                    size="sm"
                                    className="text-xs text-center truncate max-w-[80px] "
                                  >
                                    {timesheet.Jobsite.name}
                                  </Texts>
                                  <Texts
                                    size="sm"
                                    className="text-xs truncate max-w-[60px] "
                                  >
                                    {timesheet.costcode.split(" ")[0]}
                                  </Texts>
                                </Grids>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <Holds className="p-2 rounded-lg bg-white flex flex-col items-start relative">
                                <Images
                                  titleImg={
                                    timesheet.workType === "TRUCK_DRIVER"
                                      ? "/trucking.svg"
                                      : timesheet.workType === "MECHANIC"
                                        ? "/mechanic.svg"
                                        : timesheet.workType === "TASCO"
                                          ? "/tasco.svg"
                                          : "/equipment.svg"
                                  }
                                  titleImgAlt="WorkType Icon"
                                  className="w-7 h-7 mb-1 absolute top-1 right-1"
                                />
                                <Texts size="sm" className="text-xs">
                                  <strong>Start:</strong>{" "}
                                  {timesheet.startTime
                                    ? new Date(
                                        timesheet.startTime,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                    : "-"}
                                </Texts>
                                <Texts size="sm" className="text-xs">
                                  <strong>End:</strong>{" "}
                                  {timesheet.endTime
                                    ? new Date(
                                        timesheet.endTime,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                    : !timesheet.endTime &&
                                        currentTimesheetId ===
                                          Number(timesheet.id)
                                      ? `${new Date(now()).toLocaleTimeString(
                                          [],
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          },
                                        )} (${t("Now")})`
                                      : "-"}
                                </Texts>
                                <Texts
                                  size="sm"
                                  className="text-xs text-left truncate max-w-[200px] "
                                >
                                  <strong>Jobsite:</strong>{" "}
                                  {timesheet.Jobsite.name}
                                </Texts>
                                <Texts
                                  size="sm"
                                  className="text-xs truncate max-w-[200px]"
                                >
                                  <strong>Costcode:</strong>{" "}
                                  {timesheet.costcode.split(" ")[0]}
                                </Texts>
                              </Holds>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  </div>
                )}
              </Holds>
            </div>
            <div className="w-[90%] flex justify-end  pb-4 h-[70px] ">
              <Buttons
                background={"orange"}
                onClick={handleClick}
                className="h-[60px] w-full "
              >
                <Titles size={"md"}>{t("Continue")}</Titles>
              </Buttons>
            </div>
          </Holds>
        </Holds>
      </Contents>
    </Bases>
  );
}
