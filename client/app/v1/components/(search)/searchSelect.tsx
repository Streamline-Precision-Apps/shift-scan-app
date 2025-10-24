// this component is used in multiple places and takes the data from the database
//and stores it in a state to be searched and filtered. The main location is in QrGenerator.tsx as of now.
"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import SearchBar from "@/components/(search)/searchbar";
import { Holds } from "@/components/(reusable)/holds";
import { useTranslations } from "next-intl";
import { Grids } from "@/components/(reusable)/grids";
import { Texts } from "../(reusable)/texts";
import { Buttons } from "../(reusable)/buttons";
import { Contents } from "../(reusable)/contents";
import Spinner from "../(animations)/spinner";
import EmptyView from "../(reusable)/emptyView";
import { EquipmentTags } from "../../../prisma/generated/prisma/client";

type JobCode = {
  id: string;
  qrId: string;
  name: string;
};

type EquipmentCode = {
  id: string;
  qrId: string;
  name: string;
  equipmentTag: EquipmentTags;
};

type Props<T> = {
  datatype: string;
  loading: boolean;
  handleGenerate: () => void;
  options: T[];
  recentOptions: T[];
  onSelect: (option: T) => void;
  setSelectedJobSite: React.Dispatch<React.SetStateAction<string>>;
};

function SearchSelect<T extends JobCode | EquipmentCode>({
  datatype,
  options,
  handleGenerate,
  recentOptions,
  onSelect,
  loading,
  setSelectedJobSite,
}: Props<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectTerm, setSelectOption] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<T[]>(options);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recentFilteredOptions, setRecentFilteredOptions] =
    useState<T[]>(recentOptions);
  const [selectedTerm, setSelectedTerm] = useState(false);

  const t = useTranslations("Generator");

  // Recent Options
  useEffect(() => {
    setRecentFilteredOptions(recentOptions);
  }, [searchTerm, options, recentOptions]);

  // Update `filteredOptions` when `searchTerm` changes
  useEffect(() => {
    setFilteredOptions(
      options.filter(
        (option) =>
          option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.qrId.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [searchTerm, options]);

  // Handle changes in search input
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedTerm(false);
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      setIsMenuOpen(false); // Close menu if input is empty
    } else {
      setIsMenuOpen(true); // Open menu when typing
    }
  };

  // Handle selecting an option from the dropdown
  const handleOptionSelect = (option: T) => {
    setSelectOption(option.name); // Set the search input to the selected option
    setIsMenuOpen(false); // Close the dropdown menu
    setSelectedTerm(true);
    onSelect(option); // Call the onSelect prop with the selected option
  };
  const handleClearSelection = () => {
    setSearchTerm("");
    setSelectedTerm(false);
    setIsMenuOpen(false);
    setSelectedJobSite("");
  };

  return (
    <Grids rows={"6"} className=" rounded-[10px]">
      <Holds className="h-full rounded-[10px] rounded-b-none row-span-1">
        {/* Search bar for filtering */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          placeholder={`${datatype}...`}
          selected={selectedTerm}
          setSelectedTerm={setSelectedTerm}
          setSearchTerm={setSearchTerm}
          clearSelection={handleClearSelection}
          selectTerm={selectTerm}
        />
      </Holds>
      {loading ? (
        <Holds className="h-full row-span-5 border-[3px] border-black rounded-[10px] mt-5 ">
          <Holds className="my-auto h-full justify-center items-center rounded-[10px]">
            <Spinner size={50} />
          </Holds>
        </Holds>
      ) : (
        <Holds className="h-full row-span-5 border-[3px] border-black rounded-[10px] mt-5">
          <Holds className="overflow-y-auto rounded-b-[10px] no-scrollbar">
            {filteredOptions.map((option) => (
              <Holds
                key={option.qrId}
                onClick={
                  selectedTerm && option.name === selectTerm
                    ? () => handleClearSelection()
                    : () => handleOptionSelect(option)
                }
                className="py-3 cursor-pointer last:border-0"
              >
                <Holds>
                  <Contents width={"section"}>
                    <Buttons
                      background={
                        selectedTerm && option.name === selectTerm
                          ? "green"
                          : "lightBlue"
                      }
                      className="p-3"
                    >
                      <Texts size={"p4"}>{option.name}</Texts>
                    </Buttons>
                  </Contents>
                </Holds>
              </Holds>
            ))}
          </Holds>

          {!selectedTerm && filteredOptions.length === 0 && (
            <EmptyView
              TopChild={
                <Texts className=" text-black text-center flex justify-center text-2xl">
                  {t("NoResults")}
                </Texts>
              }
            />
          )}
        </Holds>
      )}
    </Grids>
  );
}

export default SearchSelect;
