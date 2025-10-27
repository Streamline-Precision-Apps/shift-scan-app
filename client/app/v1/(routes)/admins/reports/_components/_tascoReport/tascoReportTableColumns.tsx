"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

// Define the TascoReportRow interface (matches the original)
export interface TascoReportRow {
  id: string;
  shiftType: string;
  submittedDate: string;
  employee: string;
  dateWorked: string;
  laborType: string;
  equipment: string;
  loadsABCDE: number;
  loadsF: number;
  materials: string;
  startTime: string;
  endTime: string;
  LoadType: string;
}

// Create the columns for the TanStack table
export const tascoReportColumns: ColumnDef<TascoReportRow>[] = [
  {
    accessorKey: "shiftType",
    header: () => <div className="text-center">Shift Type</div>,
    cell: ({ row }) => {
      const shiftType = row.getValue("shiftType") as string;
      return (
        <div className="text-xs text-center">
          {shiftType === "ABCD Shift"
            ? "TASCO - A, B, C, D Shift"
            : shiftType === "E shift"
              ? "TASCO - E Shift Mud Conditioning"
              : shiftType}
        </div>
      );
    },
  },
  {
    accessorKey: "submittedDate",
    header: () => <div className="text-center">Submitted Date</div>,
    cell: ({ row }) => {
      const submittedDate = row.getValue("submittedDate") as string;
      return (
        <div className="text-xs text-center">
          {format(new Date(submittedDate), "yyyy/MM/dd")}
        </div>
      );
    },
  },
  {
    accessorKey: "employee",
    header: () => <div className="text-center">Employee</div>,
    cell: ({ row }) => (
      <div className="text-xs text-center">{row.getValue("employee")}</div>
    ),
  },
  {
    accessorKey: "dateWorked",
    header: () => <div className="text-center">Date Worked</div>,
    cell: ({ row }) => {
      const dateWorked = row.getValue("dateWorked") as string;
      return (
        <div className="text-xs text-center">
          {format(new Date(dateWorked), "yyyy/MM/dd")}
        </div>
      );
    },
  },
  {
    accessorKey: "laborType",
    header: () => <div className="text-center">Labor Type</div>,
    cell: ({ row }) => {
      const laborType = row.getValue("laborType") as string;
      return (
        <div className="text-xs text-center">
          {laborType === "tascoAbcdEquipment"
            ? "Equipment Operator"
            : laborType === "tascoEEquipment"
              ? "Equipment Operator" // Changed from "-" to "Equipment Operator"
              : laborType === "tascoAbcdLabor"
                ? "Manual Labor" // Changed from "Equipment Operator" to "Manual Labor" for clarity
                : laborType || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "equipment",
    header: () => <div className="text-center">Equipment</div>,
    cell: ({ row }) => {
      const equipment = row.getValue("equipment") as string;
      return <div className="text-xs text-center">{equipment || "-"}</div>;
    },
  },
  {
    accessorKey: "loadsABCDE",
    header: () => <div className="text-center">Loads - ABCDE</div>,
    cell: ({ row }) => {
      const loadsABCDE = row.getValue("loadsABCDE") as number;
      // Show 0 as "0" instead of "-", and handle null/undefined properly
      return (
        <div className="text-xs text-center">
          {loadsABCDE !== null && loadsABCDE !== undefined ? loadsABCDE : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "loadsF",
    header: () => <div className="text-center">Loads - F</div>,
    cell: ({ row }) => {
      const loadsF = row.getValue("loadsF") as number;
      // Show 0 as "0" instead of "-", and handle null/undefined properly
      return (
        <div className="text-xs text-center">
          {loadsF !== null && loadsF !== undefined ? loadsF : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "materials",
    header: () => <div className="text-center">Materials</div>,
    cell: ({ row }) => {
      const materials = row.getValue("materials") as string;
      return <div className="text-xs text-center">{materials || "-"}</div>;
    },
  },
  {
    accessorKey: "startTime",
    header: () => <div className="text-center">Start Time</div>,
    cell: ({ row }) => {
      const startTime = row.getValue("startTime") as string;
      return (
        <div className="text-xs text-center">
          {format(new Date(startTime), "HH:mm") || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "endTime",
    header: () => <div className="text-center">End Time</div>,
    cell: ({ row }) => {
      const endTime = row.getValue("endTime") as string;
      return (
        <div className="text-xs text-center">
          {format(new Date(endTime), "HH:mm") || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "LoadType",
    header: () => <div className="text-center">Screened or Unscreened</div>,
    cell: ({ row }) => {
      const loadType = row.getValue("LoadType") as string;
      return (
        <div className="text-xs text-center">
          {loadType === "SCREENED"
            ? "Screened"
            : loadType === "UNSCREENED"
              ? "Unscreened"
              : "-"}
        </div>
      );
    },
  },
];
