"use client";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import TruckSelector from "../(General)/truckSelector";
import { Buttons } from "@/components/(reusable)/buttons";
import { Titles } from "@/components/(reusable)/titles";
import { Texts } from "@/components/(reusable)/texts";

type Option = {
  id: string;
  label: string;
  code: string;
};

type LastMileageData = {
  lastMileage: number | null;
  startingMileage: number | null;
  equipmentName: string | null;
  equipmentQrId: string | null;
  lastUpdated: string | null;
  lastUser: string | null;
  timesheetEndTime: string | null;
  message?: string;
};

type TruckDriverFormProps = {
  displayValue: string;
  setDisplayValue: Dispatch<SetStateAction<string>>;
  startingMileage: number;
  setStartingMileage: Dispatch<SetStateAction<number>>;
  truck: Option;
  setTruck: React.Dispatch<React.SetStateAction<Option>>;
  selectedOpt: boolean;
  setSelectedOpt: React.Dispatch<React.SetStateAction<boolean>>;
  handleNextStep: () => void;
};

export default function TruckDriverForm({
  displayValue,
  setDisplayValue,
  startingMileage,
  setStartingMileage,
  truck,
  setTruck,
  selectedOpt,
  setSelectedOpt,
  handleNextStep,
}: TruckDriverFormProps) {
  const t = useTranslations("Clock");
  const [lastMileageData, setLastMileageData] =
    useState<LastMileageData | null>(null);
  const [isValidMileage, setIsValidMileage] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const [isLoadingMileage, setIsLoadingMileage] = useState(false);

  // Fetch last mileage when truck is selected
  useEffect(() => {
    const fetchLastMileage = async () => {
      if (!truck.id) {
        setLastMileageData(null);
        setIsValidMileage(true);
        setValidationMessage("");
        return;
      }

      setIsLoadingMileage(true);
      try {
        const response = await fetch(`/api/equipment/${truck.id}/lastMileage`);
        const data: LastMileageData = await response.json();
        setLastMileageData(data);

        // Auto-set starting mileage to last ending mileage if available
        if (
          data?.lastMileage !== null &&
          data?.lastMileage !== undefined &&
          startingMileage === 0
        ) {
          setStartingMileage(data.lastMileage);
          setDisplayValue(`${data.lastMileage.toLocaleString()}`);
        }

        // Always validate current starting mileage, even if it's empty
        validateMileageWithData(startingMileage, data);
      } catch (error) {
        console.error("Error fetching last mileage:", error);
        setLastMileageData(null);
      } finally {
        setIsLoadingMileage(false);
      }
    };

    fetchLastMileage();
  }, [truck.id]); // Removed startingMileage from dependencies to prevent infinite loop

  // Separate effect to handle validation when starting mileage changes
  useEffect(() => {
    if (lastMileageData && truck.id) {
      validateMileageWithData(startingMileage, lastMileageData);
    }
  }, [startingMileage, lastMileageData, truck.id]);

  // Enhanced validation that handles empty values and shows appropriate messages
  const validateMileageWithData = (
    currentMileage: number,
    data: LastMileageData | null,
  ) => {
    // If no truck selected, no validation needed
    if (!truck.id) {
      setIsValidMileage(true);
      setValidationMessage("");
      return;
    }

    // If no mileage entered, show requirement message
    if (!currentMileage || currentMileage <= 0) {
      if (data?.lastMileage !== null && data?.lastMileage !== undefined) {
        setIsValidMileage(false);
        setValidationMessage(
          `Starting mileage required, must be ${data.lastMileage.toLocaleString()} or greater`,
        );
      } else {
        setIsValidMileage(false);
        setValidationMessage("Starting mileage is required");
      }
      return;
    }

    // If there's last mileage data, validate against it
    if (data?.lastMileage !== null && data?.lastMileage !== undefined) {
      if (currentMileage < data.lastMileage) {
        setIsValidMileage(false);
        setValidationMessage(
          `Starting mileage (${currentMileage.toLocaleString()}) cannot be less than the last recorded mileage (${data.lastMileage.toLocaleString()})`,
        );
      } else {
        setIsValidMileage(true);
        setValidationMessage("");
      }
    } else {
      setIsValidMileage(true);
      setValidationMessage("");
    }
  };

  // Legacy function for backward compatibility
  const validateMileage = (
    currentMileage: number,
    lastRecordedMileage: number,
  ) => {
    if (currentMileage < lastRecordedMileage) {
      setIsValidMileage(false);
      setValidationMessage(
        `Starting mileage (${currentMileage.toLocaleString()}) cannot be less than the last recorded mileage (${lastRecordedMileage.toLocaleString()})`,
      );
    } else {
      setIsValidMileage(true);
      setValidationMessage("");
    }
  };

  // Handle mileage input change with validation
  const handleMileageChange = (value: string) => {
    // Strip non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    const number = Number(numericValue);

    // Update display value with commas
    setDisplayValue(number.toLocaleString());
    setStartingMileage(number);

    // Validate against last recorded mileage if available
    if (
      lastMileageData?.lastMileage !== null &&
      lastMileageData?.lastMileage !== undefined
    ) {
      validateMileage(number, lastMileageData.lastMileage);
    }
  };

  // Generate dynamic placeholder based on last mileage data
  const getPlaceholder = () => {
    if (!truck.id || !selectedOpt) {
      return "Select a truck first";
    }

    if (isLoadingMileage) {
      return "Loading last mileage...";
    }

    return t("StartingMileage");
  };

  const isFormValid =
    truck.code !== "" && selectedOpt && startingMileage > 0 && isValidMileage;

  return (
    <Grids rows={"7"} className="h-full w-full pb-5">
      {/* Starting Mileage Input with overlay validation message */}
      <Holds className="row-start-1 row-end-2  w-full relative">
        {/* Validation Message Overlay */}
        {!isValidMileage &&
          lastMileageData?.lastMileage !== null &&
          lastMileageData?.lastMileage !== undefined &&
          !isLoadingMileage && (
            <Holds className="absolute -top-6 left-0 right-0 z-10 px-2">
              <Texts size="p6" className="text-red-600 text-center text-xs">
                Minimum required: {lastMileageData.lastMileage.toLocaleString()}
              </Texts>
            </Holds>
          )}

        <Inputs
          type="text"
          name={"startingMileage"}
          value={displayValue}
          placeholder={getPlaceholder()}
          onChange={(e) => handleMileageChange(e.target.value)}
          onBlur={() => {
            if (startingMileage) {
              setDisplayValue(`${startingMileage.toLocaleString()}`);
            }
          }}
          onFocus={() => {
            // Remove commas when focusing to allow easy editing
            // Only show value if it's greater than 0 to avoid auto-filling with "0"
            setDisplayValue(
              startingMileage && startingMileage > 0
                ? startingMileage.toString()
                : "",
            );
          }}
          disabled={!truck.id || !selectedOpt}
          className={`text-center placeholder:text-sm ${
            !isValidMileage && !isLoadingMileage
              ? "border-red-500 border-2"
              : ""
          } ${
            !truck.id || !selectedOpt
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : ""
          }`}
        />
      </Holds>

      {/* Truck Selector - fixed position */}
      <Holds className="row-start-2 row-end-7 h-full w-full">
        <TruckSelector
          onTruckSelect={(selectedTruck) => {
            // Reset mileage and display value when selecting a new truck
            setStartingMileage(0);
            setDisplayValue("");

            // ^^^^^Added to clear mileage input on truck change
            if (selectedTruck) {
              setTruck(selectedTruck); // Update the truck state with the full Option object
            } else {
              setTruck({ id: "", code: "", label: "" }); // Reset if null
            }
            setSelectedOpt(!!selectedTruck);
          }}
          initialValue={truck}
        />
      </Holds>

      {/* Continue Button */}
      <Holds className="row-start-7 row-end-8 w-full pt-5">
        <Buttons
          className="py-2"
          background={!isFormValid ? "darkGray" : "orange"}
          onClick={() => {
            handleNextStep();
          }}
          disabled={!isFormValid}
        >
          <Titles size={"md"}>{t("Continue")}</Titles>
        </Buttons>
      </Holds>
    </Grids>
  );
}
