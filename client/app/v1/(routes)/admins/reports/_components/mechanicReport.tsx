"use client";

import { useState, useEffect } from "react";

import { MechanicReportRow } from "./_mechanicReport/mechanicReportTableColumns";
import { ExportReportModal } from "./ExportModal";
import { format } from "date-fns";
import { MechanicDataTable } from "./_mechanicReport/MechanicDataTable";

interface MechanicReportProps {
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  registerReload?: (reloadFn: () => Promise<void>) => void;
  isRefreshing?: boolean;
}

type DateRange = { from: Date | undefined; to: Date | undefined };

export default function MechanicReport({
  showExportModal,
  setShowExportModal,
  dateRange: externalDateRange,
  registerReload,
  isRefreshing,
}: MechanicReportProps) {
  const [allData, setAllData] = useState<MechanicReportRow[]>([]);
  const [filteredData, setFilteredData] = useState<MechanicReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports/mechanic");
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Failed to fetch Mechanic report data");
      }
      setAllData(json);
    } catch (error) {
      console.error("Error fetching Mechanic report data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on external date range
  useEffect(() => {
    if (!allData.length) {
      setFilteredData([]);
      return;
    }

    let filtered = allData;

    if (externalDateRange?.from && externalDateRange?.to) {
      // If from and to are the same day, filter by the full day
      const isSameDay =
        externalDateRange.from.toDateString() ===
        externalDateRange.to.toDateString();
      if (isSameDay) {
        const startOfDay = new Date(externalDateRange.from);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(externalDateRange.from);
        endOfDay.setHours(23, 59, 59, 999);
        filtered = allData.filter((row) => {
          const date = new Date(row.dateWorked);
          return date >= startOfDay && date <= endOfDay;
        });
      } else {
        filtered = allData.filter((row) => {
          const date = new Date(row.dateWorked);
          return (
            date >= externalDateRange.from! && date <= externalDateRange.to!
          );
        });
      }
    } else if (externalDateRange?.from) {
      // Only start date provided
      filtered = allData.filter((row) => {
        const date = new Date(row.dateWorked);
        return date >= externalDateRange.from!;
      });
    } else if (externalDateRange?.to) {
      // Only end date provided
      filtered = allData.filter((row) => {
        const date = new Date(row.dateWorked);
        return date <= externalDateRange.to!;
      });
    }

    setFilteredData(filtered);
  }, [allData, externalDateRange]);

  // Register reload function on mount
  useEffect(() => {
    if (registerReload) {
      registerReload(fetchData);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerReload]);

  const onExport = (
    exportFormat: "csv" | "xlsx",
    _dateRange?: { from?: Date; to?: Date },
    selectedFields?: string[],
  ) => {
    if (!filteredData.length) return;
    // Use the already filtered data for export
    const exportData = filteredData;

    const tableHeaders = [
      "Id",
      "Employee Name",
      "Equipment Worked On",
      "Hours",
      "Comments",
      "Date Worked",
    ];

    if (exportFormat === "csv") {
      const csvRows = [
        tableHeaders.join(","),
        ...exportData.map((row) =>
          [
            row.id,
            row.employeeName,
            row.equipmentWorkedOn,
            row.hours.toFixed(2),
            row.comments || "-",
            format(new Date(row.dateWorked), "yyyy-MM-dd"),
          ]
            .map((cell) => {
              if (cell === null || cell === undefined) return "";
              const str = String(cell);
              // Always quote, and escape quotes inside
              return '"' + str.replace(/"/g, '""') + '"';
            })
            .join(","),
        ),
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mechanic-report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === "xlsx") {
      import("xlsx")
        .then((XLSX) => {
          const ws = XLSX.utils.json_to_sheet(
            exportData.map((row) => ({
              Id: row.id,
              "Employee Name": row.employeeName,
              "Equipment Worked On": row.equipmentWorkedOn,
              Hours: row.hours.toFixed(2),
              Comments: row.comments || "-",
              "Date Worked": format(new Date(row.dateWorked), "yyyy/MM/dd"),
            })),
          );
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Mechanic Report");
          XLSX.writeFile(wb, "mechanic-report.xlsx");
        })
        .catch((error) => {
          console.error("Error exporting to XLSX:", error);
        });
    }
  };

  return (
    <>
      <MechanicDataTable
        data={filteredData}
        loading={loading || !!isRefreshing}
      />

      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={onExport}
        />
      )}
    </>
  );
}
