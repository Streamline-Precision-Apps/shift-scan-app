"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { handleMechanicTimeSheet } from "@/actions/timeSheetActions";

import { useCommentData } from "@/app/context/CommentContext";
import { useRouter } from "next/navigation";
import {
  setCurrentPageView,
  setLaborType,
  setWorkRole,
} from "@/actions/cookieActions";

import { useSavedCostCode } from "@/app/context/CostCodeContext";

import Capitalize from "@/utils/captitalize";
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
import { useTimeSheetData } from "@/app/context/TimeSheetIdContext";
import { usePermissions } from "@/app/context/PermissionsContext";

type Option = {
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
  clockInRoleTypes: string | undefined;
  handlePrevStep: () => void;
  returnPathUsed: boolean;
  setStep: Dispatch<SetStateAction<number>>;
  jobsite: Option;
};

export default function MechanicVerificationStep({
  handlePrevStep,
  type,
  handleNextStep,
  role,
  clockInRoleTypes,
  returnPathUsed,
  setStep,
  jobsite,
}: VerifyProcessProps) {
  const t = useTranslations("Clock");
  const router = useRouter();
  const [date] = useState(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();
  const { savedCommentData, setCommentData } = useCommentData();
  const { setCostCode } = useSavedCostCode();
  const costCode = "#00.50 Mechanics";
  const { savedTimeSheetData, refetchTimesheet } = useTimeSheetData();
  const { permissions, getStoredCoordinates } = usePermissions();

  useEffect(() => {
    setCostCode(costCode);
  }, [costCode]);

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
      formData.append("userId", id);
      formData.append("date", new Date().toISOString());
      formData.append("jobsiteId", jobsite?.id || "");
      formData.append("costcode", costCode);
      formData.append("startTime", new Date().toISOString());
      formData.append("workType", role);
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
      const responseAction = await handleMechanicTimeSheet(formData);
      if (responseAction.success && type === "switchJobs") {
        await fetch("/api/notifications/send-multicast", {
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
      }

      // Update state and redirect
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
      {loading && (
        <Holds className="h-full absolute justify-center items-center">
          <Spinner size={40} />
        </Holds>
      )}
      <Holds
        background={"white"}
        className={loading ? `h-full w-full opacity-[0.50]` : `h-full w-full `}
      >
        <Grids rows={"7"} gap={"5"} className="h-full w-full">
          <Holds className="row-start-1 row-end-2 h-full w-full">
            <TitleBoxes position={"row"} gap={3} onClick={handlePrevStep}>
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
                  className="row-start-1 row-end-7 border-[3px] rounded-[10px] border-black h-full pt-1"
                >
                  <Contents width={"section"} className="h-full">
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
                    <Labels size={"p3"} position={"left"}>
                      {t("LaborType")}
                    </Labels>
                    <Inputs
                      state="disabled"
                      name="jobsiteId"
                      variant={"white"}
                      data={Capitalize(role)}
                      className="text-center"
                    />

                    <Labels size={"p3"} position={"left"}>
                      {t("JobSite-label")}
                    </Labels>
                    <Inputs
                      state="disabled"
                      name="jobsiteId"
                      variant={"white"}
                      data={jobsite?.label || ""}
                      className="text-center"
                    />
                    <Labels size={"p3"} position={"left"}>
                      {t("CostCode-label")}
                    </Labels>
                    <Inputs
                      state="disabled"
                      name="costcode"
                      variant={"white"}
                      data={costCode}
                      className="text-center"
                    />
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
    </>
  );
}
