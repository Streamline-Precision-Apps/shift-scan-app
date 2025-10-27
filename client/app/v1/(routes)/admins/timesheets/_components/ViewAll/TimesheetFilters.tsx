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
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface FilterOptions {
  jobsiteId: string[];
  costCode: string[];
  equipmentId: string[];
  equipmentLogTypes: string[]; // New field for equipment log type filters
  dateRange: { from?: Date; to?: Date };
  status: string[];
  changes: string[];
  id: string[];
  notificationId: string[];
}

interface FilterPopoverProps {
  onFilterChange: (filters: FilterOptions) => void;
  onUseFiltersChange?: (useFilters: boolean) => void;
  jobsites?: { code: string; name: string }[];
  costCodes?: { code: string; name: string }[];
  equipment?: { id: string; name: string }[];
  filters: FilterOptions; // Add filters prop for controlled state
  handleClearFilters: () => Promise<void>;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
}

const TimesheetFilters: React.FC<FilterPopoverProps> = ({
  onFilterChange,
  onUseFiltersChange,
  jobsites = [],
  costCodes = [],
  equipment = [],
  filters,
  setFilters,
  handleClearFilters,
}) => {
  const [open, setOpen] = useState(false);

  const [costCodeOptions, setCostCodeOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [jobsiteOptions, setJobsiteOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [equipmentOptions, setEquipmentOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // For has changes toggle
  const hasChanges = filters.changes.includes("HAS_CHANGES");

  useEffect(() => {
    const formattedCostCodes = costCodes.map((cc) => ({
      value: cc.code,
      label: cc.name,
    }));
    setCostCodeOptions(formattedCostCodes);

    const formattedJobsites = jobsites.map((js) => ({
      value: js.code,
      label: js.name,
    }));
    setJobsiteOptions(formattedJobsites);

    const formattedEquipment = equipment.map((eq) => ({
      value: eq.id,
      label: eq.name,
    }));
    setEquipmentOptions(formattedEquipment);
  }, [costCodes, jobsites, equipment]);

  const handleApplyFilters = () => {
    const hasActiveFilters =
      filters.jobsiteId.length > 0 ||
      filters.costCode.length > 0 ||
      filters.equipmentId.length > 0 ||
      (filters.equipmentLogTypes?.length || 0) > 0 ||
      filters.dateRange.from ||
      filters.dateRange.to ||
      filters.status.length > 0 ||
      filters.id.length > 0 ||
      filters.changes.length > 0;

    onFilterChange({ ...filters });
    if (onUseFiltersChange) {
      onUseFiltersChange(Boolean(hasActiveFilters));
    }
    setOpen(false);
  };

  const getActiveFilterCount = () => {
    return (
      filters.jobsiteId.length +
      filters.costCode.length +
      filters.equipmentId.length +
      (filters.equipmentLogTypes?.length || 0) +
      (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
      filters.status.length +
      filters.id.length +
      filters.notificationId.length +
      filters.changes.length
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
            <div className="flex flex-row gap-6">
              <div className="flex flex-col space-y-3 w-1/2">
                <div>
                  <h3 className="font-medium mb-1 text-xs">Jobsite</h3>
                  <Combobox
                    options={jobsiteOptions}
                    value={filters.jobsiteId}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, jobsiteId: vals }))
                    }
                    placeholder="Select jobsite"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-xs">Cost Code</h3>
                  <Combobox
                    options={costCodeOptions}
                    value={filters.costCode}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, costCode: vals }))
                    }
                    placeholder="Select cost code"
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-1 text-xs">Equipment</h3>
                  <Combobox
                    options={equipmentOptions}
                    value={filters.equipmentId}
                    onChange={(vals: string[]) => {
                      setFilters((f) => ({
                        ...f,
                        equipmentId: vals,
                        // Reset equipment log types when equipment selection changes
                        equipmentLogTypes:
                          vals.length > 0
                            ? [
                                "employeeEquipmentLogs",
                                "truckingLogs",
                                "tascoLogs",
                                "mechanicProjects",
                              ]
                            : [],
                      }));
                    }}
                    placeholder="Select equipment"
                  />

                  {/* Equipment Log Type Checkboxes - only show when equipment is selected */}
                  {filters.equipmentId.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            filters.equipmentLogTypes?.includes(
                              "employeeEquipmentLogs",
                            ) || false
                          }
                          onCheckedChange={(checked) => {
                            setFilters((f) => {
                              const currentTypes = f.equipmentLogTypes || [];
                              const newTypes = checked
                                ? [
                                    ...currentTypes.filter(
                                      (type) =>
                                        type !== "employeeEquipmentLogs",
                                    ),
                                    "employeeEquipmentLogs",
                                  ]
                                : currentTypes.filter(
                                    (type) => type !== "employeeEquipmentLogs",
                                  );

                              return {
                                ...f,
                                equipmentLogTypes: newTypes,
                              };
                            });
                          }}
                          id="equipment-logs"
                        />
                        <Label htmlFor="equipment-logs" className="text-xs">
                          Equipment Logs
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            filters.equipmentLogTypes?.includes(
                              "truckingLogs",
                            ) || false
                          }
                          onCheckedChange={(checked) => {
                            setFilters((f) => {
                              const currentTypes = f.equipmentLogTypes || [];
                              const newTypes = checked
                                ? [
                                    ...currentTypes.filter(
                                      (type) => type !== "truckingLogs",
                                    ),
                                    "truckingLogs",
                                  ]
                                : currentTypes.filter(
                                    (type) => type !== "truckingLogs",
                                  );

                              return {
                                ...f,
                                equipmentLogTypes: newTypes,
                              };
                            });
                          }}
                          id="trucking-logs"
                        />
                        <Label htmlFor="trucking-logs" className="text-xs">
                          Trucking Logs
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            filters.equipmentLogTypes?.includes("tascoLogs") ||
                            false
                          }
                          onCheckedChange={(checked) => {
                            setFilters((f) => {
                              const currentTypes = f.equipmentLogTypes || [];
                              const newTypes = checked
                                ? [
                                    ...currentTypes.filter(
                                      (type) => type !== "tascoLogs",
                                    ),
                                    "tascoLogs",
                                  ]
                                : currentTypes.filter(
                                    (type) => type !== "tascoLogs",
                                  );

                              return {
                                ...f,
                                equipmentLogTypes: newTypes,
                              };
                            });
                          }}
                          id="tasco-logs"
                        />
                        <Label htmlFor="tasco-logs" className="text-xs">
                          Tasco Logs
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            filters.equipmentLogTypes?.includes(
                              "mechanicProjects",
                            ) || false
                          }
                          onCheckedChange={(checked) => {
                            setFilters((f) => {
                              const currentTypes = f.equipmentLogTypes || [];
                              const newTypes = checked
                                ? [
                                    ...currentTypes.filter(
                                      (type) => type !== "mechanicProjects",
                                    ),
                                    "mechanicProjects",
                                  ]
                                : currentTypes.filter(
                                    (type) => type !== "mechanicProjects",
                                  );

                              return {
                                ...f,
                                equipmentLogTypes: newTypes,
                              };
                            });
                          }}
                          id="mechanic-projects"
                        />
                        <Label htmlFor="mechanic-projects" className="text-xs">
                          Mechanic Projects
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-1 text-xs">Status</h3>
                  <Combobox
                    options={[
                      { value: "PENDING", label: "Pending" },
                      { value: "APPROVED", label: "Approved" },
                      { value: "REJECTED", label: "Rejected" },
                      { value: "DRAFT", label: "Draft" },
                    ]}
                    value={filters.status}
                    onChange={(vals: string[]) =>
                      setFilters((f) => ({ ...f, status: vals }))
                    }
                    placeholder="Select status"
                  />
                </div>
                <div className="flex items-center justify-between pt-1 ">
                  <label
                    htmlFor="has-changes-toggle"
                    className="font-medium text-xs select-none"
                  >
                    Has Changes
                  </label>
                  <Switch
                    id="has-changes-toggle"
                    checked={hasChanges}
                    onCheckedChange={(checked) => {
                      setFilters((f) => ({
                        ...f,
                        changes: checked
                          ? [...(f.changes || []), "HAS_CHANGES"]
                          : (f.changes || []).filter(
                              (c) => c !== "HAS_CHANGES",
                            ),
                      }));
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-4  w-1/2">
                <h3 className="font-medium mb-1 text-xs">Date Range</h3>
                <Calendar
                  mode="range"
                  selected={
                    filters.dateRange && filters.dateRange.from
                      ? (filters.dateRange as { from: Date; to?: Date })
                      : undefined
                  }
                  onSelect={(value) => {
                    if (value?.from && !value?.to) {
                      // Set from to start of day, to to end of day
                      const from = new Date(value.from);
                      from.setHours(0, 0, 0, 0);
                      const to = new Date(value.from);
                      to.setHours(23, 59, 59, 999);
                      setFilters((f) => ({ ...f, dateRange: { from, to } }));
                    } else if (value?.from && value?.to) {
                      const from = new Date(value.from);
                      from.setHours(0, 0, 0, 0);
                      const to = new Date(value.to);
                      to.setHours(23, 59, 59, 999);
                      setFilters((f) => ({ ...f, dateRange: { from, to } }));
                    } else {
                      setFilters((f) => ({ ...f, dateRange: {} }));
                    }
                  }}
                  autoFocus
                />
                <div className="flex items-center justify-center mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 flex-shrink-0"
                    onClick={() => setFilters((f) => ({ ...f, dateRange: {} }))}
                    aria-label="Clear date range"
                  >
                    clear
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
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

export default TimesheetFilters;
