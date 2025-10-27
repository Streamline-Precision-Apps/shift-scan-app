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
    selectedFields?: string[],
  ) => void;
  setDateRange: Dispatch<SetStateAction<DateRange>>;
  dateRange: DateRange;
}

import { ChevronDownIcon, Download, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const ExportModal = ({
  onClose,
  onExport,
  setDateRange,
  dateRange,
}: ExportModalProps) => {
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "">("");
  const closeModal = () => {
    setDateRange({ from: undefined, to: undefined });
    setExportFormat("");
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[600px] h-[65vh] px-6 py-4 flex flex-col items-center">
        {/* Modal title Content */}
        <div className="flex flex-col w-full border-b border-gray-200 pb-3">
          <div className="flex flex-row gap-2 items-center">
            <h2 className="text-xl font-bold">Export Form Data</h2>
            <Download className="h-5 w-5" />
          </div>
          <p className="text-xs text-gray-600 pt-1">
            Select a date range, apply filters, and choose your preferred export
            format
          </p>
          {/* Close button to close the modal */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={closeModal}
            className="absolute top-0 right-0 cursor-pointer"
          >
            <X width={20} height={20} />
          </Button>
        </div>
        <div className="flex-1 w-full px-2 pt-2 pb-10 space-y-5 overflow-y-auto no-scrollbar">
          {/* Date range picker */}
          <div className="w-full pt-2">
            <div className="w-full flex flex-col ">
              <Label className="font-semibold text-sm ">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal"
                  >
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                      : "Select date range"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="center"
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
        </div>
        {/* Action buttons */}
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
              variant="outline"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded"
              onClick={() => exportFormat && onExport(exportFormat, dateRange)}
              disabled={!exportFormat}
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
