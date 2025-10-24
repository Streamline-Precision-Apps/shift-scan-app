"use client";
import React, { useEffect, useState, Suspense } from "react";
import NewCodeFinder from "@/components/(search)/newCodeFinder";
import { useDBJobsite } from "@/app/context/dbCodeContext";
import { useTranslations } from "next-intl";
import JobsiteSelectorLoading from "../(loading)/jobsiteSelectorLoading";

type Option = {
  id: string;
  code: string;
  label: string;
};

type EquipmentSelectorProps = {
  onJobsiteSelect: (equipment: Option | null) => void;
  initialValue?: Option; // Optional initial value
  useJobSiteId?: boolean; // Optional prop to use ID instead of code
};

export const JobsiteSelector = ({
  onJobsiteSelect,
  initialValue,
  useJobSiteId = false,
}: EquipmentSelectorProps) => {
  const [selectedJobsite, setSelectedJobsite] = useState<Option | null>(null);
  const [jobsiteOptions, setJobsiteOptions] = useState<Option[]>([]);
  const { jobsiteResults } = useDBJobsite();
  const t = useTranslations("Clock");
  useEffect(() => {
    // Filter out archived jobsites for the selector, but keep all for QR scanning
    const activeJobsites = jobsiteResults.filter(
      (jobSite) => jobSite.status !== "ARCHIVED",
    );

    const options = activeJobsites.map((jobSite) => ({
      id: jobSite.id,
      code: jobSite.qrId,
      label: jobSite.name,
    }));

    setJobsiteOptions(options);
  }, [jobsiteResults]);

  // Initialize with the passed initialValue
  useEffect(() => {
    if (initialValue && jobsiteOptions.length > 0) {
      const foundOption = jobsiteOptions.find(
        (opt) => opt.code === initialValue.code,
      );
      if (foundOption) {
        setSelectedJobsite(foundOption);
      }
    }
  }, [initialValue, jobsiteOptions]);

  // Handle selection changes and notify parent
  const handleSelect = (option: Option | null) => {
    setSelectedJobsite(option);
    onJobsiteSelect(option); // Pass just the code to parent
  };

  return (
    <Suspense fallback={<JobsiteSelectorLoading />}>
      <NewCodeFinder
        options={jobsiteOptions}
        selectedOption={selectedJobsite}
        onSelect={handleSelect}
        placeholder={t("SearchBarPlaceholder")}
        label="Select Job Site"
      />
    </Suspense>
  );
};
