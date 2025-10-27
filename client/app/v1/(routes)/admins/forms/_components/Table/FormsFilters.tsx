"use client";

import React, { useState, useEffect, SetStateAction, Dispatch } from "react";
import { Combobox } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterOptions {
  formType: string[];
  status: string[];
}

interface FilterPopoverProps {
  onFilterChange: (filters: FilterOptions) => void;
  onUseFiltersChange?: (useFilters: boolean) => void;
  formTemplateCategoryValues: { value: string; label: string }[];
  filters: FilterOptions; // Add filters prop for controlled state
  handleClearFilters: () => Promise<void>;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
}

const FormsFilters: React.FC<FilterPopoverProps> = ({
  onFilterChange,
  onUseFiltersChange,
  formTemplateCategoryValues,
  filters,
  setFilters,
  handleClearFilters,
}) => {
  const [open, setOpen] = useState(false);

  const handleApplyFilters = () => {
    // Call onFilterChange only if we have filters to apply
    const hasActiveFilters =
      filters.formType.length > 0 || filters.status.length > 0;

    // Only trigger filter change if there are active filters
    if (hasActiveFilters) {
      onFilterChange({ ...filters });
    }

    // Always call onUseFiltersChange to trigger a refilter
    if (onUseFiltersChange) {
      onUseFiltersChange(true);
    }

    setOpen(false);
  };

  const getActiveFilterCount = () => {
    return filters.formType.length + filters.status.length + 0;
  };

  // Set useFilters based on initial filter state
  useEffect(() => {
    const hasActiveFilters = getActiveFilterCount() > 0;
    if (hasActiveFilters && onUseFiltersChange) {
      onUseFiltersChange(true);
    }
  }, []);

  return (
    <div className="bg-white rounded-lg w-10 justify-center h-full flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`relative h-full flex items-center justify-center px-3 ${
                  open
                    ? "border-slate-400"
                    : getActiveFilterCount() > 0
                      ? "bg-blue-50 border-blue-300"
                      : ""
                }`}
              >
                <img src="/filterFunnel.svg" alt="Filter" className="h-4 w-4" />
                {getActiveFilterCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 h-5 min-w-5 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">Filter Forms</TooltipContent>
        </Tooltip>
        <PopoverContent
          className="w-[400px] p-4"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <div className="space-t-4">
            <div className="flex flex-row gap-8 pb-8">
              <div className="flex flex-col space-y-4 w-full">
                <div>
                  <h3 className="font-medium mb-2 text-sm">Form Status</h3>
                  <Combobox
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "DRAFT", label: "Draft" },
                      { value: "ARCHIVED", label: "Archived" },
                    ]}
                    value={filters.status}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, status: vals }))
                    }
                    placeholder="Select status"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-sm">Form Types</h3>
                  <Combobox
                    options={formTemplateCategoryValues}
                    value={filters.formType}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, formType: vals }))
                    }
                    placeholder="Select Type"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await handleClearFilters();
                  if (onUseFiltersChange) {
                    onUseFiltersChange(true);
                  }
                }}
                className="text-xs"
              >
                {getActiveFilterCount() > 1
                  ? "Remove Filters"
                  : getActiveFilterCount() === 1
                    ? "Remove Filter"
                    : "Clear"}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleApplyFilters}
                className="text-xs"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FormsFilters;
