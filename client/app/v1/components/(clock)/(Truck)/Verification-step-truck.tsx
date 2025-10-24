"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useTimeSheetData } from "@/app/context/TimeSheetIdContext";
import { handleTruckTimeSheet } from "@/actions/timeSheetActions";

import { useCommentData } from "@/app/context/CommentContext";
import {
  setCurrentPageView,
  setLaborType,
  setWorkRole,
} from "@/actions/cookieActions";
import { useRouter } from "next/navigation";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Inputs } from "@/components/(reusable)/inputs";
import { Labels } from "@/components/(reusable)/labels";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import { useSession } from "next-auth/react";
import Spinner from "@/components/(animations)/spinner";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { usePermissions } from "@/app/context/PermissionsContext";

type Options = {
  id: string;
  label: string;
  code: string;
};

type VerifyProcessProps = {
  handleNextStep?: () => void;
  type: string;
  role: string;
  option?: string;
  comments?: string;
  laborType?: string;
  truck: Options | null;
  // trailer?: Options | null;
  startingMileage?: number;
  clockInRoleTypes: string | undefined;
  handlePrevStep: () => void;
  equipment: Options | null;
  jobsite: Options | null;
  cc: Options | null;
};

export default function TruckVerificationStep({
  type,
  handleNextStep,
  comments,
  role,
  truck,
  // trailer,
  startingMileage,
  laborType,
  clockInRoleTypes,
  handlePrevStep,
  equipment,
  jobsite,
  cc,
}: VerifyProcessProps) {
  const t = useTranslations("Clock");
  const [date] = useState(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();
  const { savedCommentData, setCommentData } = useCommentData();
  const router = useRouter();
  const { savedTimeSheetData, refetchTimesheet } = useTimeSheetData();
  const { permissions, getStoredCoordinates } = usePermissions();
  if (!session) return null; // Conditional rendering for session
  const { id } = session.user;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!id) {
        console.error("User ID does not exist");
        return;
      }
      // Check if location permissions are granted if not clock in does not work
      if (!permissions.location) {
        console.error("Location permissions are required to clock in.");
        return;
      }

      const getStoredCoordinatesResult = getStoredCoordinates();
      const formData = new FormData();
      formData.append("submitDate", new Date().toISOString());
      formData.append("userId", id?.toString() || "");
      formData.append("date", new Date().toISOString());
      formData.append("jobsiteId", jobsite?.id || "");
      formData.append("costcode", cc?.code || "");
      formData.append("startTime", new Date().toISOString());
      formData.append("workType", role);
      formData.append("laborType", clockInRoleTypes || ""); // sets the title of task to the labor type worked on
      formData.append("startingMileage", startingMileage?.toString() || ""); // sets new starting mileage
      formData.append("truck", truck?.id || ""); // sets truck ID if applicable
      // formData.append("trailer", trailer?.id || ""); // sets trailer ID if applicable
      formData.append("equipment", equipment?.id || ""); // sets equipment Id if applicable
      // fetch coordinates from permissions context
      formData.append(
        "clockInLat",
        getStoredCoordinatesResult?.latitude.toString() || "",
      );
      formData.append(
        "clockInLong",
        getStoredCoordinatesResult?.longitude.toString() || "",
      );

      // If switching jobs, include the previous timesheet ID
      if (type === "switchJobs") {
        // const timeSheetId = await fetchRecentTimeSheetId();
        let timeSheetId = savedTimeSheetData?.id;
        if (!timeSheetId) {
          await refetchTimesheet();
          const ts = savedTimeSheetData?.id;
          if (!ts) {
            console.error("No active timesheet found for job switch.");
          }
          return (timeSheetId = ts);
        }

        formData.append("id", timeSheetId.toString());
        formData.append("endTime", new Date().toISOString());
        formData.append(
          "timeSheetComments",
          savedCommentData?.id.toString() || "",
        );
        formData.append("type", "switchJobs"); // added to switch jobs
        formData.append(
          "clockOutLat",
          getStoredCoordinatesResult?.latitude.toString() || "",
        );
        formData.append(
          "clockOutLong",
          getStoredCoordinatesResult?.longitude.toString() || "",
        );
      }

      // Use the new transaction-based function
      const responseAction = await handleTruckTimeSheet(formData);
      if (responseAction.success && type === "switchJobs") {
        const response = await fetch("/api/notifications/send-multicast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: "timecard-submission",
            title: "Timecard Approval Needed",
            message: `#${responseAction.createdTimeCard.id} has been submitted by ${responseAction.createdTimeCard.User.firstName} ${responseAction.createdTimeCard.User.lastName} for approval.`,
            link: `/admins/timesheets?id=${responseAction.createdTimeCard.id}`,
            referenceId: responseAction.createdTimeCard.id,
          }),
        });
        await response.json();
      }

      setCommentData(null);
      localStorage.removeItem("savedCommentData");

      await Promise.all([
        setCurrentPageView("dashboard"),
        setWorkRole(role),
        setLaborType(clockInRoleTypes || ""),
        refetchTimesheet(),
      ]).then(() => router.push("/dashboard"));
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Holds className="h-full w-full relative">
        {loading && (
          <Holds className="h-full absolute justify-center items-center">
            <Spinner size={40} />
          </Holds>
        )}
        <Holds
          background={"white"}
          className={
            loading ? `h-full w-full opacity-[0.50]` : `h-full w-full `
          }
        >
          <Grids rows={"7"} gap={"5"} className="h-full w-full">
            <Holds className="row-start-1 row-end-2 h-full w-full">
              <TitleBoxes position={"row"} onClick={handlePrevStep}>
                <Titles position={"right"} size={"md"}>
                  {t("VerifyJobSite")}
                </Titles>
                <Images
                  titleImg="/clockIn.svg"
                  titleImgAlt="Verify"
                  className="w-6 h-6"
                />
              </TitleBoxes>
            </Holds>
            <Holds className="row-start-2 row-end-8 h-full w-full">
              <Contents width={"section"}>
                <Grids rows={"7"} gap={"5"} className="h-full w-full pb-5">
                  <Holds
                    background={"timeCardYellow"}
                    className="row-start-1 row-end-7 w-full h-full rounded-[10px] border-[3px] border-black"
                  >
                    <Contents width={"section"} className="h-full py-2">
                      <div className="h-full overflow-y-auto no-scrollbar">
                        <Holds className="flex flex-row justify-between pb-3">
                          <Texts size={"p7"} position={"left"}>
                            {date.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                            })}
                          </Texts>
                          <Texts size={"p7"} position={"right"}>
                            {date.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            })}
                          </Texts>
                        </Holds>
                        <Holds
                          className={
                            clockInRoleTypes === "truckDriver"
                              ? "row-span-1 col-span-1"
                              : "row-span-1 col-span-2"
                          }
                        >
                          <Labels
                            htmlFor="clockInRole"
                            size={"p3"}
                            position={"left"}
                          >
                            {t("LaborType")}
                          </Labels>
                          <Inputs
                            state="disabled"
                            name="clockInRole"
                            variant={"white"}
                            data={
                              clockInRoleTypes === "truckDriver"
                                ? t("TruckDriver")
                                : clockInRoleTypes === "truckEquipmentOperator"
                                  ? t("TruckEquipmentOperator")
                                  : t("TruckLabor")
                            }
                            className={"pl-2 text-base text-center"}
                          />
                        </Holds>
                        <Holds className={"row-span-1 col-span-2"}>
                          <Labels
                            htmlFor="jobsiteId"
                            size={"p3"}
                            position={"left"}
                          >
                            {t("JobSite-label")}
                          </Labels>
                          <Inputs
                            state="disabled"
                            name="jobsiteId"
                            variant={"white"}
                            data={jobsite?.label || ""}
                            className={"pl-2 text-base text-center"}
                          />
                        </Holds>
                        <Holds className={"row-span-1 col-span-2"}>
                          <Labels
                            htmlFor="costcode"
                            size={"p3"}
                            position={"left"}
                          >
                            {t("CostCode-label")}
                          </Labels>
                          <Inputs
                            state="disabled"
                            name="costcode"
                            variant={"white"}
                            data={cc?.label || ""}
                            className={"pl-2 text-base text-center"}
                          />
                        </Holds>
                        {clockInRoleTypes === "truckDriver" && (
                          <>
                            <Holds className={"row-span-1 col-span-2"}>
                              <Labels
                                htmlFor="truckId"
                                size={"p3"}
                                position={"left"}
                              >
                                {t("Truck-label")}
                              </Labels>
                              <Inputs
                                state="disabled"
                                name="truckId"
                                variant={"white"}
                                data={truck?.label || ""}
                                className={"pl-2 text-base text-center"}
                              />
                            </Holds>
                            {/* <Holds className={"row-span-1 col-span-2"}>
                            <Labels
                              htmlFor="trailerId"
                              size={"p3"}
                              position={"left"}
                            >
                              {t("Trailer-label", { default: "Trailer" })}
                            </Labels>
                            <Inputs
                              state="disabled"
                              name="trailerId"
                              variant={"white"}
                              data={
                                trailer?.label ||
                                t("NoTrailerOption", { default: "No Trailer" })
                              }
                              className={"pl-2 text-base text-center"}
                            />
                          </Holds> */}
                          </>
                        )}
                        {clockInRoleTypes === "truckEquipmentOperator" && (
                          <Holds className={"row-span-1 col-span-2"}>
                            <Labels
                              htmlFor="SelectedEquipment"
                              size={"p3"}
                              position={"left"}
                            >
                              {t("SelectedEquipment")}
                            </Labels>
                            <Inputs
                              state="disabled"
                              name="SelectedEquipment"
                              variant={"white"}
                              data={equipment?.label || ""}
                              className={"pl-2 text-base text-center"}
                            />
                          </Holds>
                        )}
                      </div>
                    </Contents>
                  </Holds>

                  <Holds className="row-start-7 row-end-8">
                    <Buttons
                      onClick={() => handleSubmit()}
                      background={"green"}
                      className=" w-full h-full py-2"
                      disabled={loading}
                    >
                      <Titles size={"md"}>{t("StartDay")}</Titles>
                    </Buttons>
                  </Holds>
                </Grids>
              </Contents>
            </Holds>
          </Grids>
        </Holds>
      </Holds>
    </>
  );
}
