"use client";
import React, { useState, useEffect } from "react";
import { Inputs } from "@/components/(reusable)/inputs";
import { Holds } from "@/components/(reusable)/holds";
import { Titles } from "@/components/(reusable)/titles";
import { Forms } from "@/components/(reusable)/forms";
import { Texts } from "@/components/(reusable)/texts";
import Spinner from "@/components/(animations)/spinner";
import { useTranslations } from "next-intl";
import { Images } from "@/components/(reusable)/images";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormStatus,
  WorkType,
} from "../../../../prisma/generated/prisma/client";
import TimesheetList from "./timesheetList";

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

type Props = {
  user: string;
};

export default function ViewTimesheets({ user }: Props) {
  const t = useTranslations("TimeSheet");
  const [showTimesheets, setShowTimesheets] = useState(false);
  const [timesheetData, setTimesheetData] = useState<TimeSheet[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split("T")[0];

  // Auto-fetch timesheets for today when component mounts
  useEffect(() => {
    fetchTimesheets(currentDate);
  }, [currentDate]);

  // Function to calculate duration
  const calculateDuration = (
    startTime: string | Date | null | undefined,
    endTime: string | Date | null | undefined,
  ): string => {
    if (startTime && endTime) {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const durationInMilliseconds = end - start;
      const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
      const rounded = Math.round(durationInHours * 10) / 10;
      if (rounded === 0) return "< 1 hr";
      return `${rounded.toFixed(1)} hrs`;
    }
    return "N/A";
  };

  // Fetch timesheets from the API
  const fetchTimesheets = async (date?: string) => {
    setLoading(true);
    try {
      const dateIso = date
        ? new Date(date).toISOString().slice(0, 10)
        : undefined;
      const queryParam = dateIso ? `?date=${dateIso}` : "";
      const response = await fetch(`/api/getTimesheets${queryParam}`);

      const data: TimeSheet[] = await response.json();
      setTimesheetData(data);
      setShowTimesheets(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (timesheet: string) => {
    try {
      await navigator.clipboard.writeText(timesheet);
      // Optionally, provide user feedback:
      alert("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const date = formData.get("date")?.toString();
    await fetchTimesheets(date);
  };

  return (
    <>
      <Holds
        position={"row"}
        background={"white"}
        className="row-span-1 w-full h-full"
      >
        <TitleBoxes
          onClick={() => {
            router.push("/");
          }}
        >
          <Holds
            position={"row"}
            className="w-full justify-center items-center gap-x-2"
          >
            <Titles size={"lg"}>{t("MyTimecards")}</Titles>
            <Images
              titleImg={"/timecards.svg"}
              titleImgAlt={t("MyTimecards")}
              className="w-8 h-8"
            />
          </Holds>
        </TitleBoxes>
      </Holds>
      <Holds className="row-start-2 row-end-8 h-full bg-app-dark-blue rounded-[10px]">
        <Holds
          background={"darkBlue"}
          className={`px-4 w-full h-20 row-start-1 row-end-2 rounded-b-none`}
        >
          <Forms onSubmit={handleSubmit} className=" h-full w-full">
            <Inputs type="hidden" name="id" value={user} readOnly />
            <div className="flex flex-col gap-2 w-full justify-center items-center">
              <Label htmlFor="date" className="text-white">
                {t("EnterDate")}
              </Label>
              <Input
                id="date"
                type="date"
                name="date"
                defaultValue={currentDate}
                className="text-center flex-col w-full bg-white max-w-[220px] justify-center items-center"
                onChange={(e) => fetchTimesheets(e.target.value)}
              />
            </div>
          </Forms>
        </Holds>
        {!showTimesheets && !loading && (
          <Holds
            background={"lightGray"}
            size={"full"}
            className="h-full row-start-2 row-end-8 border-8 border-app-dark-blue"
          />
        )}

        {loading ? (
          <Holds
            background={"white"}
            size={"full"}
            className="h-full animate-pulse border-8 border-app-dark-blue"
          >
            <Holds
              position={"center"}
              size={"50"}
              className="h-full flex flex-col justify-center items-center "
            >
              <Spinner />
              <Texts size={"sm"} className="mt-4">
                {t("LoadingTimecards")}
              </Texts>
            </Holds>
          </Holds>
        ) : (
          showTimesheets && (
            <Holds
              background={"white"}
              size={"full"}
              className="h-full overflow-auto no-scrollbar p-2  border-8 border-app-dark-blue "
            >
              {timesheetData.length > 0 ? (
                timesheetData.map((timesheet) => (
                  <TimesheetList
                    key={timesheet.id}
                    timesheet={timesheet}
                    calculateDuration={calculateDuration}
                    copyToClipboard={copyToClipboard}
                  />
                ))
              ) : (
                <Holds size={"full"} className="h-full justify-center">
                  <Texts size={"sm"} className="text-gray-500 italic">
                    {t("NoTimecardsFoundForTheDaySelected")}
                  </Texts>
                </Holds>
              )}
            </Holds>
          )
        )}
      </Holds>
    </>
  );
}
