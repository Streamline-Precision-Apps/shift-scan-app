import { Dispatch, SetStateAction, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

type DateRange = { from: Date | undefined; to: Date | undefined };

interface ExportModalProps {
  onClose: () => void;
  onExport: (
    exportFormat: "csv" | "xlsx",
    dateRange?: {
      from?: Date;
      to?: Date;
    },
    selectedFields?: string[]
  ) => void;
  setDateRange: Dispatch<SetStateAction<DateRange>>;
  dateRange: DateRange;
}

import { ChevronDownIcon, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ExportTruckingReportModal = ({
  onClose,
  onExport,
  setDateRange,
  dateRange,
}: ExportModalProps) => {
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "">("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "general",
    "equipment",
    "materials",
    "fuel",
    "stateline",
  ]);

  const exportCategories = [
    { key: "general", label: "General Trucking Details" },
    { key: "equipment", label: "Equipment Logs" },
    { key: "materials", label: "Material Logs" },
    { key: "fuel", label: "Fuel Logs" },
    { key: "stateline", label: "Stateline Logs" },
  ];

  const handleCategoryChange = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg min-w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto no-scrollbar p-8 flex flex-col items-center">
        <div className="flex flex-col gap-4 w-full items-center">
          <div className="w-full flex flex-col  mb-2">
            <div className="flex flex-col  mb-6">
              <div className="flex flex-row gap-2">
                <Download className="h-5 w-5" />
                <h2 className="text-base font-bold">Export Report Data</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Select a date range, apply filters, and choose your preferred
                export format
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="text-base font-semibold">
                Date Range
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal"
                  >
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "PPP")} - ${format(
                          dateRange.to,
                          "PPP"
                        )}`
                      : "Select date range"}
                    <ChevronDownIcon />
                  </Button>
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

          {/* Checklist for export categories */}
          <div className="w-full flex flex-col mb-4">
            <p className="text-base font-semibold mb-2">Export Categories</p>
            <div className="flex flex-col gap-2">
              {exportCategories.map((cat) => (
                <label
                  key={cat.key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.key)}
                    onChange={() => handleCategoryChange(cat.key)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col">
            <p className="text-base font-semibold mb-4 ">Export format</p>
            <div className="flex flex-row gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={() => setExportFormat("csv")}
                  className="accent-blue-600"
                />
                <span className="text-sm">CSV</span>
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
                <span className="text-sm">Excel (XLSX)</span>
              </label>
            </div>
          </div>
          <div className="flex flex-row gap-3 w-full mb-2">
            <Button
              size={"sm"}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
              onClick={() =>
                exportFormat &&
                selectedCategories.length > 0 &&
                onExport(exportFormat, dateRange, selectedCategories)
              }
              disabled={!exportFormat || selectedCategories.length === 0}
            >
              Export
            </Button>
            <Button
              size={"sm"}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded transition"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ExportTruckingReportModal };
