import { useState, useMemo, SetStateAction, Dispatch } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { CrewData, User } from "../useAllTimeSheetData";
import {
  ArrowUpAZ,
  ChevronDownIcon,
  Download,
  Funnel,
  Info,
  Table,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";

type DateRange = { from: Date | undefined; to: Date | undefined };

interface FilterData {
  users?: string[];
  crews?: string[];
  exportByUser?: boolean;
}

interface ExportModalProps {
  onClose: () => void;
  onExport: (
    exportFormat: "csv" | "xlsx",
    dateRange?: {
      from?: Date;
      to?: Date;
    },
    selectedFields?: string[],
    selectedUsers?: string[],
    selectedCrew?: string[],
    selectedProfitCenters?: string[],
    filterByUser?: boolean,
    filterData?: FilterData,
  ) => void;
  crew: CrewData[];
  users: User[];
  profitCenters: {
    code: string;
    name: string;
  }[];
  exportFileName: string | null;
  setExportFileName: Dispatch<SetStateAction<string | null>>;
}

// Convert actual user and crew data to ComboboxOption format
const formatUsers = (users: User[]): ComboboxOption[] => {
  return (
    users
      // Filter out users with termination date
      .filter((user) => !user.terminationDate)
      // Sort alphabetically by last name
      .sort((a, b) => a.lastName.localeCompare(b.lastName))
      .map((user) => ({
        value: user.id,
        label: `${user.lastName}, ${user.firstName}`,
      }))
  );
};

const formatCrews = (crews: CrewData[]): ComboboxOption[] => {
  return (
    crews
      // Sort alphabetically by name
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((crew) => ({
        value: crew.id,
        label: crew.name,
      }))
  );
};

const formatProfitCenters = (
  profitCenters: {
    code: string;
    name: string;
  }[],
): ComboboxOption[] => {
  return (
    profitCenters
      // Sort alphabetically by name
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((job) => ({
        value: job.code,
        label: job.name,
      }))
  );
};

export const EXPORT_FIELDS = [
  { key: "Id", label: "Id" },
  { key: "Date", label: "Date Worked" },
  { key: "Employee", label: "Employee" },
  { key: "Jobsite", label: "Profit Center" },
  { key: "CostCode", label: "Cost Code" },
  { key: "NU", label: "NU" },
  { key: "FP", label: "FP" },
  { key: "Start", label: "Start Time" },
  { key: "End", label: "End Time" },
  { key: "Duration", label: "Hours" },
  { key: "Comment", label: "Description" },
  { key: "EquipmentId", label: "Equipment" },
  { key: "EquipmentUsage", label: "Equipment Usage" },
  { key: "TruckNumber", label: "Trucking Number" },
  { key: "TruckStartingMileage", label: "Truck Starting Mileage" },
  { key: "TruckEndingMileage", label: "Truck Ending Mileage" },
  { key: "MilesAtFueling", label: "Miles at Fueling" },
  { key: "TascoABCDELoads", label: "ABCDE loads" },
  { key: "TascoFLoads", label: "F loads" },
];

const ExportModal = ({
  onClose,
  onExport,
  crew,
  users,
  profitCenters,
  exportFileName,
  setExportFileName,
}: ExportModalProps) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.map((f) => f.key),
  );
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "">("");

  // Filter specific states
  const [showExportGuide, setShowExportGuide] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCrews, setSelectedCrews] = useState<string[]>([]);
  const [selectedProfitCenters, setSelectedProfitCenters] = useState<string[]>(
    [],
  );
  const [selectUserEnabled, setSelectUserEnabled] = useState(false);
  const [selectCrewEnabled, setSelectCrewEnabled] = useState(false);
  const [selectProfitCenterEnabled, setSelectProfitCenterEnabled] =
    useState(false);
  const [exportByUser, setExportByUser] = useState(false);
  const [useCustomTimeRange, setUseCustomTimeRange] = useState(false);
  const [startTime, setStartTime] = useState<string>("00:00"); // Default 12:00 AM
  const [endTime, setEndTime] = useState<string>("23:59"); // Default 11:59 PM

  const allChecked = useMemo(
    () => selectedFields.length === EXPORT_FIELDS.length,
    [selectedFields],
  );
  const isIndeterminate = useMemo(
    () =>
      selectedFields.length > 0 && selectedFields.length < EXPORT_FIELDS.length,
    [selectedFields],
  );

  const handleFieldChange = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  };

  const handleSelectAll = () => {
    if (allChecked) setSelectedFields([]);
    else setSelectedFields(EXPORT_FIELDS.map((f) => f.key));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[600px] h-[80vh] px-6 py-4 flex flex-col items-center">
        <div className="w-full flex flex-col border-b border-gray-100 pb-3 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setDateRange({ from: undefined, to: undefined });
              setExportFormat("");
              onClose();
            }}
            className="absolute top-0 right-0 cursor-pointer"
          >
            <X width={20} height={20} />
          </Button>
          <div className="flex flex-row gap-2 items-center justify-between w-full max-w-[500px] py-1">
            <div className="flex flex-row gap-2  items-center">
              <Download className="h-5 w-5" />
              <h2 className="text-lg font-bold">Export Timesheets</h2>
            </div>

            <div className="w-fit ">
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => setShowExportGuide(!showExportGuide)}
                className={
                  showExportGuide
                    ? "bg-blue-100 text-blue-600 border-1 border-blue-600 hover:bg-blue-100 hover:text-blue-600 "
                    : "text-blue-600 hover:bg-white hover:text-blue-600"
                }
              >
                <Info className="h-4 w-4" />
                <span className="text-xs">
                  {showExportGuide ? "Close Guide" : "Open Guide"}
                </span>
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full px-2 pt-2 pb-10 space-y-5 overflow-y-auto no-scrollbar">
          <div className="w-full">
            {showExportGuide && (
              <>
                <div className="flex flex-row gap-1 pb-1 items-center">
                  <h3 className="font-semibold text-sm text-blue-600">
                    Export Guide
                  </h3>
                </div>

                <div className="flex flex-col  bg-blue-50 px-4 py-3 rounded-lg border border-blue-600 relative">
                  <ul className="list-disc list-inside text-sm font-normal text-blue-600 space-y-1.5">
                    <li>{`Only Approved Timesheets are included in the export`}</li>
                    <li>{`Entering a file name allows you to title the export`}</li>
                    <li>{`Selecting one date you will export Timesheets for that entire day!`}</li>
                    <li>{`Selecting a Range will export Timesheets for the entire range`}</li>
                    <li>{`Every Export applies a default range of 12:00 AM to 11:59 PM`}</li>
                    <li>{`You can only apply one filter not including the date range option`}</li>
                  </ul>
                  <Button
                    size={"sm"}
                    variant={"ghost"}
                    onClick={() => setShowExportGuide(false)}
                    className={"absolute top-1 right-1  "}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            <div className="flex flex-col gap-1 pt-4">
              <div className="flex-col flex pb-1 gap-1">
                <div className="flex flex-row gap-1 items-center">
                  <Label
                    htmlFor="exportFileName"
                    className="font-semibold text-sm"
                  >
                    Export File Name
                  </Label>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Custom export name (auto-generated if blank)
                </p>
              </div>
              <Input
                id="exportFileName"
                placeholder={`timesheets_${new Date().toISOString().slice(0, 10)}`}
                value={exportFileName || ""}
                onChange={(e) => setExportFileName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 pt-4 mb-2">
              <Popover>
                <PopoverTrigger asChild>
                  <div>
                    <Label htmlFor="date" className="font-semibold text-sm">
                      Date Range
                    </Label>
                    <Button
                      variant="outline"
                      id="date"
                      className="w-full justify-between font-normal"
                    >
                      {dateRange.from &&
                      dateRange.to &&
                      dateRange.from !== dateRange.to
                        ? `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                        : dateRange.from &&
                            dateRange.to &&
                            dateRange.from === dateRange.to
                          ? `${format(dateRange.from, "PPP")}`
                          : "Select a date or date range"}
                      <ChevronDownIcon />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <div className="p-4 justify-center flex flex-col items-center">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(value) =>
                        setDateRange({ from: value?.from, to: value?.to })
                      }
                      autoFocus
                    />
                    {(dateRange.from || dateRange.to) && (
                      <Button
                        variant="outline"
                        className="w-1/2 text-xs text-blue-600 hover:underline"
                        onClick={() =>
                          setDateRange({ from: undefined, to: undefined })
                        }
                        type="button"
                      >
                        Clear date range
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="w-full flex flex-col items-center mb-2">
            <div className="w-full flex flex-row gap-1  items-center">
              <h3 className="font-semibold text-sm ">
                Advance Exporting Options
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md text-xs">{`Optional`}</span>
            </div>
            <div className="w-full pt-1 pb-4">
              <p className="text-xs text-gray-600">
                Customize your export with additional options to filter, sort,
                and include specific fields.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem
                value="Customize"
                className="border rounded-md px-4"
              >
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex flex-row items-center gap-2 ">
                    <Table className="h-5 w-5" color="blue" />
                    <div className="w-full flex items-center gap-2">
                      <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        Customize
                      </span>
                      <p className="text-xs text-gray-600">
                        Select Field to include or exclude
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 w-full bg-slate-50 rounded-lg p-3 border border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer col-span-2 hover:bg-blue-50 rounded px-2 py-1 transition">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        className="accent-blue-600"
                      />
                      <span className="font-medium text-blue-700">
                        {allChecked ? "Unselect All" : "Select All"}
                      </span>
                    </label>
                    {EXPORT_FIELDS.map((field) => (
                      <label
                        key={field.key}
                        className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field.key)}
                          onChange={() => handleFieldChange(field.key)}
                          className="accent-blue-600"
                        />
                        <span className="text-xs">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="filter" className="border rounded-md px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex flex-row items-center gap-2 ">
                    <Funnel className="h-5 w-5" color="blue" />
                    <div className="w-full flex flex-row items-center gap-2">
                      <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        Filter
                      </span>
                      <p className="text-xs text-gray-600">
                        Filter the exported data based on specific criteria.
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="w-full mb-4">
                    <div className="w-full bg-slate-50 rounded-lg py-1.5 px-1.5 border border-gray-200 transition-all duration-200 ease-in-out">
                      {/* User Selection */}
                      <div
                        className={`p-2 rounded-md flex flex-col gap-2 mb-4  ${selectCrewEnabled ? "bg-slate-50 border-gray-200 border" : "bg-white border-gray-200 border"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Users</span>
                            {selectCrewEnabled && (
                              <span className="bg-slate-100 text-slate-600 border border-slate-300  px-1.5 py-0.5 rounded-lg text-xs text-center">
                                Disabled
                              </span>
                            )}
                          </div>
                          <Switch
                            checked={selectUserEnabled}
                            disabled={selectCrewEnabled}
                            onCheckedChange={(checked) => {
                              setSelectUserEnabled(checked);
                              if (!checked) setSelectedUsers([]);
                            }}
                            aria-label="Toggle user selection"
                          />
                        </div>
                        <div className="flex flex-row items-center gap-1">
                          <p className="text-xs text-gray-600 mb-2">
                            Exports the data only for the selected users
                          </p>
                        </div>

                        {selectUserEnabled && (
                          <Combobox
                            options={formatUsers(users)}
                            value={selectedUsers}
                            onChange={setSelectedUsers}
                            placeholder="Select users to include"
                            filterKeys={["label"]}
                            showCount={true}
                            optionName="User"
                          />
                        )}
                      </div>

                      {/* Crew Selection */}
                      <div
                        className={`p-2 rounded-md flex flex-col gap-2 mb-4  ${selectUserEnabled ? "bg-slate-50 border-gray-200 border" : "bg-white border-gray-200 border"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">Crews</span>
                            {selectUserEnabled && (
                              <span className="bg-slate-100 text-slate-600 border border-slate-300 px-1.5 py-0.5 rounded-lg text-xs text-center">
                                Disabled
                              </span>
                            )}
                          </div>
                          <Switch
                            checked={selectCrewEnabled}
                            disabled={selectUserEnabled}
                            onCheckedChange={(checked) => {
                              setSelectCrewEnabled(checked);
                              if (!checked) setSelectedCrews([]);
                            }}
                            aria-label="Toggle crew selection"
                          />
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          Exports the data only for all users in the selected
                          crews
                        </p>

                        {selectCrewEnabled && (
                          <Combobox
                            options={formatCrews(crew)}
                            value={selectedCrews}
                            onChange={setSelectedCrews}
                            placeholder="Select crews to export"
                            filterKeys={["label"]}
                            showCount={true}
                            optionName="Crew"
                          />
                        )}
                      </div>

                      {/* Jobsite Selection */}
                      <div
                        className={`p-2 rounded-md flex flex-col gap-2 mb-4  ${selectUserEnabled ? "bg-slate-50 border-gray-200 border" : "bg-white border-gray-200 border"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">
                              Profit Centers
                            </span>
                            {selectUserEnabled && (
                              <span className="bg-slate-100 text-slate-600 border border-slate-300 px-1.5 py-0.5 rounded-lg text-xs text-center">
                                Disabled
                              </span>
                            )}
                          </div>
                          <Switch
                            checked={selectProfitCenterEnabled}
                            disabled={selectUserEnabled || selectCrewEnabled}
                            onCheckedChange={(checked) => {
                              setSelectProfitCenterEnabled(checked);
                              if (!checked) setSelectedProfitCenters([]);
                            }}
                            aria-label="Toggle crew selection"
                          />
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          Exports the data only for all users in the selected
                          profit centers.
                        </p>

                        {selectProfitCenterEnabled && (
                          <Combobox
                            options={formatProfitCenters(profitCenters)}
                            value={selectedProfitCenters}
                            onChange={setSelectedProfitCenters}
                            placeholder="Select profit centers to export"
                            filterKeys={["label"]}
                            showCount={true}
                            optionName="Profit Center"
                          />
                        )}
                      </div>

                      {/* Time Range Override */}
                      <div className="bg-white p-2 rounded-md flex flex-col gap-2   border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Custom Export Hours
                          </span>
                          <Switch
                            checked={useCustomTimeRange}
                            onCheckedChange={setUseCustomTimeRange}
                            aria-label="Toggle time range override"
                          />
                        </div>
                        <p className="w-full text-xs text-gray-600 mb-2">
                          By default, exports include all times from 12:00 AM to
                          11:59 PM. Adjust to narrow or expand the range.
                        </p>

                        {useCustomTimeRange && (
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3 pb-2">
                              <div>
                                <label className="text-xs font-medium block mb-1">
                                  Start Time
                                </label>
                                <input
                                  type="time"
                                  value={startTime}
                                  onChange={(e) => setStartTime(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium block mb-1">
                                  End Time
                                </label>
                                <input
                                  type="time"
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setStartTime("00:00");
                                setEndTime("23:59");
                              }}
                              className="w-auto self-end text-xs text-blue-600"
                              type="button"
                            >
                              Reset to default times
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sorting" className="border rounded-md px-4">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex flex-row items-center gap-2 ">
                    <ArrowUpAZ className="h-5 w-5" color="blue" />
                    <div className="w-full flex flex-row items-center gap-2">
                      <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        Sorting
                      </span>
                      <p className="text-xs text-gray-600">
                        Sorts and format the data automatically
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="w-full mb-4">
                    <div className="w-full bg-slate-50 rounded-lg p-3 border border-gray-200 transition-all duration-200 ease-in-out">
                      {/* Export by User */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">
                              Sort by User
                            </span>
                            <p className="text-xs text-gray-600">
                              Sort the data by the user last name and then by
                              date.
                            </p>
                          </div>
                          <Switch
                            checked={exportByUser}
                            onCheckedChange={setExportByUser}
                            aria-label="Toggle export by user"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <div className="w-full flex flex-row justify-between gap-3 pt-5 border-t border-gray-100">
          <div className="w-full flex flex-col max-w-[300px]">
            <h3 className="font-semibold text-xs mb-1">Export Format</h3>
            <div className="w-full flex flex-row gap-4 ">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                  className="accent-blue-600"
                />
                <span className="text-xs">CSV</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="xlsx"
                  checked={exportFormat === "xlsx"}
                  onChange={() => setExportFormat("xlsx")}
                  className="accent-green-600"
                />
                <span className="text-xs">Excel (XLSX)</span>
              </label>
            </div>
          </div>
          <div className="flex flex-row justify-end  gap-2 ">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded"
              onClick={() => {
                if (exportFormat && dateRange.from) {
                  // Apply time settings based on user selection
                  const finalDateRange = { ...dateRange };

                  if (useCustomTimeRange) {
                    // Parse the time strings for custom time range
                    const [startHours, startMinutes] = startTime
                      .split(":")
                      .map(Number);
                    const [endHours, endMinutes] = endTime
                      .split(":")
                      .map(Number);

                    // Create new Date objects with original dates but custom times
                    if (finalDateRange.from) {
                      const newFrom = new Date(finalDateRange.from);
                      newFrom.setHours(startHours, startMinutes, 0, 0);
                      finalDateRange.from = newFrom;
                    }

                    if (finalDateRange.to) {
                      const newTo = new Date(finalDateRange.to);
                      newTo.setHours(endHours, endMinutes, 0, 0);
                      finalDateRange.to = newTo;
                    }
                  } else {
                    // Set default time range (12:00 AM to 11:59 PM) when custom time range is not enabled
                    if (finalDateRange.from) {
                      const newFrom = new Date(finalDateRange.from);
                      newFrom.setHours(0, 0, 0, 0); // 12:00 AM
                      finalDateRange.from = newFrom;
                    }

                    if (finalDateRange.to) {
                      const newTo = new Date(finalDateRange.to);
                      newTo.setHours(23, 59, 59, 999); // 11:59 PM
                      finalDateRange.to = newTo;
                    } else if (finalDateRange.from) {
                      // If only from date is selected, set to date to the same day at 11:59 PM
                      const sameDate = new Date(finalDateRange.from);
                      sameDate.setHours(23, 59, 59, 999);
                      finalDateRange.to = sameDate;
                    }
                  }

                  // Create a filter object to pass to the export function
                  const filterData = {
                    users:
                      selectUserEnabled && selectedUsers.length > 0
                        ? selectedUsers
                        : undefined,
                    crews:
                      selectCrewEnabled && selectedCrews.length > 0
                        ? selectedCrews
                        : undefined,
                    profitCenters:
                      selectProfitCenterEnabled &&
                      selectedProfitCenters.length > 0
                        ? selectedProfitCenters
                        : undefined,
                    exportByUser: exportByUser,
                  };
                  // Pass the filter data to the onExport function
                  onExport(
                    exportFormat,
                    finalDateRange,
                    selectedFields,
                    selectUserEnabled ? selectedUsers : undefined,
                    selectCrewEnabled ? selectedCrews : undefined,
                    selectProfitCenterEnabled
                      ? selectedProfitCenters
                      : undefined,
                    exportByUser,
                    filterData,
                  );
                }
              }}
              disabled={
                selectedFields.length === 0 || !exportFormat || !dateRange.from
              }
              title={
                !dateRange.from
                  ? "Please select a start date"
                  : !exportFormat
                    ? "Please select an export format"
                    : ""
              }
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ExportModal };
