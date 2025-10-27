"use client";
import { Holds } from "@/components/(reusable)/holds";
import { useEffect, useState, useRef } from "react";
import { Suspense } from "react";
import SelectEquipment from "./SelectEquipment";
import EquipmentScanner from "./EquipmentScanner";
import EquipmentSelectorView from "./EquipmentSelector";
import LoadingScannerFallback from "./LoadingScannerFallback";
import LoadingSelectorFallback from "./LoadingSelectorFallback";
type Option = {
  id: string;
  label: string;
  code: string;
};
export default function ScanEquipment() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"Scan" | "Select" | "">("");
  const [equipmentQr, setEquipmentQr] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Option>({
    id: "",
    label: "",
    code: "",
  });
  const [jobSite, setJobSite] = useState<Option>({
    id: "",
    label: "",
    code: "",
  });

  // Ref to prevent multiple submissions
  const submitRef = useRef(false);

  useEffect(() => {
    const getJobsite = async () => {
      const jobsiteResult = await fetch("/api/getRecentJobDetails");
      const jobsiteData = await jobsiteResult.json();
      setJobSite({
        id: jobsiteData.id,
        label: jobsiteData.name,
        code: jobsiteData.qrId,
      });
    };
    getJobsite();
  }, []);

  return (
    <>
      <Holds className="h-full">
        {step === 1 ? (
          <SelectEquipment
            setStep={setStep}
            setMethod={setMethod}
            error={error}
            setError={setError}
          />
        ) : step === 2 ? (
          <>
            {method === "Scan" ? (
              <Suspense fallback={<LoadingScannerFallback />}>
                <EquipmentScanner
                  setError={setError}
                  setStep={setStep}
                  setMethod={setMethod}
                  setEquipmentQr={setEquipmentQr}
                  equipmentQr={equipmentQr}
                  jobSite={jobSite}
                  submitRef={submitRef}
                />
              </Suspense>
            ) : method === "Select" ? (
              <Suspense fallback={<LoadingSelectorFallback />}>
                <EquipmentSelectorView
                  setStep={setStep}
                  setMethod={setMethod}
                  setEquipment={setEquipment}
                  equipment={equipment}
                  jobSite={jobSite}
                  submitRef={submitRef}
                />
              </Suspense>
            ) : null}
          </>
        ) : null}
      </Holds>
    </>
  );
}
