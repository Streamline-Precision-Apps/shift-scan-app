"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import NewCodeFinder from "@/components/(search)/newCodeFinder";
import TrailerSelectorLoading from "../(loading)/trailerSelectorLoading";
import { useDBEquipment } from "@/app/context/dbCodeContext";

type Option = {
  id: string;
  code: string;
  label: string;
};

type TrailerSelectorProps = {
  onTrailerSelect: (trailer: Option | null) => void;
  initialValue?: Option;
};

const TrailerSelector = ({
  onTrailerSelect,
  initialValue,
}: TrailerSelectorProps) => {
  const [selectedTrailer, setSelectedTrailer] = useState<Option | null>(null);
  const [trailerOptions, setTrailerOptions] = useState<Option[]>([]);
  const t = useTranslations("Clock");
  const { equipmentResults } = useDBEquipment();

  useEffect(() => {
    if (equipmentResults) {
      const noTrailerOption: Option = {
        id: "none",
        code: "none",
        label: t("NoTrailerOption", { default: "No Trailer" }),
      };
      
      const options: Option[] = equipmentResults
        .filter((equipment) => 
          equipment.equipmentTag === "TRAILER" && equipment.status !== "ARCHIVED"
        )
        .map((equipment) => ({
          id: equipment.id,
          code: equipment.qrId,
          label: equipment.name,
        }))
        .sort((a: Option, b: Option) => a.label.localeCompare(b.label));
      
      // Pin 'No Trailer' to the top
      const finalOptions = [noTrailerOption, ...options];
      setTrailerOptions(finalOptions);
    }
  }, [equipmentResults, t]);

  useEffect(() => {
    if (initialValue && trailerOptions.length > 0) {
      const foundOption = trailerOptions.find(
        (opt) => opt.code === initialValue.code,
      );
      if (foundOption) {
        setSelectedTrailer(foundOption);
      }
    }
  }, [initialValue, trailerOptions]);

  const handleSelect = (option: Option | null) => {
    setSelectedTrailer(option);
    onTrailerSelect(option);
  };

  return (
    <Suspense fallback={<TrailerSelectorLoading />}>
      <NewCodeFinder
        options={trailerOptions}
        selectedOption={selectedTrailer}
        onSelect={handleSelect}
        placeholder={t("SearchBarPlaceholder")}
        label={t("Trailer-label")}
      />
    </Suspense>
  );
};

export default TrailerSelector;
