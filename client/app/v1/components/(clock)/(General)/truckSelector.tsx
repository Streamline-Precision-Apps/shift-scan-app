"use client";
import React, { useEffect, useState, Suspense } from "react";
import NewCodeFinder from "@/components/(search)/newCodeFinder";
import { useDBEquipment } from "@/app/context/dbCodeContext";
import { useTranslations } from "next-intl";
import TruckSelectorLoading from "../(loading)/truckSelectorLoading";

type Option = {
  id: string; // ID is now required
  viewpoint?: string;
  code: string;
  label: string;
};

type TruckSelectorProps = {
  onTruckSelect: (truck: Option | null) => void;
  initialValue?: Option; // Optional initial value
};

const TruckSelector = ({ onTruckSelect, initialValue }: TruckSelectorProps) => {
  const [selectedTruck, setSelectedTruck] = useState<Option | null>(null);
  const [truckOptions, setTruckOptions] = useState<Option[]>([]);
  const { equipmentResults } = useDBEquipment();
  const t = useTranslations("Clock");
  // Initialize with the passed initialValue
  useEffect(() => {
    if (equipmentResults) {
      const options = equipmentResults
        .filter(
          (equipment) =>
            equipment.equipmentTag === "TRUCK" &&
            equipment.status !== "ARCHIVED",
        )
        .map((equipment) => ({
          id: equipment.id,
          viewpoint: equipment.code,
          code: equipment.qrId,
          label: equipment.name,
        }));
      setTruckOptions(options);
    }
  }, [equipmentResults]);

  useEffect(() => {
    if (initialValue && truckOptions.length > 0) {
      const foundOption = truckOptions.find(
        (opt) => opt.code === initialValue.code,
      );
      if (foundOption) {
        setSelectedTruck(foundOption);
      }
    }
  }, [initialValue, truckOptions]);

  // Handle selection changes and notify parent
  const handleSelect = (option: Option | null) => {
    setSelectedTruck(option);
    onTruckSelect(option); // Pass just the code to parent
  };

  return (
    <Suspense fallback={<TruckSelectorLoading />}>
      <NewCodeFinder
        options={truckOptions}
        selectedOption={selectedTruck}
        onSelect={handleSelect}
        placeholder={t("SearchBarPlaceholder")}
        label="Select a truck"
      />
    </Suspense>
  );
};

export default TruckSelector;
