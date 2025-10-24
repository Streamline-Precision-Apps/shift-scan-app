// components/reusable/SelectableModal.tsx
import { useState, ChangeEvent, FC } from "react";
import { NModals } from "@/components/(reusable)/newmodals";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { Buttons } from "@/components/(reusable)/buttons";
import { Titles } from "@/components/(reusable)/titles";
import { Images } from "./images";

type Option = {
  id: string;
  name: string;
  qrId: string;
};
type SelectableModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  handleCancel: () => void;
  options: Option[];
  onSelect: (option: Option) => void;
  selectedValue: string;
  placeholder?: string;
  handleSave: () => void;
};

const SelectableModal: FC<SelectableModalProps> = ({
  isOpen,
  handleSave,
  handleClose,
  handleCancel,
  options,
  onSelect,
  selectedValue,
  placeholder = "Search...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered options for search term
  const filteredOptions = options.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.qrId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toUpperCase()); // Convert to uppercase
  };

  return (
    <NModals
      size={"xlW"}
      background={"noOpacity"}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <Holds background={"white"} className="w-full h-full">
        <Grids rows={"8"} className="h-full">
          <Holds className="row-span-1 h-full">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              placeholder={placeholder}
              label={""}
            />
          </Holds>
          <Holds
            background={"darkBlue"}
            className="row-start-2 row-end-8 h-full border-[3px] border-black rounded-[10px] rounded-t-none overflow-y-auto no-scrollbar"
          >
            {filteredOptions.map((option) => (
              <Holds key={option.qrId} className="p-2">
                <Buttons
                  background={
                    selectedValue === option.name ? "green" : "lightBlue"
                  }
                  shadow={"none"}
                  key={option.qrId}
                  onClick={() => onSelect(option)}
                  className="w-full p-3 mb-4 text-left"
                >
                  <Titles size={"h6"}>
                    {option.name} - ({option.qrId})
                  </Titles>
                </Buttons>
              </Holds>
            ))}
          </Holds>
          <Holds position={"row"} className="row-start-8 row-end-9 py-2 gap-4">
            <Buttons background={"green"} onClick={() => handleSave()}>
              Save
            </Buttons>
            <Buttons background={"red"} onClick={() => handleClose()}>
              Close
            </Buttons>
          </Holds>
        </Grids>
      </Holds>
    </NModals>
  );
};

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
            titleImg="/searchRight.svg"
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
            className="w-full h-full text-center placeholder-gray-500 placeholder:text-xl focus:outline-hidden rounded-[10px] "
            aria-label={label}
          />
        </Holds>
        <Holds size={"10"}></Holds>
      </Holds>
    </Holds>
  );
};

export default SelectableModal;
