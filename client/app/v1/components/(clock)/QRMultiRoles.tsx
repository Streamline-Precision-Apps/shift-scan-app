"use client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import QR from "./qr";
import { Buttons } from "../(reusable)/buttons";
import { Texts } from "../(reusable)/texts";
import { Titles } from "../(reusable)/titles";
import { Holds } from "../(reusable)/holds";
import { Grids } from "../(reusable)/grids";
import { Images } from "../(reusable)/images";
import { Selects } from "../(reusable)/selects";
import { useSession } from "next-auth/react";
import { Contents } from "../(reusable)/contents";
import { TitleBoxes } from "../(reusable)/titleBoxes";
import { Title } from "@/app/(routes)/dashboard/mechanic/_components/Title";
import { usePermissions } from "@/app/context/PermissionsContext";

type Option = {
  id: string;
  label: string;
  code: string;
};
type QRStepProps = {
  handleAlternativePath: () => void;
  handleNextStep: () => void;
  handleReturn?: () => void;
  handleReturnPath: () => void;
  handleScanJobsite?: (type: string) => void;
  type: string;
  url: string;
  option?: string;
  clockInRole: string | undefined;
  setClockInRole: React.Dispatch<React.SetStateAction<string | undefined>>;
  clockInRoleTypes: string | undefined;
  setClockInRoleTypes: Dispatch<SetStateAction<string | undefined>>;
  setJobsite: Dispatch<SetStateAction<Option>>;
};

export default function QRMultiRoles({
  option,
  handleReturnPath,
  handleAlternativePath,
  handleNextStep,
  handleScanJobsite,
  type,
  url,
  clockInRole,
  setClockInRole,

  clockInRoleTypes,
  setClockInRoleTypes,
  setJobsite,
}: QRStepProps) {
  const t = useTranslations("Clock");
  const [startCamera, setStartCamera] = useState<boolean>(false);
  const { data: session } = useSession();
  const tascoView = session?.user.tascoView;
  const truckView = session?.user.truckView;
  const mechanicView = session?.user.mechanicView;
  const laborView = session?.user.laborView;
  const [numberOfViews, setNumberOfViews] = useState(0);
  const [failedToScan, setFailedToScan] = useState(false);
  // Local state to store the selected role until camera starts
  const [tempClockInRole, setTempClockInRole] = useState<string | undefined>(
    clockInRole,
  );
  const { requestAllPermissions, permissions } = usePermissions();
  useEffect(() => {
    const requestPermissions = async () => {
      // Skip if both permissions are already granted
      if (permissions.camera && permissions.location) {
        return;
      }

      try {
        await requestAllPermissions();
      } catch (error) {
        console.error("Error requesting permissions:", error);
      }
    };

    requestPermissions();
  }, [requestAllPermissions, permissions]);

  const selectView = (selectedRoleType: string) => {
    setClockInRoleTypes(selectedRoleType);

    // Map the selected role type to the main clock-in role but only update local state
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
      setClockInRoleTypes("general");
      newRole = "general"; // Handle undefined or invalid cases
    }

    // Only update local state
    setTempClockInRole(newRole);
  };

  useEffect(() => {
    let count = 0;
    if (tascoView) count++;
    if (truckView) count++;
    if (mechanicView) count++;
    if (laborView) count++;

    setNumberOfViews(count);
  }, [tascoView, truckView, mechanicView, laborView]);

  useEffect(() => {
    setTimeout(() => {
      setFailedToScan(false);
    }, 5000);
  }, [failedToScan]);

  // Keep local state in sync with incoming props
  useEffect(() => {
    setTempClockInRole(clockInRole);
  }, [clockInRole]);

  return (
    <>
      <Holds background={"white"} className="h-full w-full">
        <Grids rows={"7"} gap={"5"} className="h-full w-full">
          <Holds className="row-start-1 row-end-2 h-full w-full">
            <TitleBoxes onClick={handleReturnPath}>
              <Titles size={"md"}>
                {startCamera ? t("ScanJobsite") : t("SelectLaborType")}
              </Titles>
            </TitleBoxes>
          </Holds>
          <Holds className="row-start-2 row-end-8 h-full w-full">
            <Grids rows={"7"} gap={"5"} className="h-full w-full pb-5">
              {type !== "equipment" ? (
                <>
                  {numberOfViews > 1 && option !== "switchJobs" ? (
                    <Holds className="p-1 justify-center row-start-1 row-end-2 ">
                      <Contents width={"section"}>
                        <Selects
                          className="bg-app-blue text-center p-3 text-sm disabled:bg-app-blue"
                          value={clockInRoleTypes}
                          disabled={startCamera}
                          onChange={(e) => selectView(e.target.value)}
                        >
                          <option value="">{t("SelectWorkType")}</option>
                          {tascoView === true && (
                            <>
                              <option value="tascoAbcdLabor">
                                {t("TASCOABCDLabor")}
                              </option>
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
                              <option value="truckDriver">
                                {t("TruckDriver")}
                              </option>
                              {/* <option value="truckEquipmentOperator">
                                {t("TruckEquipmentOperator")}
                              </option>
                              <option value="truckLabor">
                                {t("TruckLabor")}
                              </option> */}
                            </>
                          )}
                          {mechanicView === true && (
                            <option value="mechanic">{t("Mechanic")}</option>
                          )}
                          {laborView === true && (
                            <option value="general">{t("GeneralLabor")}</option>
                          )}
                        </Selects>
                      </Contents>
                    </Holds>
                  ) : numberOfViews === 1 && clockInRole === "tasco" ? (
                    <Holds className="p-1 justify-center row-start-1 row-end-2 ">
                      <Contents width={"section"}>
                        <Selects
                          className="bg-app-blue text-center p-3 disabled:bg-app-blue"
                          value={clockInRoleTypes}
                          disabled={startCamera}
                          onChange={(e) => selectView(e.target.value)}
                        >
                          <option value="">{t("SelectWorkType")}</option>
                          {tascoView === true && (
                            <>
                              <option value="general">
                                {t("GeneralLabor")}
                              </option>
                              <option value="tascoAbcdLabor">
                                {t("TASCOABCDLabor")}
                              </option>
                              <option value="tascoAbcdEquipment">
                                {t("TASCOABCDEquipmentOperator")}
                              </option>
                              <option value="tascoEEquipment">
                                {t("TASCOEEquipmentOperator")}
                              </option>
                            </>
                          )}
                        </Selects>
                      </Contents>
                    </Holds>
                  ) : numberOfViews === 1 && clockInRole === "truck" ? (
                    <Holds className="p-1 justify-center row-start-1 row-end-2 ">
                      <Contents width={"section"}>
                        <Selects
                          className="bg-app-blue text-center p-3 disabled:bg-app-blue"
                          value={clockInRoleTypes}
                          disabled={startCamera}
                          onChange={(e) => selectView(e.target.value)}
                        >
                          <option value="">{t("SelectWorkType")}</option>
                          {truckView === true && (
                            <>
                              <option value="general">
                                {t("GeneralLabor")}
                              </option>
                              <option value="truckDriver">
                                {t("TruckDriver")}
                              </option>
                            </>
                          )}
                        </Selects>
                      </Contents>
                    </Holds>
                  ) : null}
                </>
              ) : null}

              {!startCamera ? (
                <Holds className={"h-full w-full row-start-2 row-end-6"}>
                  <Contents width={"section"}>
                    <Holds
                      className={
                        "h-full w-full row-start-2 row-end-6 border-[3px] border-black rounded-[10px] p-3 justify-center "
                      }
                    >
                      <Images
                        titleImg="/camera.svg"
                        titleImgAlt="clockIn"
                        position={"center"}
                        size={"20"}
                      />
                      {failedToScan === true && (
                        <Holds className="pt-5">
                          <Texts text={"red"} size={"p4"}>
                            {t("FailedToScanJobSiteDoesNotExist")}
                          </Texts>
                        </Holds>
                      )}
                    </Holds>
                  </Contents>
                </Holds>
              ) : (
                <Holds className={"h-full w-full row-start-2 row-end-7"}>
                  <Contents width={"section"}>
                    <Grids rows={"6"} gap={"2"}>
                      <Holds className="h-full w-full row-start-1 row-end-6 justify-center ">
                        <QR
                          handleScanJobsite={handleScanJobsite}
                          url={url}
                          clockInRole={clockInRole}
                          type={type}
                          handleNextStep={handleNextStep}
                          startCamera={startCamera}
                          setStartCamera={setStartCamera}
                          setFailedToScan={setFailedToScan}
                          setJobsite={setJobsite}
                        />
                      </Holds>

                      <Holds className="h-full w-full row-start-6 row-end-7 justify-center">
                        <Buttons
                          background={"none"}
                          shadow={"none"}
                          onClick={handleAlternativePath}
                        >
                          <Texts
                            size={"p4"}
                            className="underline underline-offset-4"
                          >
                            {t("TroubleScanning")}
                          </Texts>
                        </Buttons>
                      </Holds>
                    </Grids>
                  </Contents>
                </Holds>
              )}
              {!startCamera ? (
                <Holds className="row-start-7 row-end-8 w-full justify-center">
                  <Contents width={"section"}>
                    <Buttons
                      onClick={() => {
                        // Update parent state with our local role state only when starting camera
                        if (tempClockInRole) {
                          setClockInRole(tempClockInRole);
                        }
                        setStartCamera(!startCamera);
                      }}
                      // Only enable the button if a role is selected when multiple views are available
                      disabled={
                        numberOfViews > 1 &&
                        (!clockInRoleTypes || clockInRoleTypes === "")
                      }
                      background={
                        numberOfViews > 1 &&
                        (!clockInRoleTypes || clockInRoleTypes === "")
                          ? "darkGray"
                          : "green"
                      }
                      className="py-2"
                    >
                      <Titles size={"md"}>{t("StartCamera")}</Titles>
                    </Buttons>
                  </Contents>
                </Holds>
              ) : null}
            </Grids>
          </Holds>
        </Grids>
      </Holds>
    </>
  );
}
