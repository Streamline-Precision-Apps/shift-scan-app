"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Holds } from "@/components/(reusable)/holds";
import { Selects } from "@/components/(reusable)/selects";
import { Grids } from "@/components/(reusable)/grids";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { EquipmentSelector } from "../(General)/equipmentSelector";
import { MaterialType } from "@/lib/types";

type TascoClockInFormProps = {
  handlePrevStep: () => void;
  handleNextStep: () => void;
  shiftType: string;
  setShiftType: React.Dispatch<React.SetStateAction<string>>;
  laborType: string;
  setLaborType: React.Dispatch<React.SetStateAction<string>>;
  materialType: string;
  setMaterialType: React.Dispatch<React.SetStateAction<string>>;
  clockInRoleTypes: string | undefined;
  returnPathUsed: boolean;
  setStep: Dispatch<SetStateAction<number>>;
  equipment: Option;
  setEquipment: Dispatch<SetStateAction<Option>>;
};

type Option = {
  id: string;
  code: string;
  label: string;
};

export default function TascoClockInForm({
  handleNextStep,
  laborType,
  setLaborType,
  materialType,
  setMaterialType,
  shiftType,
  setShiftType,
  handlePrevStep,
  clockInRoleTypes,
  returnPathUsed,
  setStep,
  equipment,
  setEquipment,
}: TascoClockInFormProps) {
  const t = useTranslations("Clock");
  const [loading, setLoading] = useState(false);
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);

  useEffect(() => {
    const fetchMaterialTypes = async () => {
      setLoading(true);
      try {
        const materialTypesResponse = await fetch("/api/getMaterialTypes");
        const materialTypesData = await materialTypesResponse.json();
        setMaterialTypes(materialTypesData);
      } catch {
        console.error("Error fetching material types");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialTypes();
  }, []);

  return (
    <Holds
      background={"white"}
      className={loading ? " h-full w-full" : "w-full h-full"}
    >
      <Grids rows={"7"} gap={"5"} className="h-full w-full">
        <Holds className="row-start-1 row-end-2 h-full w-full">
          <TitleBoxes
            onClick={returnPathUsed ? () => setStep(1) : handlePrevStep}
          >
            <>
              {clockInRoleTypes === "tascoAbcdLabor" ? (
                <Titles size={"md"}>{t("SelectMaterialType")}</Titles>
              ) : clockInRoleTypes === "tascoAbcdEquipment" ? (
                <Titles size={"md"}>
                  {t("SelectMaterialTypeAndEquipment")}
                </Titles>
              ) : clockInRoleTypes === "tascoEEquipment" ? (
                <Titles size={"md"}>{t("Title-equipment-operator")}</Titles>
              ) : (
                ""
              )}
            </>
          </TitleBoxes>
        </Holds>
        {/* Only Show Material & Labor Type Selection for ABCDShift */}
        <Holds className="row-start-2 row-end-8 h-full w-full">
          <Contents width={"section"}>
            <Grids rows={"7"} gap={"5"} className="h-full w-full pb-5 ">
              {clockInRoleTypes === "tascoEEquipment" ? (
                <Holds className="row-start-1 row-end-7 h-full w-full">
                  <EquipmentSelector
                    onEquipmentSelect={(equipment) => {
                      if (equipment) {
                        setEquipment(equipment); // Update the equipment state with the full Option object
                      } else {
                        setEquipment({ id: "", code: "", label: "" }); // Reset if null
                      }
                    }}
                    initialValue={equipment}
                  />
                </Holds>
              ) : clockInRoleTypes === "tascoAbcdEquipment" ? (
                <Holds className="row-start-1 row-end-7 h-full w-full">
                  <Grids rows={"10"}>
                    <Holds className="row-start-1 row-end-2 w-full">
                      <Selects
                        value={materialType || ""}
                        onChange={(e) => setMaterialType(e.target.value)}
                        className={`text-center ${
                          materialType === "" ? "text-app-dark-gray" : ""
                        } `}
                      >
                        <option value="">{t("SelectMaterialHere")}</option>
                        {materialTypes.map((option) => (
                          <option key={option.name} value={option.name}>
                            {option.name}
                          </option>
                        ))}
                      </Selects>
                    </Holds>
                    <Holds className="row-start-2 row-end-11 h-full w-full">
                      <EquipmentSelector
                        onEquipmentSelect={(equipment) => {
                          if (equipment) {
                            setEquipment(equipment); // Update the equipment state with the full Option object
                          } else {
                            setEquipment({ id: "", code: "", label: "" }); // Reset if null
                          }
                        }}
                        initialValue={equipment}
                      />
                    </Holds>
                  </Grids>
                </Holds>
              ) : clockInRoleTypes === "tascoAbcdLabor" ? (
                <Holds className="row-start-1 row-end-7 h-full w-full">
                  <Selects
                    value={materialType || ""}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className={`text-center ${
                      materialType === "" ? "text-app-dark-gray" : ""
                    }`}
                  >
                    <option value="">{t("SelectMaterialType")}</option>
                    {materialTypes.map((option) => (
                      <option key={option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </Selects>
                </Holds>
              ) : null}

              <Holds className="row-start-7 row-end-8  w-full">
                {clockInRoleTypes === "tascoEEquipment" ? (
                  <Buttons
                    background={equipment.code === "" ? "darkGray" : "orange"}
                    className="py-2"
                    onClick={handleNextStep}
                    disabled={equipment.code === ""}
                  >
                    <Titles size={"md"}>{t("Continue")}</Titles>
                  </Buttons>
                ) : clockInRoleTypes === "tascoAbcdEquipment" ? (
                  <Buttons
                    background={materialType === "" ? "darkGray" : "orange"}
                    className="py-2"
                    onClick={handleNextStep}
                    disabled={materialType === ""}
                  >
                    <Titles size={"md"}>{t("Continue")}</Titles>
                  </Buttons>
                ) : clockInRoleTypes === "tascoAbcdLabor" ? (
                  <Buttons
                    background={materialType === "" ? "darkGray" : "orange"}
                    className="py-2"
                    onClick={handleNextStep}
                    disabled={materialType === ""}
                  >
                    <Titles size={"md"}>{t("Continue")}</Titles>
                  </Buttons>
                ) : null}
              </Holds>
            </Grids>
          </Contents>
        </Holds>
      </Grids>
    </Holds>
  );
}
