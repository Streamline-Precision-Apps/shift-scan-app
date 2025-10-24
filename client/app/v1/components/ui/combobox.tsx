"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  [key: string]: string | number | boolean | undefined;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  filterKeys?: string[];
  font?: "font-semibold" | "font-bold" | "font-normal";
  required?: boolean;
  errorMessage?: string;
  listData?: string[];
  optionName?: string;
  showCount?: boolean; // Display count of selected items
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  disabled = false,
  filterKeys = ["label"],
  font = "font-semibold",
  required = false,
  errorMessage = "This field is required.",
  listData = [],
  showCount = false,
  optionName = "option",
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false); // Track if the field has been interacted with

  // Advanced filter: match if any filterKey contains the search string
  const filteredOptions = options.filter((option) => {
    // If search is empty, show all
    if (!search.trim()) return true;
    // Defensive: filterKeys must be array of strings
    if (!Array.isArray(filterKeys)) return true;
    return filterKeys.some((key) => {
      // Support nested keys like 'user.firstName'
      const value = key
        .split(".")
        .reduce<unknown>(
          (obj, k) =>
            obj && typeof obj === "object"
              ? (obj as Record<string, unknown>)[k]
              : undefined,
          option,
        );
      return (value ?? "")
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  });

  const showError = required && touched && (!value || value.length === 0);

  return (
    <div>
      {label && <label className={`block text-xs ${font} mb-1`}>{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between text-sm md:text-xs py-2 h-auto min-h-[40px] overflow-hidden ${
              showError && listData.length < 1 ? "border-red-500" : ""
            }`}
            disabled={disabled}
            onBlur={() => setTouched(true)}
          >
            <span className="truncate">
              {value && value.length > 0
                ? options
                    .filter((option) => value.includes(option.value))
                    .map((option) => option.label)
                    .join(", ")
                : placeholder}
            </span>
            <div className="flex items-center gap-2">
              {showCount && options.length > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 border border-slate-300 font-medium px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
                  {options.length}{" "}
                  {options.length === 1 ? optionName : `${optionName}s`}
                </span>
              )}
              <ChevronsUpDownIcon className="h-5 w-5 md:h-4 md:w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[300px] overflow-hidden text-sm md:text-xs">
          <Command className="w-full">
            <CommandInput
              placeholder={`Search...`}
              value={search}
              onValueChange={setSearch}
              className="h-9 px-3 text-sm"
            />
            <CommandList className="max-h-[230px] overflow-auto">
              <CommandEmpty className="py-3 text-center">
                No option found.
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const checked = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        let newValue: string[];
                        if (checked) {
                          newValue = value.filter((v) => v !== option.value);
                        } else {
                          newValue = [...value, option.value];
                        }
                        onChange(newValue);
                      }}
                      className="py-2 px-2 cursor-pointer"
                    >
                      <div className="flex items-center w-full gap-2">
                        <div
                          className={cn(
                            "flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center",
                            checked
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300",
                          )}
                        >
                          <CheckIcon
                            className={cn(
                              "h-3.5 w-3.5 text-white",
                              checked ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </div>
                        <span className="flex-1 truncate">{option.label}</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showError && listData.length < 1 && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
}
