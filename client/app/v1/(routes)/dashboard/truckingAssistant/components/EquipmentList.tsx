"use client";
import {
  updateEquipmentLogs,
  updateEquipmentLogsEquipment,
} from "@/actions/truckingActions";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Contents } from "@/components/(reusable)/contents";
import { useTranslations } from "next-intl";
import { Texts } from "@/components/(reusable)/texts";
import { NModals } from "@/components/(reusable)/newmodals";
import { EquipmentSelector } from "@/components/(clock)/(General)/equipmentSelector";
import { Buttons } from "@/components/(reusable)/buttons";
import { Grids } from "@/components/(reusable)/grids";
import { Titles } from "@/components/(reusable)/titles";
import Spinner from "@/components/(animations)/spinner";
import { Label } from "@/components/ui/label";

type EquipmentHauled = {
  id: string;
  truckingLogId: string | null;
  equipmentId: string | null;
  createdAt: Date;
  source: string | null;
  destination: string | null;
  Equipment: {
    id: string;
    name: string;
  } | null;
  JobSite: {
    id: string;
    name: string;
  } | null;
  startMileage: number | null;
  endMileage: number | null;
};

type Option = {
  id: string;
  label: string;
  code: string;
};

export default function EquipmentList({
  equipmentHauled,
  setEquipmentHauled,
  truckingLog,
}: {
  equipmentHauled: EquipmentHauled[];
  setEquipmentHauled: Dispatch<SetStateAction<EquipmentHauled[] | undefined>>;
  truckingLog: string;
}) {
  const t = useTranslations("TruckingAssistant");
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Option>({
    id: "",
    label: "",
    code: "",
  });
  const [form, setForm] = useState({
    source: "",
    destination: "",
    startingMileage: "",
    endMileage: "",
  });
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // Unified field change handler
  const handleFieldChange = (
    id: string,
    field: keyof EquipmentHauled,
    value: string | number | null,
  ) => {
    setEquipmentHauled((prev) =>
      prev
        ? prev.map((item) =>
            item.id === id ? { ...item, [field]: value } : item,
          )
        : [],
    );
  };

  // Unified field blur handler
  const handleFieldBlur = async (id: string) => {
    const log = equipmentHauled.find((item) => item.id === id);
    if (!log) return;
    const formData = new FormData();
    formData.append("id", log.id);
    formData.append("truckingLogId", truckingLog);
    formData.append("source", log.source ?? "");
    formData.append("destination", log.destination ?? "");
    formData.append("startMileage", log.startMileage?.toString() ?? "");
    formData.append("endMileage", log.endMileage?.toString() ?? "");
    await updateEquipmentLogs(formData);
  };

  // Equipment update (modal)
  const handleUpdateEquipment = async (equipment: Option | null) => {
    if (!selectedIndex || !equipment) return;
    setEquipmentLoading(true);
    try {
      const currentLog = equipmentHauled.find(
        (item) => item.id === selectedIndex,
      );

      const formData = new FormData();
      formData.append("id", selectedIndex);
      formData.append("truckingLogId", truckingLog);
      formData.append("equipmentId", equipment.id);
      formData.append("equipmentName", equipment.label);

      await updateEquipmentLogsEquipment(formData);
      setEquipmentHauled((prev) =>
        prev
          ? prev.map((item) =>
              item.id === selectedIndex
                ? {
                    ...item,
                    equipmentId: equipment.code,
                    Equipment: {
                      id: equipment.code,
                      name: equipment.label,
                    },
                  }
                : item,
            )
          : [],
      );
      setIsEquipmentOpen(false);
      setSelectedIndex(null);
      setSelectedEquipment({ id: "", label: "", code: "" });
    } catch (error) {
      console.error(t("ErrorSubmittingData"), error);
    } finally {
      setEquipmentLoading(false);
    }
  };

  return (
    <>
      <Contents className="overflow-y-auto no-scrollbar">
        {equipmentHauled.length === 0 && (
          <Holds className="px-10 mt-4">
            <Texts size={"p5"} text={"gray"} className="italic">
              No Equipment Hauled Recorded
            </Texts>
            <Texts size={"p7"} text={"gray"}>
              {`(Tap the plus icon to add a log.)`}
            </Texts>
          </Holds>
        )}
        {equipmentHauled.map((mat: EquipmentHauled) => (
          <Holds key={mat.id}>
            <Holds
              key={mat.id}
              background={"white"}
              className={`w-full h-full gap-4`}
            >
              {/* Equipment Input with Label */}
              <Holds className="w-full h-full justify-center">
                <Label>
                  {t("Equipment")} <span className="text-app-red">*</span>
                </Label>
                {equipmentLoading && selectedIndex === mat.id ? (
                  <Spinner size={20} />
                ) : (
                  <Inputs
                    type="text"
                    placeholder="Equipment"
                    value={mat.Equipment?.name || ""}
                    onClick={() => {
                      setSelectedEquipment({
                        id: mat.Equipment?.id || "",
                        label: mat.Equipment?.name || "",
                        code: mat.Equipment?.id || "",
                      });
                      setIsEquipmentOpen(true);
                      setSelectedIndex(mat.id);
                    }}
                    className={`text-xs cursor-pointer py-2 ${
                      mat.equipmentId === null && "placeholder:text-app-red"
                    }`}
                    readOnly
                  />
                )}
              </Holds>

              <Holds>
                <Label>
                  {t("Source")}
                  <span className="text-app-red">*</span>
                </Label>
                <Inputs
                  type="text"
                  placeholder="Source"
                  value={mat.source ?? ""}
                  onChange={(e) =>
                    handleFieldChange(mat.id, "source", e.target.value)
                  }
                  onBlur={() => handleFieldBlur(mat.id)}
                  className="text-xs py-2"
                />
              </Holds>

              {/* Destination Input with Label */}
              <Holds>
                <Label>
                  {t("Destination")}
                  <span className="text-app-red">*</span>
                </Label>
                <Inputs
                  type="text"
                  placeholder="Destination"
                  value={mat.destination ?? ""}
                  onChange={(e) =>
                    handleFieldChange(mat.id, "destination", e.target.value)
                  }
                  onBlur={() => handleFieldBlur(mat.id)}
                  className="text-xs py-2"
                />
              </Holds>

              {/* Starting Mileage Input with Label */}
              <Holds>
                <Label>{t("StartingMileage")}</Label>
                <Inputs
                  type="number"
                  placeholder="Starting Mileage"
                  value={mat.startMileage ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      mat.id,
                      "startMileage",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  onBlur={() => handleFieldBlur(mat.id)}
                  className="text-xs py-2"
                />
              </Holds>

              {/* Ending Mileage Input with Label */}
              <Holds>
                <Label>{t("EndingMileage")}</Label>
                <Inputs
                  type="number"
                  placeholder="Ending Mileage"
                  value={mat.endMileage ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      mat.id,
                      "endMileage",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  onBlur={() => handleFieldBlur(mat.id)}
                  className="text-xs py-2"
                />
              </Holds>
            </Holds>
          </Holds>
        ))}

        <NModals
          size={"xlW"}
          background={"noOpacity"}
          isOpen={isEquipmentOpen}
          handleClose={() => setIsEquipmentOpen(false)}
        >
          <Grids rows={"7"} gap={"5"} className="h-full w-full">
            <Holds className="h-full w-full row-start-1 row-end-7">
              <EquipmentSelector
                onEquipmentSelect={(equipment) => {
                  if (equipment) {
                    setSelectedEquipment(equipment); // Update the equipment state with the full Option object
                  } else {
                    setSelectedEquipment({ id: "", code: "", label: "" }); // Reset if null
                  }
                }}
                initialValue={selectedEquipment}
              />
            </Holds>
            <Holds
              position={"row"}
              className="h-full w-full row-start-7 row-end-8 gap-x-3"
            >
              <Holds>
                <Buttons
                  background={"green"}
                  shadow={"none"}
                  onClick={() => {
                    handleUpdateEquipment(selectedEquipment);
                    setIsEquipmentOpen(false);
                  }}
                  className="py-3"
                >
                  <Titles size={"h3"}>Select </Titles>
                </Buttons>
              </Holds>
              <Holds>
                <Buttons
                  background={"red"}
                  shadow={"none"}
                  onClick={() => {
                    setSelectedEquipment({ id: "", code: "", label: "" });
                    setIsEquipmentOpen(false);
                  }}
                  className="py-3"
                >
                  <Titles size={"h3"}>Cancel</Titles>
                </Buttons>
              </Holds>
            </Holds>
          </Grids>
        </NModals>
      </Contents>
    </>
  );
}
