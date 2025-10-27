"use client";
import { Holds } from "@/components/(reusable)/holds";
import { Inputs } from "@/components/(reusable)/inputs";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

interface SearchBarProps {
  term: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
  children?: React.ReactNode;
  textSize?: "xs" | "sm" | "md" | "lg" | "xl";
  imageSize?: "2" | "4" | "6" | "8" | "10" | "12" | "14" | "16";
}

const SearchBarPopover: React.FC<SearchBarProps> = ({
  term,
  handleSearchChange,
  placeholder,
  disabled = false,
  children = null,
  textSize = "sm",
  imageSize = "8",
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="bg-white/5 rounded-lg w-10 justify-center h-full flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open search"
            disabled={disabled}
            className={`flex items-center justify-center w-${imageSize} h-${imageSize} p-2.5  transition focus:outline-none focus:ring-none focus:ring-blue-500 ${open ? "rounded-tl-md rounded-bl-md border-r border-black bg-white/5 hover:bg-white/5 " : "rounded-md bg-white hover:bg-slate-100 "}`}
          >
            <img
              src={open ? "/searchLeft-white.svg" : "/searchLeft.svg"}
              alt="search"
              className={`w-${imageSize} h-${imageSize}`}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          side="right"
          sideOffset={0}
          className={`w-[400px] h-${imageSize} bg-white border border-slate-200 rounded-l-none rounded-tr-md rounded-br-md shadow-lg`}
        >
          <Holds
            background={disabled ? "lightGray" : "white"}
            position="row"
            className="w-full h-full relative"
          >
            <Holds className="w-full h-auto justify-center items-center ">
              <Inputs
                type="search"
                placeholder={placeholder}
                value={term}
                onChange={handleSearchChange}
                disabled={disabled}
                autoFocus
                className={`border-none outline-hidden text-${textSize} text-left w-full h-full rounded-tr-md rounded-br-md bg-white focus:ring-0 focus:border-none focus:outline-none`}
              />
            </Holds>
            {children}
          </Holds>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchBarPopover;
