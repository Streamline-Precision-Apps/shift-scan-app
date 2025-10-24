import { setEquipment } from "@/actions/cookieActions";
import { Holds } from "@/components/(reusable)/holds";

import { Dispatch, SetStateAction, useState } from "react";
import { EquipmentSelector } from "../(General)/equipmentSelector";
import { Grids } from "@/components/(reusable)/grids";
import StepButtons from "../step-buttons";

type Option = {
  id: string;
  code: string;
  label: string;
};
type TruckEquipmentOperatorFormProps = {
  equipment: { id: string; code: string; label: string };
  setEquipment: Dispatch<SetStateAction<Option>>;
  selectedOpt: boolean;
  setSelectedOpt: Dispatch<SetStateAction<boolean>>;
  handleNextStep: () => void;
};
export default function TruckEquipmentOperatorForm({
  equipment,
  setEquipment,
  selectedOpt,
  setSelectedOpt,
  handleNextStep,
}: TruckEquipmentOperatorFormProps) {
  return (
    <Grids rows={"7"} gap={"5"} className="h-full w-full pb-5">
      <Holds className="row-start-1 row-end-7 h-full w-full">
        <EquipmentSelector
          onEquipmentSelect={(equipment) => {
            if (equipment) {
              setEquipment(equipment); // Update the equipment state with the full Option object
            } else {
              setEquipment({ id: "", code: "", label: "" }); // Reset if null
            }
            setSelectedOpt(!!equipment);
          }}
          initialValue={equipment}
        />
      </Holds>
      <Holds className="row-start-7 row-end-8 w-full justify-center">
        <StepButtons
          handleNextStep={handleNextStep}
          disabled={!equipment.code}
        />
      </Holds>
    </Grids>
  );
}
