"use client";
import React, { useState, ChangeEvent, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Holds } from "../(reusable)/holds";
import { Grids } from "../(reusable)/grids";
import { Titles } from "../(reusable)/titles";
import { Buttons } from "../(reusable)/buttons";
import { Images } from "../(reusable)/images";
import { PullToRefresh } from "../(animations)/pullToRefresh";

type Option = {
  id: string;
  viewpoint?: string;
  code: string;
  label: string;
  status?: string;
};

type CodeFinderProps = {
  options: Option[];
  selectedOption: Option | null;
  onSelect: (option: Option | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  showStatusTags?: boolean;
};

export default function CodeFinder({
  options,
  selectedOption,
  onSelect,
  placeholder = "Search...",
  label,
  className = "",
  onRefresh,
  isLoading,
  showStatusTags = false,
}: CodeFinderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations("CodeFinder");
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options
      .filter((option) => {
        const searchLower = searchTerm.toLowerCase();
        const labelLower = option.label.toLowerCase();
        const viewpointLower = option.viewpoint?.toLowerCase() || "";

        return (
          labelLower.includes(searchLower) ||
          viewpointLower.includes(searchLower)
        );
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [options, searchTerm]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // Keep original case for better UX
  };

  const clearSelection = () => {
    setSearchTerm("");
    onSelect(null);
  };

  return (
    <Grids rows={"8"} className={`h-full w-full `}>
      <Holds className="row-span-1 h-full">
        {selectedOption ? (
          <Holds
            background={"lightBlue"}
            className="h-full w-full border-[3px] border-b-none border-black rounded-b-none justify-center items-center"
            onClick={clearSelection}
          >
            <Titles size={"md"} className="text-center text-black">
              {selectedOption.label.length > 21
                ? selectedOption.label.slice(0, 21) + "..."
                : selectedOption.label}
            </Titles>
          </Holds>
        ) : (
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            placeholder={placeholder}
            label={label}
          />
        )}
      </Holds>
      <Holds
        background={"darkBlue"}
        className="row-start-2 row-end-9 h-full border-[3px] border-black rounded-[10px] rounded-t-none overflow-hidden"
      >
        {onRefresh ? (
          <PullToRefresh
            onRefresh={onRefresh}
            bgColor="bg-darkBlue/70"
            textColor="text-white"
            pullText={t("PullToRefresh")}
            releaseText={t("ReleaseToRefresh")}
            refreshingText=""
            containerClassName="h-full"
          >
            <OptionsList
              filteredOptions={filteredOptions}
              selectedOption={selectedOption}
              onSelect={onSelect}
              clearSelection={clearSelection}
              isLoading={isLoading}
              showStatusTags={showStatusTags}
            />
          </PullToRefresh>
        ) : (
          <div className="h-full overflow-y-auto no-scrollbar">
            <OptionsList
              filteredOptions={filteredOptions}
              selectedOption={selectedOption}
              onSelect={onSelect}
              clearSelection={clearSelection}
              isLoading={isLoading}
              showStatusTags={showStatusTags}
            />
          </div>
        )}
      </Holds>
    </Grids>
  );
}

// Extracted Options List component for reusability
const OptionsList = ({
  filteredOptions,
  selectedOption,
  onSelect,
  clearSelection,
  isLoading,
  showStatusTags = false,
}: {
  filteredOptions: Option[];
  selectedOption: Option | null;
  onSelect: (option: Option | null) => void;
  clearSelection: () => void;
  isLoading?: boolean;
  showStatusTags?: boolean;
}) => {
  const t = useTranslations("Clock");
  if (filteredOptions.length > 0) {
    return filteredOptions.map((option) => (
      <Holds key={option.code} className="p-2">
        <Buttons
          shadow={"none"}
          className={`py-2 px-2 cursor-pointer flex justify-left items-center ${
            selectedOption?.code === option.code ? "bg-app-green" : "bg-white"
          }`}
          onClick={() =>
            selectedOption?.code === option.code
              ? clearSelection()
              : onSelect(option)
          }
        >
          <div className="flex items-center justify-between w-full">
            <Titles size={"sm"} className="max-w-[200px] truncate ">
              <span className="text-base">
                {option.viewpoint ? `${option.viewpoint} - ` : null}
              </span>
              {option.label}
            </Titles>
            {showStatusTags && option.status && option.status !== "ACTIVE" && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ml-2 ${
                  option.status === "ARCHIVED"
                    ? "bg-gray-200 text-gray-600"
                    : option.status === "DRAFT"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-200 text-gray-700"
                }`}
              >
                {option.status === "ARCHIVED"
                  ? "Archived"
                  : option.status === "DRAFT"
                    ? "Draft"
                    : option.status}
              </span>
            )}
          </div>
        </Buttons>
      </Holds>
    ));
  } else if (isLoading) {
    return (
      <Holds className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-6 w-6 text-white mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-white text-lg">{t("Loading")}</p>
        </div>
      </Holds>
    );
  } else {
    return (
      <Holds className="h-full w-full p-1.5">
        <Holds
          background={"white"}
          className="flex justify-center items-center h-full w-full bg-opacity-10 relative"
        >
          <p className="text-neutral-100 text-lg">{t("NoResultsFound")}</p>
        </Holds>
      </Holds>
    );
  }
};

// Simplified SearchBar component
const SearchBar = ({
  searchTerm,
  onSearchChange,
  placeholder,
  label,
}: {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label?: string;
}) => {
  return (
    <Holds
      position={"row"}
      className="px-4 border-[3px] border-black rounded-[10px] rounded-b-none h-full"
    >
      <Holds position={"row"} className="h-full w-full">
        <Holds size={"10"}>
          <Images
            titleImg="/searchLeft.svg"
            titleImgAlt="search"
            size={"full"}
          />
        </Holds>
        <Holds size={"80"} className="pl-4 text-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={placeholder}
            className="w-full placeholder:text-center text-left h-full placeholder-gray-500 placeholder:text-xl focus:outline-none rounded-[10px]"
            aria-label={label || "Search"}
            autoComplete="off"
          />
        </Holds>
        <Holds size={"10"}></Holds>
      </Holds>
    </Holds>
  );
};
