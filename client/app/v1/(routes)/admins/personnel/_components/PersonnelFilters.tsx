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

export interface PersonnelFilterOptions {
  roles: string[];
  accessLevel: string[];
  accountSetup: string[];
  crews: string[];
}

interface PersonnelFilterPopoverProps {
  onFilterChange: (filters: PersonnelFilterOptions) => void;
  onApplyFilters: () => void;
  onUseFiltersChange?: (useFilters: boolean) => void;
  filters: PersonnelFilterOptions;
  appliedFilters: PersonnelFilterOptions;
  handleClearFilters: () => Promise<void>;
  setFilters: Dispatch<SetStateAction<PersonnelFilterOptions>>;
}

const PersonnelFilters: React.FC<PersonnelFilterPopoverProps> = ({
  onFilterChange,
  onApplyFilters,
  onUseFiltersChange,
  filters,
  appliedFilters,
  setFilters,
  handleClearFilters,
}) => {
  const [open, setOpen] = useState(false);

  // Access level options (permission levels)
  const accessLevelOptions = [
    { value: "USER", label: "User" },
    { value: "MANAGER", label: "Manager" },
    { value: "ADMIN", label: "Admin" },
    { value: "SUPERADMIN", label: "Super Admin" },
  ];

  // Role options (based on the views in personnel data)
  const roleOptions = [
    { value: "truckView", label: "Trucking" },
    { value: "tascoView", label: "Tasco" },
    { value: "mechanicView", label: "Mechanic" },
    { value: "laborView", label: "General" },
  ];

  // Account setup options
  const accountSetupOptions = [
    { value: "true", label: "Complete" },
    { value: "false", label: "Incomplete" },
  ];

  // Crews options
  const crewsOptions = [
    { value: "hasCrews", label: "Has Crews" },
    { value: "noCrews", label: "No Crews" },
  ];

  const handleApplyFilters = () => {
    onApplyFilters();
    setOpen(false);
  };

  const getActiveFilterCount = () => {
    return (
      appliedFilters.roles.length +
      appliedFilters.accessLevel.length +
      appliedFilters.accountSetup.length +
      appliedFilters.crews.length
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
          <TooltipContent side="top">Filter Personnel</TooltipContent>
        </Tooltip>
        <PopoverContent
          className="w-[600px] p-4"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <div className="space-y-4">
            <div className="flex flex-row gap-6">
              <div className="flex flex-col space-y-3 w-1/2">
                <div>
                  <h3 className="font-medium mb-1 text-xs">Role</h3>
                  <Combobox
                    options={roleOptions}
                    value={filters.roles}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, roles: vals }))
                    }
                    placeholder="Select roles"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-1 text-xs">Access Level</h3>
                  <Combobox
                    options={accessLevelOptions}
                    value={filters.accessLevel}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, accessLevel: vals }))
                    }
                    placeholder="Select access levels"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-3 w-1/2">
                <div>
                  <h3 className="font-medium mb-1 text-xs">Account Setup</h3>
                  <Combobox
                    options={accountSetupOptions}
                    value={filters.accountSetup}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, accountSetup: vals }))
                    }
                    placeholder="Select account status"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-1 text-xs">Crew Status</h3>
                  <Combobox
                    options={crewsOptions}
                    value={filters.crews}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, crews: vals }))
                    }
                    placeholder="Select crew status"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row justify-between gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={
                  getActiveFilterCount() > 0
                    ? handleClearFilters
                    : () => setOpen(false)
                }
                className=""
              >
                {getActiveFilterCount() > 0 ? "Clear All" : "Close"}
              </Button>
              <Button size="sm" onClick={handleApplyFilters} className=" ">
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PersonnelFilters;
