"use client";

import { useState, useEffect } from "react";
import { 
  TruckingReportRow, 
  EquipmentItem, 
  MaterialItem, 
  FuelItem, 
  StateMileageItem 
} from "./_truckingReport/truckingReportTableColumns";
import { ExportReportModal } from "./ExportModal";
import { format } from "date-fns";
import { TruckingDataTable } from "./_truckingReport/TruckingDataTable";

interface TruckingReportProps {
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  dateRange?: { from: Date | undefined; to: Date | undefined };
  registerReload?: (reloadFn: () => Promise<void>) => void;
  isRefreshing?: boolean;
}

type DateRange = { from: Date | undefined; to: Date | undefined };

export default function TruckingReport({
  showExportModal,
  setShowExportModal,
  dateRange: externalDateRange,
  registerReload,
  isRefreshing,
}: TruckingReportProps) {
  const [allData, setAllData] = useState<TruckingReportRow[]>([]);
  const [filteredData, setFilteredData] = useState<TruckingReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports/trucking");
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Failed to fetch Trucking report data");
      }
      setAllData(json);
    } catch (error) {
      console.error("Error fetching Trucking report data:", error);
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
          const date = new Date(row.date);
          return date >= startOfDay && date <= endOfDay;
        });
      } else {
        filtered = allData.filter((row) => {
          const date = new Date(row.date);
          return (
            date >= externalDateRange.from! && date <= externalDateRange.to!
          );
        });
      }
    } else if (externalDateRange?.from) {
      // Only start date provided
      filtered = allData.filter((row) => {
        const date = new Date(row.date);
        return date >= externalDateRange.from!;
      });
    } else if (externalDateRange?.to) {
      // Only end date provided
      filtered = allData.filter((row) => {
        const date = new Date(row.date);
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

    // Helper functions for formatting each type of data
    const formatEquipment = (equipment: EquipmentItem[]) => {
      if (!Array.isArray(equipment) || equipment.length === 0) return "-";
      return equipment.map(
        (eq: EquipmentItem) =>
          `[${eq.name}: ${eq.source} → ${eq.destination} (${eq.startMileage}-${eq.endMileage} mi)]`,
      ).join(" | ");
    };

    const formatMaterials = (materials: MaterialItem[]) => {
      if (!Array.isArray(materials) || materials.length === 0) return "-";
      return materials.map(
        (mat: MaterialItem) =>
          `[${mat.name}: ${mat.quantity} ${mat.unit} at ${mat.location}]`,
      ).join(" | ");
    };

    const formatFuel = (fuel: FuelItem[]) => {
      if (!Array.isArray(fuel) || fuel.length === 0) return "-";
      return fuel.map(
        (f: FuelItem) => `[${f.milesAtFueling} mi: ${f.gallonsRefueled} gal]`,
      ).join(" | ");
    };

    const formatStateMileages = (stateMileages: StateMileageItem[]) => {
      if (!Array.isArray(stateMileages) || stateMileages.length === 0) return "-";
      return stateMileages.map(
        (s: StateMileageItem) => `[${s.state}: ${s.stateLineMileage} mi]`,
      ).join(" | ");
    };

    const tableHeaders = [
      "Driver",
      "Date",
      "Truck #",
      "Trailer #",
      "Trailer Type",
      "Job #",
      "Starting Mileage",
      "Ending Mileage",
      "Equipment Details [equipment moved: starting location -> ending location (mileage)]",
      "Material Hauled Details [Material: Quantity - Location]",
      "Refuel Details",
      "State Line Details",
      "Notes",
    ];

    if (exportFormat === "csv") {
      const csvRows = [
        tableHeaders.join(","),
        ...exportData.map((row) => {
          return [
            row.driver,
            format(new Date(row.date), "yyyy-MM-dd"),
            row.truckName || "-",
            row.trailerName || "-",
            row.trailerType || "-",
            row.jobId || "-",
            row.StartingMileage || "-",
            row.EndingMileage || "-",
            formatEquipment(row.Equipment || []),
            formatMaterials(row.Materials || []),
            formatFuel(row.Fuel || []),
            formatStateMileages(row.StateMileages || []),
            row.notes || "-",
          ]
            .map((cell) => {
              if (cell === null || cell === undefined) return "";
              const str = String(cell);
              // Always quote, and escape quotes inside
              return '"' + str.replace(/"/g, '""') + '"';
            })
            .join(",");
        }),
      ];

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "trucking-report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportFormat === "xlsx") {
      import("xlsx").then((XLSX) => {
        const ws = XLSX.utils.json_to_sheet(
          exportData.map((row) => ({
            Driver: row.driver,
            Date: format(new Date(row.date), "yyyy/MM/dd"),
            "Truck #": row.truckName || "-",
            "Trailer #": row.trailerName || "-",
            "Trailer Type": row.trailerType || "-",
            "Job #": row.jobId || "-",
            "Starting Mileage": row.StartingMileage || "-",
            "Ending Mileage": row.EndingMileage || "-",
            "Equipment Details [equipment moved: starting location -> ending location (mileage)]": formatEquipment(row.Equipment || []),
            "Material Hauled Details [Material: Quantity - Location]": formatMaterials(row.Materials || []),
            "Refuel Details": formatFuel(row.Fuel || []),
            "State Line Details": formatStateMileages(row.StateMileages || []),
            Notes: row.notes || "-",
          })),
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Trucking Report");
        XLSX.writeFile(wb, "trucking-report.xlsx");
      });
    }
  };

  return (
    <>
      <TruckingDataTable data={filteredData} loading={loading} />

      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={onExport}
        />
      )}
    </>
  );
}
