"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Grids } from "@/components/(reusable)/grids";
import { useTranslations } from "next-intl";
import StepButtons from "../step-buttons";
import { TitleBoxes } from "../../(reusable)/titleBoxes";
import { useOperator } from "@/app/context/operatorContext";
import { Titles } from "../../(reusable)/titles";
import TruckDriverForm from "./truckDriverForm";
import TruckEquipmentOperatorForm from "./truckEquipmentOperatorForm";

type Option = {
  id: string;
  code: string;
  label: string;
};

type TruckClockInFormProps = {
  handleNextStep: () => void;
  handlePrevStep: () => void;
  laborType: string;
  truck: Option;
  setLaborType: React.Dispatch<React.SetStateAction<string>>;
  setTruck: Dispatch<SetStateAction<Option>>;
  setStartingMileage: React.Dispatch<React.SetStateAction<number>>;
  clockInRoleTypes: string | undefined;
  returnPathUsed: boolean;
  setStep: Dispatch<SetStateAction<number>>;
  startingMileage: number;
  equipment: Option;
  setEquipment: Dispatch<SetStateAction<Option>>;
};

export default function TruckClockInForm({
  handleNextStep,
  laborType,
  truck,
  setLaborType,
  setTruck,
  setStartingMileage,
  handlePrevStep,
  clockInRoleTypes,
  returnPathUsed,
  setStep,
  startingMileage,
  equipment,
  setEquipment,
}: TruckClockInFormProps) {
  const t = useTranslations("Clock");
  const { equipmentId } = useOperator();
  const [displayValue, setDisplayValue] = useState(
    startingMileage ? `${startingMileage.toLocaleString()} Miles` : "",
  );

  const [selectedOpt, setSelectedOpt] = useState<boolean>(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [clockInTruckType, setClockInTruckType] = useState<
    string | undefined
  >();

  useEffect(() => {
    setClockInTruckType(clockInRoleTypes);
    if (clockInTruckType === "truckLabor" && !hasTriggered) {
      handleNextStep();
      setHasTriggered(true); // Set the flag to prevent future triggers
    }
  }, [clockInTruckType, hasTriggered]);

  useEffect(() => {
    if (equipmentId) {
      setSelectedOpt(true);
    }
  }, [equipmentId]);

  return (
    <Holds background={"white"} className={"w-full h-full"}>
      <Grids rows={"7"} gap={"5"} className="h-full w-full ">
        <Holds className="row-start-1 row-end-2 h-full w-full">
          <TitleBoxes
            onClick={returnPathUsed ? () => setStep(1) : handlePrevStep}
          >
            {clockInRoleTypes === "truckDriver" ? (
              <Titles size={"md"}>{t("EnterTruckInfo")}</Titles>
            ) : clockInRoleTypes === "truckEquipmentOperator" ? (
              <Titles size={"md"}>{t("EnterEquipmentInfo")}</Titles>
            ) : (
              ""
            )}
          </TitleBoxes>
        </Holds>
        <Holds className="row-start-2 row-end-8 h-full w-full">
          <Contents width="section">
            {clockInRoleTypes === "truckDriver" && (
              <TruckDriverForm
                displayValue={displayValue}
                setDisplayValue={setDisplayValue}
                startingMileage={startingMileage}
                setStartingMileage={setStartingMileage}
                truck={truck}
                setTruck={setTruck}
                selectedOpt={selectedOpt}
                setSelectedOpt={setSelectedOpt}
                handleNextStep={handleNextStep}
              />
            )}
            {clockInRoleTypes === "truckEquipmentOperator" && (
              <TruckEquipmentOperatorForm
                handleNextStep={handleNextStep}
                equipment={equipment}
                setEquipment={setEquipment}
                selectedOpt={selectedOpt}
                setSelectedOpt={setSelectedOpt}
              />
            )}
          </Contents>
        </Holds>
      </Grids>
    </Holds>
  );
}
