"use client";
import React, { ChangeEvent, useEffect } from "react";
import { Images } from "../(reusable)/images";
import { Holds } from "../(reusable)/holds";
import { Buttons } from "../(reusable)/buttons";
import { Texts } from "../(reusable)/texts";
import { useTranslations } from "next-intl";

// defines the searchbar type for typescript
type SearchBarProps = {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  selected: boolean;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTerm?: React.Dispatch<React.SetStateAction<boolean>>;
  clearSelection: () => void;
  selectTerm: string;
};

// defines the searchbar component and what the input should look like
export default function SearchBar({
  searchTerm,
  onSearchChange,
  placeholder,
  selected,
  setSelectedTerm,
  clearSelection,
  selectTerm,
}: SearchBarProps) {
  const previousTermLength = searchTerm.length;

  useEffect(() => {
    if (setSelectedTerm && previousTermLength > 0 && searchTerm.length === 0) {
      // Clear selection when the search term is erased
      clearSelection();
    }
  }, [searchTerm, setSelectedTerm, clearSelection, previousTermLength]);
  const t = useTranslations("Clock");
  return (
    <Holds
      position={"row"}
      className="px-4 border-[3px]  border-black rounded-[10px] rounded-b-none h-full"
    >
      <Holds className="rounded-[10px]">
        {selected ? (
          <Holds position={"row"} className="h-full w-full space-x-2">
            <Buttons
              onClick={clearSelection}
              className=" w-full h-full bg-app-green text-center text-bold border-[3px] border-black rounded-[10px] shadow-none py-2 "
            >
              <Texts size={"p6"}>
                {selectTerm.split("-")[1] || selectTerm}
              </Texts>
            </Buttons>
          </Holds>
        ) : (
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
                placeholder={t("SearchBarPlaceholder")}
                className="w-full h-full text-center placeholder-gray-500 placeholder:text-xl focus:outline-hidden rounded-[10px]"
              />
            </Holds>
            <Holds size={"10"}></Holds>
          </Holds>
        )}
      </Holds>
    </Holds>
  );
}
