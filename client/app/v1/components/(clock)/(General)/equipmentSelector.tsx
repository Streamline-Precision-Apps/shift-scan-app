"use client";
import React, { useEffect, useState, Suspense } from "react";
import NewCodeFinder from "@/app/v1/components/(search)/newCodeFinder";

import { useTranslations } from "next-intl";
import EquipmentSelectorLoading from "../(loading)/equipmentSelectorLoading";
import { useEquipmentStore } from "@/app/lib/store/equipmentStore";

type Option = {
  id: string; // Optional ID for compatibility
  viewpoint?: string; // For compatibility with other selectors
  code: string;
  label: string;
};

type EquipmentSelectorProps = {
  onEquipmentSelect: (equipment: Option | null) => void;
  initialValue?: Option; // Optional initial value
  useEquipmentId?: boolean;
};

export const EquipmentSelector = ({
  onEquipmentSelect,
  initialValue,
  useEquipmentId = false,
}: EquipmentSelectorProps) => {
  const [selectedEquipment, setSelectedEquipment] = useState<Option | null>(
    null
  );
  const [equipmentOptions, setEquipmentOptions] = useState<Option[]>([]);
  const t = useTranslations("Clock");
  const { equipments: equipmentResults } = useEquipmentStore();

  useEffect(() => {
    if (equipmentResults) {
      // Filter out archived equipment and equipment with null/undefined codes
      const activeEquipment = equipmentResults.filter(
        (equipment) => equipment.status !== "ARCHIVED" && equipment.code != null
      );

      const options = activeEquipment.map((equipment) => ({
        id: equipment.id,
        viewpoint: equipment.code!, // Non-null assertion is safe due to filter above
        code: equipment.qrId,
        label: equipment.name,
      }));
      setEquipmentOptions(options);
    }
  }, [equipmentResults]);

  // Initialize with the passed initialValue, but avoid infinite loops
  useEffect(() => {
    if (initialValue && equipmentOptions.length > 0) {
      const foundOption = equipmentOptions.find(
        (opt) => opt.code === initialValue.code
      );
      // Only update if different
      if (
        foundOption &&
        (!selectedEquipment || foundOption.code !== selectedEquipment.code)
      ) {
        setSelectedEquipment(foundOption);
      }
    }
  }, [initialValue, equipmentOptions]);

  // Handle selection changes and notify parent
  const handleSelect = (option: Option | null) => {
    setSelectedEquipment(option);
    onEquipmentSelect(option); // Pass just the code to parent
  };

  return (
    <Suspense fallback={<EquipmentSelectorLoading />}>
      <NewCodeFinder
        options={equipmentOptions}
        selectedOption={selectedEquipment}
        onSelect={handleSelect}
        placeholder={t("SearchBarPlaceholder")}
        label="Select an equipment"
      />
    </Suspense>
  );
};
