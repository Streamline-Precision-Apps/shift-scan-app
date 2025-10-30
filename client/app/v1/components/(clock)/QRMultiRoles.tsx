"use client";
import React, {
  Dispatch,
  SetStateAction,
  use,
  useEffect,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import QR from "./qr";
import { Buttons } from "../(reusable)/buttons";
import { Texts } from "../(reusable)/texts";
import { Titles } from "../(reusable)/titles";
import { Holds } from "../(reusable)/holds";
import { Grids } from "../(reusable)/grids";
import { Images } from "../(reusable)/images";
import { Selects } from "../(reusable)/selects";
import { Contents } from "../(reusable)/contents";
import { TitleBoxes } from "../(reusable)/titleBoxes";

import { usePermissions } from "@/app/lib/context/permissionContext";
import { useUserStore } from "@/app/lib/store/userStore";
import { useCostCodeStore } from "@/app/lib/store/costCodeStore";
import { useProfitStore } from "@/app/lib/store/profitStore";

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
  setCC?: Dispatch<SetStateAction<Option>>;
  setMaterialType?: Dispatch<SetStateAction<string>>;
  setShiftType?: Dispatch<SetStateAction<string>>;
  setLaborType?: Dispatch<SetStateAction<string>>;
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
  setCC,
  setMaterialType,
  setShiftType,
  setLaborType,
}: QRStepProps) {
  const t = useTranslations("Clock");
  const [startCamera, setStartCamera] = useState<boolean>(false);
  const { user } = useUserStore();
  const { costCodes: costcodeResults } = useCostCodeStore();
  const { jobsites: jobsiteResults } = useProfitStore();

  const tascoView = user?.tascoView;
  const truckView = user?.truckView;
  const mechanicView = user?.mechanicView;
  const laborView = user?.laborView;

  const [numberOfViews, setNumberOfViews] = useState(0);
  const [failedToScan, setFailedToScan] = useState(false);
  // Local state to store the selected role until camera starts
  const [tempClockInRole, setTempClockInRole] = useState<string | undefined>(
    clockInRole
  );
  const {
    permissionStatus,
    requestCameraPermission,
    requestLocationPermission,
  } = usePermissions();
  useEffect(() => {
    const requestPermissions = async () => {
      // Skip if both permissions are already granted
      if (permissionStatus.camera && permissionStatus.location) {
        return;
      }

      try {
        if (!permissionStatus.camera) {
          await requestCameraPermission();
        }
        if (!permissionStatus.location) {
          await requestLocationPermission();
        }
      } catch (error) {
        console.error("Error requesting permissions:", error);
      }
    };

    requestPermissions();
  }, [permissionStatus, requestCameraPermission, requestLocationPermission]);

  const selectView = (selectedRoleType: string) => {
    setClockInRoleTypes(selectedRoleType);

    // Map the selected role type to the main clock-in role but only update local state
    let newRole: string;
    if (
      selectedRoleType === "tascoAbcdLabor" ||
      selectedRoleType === "tascoAbcdEquipment" ||
      selectedRoleType === "tascoEEquipment" ||
      selectedRoleType === "tascoFEquipment"
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

  const handleTascoContinue = () => {
    if (!clockInRoleTypes || !costcodeResults || !jobsiteResults) return;

    // Helper function to find cost code by exact name match
    const findCostCodeByExactName = (exactName: string) => {
      const foundCostCode = costcodeResults.find((cc) => cc.name === exactName);
      return foundCostCode
        ? {
            id: foundCostCode.id,
            label: foundCostCode.name,
            code: foundCostCode.name,
          }
        : null;
    };

    // Helper function to find jobsite by name pattern
    const findJobsiteByName = (namePattern: string) => {
      const foundJobsite = jobsiteResults.find((js) =>
        js.name.toLowerCase().includes(namePattern.toLowerCase())
      );

      return foundJobsite
        ? {
            id: foundJobsite.id,
            label: foundJobsite.name,
            code: foundJobsite.qrId,
          }
        : null;
    };

    // Set predefined data based on selected Tasco shift type
    switch (clockInRoleTypes) {
      case "tascoAbcdEquipment":
        // ABCD Equipment Operator → #80.40 Amalgamated Equipment
        const equipmentCostCode = findCostCodeByExactName(
          "#80.40 Amalgamated Equipment"
        );
        if (equipmentCostCode) {
          setCC?.(equipmentCostCode);
        }
        setShiftType?.("ABCD Shift");
        setLaborType?.("Operator");
        break;

      case "tascoAbcdLabor":
        // ABCD Shift Labor → #80.20 Amalgamated Labor
        const laborCostCode = findCostCodeByExactName(
          "#80.20 Amalgamated Labor"
        );
        if (laborCostCode) {
          setCC?.(laborCostCode);
        }
        setShiftType?.("ABCD Shift");
        setLaborType?.("Manual Labor");
        break;

      case "tascoEEquipment":
        // E Shift - Mud Conditioning → #80.40 Amalgamated Equipment
        const eMudCostCode = findCostCodeByExactName(
          "#80.40 Amalgamated Equipment"
        );
        if (eMudCostCode) {
          setCC?.(eMudCostCode);
        }
        const eJobsite = findJobsiteByName("MH2526");
        if (eJobsite) {
          setJobsite?.(eJobsite);
        }
        setShiftType?.("E Shift");
        setMaterialType?.("Mud Conditioning");
        setLaborType?.("EShift");
        break;

      case "tascoFShift":
      case "tascoFEquipment":
        // F Shift - Lime Rock → #80.40 Amalgamated Equipment (same as E shift but different material)
        const fCostCode = findCostCodeByExactName(
          "#80.40 Amalgamated Equipment"
        );
        if (fCostCode) {
          setCC?.(fCostCode);
        }
        const fJobsite = findJobsiteByName("MH2526");
        if (fJobsite) {
          setJobsite?.(fJobsite);
        }
        setShiftType?.("F Shift");
        setMaterialType?.("Lime Rock");
        setLaborType?.("FShift");
        break;
    }

    // Update parent state with our local role state
    if (tempClockInRole) {
      setClockInRole(tempClockInRole);
    }

    // Move to next step
    handleNextStep();
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

  // Auto-set predefined data when clockInRoleTypes is already set (e.g., from switch jobs)
  useEffect(() => {
    if (
      (clockInRoleTypes === "tascoFShift" ||
        clockInRoleTypes === "tascoFEquipment") &&
      jobsiteResults &&
      costcodeResults
    ) {
      // Helper function to find cost code by exact name
      const findCostCodeByExactName = (namePattern: string) => {
        const foundCostCode = costcodeResults.find((cc) =>
          cc.name.toLowerCase().includes(namePattern.toLowerCase())
        );
        return foundCostCode
          ? {
              id: foundCostCode.id,
              label: foundCostCode.name,
              code: foundCostCode.name,
            }
          : null;
      };

      // Helper function to find jobsite by name pattern (same as E-shift)
      const findJobsiteByName = (namePattern: string) => {
        const foundJobsite = jobsiteResults.find((js) =>
          js.name.toLowerCase().includes(namePattern.toLowerCase())
        );

        return foundJobsite
          ? {
              id: foundJobsite.id,
              label: foundJobsite.name,
              code: foundJobsite.qrId,
            }
          : null;
      };

      // F Shift - Lime Rock → #80.40 Amalgamated Equipment (same as E shift but different material)
      const fCostCode = findCostCodeByExactName("#80.40 Amalgamated Equipment");
      if (fCostCode) {
        setCC?.(fCostCode);
      }
      const fJobsite = findJobsiteByName("MH2526");
      if (fJobsite) {
        setJobsite?.(fJobsite);
      }
      setShiftType?.("F Shift");
      setMaterialType?.("Lime Rock");
    }
  }, [
    clockInRoleTypes,
    jobsiteResults,
    costcodeResults,
    setCC,
    setJobsite,
    setShiftType,
    setMaterialType,
  ]);

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
                              <option value="tascoFShift">
                                {t("TASCOFShift")}
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
                              <option value="tascoAbcdLabor">
                                {t("TASCOABCDLabor")}
                              </option>
                              <option value="tascoAbcdEquipment">
                                {t("TASCOABCDEquipmentOperator")}
                              </option>
                              <option value="tascoEEquipment">
                                {t("TASCOEEquipmentOperator")}
                              </option>
                              <option value="tascoFShift">
                                {t("TASCOFShift")}
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
                        // Check if it's a Tasco role
                        const isTascoRole =
                          tempClockInRole === "tasco" ||
                          (clockInRoleTypes &&
                            [
                              "tascoAbcdLabor",
                              "tascoAbcdEquipment",
                              "tascoEEquipment",
                              "tascoFShift",
                            ].includes(clockInRoleTypes));

                        if (isTascoRole) {
                          // Handle Tasco continue logic
                          handleTascoContinue();
                        } else {
                          // Handle regular camera start logic
                          if (tempClockInRole) {
                            setClockInRole(tempClockInRole);
                          }
                          setStartCamera(!startCamera);
                        }
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
                      <Titles size={"md"}>
                        {tempClockInRole === "tasco" ||
                        (clockInRoleTypes &&
                          [
                            "tascoAbcdLabor",
                            "tascoAbcdEquipment",
                            "tascoEEquipment",
                            "tascoFShift",
                          ].includes(clockInRoleTypes))
                          ? t("Continue")
                          : t("StartCamera")}
                      </Titles>
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
