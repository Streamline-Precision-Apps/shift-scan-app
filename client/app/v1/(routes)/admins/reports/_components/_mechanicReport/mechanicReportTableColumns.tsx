"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

// Define the MechanicReportRow interface
export interface MechanicReportRow {
  id: number;
  employeeName: string;
  equipmentWorkedOn: string;
  hours: number;
  comments: string;
  dateWorked: string;
}

// Create the columns for the TanStack table
export const mechanicReportColumns: ColumnDef<MechanicReportRow>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center">Id</div>,
    cell: ({ row }) => (
      <div className="text-xs text-center">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "employeeName",
    header: () => <div className="text-center">Employee Name</div>,
    cell: ({ row }) => (
      <div className="text-xs text-center">{row.getValue("employeeName")}</div>
    ),
  },
  {
    accessorKey: "equipmentWorkedOn",
    header: () => <div className="text-center">Equipment Worked On</div>,
    cell: ({ row }) => (
      <div className="text-xs text-center">
        {row.getValue("equipmentWorkedOn")}
      </div>
    ),
  },
  {
    accessorKey: "hours",
    header: () => <div className="text-center">Hours</div>,
    cell: ({ row }) => {
      const hours = row.getValue("hours") as number;
      return (
        <div className="text-xs text-center">
          {hours ? hours.toFixed(2) : "0.00"}
        </div>
      );
    },
  },
  {
    accessorKey: "comments",
    header: () => <div className="text-center">Comments</div>,
    cell: ({ row }) => {
      const comments = row.getValue("comments") as string;
      return (
        <div className="text-xs text-center">{comments || "No comments"}</div>
      );
    },
  },
  {
    accessorKey: "dateWorked",
    header: () => <div className="text-center">Date Worked</div>,
    cell: ({ row }) => {
      const date = row.getValue("dateWorked") as string;
      return (
        <div className="text-xs text-center">
          {date ? format(new Date(date), "yyyy-MM-dd") : "-"}
        </div>
      );
    },
  },
];
