import { Inputs } from "@/components/(reusable)/inputs";
import { updateTruckingMileage } from "@/actions/truckingActions";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Texts } from "@/components/(reusable)/texts";
import { Titles } from "@/components/(reusable)/titles";

type StateMileage = {
  id: string;
  truckingLogId: string;
  state?: string;
  stateLineMileage?: number;
  createdAt?: Date;
};

type Refueled = {
  id: string;
  employeeEquipmentLogId: string | null;
  truckingLogId: string | null;
  gallonsRefueled: number | null;
  milesAtFueling: number | null;
  tascoLogId: string | null;
};

export const EndingMileage = ({
  truckingLog,
  endMileage,
  setEndMileage,
  setStartingMileage,
  startingMileage,
  stateMileage,
  refuelLogs,
}: {
  truckingLog: string | undefined;
  endMileage: number | null;
  setEndMileage: React.Dispatch<React.SetStateAction<number | null>>;
  setStartingMileage: React.Dispatch<React.SetStateAction<number | null>>;
  startingMileage: number | null;
  stateMileage?: StateMileage[];
  refuelLogs?: Refueled[];
}) => {
  const t = useTranslations("TruckingAssistant");
  const [validationMessage, setValidationMessage] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Calculate minimum required end mileage
  const getMinimumEndMileage = (): number | null => {
    if (!startingMileage) return null;

    let maxMileage = startingMileage;

    // Check state mileage logs
    if (stateMileage && stateMileage.length > 0) {
      stateMileage.forEach((log) => {
        if (log.stateLineMileage && log.stateLineMileage > maxMileage) {
          maxMileage = log.stateLineMileage;
        }
      });
    }

    // Check refuel logs
    if (refuelLogs && refuelLogs.length > 0) {
      refuelLogs.forEach((log) => {
        if (log.milesAtFueling && log.milesAtFueling > maxMileage) {
          maxMileage = log.milesAtFueling;
        }
      });
    }

    return maxMileage;
  };

  // Validation function
  const validateEndMileage = (value: number | null) => {
    const minRequired = getMinimumEndMileage();

    if (minRequired === null) {
      setValidationMessage("");
      setIsValid(true);
      return true;
    }

    // Show validation message for empty/null values
    if (value === null || value === 0) {
      setValidationMessage(
        `${t(`EndRequiredMileageMustBe`)} ${minRequired.toLocaleString()}`,
      );
      setIsValid(false);
      return false;
    }

    if (value < minRequired) {
      setValidationMessage(
        `${t(`EndMileageMustBe`)} ${minRequired.toLocaleString()}`,
      );
      setIsValid(false);
      return false;
    }

    setValidationMessage("");
    setIsValid(true);
    return true;
  };

  // Validate on mount and when dependencies change
  useEffect(() => {
    validateEndMileage(endMileage);
  }, [startingMileage, stateMileage, refuelLogs, endMileage]);

  const updateEndingMileage = async () => {
    if (!validateEndMileage(endMileage)) return;

    const formData = new FormData();
    formData.append("endingMileage", endMileage?.toString() || "");
    formData.append("id", truckingLog ?? "");
    updateTruckingMileage(formData);
  };

  const handleMileageChange = (value: string) => {
    // Strip non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    const number = numericValue ? parseInt(numericValue) : null;

    setEndMileage(number);
    validateEndMileage(number);
  };

  return (
    <div className="w-full">
      <div className="w-full border-b-[2px] border-black mb-2">
        <Titles size={"md"} className="text-left">
          {t("Mileage")}
        </Titles>
      </div>
      <div className="w-full flex flex-row gap-2 items-center pb-1">
        <Texts size={"sm"} className="text-left mb-1">
          {startingMileage ? `${t("BeginningMileage")}:` : ""}
        </Texts>
        <Texts size={"sm"} className="text-left mb-1">
          {startingMileage ? `${startingMileage.toLocaleString()} Mi` : ""}
        </Texts>
      </div>
      <div className="w-full flex flex-col pb-1">
        <p className="text-sm">{t("EndMileage")}: </p>
        <div className="w-full">
          <Inputs
            type="text"
            name="endingMileage"
            value={endMileage ? endMileage.toLocaleString() : ""}
            onChange={(e) => handleMileageChange(e.target.value)}
            onBlur={updateEndingMileage}
            placeholder={t("EnterEndingMileageHere")}
            className={`w-full text-left focus:outline-none  ${
              endMileage === null || !isValid
                ? "placeholder:text-app-red border-red-500"
                : "border-black"
            } h-8 border-[3px]  rounded-[10px] text-base mb-0   focus:outline-hidden focus:ring-transparent focus:border-current`}
          />

          {validationMessage && (
            <div className="text-xs text-app-red leading-tight">
              {validationMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
