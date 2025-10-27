"use client";
import { updateTimeSheet } from "@/actions/timeSheetActions";
import { usePermissions } from "@/app/context/PermissionsContext";
import Spinner from "@/components/(animations)/spinner";
import { Bases } from "@/components/(reusable)/bases";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Inputs } from "@/components/(reusable)/inputs";
import { Labels } from "@/components/(reusable)/labels";
import { Texts } from "@/components/(reusable)/texts";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  TascoLogs: {
    laborType: string;
    shiftType: string;
  }[];
};

export const LaborClockOut = ({
  prevStep,
  commentsValue,
  pendingTimeSheets,
  wasInjured,
  timeSheetId,
  refetchTimesheet,
}: {
  prevStep: () => void;
  commentsValue: string;
  pendingTimeSheets: TimeSheet | undefined;
  wasInjured: boolean;
  timeSheetId: number | undefined;
  refetchTimesheet: () => Promise<void>;
}) => {
  const t = useTranslations("ClockOut");
  const [date] = useState(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { permissions, getStoredCoordinates } = usePermissions();

  async function handleSubmitTimeSheet() {
    try {
      setLoading(true);
      // Step 1: Get the recent timecard ID.
      if (!permissions.location) {
        console.error("Location permissions are required to clock in.");
        return;
      }

      const coordinates = getStoredCoordinates();
      const formData = new FormData();
      formData.append("id", timeSheetId?.toString() || "");
      formData.append("userId", session?.user.id?.toString() || "");
      formData.append("endTime", new Date().toISOString());
      formData.append("timeSheetComments", commentsValue);
      formData.append("wasInjured", wasInjured.toString());
      formData.append("clockOutLat", coordinates?.latitude.toString() || "");
      formData.append("clockOutLng", coordinates?.longitude.toString() || "");

      const result = await updateTimeSheet(formData);
      if (result.success) {
        try {
          await fetch("/api/notifications/send-multicast", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topic: "timecard-submission",
              title: "Timecard Approval Needed",
              message: `#${result.timesheetId} has been submitted by ${result.userFullName} for approval.`,
              link: `/admins/timesheets?id=${result.timesheetId}`,
              referenceId: result.timesheetId,
            }),
          });
        } catch (error) {
          console.error("🔴 Failed to send notification:", error);
          return;
        } finally {
          setLoading(false);
          await Promise.all([refetchTimesheet(), router.push("/")]);
          // clear the saved storage after navigation
          setTimeout(() => {
            fetch("/api/cookies?method=deleteAll");
            localStorage.clear();
          }, 500);
        }
      }
    } catch (error) {
      console.error("🔴 Failed to process the time sheet:", error);
    }
  }

  return (
    <Bases>
      <Contents>
        {loading && (
          <Holds className="h-full absolute justify-center items-center">
            <Spinner size={40} />
          </Holds>
        )}
        <Holds
          background={"white"}
          className={
            loading
              ? `h-full w-full flex flex-col items-center opacity-[0.50]`
              : `h-full w-full flex flex-col items-center `
          }
        >
          <TitleBoxes onClick={prevStep} className="h-24">
            <Holds className="h-full justify-end">
              <Holds position={"row"} className="justify-center gap-3">
                <Titles size={"lg"} position={"right"}>
                  {t("ClockOut")}
                </Titles>

                <Images
                  titleImg="/clockOut.svg"
                  titleImgAlt="Verify"
                  className="max-w-6 h-auto"
                />
              </Holds>
            </Holds>
          </TitleBoxes>

          <div className="w-[90%] flex-grow flex flex-col pb-5">
            <Holds
              background={"timeCardYellow"}
              className="h-full w-full rounded-[10px] border-[3px] border-black mt-8"
            >
              <Holds className="h-full w-full px-3 py-2">
                <Holds position={"row"} className="justify-between">
                  <Texts size={"p7"} className="font-bold">
                    {date.toLocaleDateString()}
                  </Texts>
                  <Texts size={"p7"}>
                    {date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                      hour12: false,
                    })}
                  </Texts>
                </Holds>
                <Holds className="h-full w-full py-5">
                  <Labels htmlFor="laborType" size={"p5"} position={"left"}>
                    {t("LaborType")}
                  </Labels>
                  {pendingTimeSheets?.workType === "TASCO" ? (
                    <Inputs
                      state="disabled"
                      name="laborType"
                      className="text-center"
                      variant={"white"}
                      data={
                        pendingTimeSheets?.TascoLogs[0].laborType ===
                        "tascoAbcdLabor"
                          ? t("TascoLabor")
                          : t("TascoOperator")
                      }
                    />
                  ) : (
                    <Inputs
                      state="disabled"
                      name="laborType"
                      className="text-center"
                      variant={"white"}
                      data={
                        pendingTimeSheets?.workType === "LABOR"
                          ? t("GeneralLabor")
                          : pendingTimeSheets?.workType === "TRUCK_DRIVER"
                            ? t("TruckDriver")
                            : pendingTimeSheets?.workType === "MECHANIC"
                              ? t("Mechanic")
                              : ""
                      }
                    />
                  )}
                  {pendingTimeSheets?.workType === "TASCO" && (
                    <>
                      <Labels htmlFor="laborType" size={"p5"} position={"left"}>
                        {t("ShiftType")}
                      </Labels>
                      <Inputs
                        state="disabled"
                        name="laborType"
                        className="text-center"
                        variant={"white"}
                        data={pendingTimeSheets?.TascoLogs[0].shiftType || ""}
                      />
                    </>
                  )}
                  <Labels htmlFor="jobsiteId" size={"p5"} position={"left"}>
                    {t("JobSite")}
                  </Labels>
                  <Inputs
                    state="disabled"
                    name="jobsiteId"
                    className="text-center"
                    variant={"white"}
                    data={pendingTimeSheets?.Jobsite.name || ""}
                  />
                  <Labels htmlFor="costcode" size={"p6"} position={"left"}>
                    {t("CostCode")}
                  </Labels>
                  <Inputs
                    state="disabled"
                    name="costcode"
                    variant={"white"}
                    className="text-center"
                    data={pendingTimeSheets?.costcode || ""}
                  />
                </Holds>
              </Holds>
            </Holds>
          </div>

          <div className="w-[90%] flex justify-end  pb-4 h-[70px] ">
            <Buttons
              background={"red"}
              onClick={handleSubmitTimeSheet}
              className="h-[60px] w-full"
            >
              <Titles size={"md"}>{t("EndDay")}</Titles>
            </Buttons>
          </div>
        </Holds>
      </Contents>
    </Bases>
  );
};
