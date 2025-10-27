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

export interface FilterOptions {
  equipmentTags: string[];
  ownershipTypes: string[];
  conditions: string[];
  statuses: string[];
  activityStatuses: string[];
}

interface FilterPopoverProps {
  onFilterChange: (filters: FilterOptions) => void;
  onUseFiltersChange?: (useFilters: boolean) => void;
  filters: FilterOptions; // Add filters prop for controlled state
  handleClearFilters: () => Promise<void>;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const EquipmentFilters: React.FC<FilterPopoverProps> = ({
  onFilterChange,
  onUseFiltersChange,
  filters,
  setFilters,
  handleClearFilters,
  open,
  setOpen,
}) => {
  // Local filter state used for UI updates (doesn't affect parent until applied)
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  // Update local filters when parent filters change (for initial load and reset)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    const hasActiveFilters =
      localFilters.equipmentTags.length > 0 ||
      localFilters.ownershipTypes.length > 0 ||
      localFilters.statuses.length > 0 ||
      localFilters.activityStatuses.length > 0 ||
      localFilters.conditions.length > 0;

    // Only update parent state when Apply is clicked
    setFilters(localFilters);
    onFilterChange(localFilters);

    // Set useFilters based on whether we have active filters
    if (onUseFiltersChange) {
      // Just set it directly - our dependency array is now properly handling filter changes
      onUseFiltersChange(Boolean(hasActiveFilters));
    }
    setOpen(false);
  };

  const getActiveFilterCount = () => {
    return (
      filters.equipmentTags.length +
      filters.ownershipTypes.length +
      filters.conditions.length +
      filters.activityStatuses.length +
      filters.statuses.length
    );
  };

  // Local active filter count (for badge in popover)
  const getLocalActiveFilterCount = () => {
    return (
      localFilters.equipmentTags.length +
      localFilters.ownershipTypes.length +
      localFilters.conditions.length +
      localFilters.activityStatuses.length +
      localFilters.statuses.length
    );
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
          <TooltipContent side="top">Filter Equipment</TooltipContent>
        </Tooltip>
        <PopoverContent
          className="w-[600px] p-4"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <div className="space-t-4">
            <div className="flex flex-row gap-6 pb-2">
              <div className="flex flex-col space-y-3 w-1/2">
                <div>
                  <h3 className="font-medium mb-1 text-xs">Equipment Type</h3>
                  <Combobox
                    options={[
                      { value: "VEHICLE", label: "Vehicle" },
                      { value: "TRUCK", label: "Truck" },
                      { value: "EQUIPMENT", label: "Equipment" },
                    ]}
                    value={localFilters.equipmentTags}
                    onChange={(vals: string[]) =>
                      setLocalFilters((f) => ({ ...f, equipmentTags: vals }))
                    }
                    placeholder="Select equipment type"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-xs">Activity</h3>
                  <Combobox
                    options={[
                      { value: "ACTIVE", label: "Active" },
                      { value: "ARCHIVED", label: "Archived" },
                    ]}
                    value={localFilters.activityStatuses}
                    onChange={(vals: string[]) =>
                      setLocalFilters((f) => ({ ...f, activityStatuses: vals }))
                    }
                    placeholder="Select status"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-xs">Ownership</h3>
                  <Combobox
                    options={[
                      { value: "OWNED", label: "Owned" },
                      { value: "LEASED", label: "Leased" },
                    ]}
                    value={localFilters.ownershipTypes}
                    onChange={(vals: string[]) =>
                      setLocalFilters((f) => ({ ...f, ownershipTypes: vals }))
                    }
                    placeholder="Select ownership"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-1 text-xs">Condition</h3>
                  <Combobox
                    options={[
                      { value: "New", label: "New" },
                      { value: "USED", label: "Used" },
                    ]}
                    value={localFilters.conditions}
                    onChange={(vals: string[]) =>
                      setLocalFilters((f) => ({ ...f, conditions: vals }))
                    }
                    placeholder="Select condition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear local filters first
                  setLocalFilters({
                    equipmentTags: [],
                    ownershipTypes: [],
                    conditions: [],
                    statuses: [],
                    activityStatuses: [],
                  });
                  // Then call parent's clear function
                  handleClearFilters();
                }}
                className="text-xs"
              >
                {getLocalActiveFilterCount() > 1
                  ? "Remove Filters"
                  : getLocalActiveFilterCount() === 1
                    ? "Clear Filter"
                    : "Close"}
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

export default EquipmentFilters;
