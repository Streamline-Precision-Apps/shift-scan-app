"use client";

import * as React from "react";
import { Star, ChevronsUpDown, Check } from "lucide-react";
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

export interface CrewMemberOption {
  value: string;
  label: string;
}

interface CrewMemberCheckboxListProps {
  options: CrewMemberOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  leadId?: string; // ID of the crew lead
  className?: string;
}

export function CrewMemberCheckboxList({
  options,
  value,
  onChange,
  placeholder = "Select crew members...",
  leadId,
  className,
}: CrewMemberCheckboxListProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = useState("");

  // Advanced filter: match if label contains the search string
  const filteredOptions = options.filter((option) => {
    if (!search.trim()) return true;
    return option.label.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (optionValue: string) => {
    // If trying to uncheck the lead, prevent it
    if (leadId && optionValue === leadId && value.includes(optionValue)) {
      return;
    }

    const checked = value.includes(optionValue);
    const newValue = checked
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    onChange(newValue);
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm md:text-xs py-2 h-auto min-h-[40px] overflow-hidden"
          >
            <span className="truncate">
              {value && value.length > 0
                ? options
                    .filter((option) => value.includes(option.value))
                    .map((option) => option.label)
                    .join(", ")
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-5 w-5 md:h-4 md:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[300px] overflow-hidden text-sm md:text-xs">
          <Command className="w-full">
            <CommandInput
              placeholder="Search crew members..."
              value={search}
              onValueChange={setSearch}
              className="h-9 px-3 text-sm"
            />
            <CommandList className="max-h-[230px] overflow-auto">
              <CommandEmpty className="py-3 text-center">
                No crew members found.
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const checked = value.includes(option.value);
                  const isLead = leadId === option.value;
                  const isLeadAndSelected = isLead && checked;

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "py-2 px-2 cursor-pointer",
                        isLeadAndSelected && "opacity-75",
                      )}
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
                          <Check
                            className={cn(
                              "h-3.5 w-3.5 text-white",
                              checked ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </div>
                        <span className="flex-1 truncate flex items-center gap-1">
                          {option.label}
                          {isLead && (
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
