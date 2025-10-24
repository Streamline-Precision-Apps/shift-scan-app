"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

export interface MobileComboboxOption {
  value: string;
  label: string;
  [key: string]: string | number | boolean | undefined;
}

interface MobileComboboxProps {
  options: MobileComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  dialogTitle?: string;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string;
  multiSelect?: boolean; // Allow selection of multiple items
  closeOnSelect?: boolean; // Automatically close after selection (for single select)
}

export function MobileCombobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  dialogTitle = "Select an option",
  disabled = false,
  required = false,
  errorMessage = "This field is required.",
  multiSelect = false,
  closeOnSelect = !multiSelect,
}: MobileComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [touched, setTouched] = useState(false);
  const [tempSelection, setTempSelection] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setTempSelection(null);
    }
  }, [open]);

  // Filter options based on search input
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );

  const showError = required && touched && (!value || value.length === 0);

  // Handle selection
  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      // Toggle selection for multi-select
      let newValue: string[];
      const isSelected = value.includes(optionValue);
      if (isSelected) {
        newValue = value.filter((v) => v !== optionValue);
      } else {
        newValue = [...value, optionValue];
      }
      onChange(newValue);

      // Close dialog if configured to close on select
      if (closeOnSelect) {
        setOpen(false);
      }
    } else {
      // For single select, just mark the item as temporarily selected
      // but don't apply the change yet - wait for confirmation
      setTempSelection(optionValue);
    }
  };

  // Confirm selection for single select mode
  const confirmSelection = () => {
    if (tempSelection !== null) {
      onChange([tempSelection]);
    }
    setOpen(false);
  };

  // Get display text for selected values
  const getSelectedText = () => {
    if (!value || value.length === 0) return placeholder;

    const selectedLabels = options
      .filter((option) => value.includes(option.value))
      .map((option) => option.label);

    if (selectedLabels.length === 0) return placeholder;
    if (selectedLabels.length === 1) return selectedLabels[0];

    return `${selectedLabels[0]} +${selectedLabels.length - 1}`;
  };

  return (
    <div className="w-full ">
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-12 px-3 py-2 text-base justify-between",
              "flex items-center relative overflow-hidden ",
              showError ? "border-red-500" : "",
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            )}
            disabled={disabled}
            onBlur={() => setTouched(true)}
          >
            <span className="truncate">{getSelectedText()}</span>
            <ChevronsUpDownIcon className="ml-2 h-5 w-5 shrink-0 opacity-60" />
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[90%] max-w-md mx-auto p-0 h-[70vh] flex flex-col rounded-xl">
          <DialogHeader className="px-4 py-2 border-b sticky top-0 bg-white z-10 rounded-lg">
            <DialogTitle>{dialogTitle}</DialogTitle>
            <div className="relative mt-2">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                className="pl-9 pr-4 py-2 h-10 text-base"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <XIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </DialogHeader>

          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No options found
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => {
                  const isSelected = multiSelect
                    ? value.includes(option.value)
                    : tempSelection === option.value ||
                      value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      className={cn(
                        "w-full flex items-center px-4 py-3 text-left text-base",
                        "hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                        isSelected ? "bg-gray-50" : "",
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-sm border mr-3 flex items-center justify-center",
                          isSelected
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300",
                        )}
                      >
                        {isSelected && (
                          <CheckIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="flex-1 truncate">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {multiSelect && (
            <div className="border-t p-3 mt-auto bg-white rounded-lg">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => onChange([])}
                  size="sm"
                  className="text-sm"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setOpen(false)}
                  size="sm"
                  className="text-sm"
                >
                  Done ({value.length} selected)
                </Button>
              </div>
            </div>
          )}

          {!multiSelect && (
            <div className="border-t p-3 mt-auto bg-white rounded-lg">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  size="sm"
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSelection}
                  size="sm"
                  className="text-sm bg-green-500 hover:bg-green-600 text-white"
                  disabled={tempSelection === null}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showError && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
    </div>
  );
}
