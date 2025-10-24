"use client";
import { useSession } from "next-auth/react";
import { Buttons } from "../(reusable)/buttons";
import { Holds } from "../(reusable)/holds";
import { Grids } from "../(reusable)/grids";
import { Titles } from "../(reusable)/titles";
import { useTranslations } from "next-intl";
import { useCommentData } from "@/app/context/CommentContext";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Images } from "../(reusable)/images";
import { Selects } from "../(reusable)/selects";
import { TextAreas } from "../(reusable)/textareas";
import { Texts } from "../(reusable)/texts";
import { Labels } from "../(reusable)/labels";
import { TitleBoxes } from "../(reusable)/titleBoxes";

type Props = {
  handleNextStep: () => void;
  setClockInRole: React.Dispatch<React.SetStateAction<string | undefined>>;
  clockInRole: string | undefined;
  option?: string;
  handleReturn?: () => void;
  handleReturnPath: () => void;
  type: string;
  numberOfRoles: number;
  clockInRoleTypes: string | undefined;
  setClockInRoleTypes: Dispatch<SetStateAction<string | undefined>>;
  clockOutComment: string | undefined;
};

export default function SwitchJobsMultiRoles({
  handleNextStep,
  setClockInRole,
  clockInRole,
  handleReturnPath,
  numberOfRoles,
  clockInRoleTypes,
  setClockInRoleTypes,
  clockOutComment,
}: Props) {
  const t = useTranslations("Clock");
  const { data: session } = useSession();
  const tascoView = session?.user.tascoView;
  const truckView = session?.user.truckView;
  const mechanicView = session?.user.mechanicView;
  const laborView = session?.user.laborView;
  const { setCommentData } = useCommentData();
  const [commentsValue, setCommentsValue] = useState<string>("");
  const [submittable, setSubmittable] = useState<boolean>(false);

  // Use a local state to store the selected main role
  const [tempClockInRole, setTempClockInRole] = useState<string | undefined>(
    clockInRole,
  );

  const selectView = (selectedRoleType: string) => {
    setClockInRoleTypes(selectedRoleType);

    let newRole: string;
    if (
      selectedRoleType === "tascoAbcdLabor" ||
      selectedRoleType === "tascoAbcdEquipment" ||
      selectedRoleType === "tascoEEquipment"
    ) {
      newRole = "tasco";
    } else if (
      selectedRoleType === "truckDriver" ||
      selectedRoleType === "truckEquipmentOperator" ||
      selectedRoleType === "truckLabor"
    ) {
      newRole = "truck";
    } else if (selectedRoleType === "mechanic") {
      newRole = "mechanic";
    } else if (selectedRoleType === "general") {
      newRole = "general";
    } else {
      newRole = "general"; // Handle undefined or invalid cases
    }

    // Update local state only
    setTempClockInRole(newRole);
  };

  const saveCurrentData = () => {
    // Save comment data
    setCommentData({ id: commentsValue });

    // Now update the parent's clockInRole state when user clicks Continue
    if (tempClockInRole) {
      setClockInRole(tempClockInRole);
    }
  };

  useEffect(() => {
    setCommentsValue(clockOutComment || "");
  }, [clockOutComment]);

  useEffect(() => {
    // Make sure we have both a valid comment and a selected role type
    const hasValidComment = commentsValue.length >= 3;
    const hasValidRole =
      clockInRoleTypes !== undefined && clockInRoleTypes !== "";

    setSubmittable(hasValidComment && (numberOfRoles === 1 || hasValidRole));
  }, [commentsValue, clockInRoleTypes, numberOfRoles]);

  if (
    numberOfRoles === 1 &&
    clockInRole !== "tasco" &&
    clockInRole !== "truck"
  ) {
    return (
      <Holds background={"white"} className="h-full w-full">
        <Grids rows={"7"} gap={"5"} className="h-full w-full p-3 pb-5">
          <Holds className="row-start-1 row-end-4 h-full w-full justify-center ">
            <Grids rows={"5"} cols={"5"} gap={"3"} className=" h-full w-full">
              <Holds
                className="row-start-1 row-end-2 col-start-1 col-end-2 h-full w-full justify-center"
                onClick={handleReturnPath}
              >
                <Images
                  titleImg="/arrowBack.svg"
                  titleImgAlt="back"
                  position={"left"}
                />
              </Holds>

              <Holds className="row-start-2 row-end-6 col-start-1 col-end-6  h-full w-full justify-center">
                <Holds className="h-full w-[95%] justify-center relative">
                  <Labels size={"p4"} className="text-left">
                    {t("PreviousJobComment")}
                  </Labels>
                  <TextAreas
                    name="comments"
                    value={commentsValue}
                    onChange={(e) => {
                      setCommentsValue(e.target.value);
                    }}
                    placeholder={t("TodayIDidTheFollowing")}
                    className="w-full h-full"
                    maxLength={40}
                    style={{ resize: "none" }}
                  />

                  <Texts
                    size={"p2"}
                    className={`${
                      commentsValue.length === 40
                        ? "text-red-500 absolute bottom-5 right-2"
                        : "absolute bottom-5 right-2"
                    }`}
                  >
                    {commentsValue.length}/40
                  </Texts>
                </Holds>
              </Holds>
            </Grids>
          </Holds>
          <Holds className="row-start-4 row-end-6 h-full w-full justify-center"></Holds>
          <Holds className="row-start-7 row-end-8 h-full w-full justify-center">
            <Buttons
              disabled={!submittable}
              onClick={() => {
                saveCurrentData();
                handleNextStep();
              }}
              background={submittable === false ? "darkGray" : "orange"}
            >
              <Titles size={"h2"}>{t("Continue")}</Titles>
            </Buttons>
          </Holds>
        </Grids>
      </Holds>
    );
  }

  return (
    <Holds background={"white"} className="h-full w-full">
      <TitleBoxes onClick={handleReturnPath} className="h-24"></TitleBoxes>
      <div className="h-full w-full flex flex-col gap-5 items-center">
        <Holds className="h-full max-h-[200px] w-[90%] justify-center relative">
          <Labels size={"p4"} className="text-left">
            {t("PreviousJobComment")}
          </Labels>
          <TextAreas
            onChange={(e) => {
              setCommentsValue(e.target.value);
            }}
            value={commentsValue}
            placeholder={t("TodayIDidTheFollowing")}
            className="w-full h-full"
            maxLength={40}
            style={{ resize: "none" }}
          />

          <Texts
            size={"p2"}
            className={`${
              commentsValue.length === 40
                ? "text-red-500 absolute bottom-5 right-2"
                : "absolute bottom-5 right-2"
            }`}
          >
            {commentsValue.length}/40
          </Texts>
        </Holds>
        <Holds className=" w-[90%] flex flex-col justify-center">
          <Titles size={"lg"} className="text-left">
            {t("ChangeIfNecessary")}
          </Titles>
          <Selects
            className="bg-app-blue text-md text-center"
            value={clockInRoleTypes}
            onChange={(e) => selectView(e.target.value)}
          >
            <option value="">{t("SelectWorkType")}</option>
            {tascoView === true && (
              <>
                <option value="general">{t("GeneralLabor")}</option>
                <option value="tascoAbcdLabor">{t("TASCOABCDLabor")}</option>
                <option value="tascoAbcdEquipment">
                  {t("TASCOABCDEquipmentOperator")}
                </option>
                <option value="tascoEEquipment">
                  {t("TASCOEEquipmentOperator")}
                </option>
              </>
            )}
            {truckView === true && (
              <>
                <option value="truckDriver">{t("TruckDriver")}</option>
                <option value="general">{t("General")}</option>
                {/* <option value="truckEquipmentOperator">
                          {t("TruckEquipmentOperator")}
                        </option>
                        */}
              </>
            )}
            {mechanicView === true && (
              <>
                <option value="mechanic">{t("Mechanic")}</option>
              </>
            )}
            {laborView === true && (
              <option value="general">{t("General")}</option>
            )}
          </Selects>
        </Holds>
      </div>
      <Holds className="row-start-7 row-end-8 h-[70px] w-[90%] pb-4 flex justify-end">
        <Buttons
          disabled={!submittable}
          onClick={() => {
            saveCurrentData();
            handleNextStep();
          }}
          className="h-[60px]"
          background={submittable === false ? "darkGray" : "orange"}
        >
          <Titles size={"md"}>{t("Continue")}</Titles>
        </Buttons>
      </Holds>
    </Holds>
  );
}
