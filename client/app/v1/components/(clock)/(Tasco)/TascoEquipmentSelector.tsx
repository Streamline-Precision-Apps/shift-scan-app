"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Titles } from "../../(reusable)/titles";
import { Holds } from "../../(reusable)/holds";
import { Grids } from "../../(reusable)/grids";
import { Contents } from "../../(reusable)/contents";
import { TitleBoxes } from "../../(reusable)/titleBoxes";
import StepButtons from "../step-buttons";
import { EquipmentSelector } from "../(General)/equipmentSelector";

type Option = {
  id: string;
  label: string;
  code: string;
};

type TascoEquipmentSelectorProps = {
  handleNextStep: () => void;
  handlePrevStep: () => void;
  equipment: Option;
  setEquipment: React.Dispatch<React.SetStateAction<Option>>;
};

export default function TascoEquipmentSelector({
  handleNextStep,
  handlePrevStep,
  equipment,
  setEquipment,
}: TascoEquipmentSelectorProps) {
  const t = useTranslations("Clock");

  const handleEquipmentSelect = (selectedEquipment: Option | null) => {
    if (selectedEquipment) {
      setEquipment(selectedEquipment);
    } else {
      setEquipment({ id: "", code: "", label: "" });
    }
  };

  return (
    <Holds background={"white"} className="h-full w-full">
      <Grids rows={"7"} gap={"5"} className="h-full w-full">
        <Holds className="row-start-1 row-end-2 h-full w-full">
          <TitleBoxes onClick={handlePrevStep}>
            <Titles size={"h4"}>{t("Title-equipment")}</Titles>
          </TitleBoxes>
        </Holds>

        <Holds className="row-start-2 row-end-8 h-full w-full">
          <Contents width="section">
            <Grids rows={"7"} gap={"5"} className="h-full w-full pb-5">
              <Holds className="row-start-1 row-end-7 h-full w-full">
                <EquipmentSelector
                  onEquipmentSelect={handleEquipmentSelect}
                  initialValue={equipment}
                  useEquipmentId={true}
                />
              </Holds>

              <Holds className="row-start-7 row-end-8 w-full justify-center">
                <StepButtons
                  handleNextStep={handleNextStep}
                  disabled={equipment.code === ""}
                />
              </Holds>
            </Grids>
          </Contents>
        </Holds>
      </Grids>
    </Holds>
  );
}
