"use client";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { formatTimeHHMM } from "@/utils/formatDateAmPm";
import { useTranslations } from "next-intl";
import { Contents } from "@/components/(reusable)/contents";
import {
  FormStatus,
  WorkType,
} from "../../../../prisma/generated/prisma/client";

export type TimeSheet = {
  id: number;
  date: Date | string;
  userId: string;
  jobsiteId: string;
  costcode: string;
  nu: string;
  Fp: string;
  startTime: Date | string;
  endTime: Date | string | null;
  comment: string | null;
  statusComment: string | null;
  location: string | null;
  status: FormStatus; // Enum: PENDING, APPROVED, etc.
  workType: WorkType; // Enum: Type of work
  editedByUserId: string | null;
  newTimeSheetId: number | null;
  createdByAdmin: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  clockInLat: number | null;
  clockInLng: number | null;
  clockOutLat: number | null;
  clockOutLng: number | null;
  withinFenceIn: boolean | null;
  withinFenceOut: boolean | null;
  wasInjured: boolean;

  // Relations
  Jobsite: {
    name: string;
  };
};

export default function TimesheetList({
  timesheet,
  copyToClipboard,
  calculateDuration,
}: {
  timesheet: TimeSheet;
  copyToClipboard: (timesheet: string) => Promise<void>;
  calculateDuration: (
    startTime: string | Date | null | undefined,
    endTime: string | Date | null | undefined,
  ) => string;
}) {
  const t = useTranslations("TimeSheet");

  return (
    <Holds
      key={timesheet.id}
      size={"full"}
      className="w-full border-[3px] border-black rounded-[10px] pt-2 pb-4 my-3 relative"
    >
      <Contents width={"section"}>
        <Holds className="w-full h-full p-2 ">
          <Holds position="row" className="justify-between pb-1 border-b">
            <div className="flex items-center ">
              <Texts size="md">{t("TimecardId")}</Texts>
              <Texts size="sm">{timesheet.id}</Texts>
            </div>
            <button
              onClick={() => copyToClipboard(String(timesheet.id))}
              className="p-1 rounded-md bg-slate-300"
            >
              <Images
                titleImg="/form.svg"
                titleImgAlt="Copy"
                className="w-5 h-5 opacity-70"
              />
            </button>
          </Holds>
          <Holds position={"row"} className="justify-between border-b">
            <Texts size={"md"}>{t("WorkHours")}</Texts>
            <div className="flex flex-row gap-2">
              <Texts size={"xs"}>
                {timesheet.startTime
                  ? formatTimeHHMM(timesheet.startTime.toString())
                  : "N/A"}
              </Texts>
              <Texts size={"xs"}>to</Texts>
              <Texts size={"xs"}>
                {timesheet.endTime
                  ? formatTimeHHMM(timesheet.endTime.toString())
                  : "N/A"}
              </Texts>
            </div>
          </Holds>
          <Holds position={"row"} className="justify-between border-b pt-2">
            <Texts size={"md"}>{t("Duration")}</Texts>

            <Texts size={"sm"}>
              {calculateDuration(timesheet.startTime, timesheet.endTime)}{" "}
            </Texts>
          </Holds>
          <Holds position={"row"} className="justify-between border-b pt-2">
            <Texts size={"md"}>{t("Jobsite")}</Texts>

            <Texts size={"sm"}>
              {timesheet.Jobsite.name.length > 16
                ? timesheet.Jobsite.name.slice(0, 16) + "..."
                : timesheet.Jobsite.name}
            </Texts>
          </Holds>
          <Holds position={"row"} className="justify-between border-b pt-2">
            <Texts size={"md"}>{t("CostCode")}</Texts>

            <Texts size={"sm"}>
              {timesheet.costcode.length > 16
                ? timesheet.costcode.slice(0, 16) + "..."
                : timesheet.costcode}
            </Texts>
          </Holds>
        </Holds>
      </Contents>
    </Holds>
  );
}
