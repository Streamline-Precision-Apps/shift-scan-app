import { useState } from "react";

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
}

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExportReportModal = ({ onClose, onExport }: ExportModalProps) => {
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "">("");

  const closeModal = () => {
    setExportFormat("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto no-scrollbar px-6 py-4">
        <div className="flex flex-col gap-4 items-center w-full relative">
          {/* Modal title Content */}
          <div className="flex flex-col w-full border-b border-gray-200 pb-3">
            <div className="flex flex-row gap-2 items-center">
              <h2 className="text-xl font-bold">Export Report Data</h2>
              <Download className="h-5 w-5" />
            </div>
            <p className="text-xs text-gray-600 pt-1">
              Choose your preferred export format. Date filtering is applied
              based on your selection above.
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
          <div className="flex flex-col gap-6 w-full px-2 py-4">
            {/* Export format selection */}
            <div className="w-full">
              <h3 className="font-semibold text-sm mb-2">Export Format</h3>
              <div className="flex flex-row w-full gap-4 border border-gray-200 rounded-md p-4">
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
          </div>
          {/* Action buttons */}
          <div className="flex flex-row gap-3 w-full justify-end border-t border-gray-200 pt-4">
            <Button
              variant="outline"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              className="bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-50"
              onClick={() => exportFormat && onExport(exportFormat)}
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

export { ExportReportModal };
