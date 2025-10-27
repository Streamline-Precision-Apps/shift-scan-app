"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";
import Qr from "./qr";
import { equipmentType } from "./companyDocuments";

type QRStepProps = {
  handleReturnPath: () => void;
  handleNextStep: () => void;
  scanned: string | null;
  setScanned: React.Dispatch<React.SetStateAction<string | null>>;
  equipment: equipmentType[];
};

export default function EquipmentQRScanner({
  handleReturnPath,
  handleNextStep,
  scanned,
  setScanned,
  equipment,
}: QRStepProps) {
  const t = useTranslations("Clock");
  const [startCamera, setStartCamera] = useState<boolean>(false);
  const [failedToScan, setFailedToScan] = useState<boolean>(false);
  const [scanErrorType, setScanErrorType] = useState<
    "camera" | "permission" | "invalid" | null
  >(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (failedToScan) {
      timeout = setTimeout(() => {
        setFailedToScan(false);
        setScanErrorType(null);
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [failedToScan]);

  const getErrorMessage = () => {
    switch (scanErrorType) {
      case "camera":
        return t("NoCameraAvailable");
      case "permission":
        return t("CameraPermissionDenied");
      case "invalid":
        return t("InvalidEquipmentQR");
      default:
        return t("FailedToScan");
    }
  };

  return (
    <Holds background="white" className="h-full w-full">
      <Contents width="section" className="h-full py-5">
        <Grids rows="7" gap="5" className="h-full w-full">
          <Holds className="row-start-1 row-end-2 h-full w-full justify-center">
            <Grids rows="2" cols="5" gap="3" className="h-full w-full">
              <Holds
                className="row-start-1 row-end-2 col-start-1 col-end-2 h-full w-full justify-center"
                onClick={handleReturnPath}
              >
                <Images
                  titleImg="/arrowBack.svg"
                  titleImgAlt="back"
                  position="left"
                />
              </Holds>
              <Holds className="row-start-2 row-end-3 col-span-5 h-full w-full justify-center">
                <Titles size="h1">{t("ScanEquipment")}</Titles>
              </Holds>
            </Grids>
          </Holds>

          {!startCamera ? (
            <Holds className="h-full w-full row-start-2 row-end-7">
              <Grids rows="6" gap="2" className="h-full w-full">
                <Holds className="h-full w-full row-start-2 row-end-6 justify-center border-[3px] border-black rounded-[10px] p-3">
                  <Holds className="h-full w-full justify-center bg-app-dark-gray border-[3px] border-black rounded-[10px]">
                    <Images
                      titleImg="/camera.svg"
                      titleImgAlt="clockIn"
                      position="center"
                      size="40"
                    />
                  </Holds>
                  {failedToScan && (
                    <Holds className="h-full w-full row-start-6 row-end-7 justify-center">
                      <Texts text="red" size="p4">
                        {getErrorMessage()}
                      </Texts>
                    </Holds>
                  )}
                </Holds>
              </Grids>
            </Holds>
          ) : (
            <Holds className="h-full w-full row-start-2 row-end-7 relative">
              <Grids rows="6" gap="2">
                <Holds className="h-full w-full row-start-2 row-end-6 justify-center border-[3px] p-3 border-black rounded-[10px]">
                  <Qr
                    handleNextStep={handleReturnPath}
                    startCamera={startCamera}
                    setStartCamera={setStartCamera}
                    setScanError={setFailedToScan}
                    setScanErrorType={setScanErrorType}
                    setScanned={setScanned}
                    equipment={equipment}
                  />
                </Holds>

                <Holds className="h-full w-full row-start-6 row-end-7 justify-center">
                  <Buttons
                    shadow={"none"}
                    background="none"
                    onClick={handleNextStep}
                  >
                    <Texts size="p4">{t("TroubleScanning")}</Texts>
                  </Buttons>
                </Holds>
              </Grids>
            </Holds>
          )}

          {!startCamera && (
            <Holds className="row-start-7 row-end-8  w-full justify-center">
              <Buttons
                onClick={() => setStartCamera(true)}
                background="green"
                className="w-full py-3"
              >
                <Titles size="h2">{t("StartCamera")}</Titles>
              </Buttons>
            </Holds>
          )}
        </Grids>
      </Contents>
    </Holds>
  );
}
