"use client";

import { CreateMechanicProject } from "@/actions/mechanicActions";
import SimpleQr from "@/components/(clock)/simple-qr";
import { Bases } from "@/components/(reusable)/bases";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Images } from "@/components/(reusable)/images";
import { Labels } from "@/components/(reusable)/labels";
import { Selects } from "@/components/(reusable)/selects";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Texts } from "@/components/(reusable)/texts";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/(animations)/spinner";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import StepButtons from "@/components/(clock)/step-buttons";

type Equipment = {
  id: string;
  name: string;
  qrId: string;
  lastInspection: Date | null;
  lastRepair: Date | null;
  mileage: number | null;
};

export default function CreateMechanicProjectProcess() {
  const t = useTranslations("MechanicWidget");
  const router = useRouter(); // ALWAYS call hooks at the top
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [scanned, setScanned] = useState(false);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [equipmentIssue, setEquipmentIssue] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [selectedOpt, setSelectedOpt] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "TODAY" | "HIGH" | "MEDIUM" | "LOW" | "PENDING" | ""
  >("");

  const { data: session } = useSession();

  // Fetch equipment data when scannedId is available
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!scannedId) return; // Check inside the async function
      setLoading(true);
      try {
        const response = await fetch(`/api/getEquipmentbyQrId/${scannedId}`);
        if (response.ok) {
          const data = await response.json();
          setEquipment(data);
          if (scanned) {
            setStep(4); // Proceed to step 4 only after successfully fetching data.
          }
        } else {
          console.error(t("ErrorFetchingEquipment"), response.statusText);
        }
      } catch (error) {
        console.error(t("Error:"), error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [scanned, scannedId, t]);

  const PriorityOptions = [
    { label: t("SelectPriority"), value: "" },
    { label: t("HighPriority"), value: "HIGH" },
    { label: t("MediumPriority"), value: "MEDIUM" },
    { label: t("LowPriority"), value: "LOW" },
    { label: t("Today"), value: "TODAY" },
  ];

  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("equipmentId", equipment?.id ?? "");
      formData.append("equipmentIssue", equipmentIssue);
      formData.append("additionalInfo", additionalInfo || "");
      formData.append("location", location);
      formData.append("priority", status);
      formData.append(
        "createdBy",
        `${session?.user?.firstName} ${session?.user?.lastName}`,
      );
      const response = await CreateMechanicProject(formData);
      if (response) {
        router.push("/dashboard/mechanic");
      }
    } catch (error) {
      console.error(t("Error:"), error);
    }
  };

  return (
    <>
      <Bases>
        <Contents>
          {/* Step 1: Select Scanning Option */}
          {step === 1 && (
            <Holds background="white" className="w-full h-full ">
              <Grids rows="10" className="w-full h-full">
                <Holds className="row-start-1 row-end-2 h-full">
                  <TitleBoxes
                    onClick={() => router.push("/dashboard/mechanic")}
                  >
                    <Holds position={"row"}>
                      <Titles size="h3">{t("SelectEquipment")}</Titles>
                      <Images
                        titleImg="/mechanic.svg"
                        titleImgAlt={t("Mechanic")}
                        className="w-8 h-8"
                      />
                    </Holds>
                  </TitleBoxes>
                </Holds>

                <Holds className="row-start-3 row-end-8 h-full justify-center">
                  <Images
                    titleImg="/camera.svg"
                    titleImgAlt={t("Camera")}
                    size="40"
                  />
                </Holds>
                <Holds className="row-start-8 row-end-11 h-full py-4 ">
                  <Contents
                    width={"section"}
                    className="flex flex-col h-full gap-5 py-3"
                  >
                    <Buttons
                      background="lightBlue"
                      onClick={nextStep}
                      className="w-full h-1/2 "
                    >
                      <Titles size="h3">{t("ScanEquipment")}</Titles>
                    </Buttons>

                    <Buttons
                      background="lightBlue"
                      onClick={() => {
                        nextStep();
                        nextStep();
                      }}
                      className="w-full h-1/2 "
                    >
                      <Titles size="h3">{t("SelectManually")}</Titles>
                    </Buttons>
                  </Contents>
                </Holds>
              </Grids>
            </Holds>
          )}

          {/* Step 2: QR Scan Equipment Option */}
          {step === 2 && (
            <Holds background="white" className="w-full h-full py-4">
              <Grids rows="10" gap="5" className="w-full h-full">
                <Holds className="row-start-1 row-end-2 h-full">
                  <TitleBoxes onClick={prevStep}>
                    <Holds position={"row"}>
                      <Titles size="h3">{t("SelectEquipment")}</Titles>
                      <Images
                        titleImg="/mechanic.svg"
                        titleImgAlt={t("Mechanic")}
                        className="w-8 h-8"
                      />
                    </Holds>
                  </TitleBoxes>
                </Holds>
                <Holds className="row-start-3 row-end-9 h-full">
                  <Contents width={"section"} className="h-full py-5">
                    <Holds className="h-full w-full row-start-2 row-end-6 justify-center border-[3px] p-3 border-black rounded-[10px]">
                      <SimpleQr
                        setScannedId={setScannedId}
                        setScanned={setScanned}
                      />
                    </Holds>
                  </Contents>
                </Holds>
                <Holds className="row-start-9 row-end-10 h-full">
                  <Buttons background="none" onClick={() => setStep(3)}>
                    <Texts size="p4" className="underline opacity-60">
                      {t("TroubleScanning")}
                    </Texts>
                  </Buttons>
                </Holds>
              </Grids>
            </Holds>
          )}

          {/* Step 3: Manual Entry of Equipment */}
          {step === 3 && (
            <Holds background="white" className="w-full h-full">
              <Grids rows={"7"} gap={"5"} className="w-full h-full">
                <Holds className="h-full row-start-1 row-end-2">
                  <TitleBoxes onClick={prevStep}>
                    <Holds position={"row"}>
                      <Titles size="h3">{t("SelectEquipment")}</Titles>
                      <Images
                        titleImg="/mechanic.svg"
                        titleImgAlt="Mechanic"
                        className="w-8 h-8"
                      />
                    </Holds>
                  </TitleBoxes>
                </Holds>
                <Contents
                  width={"section"}
                  className="h-full row-start-2 row-end-8 py-5"
                >
                  <Grids rows="7" gap="5" className="w-full h-full">
                    <Holds className="h-full row-start-1 row-end-7">
                      {/* Add code finder here */}
                    </Holds>
                    <Holds className="row-start-7 row-end-8 h-full ">
                      <StepButtons
                        handleNextStep={() => setStep(4)}
                        disabled={!selectedOpt}
                      />
                    </Holds>
                  </Grids>
                </Contents>
              </Grids>
            </Holds>
          )}

          {/* Step 4: Creation of Project with problem, jobsite, status */}
          {step === 4 && (
            <>
              {loading ? (
                <Holds
                  background="white"
                  className="w-full h-full py-4 animate-pulse"
                >
                  <Holds className="flex items-center justify-center h-full animate-pulse">
                    <Spinner />
                  </Holds>
                </Holds>
              ) : (
                <Holds background="white" className="w-full h-full py-4">
                  <Grids rows="7" gap="5" className="w-full h-full">
                    <Holds className="row-start-1 row-end-2">
                      <TitleBoxes onClick={() => setStep(1)}>
                        <Holds position={"row"}>
                          <Titles size="h3">
                            {equipment
                              ? equipment.name.slice(0, 18) + "..."
                              : ""}
                          </Titles>
                        </Holds>
                      </TitleBoxes>
                    </Holds>
                    <Holds className="row-start-2 row-end-6 h-full">
                      <Contents width={"section"} className="h-full">
                        <Holds className="h-full">
                          <Labels size="p4" htmlFor="equipmentIssue">
                            {t("EquipmentIssue")}
                          </Labels>
                          <TextAreas
                            name="equipmentIssue"
                            value={equipmentIssue}
                            onChange={(e) => setEquipmentIssue(e.target.value)}
                            placeholder="Enter a problem description..."
                            rows={2}
                            style={{ resize: "none" }}
                          />
                        </Holds>
                        <Holds className="h-full">
                          <Labels size="p4" htmlFor="additionalInfo">
                            {t("AdditionalInfo")}
                          </Labels>
                          <TextAreas
                            name="additionalInfo"
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder="Enter any additional information..."
                            style={{ resize: "none" }}
                            className="h-full"
                          />
                        </Holds>
                        <Holds className="h-full">
                          <Labels size="p4" htmlFor="location">
                            {t("Location")}
                          </Labels>
                          <TextAreas
                            name="jobsite"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={t("LocationPlaceholder")}
                            rows={2}
                            style={{ resize: "none" }}
                          />
                        </Holds>
                        <Holds className="h-full relative">
                          <Labels size="p4" htmlFor="additionalInfo">
                            {t("Status")}
                          </Labels>
                          {status === "" ? (
                            <Holds className="relative w-full">
                              <Selects
                                name="additionalInfo"
                                value={status}
                                onChange={(e) =>
                                  setStatus(
                                    e.target.value as
                                      | ""
                                      | "TODAY"
                                      | "HIGH"
                                      | "MEDIUM"
                                      | "LOW",
                                  )
                                }
                                className="pl-8"
                              >
                                {PriorityOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                    className="text-center"
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </Selects>
                            </Holds>
                          ) : (
                            <Holds className="relative w-full">
                              <Images
                                titleImg={
                                  status === "TODAY"
                                    ? "/todayPriority.svg"
                                    : status === "HIGH"
                                      ? "/priorityHigh.svg"
                                      : status === "MEDIUM"
                                        ? "/priorityMedium.svg"
                                        : status === "LOW"
                                          ? "/priorityLow.svg"
                                          : "/priorityPending.svg"
                                }
                                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2"
                                titleImgAlt="status"
                              />
                              <Selects
                                name="additionalInfo"
                                value={status}
                                onChange={(e) =>
                                  setStatus(
                                    e.target.value as
                                      | ""
                                      | "TODAY"
                                      | "HIGH"
                                      | "MEDIUM"
                                      | "LOW",
                                  )
                                }
                                className="pl-8"
                              >
                                {PriorityOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                    className="text-center"
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </Selects>
                            </Holds>
                          )}
                        </Holds>
                      </Contents>
                    </Holds>
                    <Holds className="row-start-7 row-end-8">
                      <Contents width={"section"}>
                        <Buttons
                          background={"green"}
                          onClick={handleSubmit}
                          className="py-4"
                        >
                          <Titles size={"h4"}>{t("CreateProject")}</Titles>
                        </Buttons>
                      </Contents>
                    </Holds>
                  </Grids>
                </Holds>
              )}
            </>
          )}
        </Contents>
      </Bases>
    </>
  );
}
