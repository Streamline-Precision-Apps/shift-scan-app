import { ColumnDef, TableMeta } from "@tanstack/react-table";
import { Timesheet } from "../useAllTimeSheetData";
import { format } from "date-fns";

// Define custom meta types for the table
export interface TimesheetTableMeta {
  searchTerm: string;
}

// This will allow TypeScript to recognize our custom meta properties
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    searchTerm?: string;
  }
}

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { highlight } from "../../../_pages/highlight";
import { calculateDuration } from "@/utils/calculateDuration";
import { Flag } from "lucide-react";

// Define the column configuration for the timesheet table
// We'll now include the search term as part of the context
export const timesheetTableColumns: ColumnDef<Timesheet>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row, table }) => {
      // Access search term from table meta
      const searchTerm = (table.options.meta?.searchTerm as string) || "";
      return (
        <div className="text-xs text-center">
          {highlight(row.original.id.toString(), searchTerm)}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date Worked",
    cell: ({ row }) => {
      return (
        <div className=" text-xs text-center">
          {format(row.original.startTime, "MM/dd/yy")}
        </div>
      );
    },
  },
  {
    accessorKey: "workType",
    header: "Work Type",
    cell: ({ row }) => {
      return (
        <div className=" text-xs text-center">
          {row.original.workType === "TRUCK_DRIVER" ? (
            <span>Trucking</span>
          ) : row.original.workType === "TASCO" ? (
            <span>Tasco</span>
          ) : row.original.workType === "LABOR" ? (
            <span>General</span>
          ) : row.original.workType === "MECHANIC" ? (
            <span>Mechanic</span>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "employeeName",
    header: "Employee Name",
    cell: ({ row, table }) => {
      // Access search term from table meta
      const searchTerm = (table.options.meta?.searchTerm as string) || "";
      return (
        <div className=" text-xs text-center">
          {highlight(
            `${row.original.User.firstName} ${row.original.User.lastName}`,
            searchTerm,
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "jobsite",
    header: "Profit Id",
    cell: ({ row, table }) => {
      const searchTerm = (table.options.meta?.searchTerm as string) || "";
      return (
        <div className=" text-xs text-center">
          {row.original.Jobsite ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer text-blue-600 underline underline-offset-2 decoration-solid">
                  {highlight(row.original.Jobsite.code, searchTerm)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs font-semibold">
                  {row.original.Jobsite.name.split("-").slice(1).join(" ")}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "costCode",
    header: "Cost Code",
    cell: ({ row, table }) => {
      const searchTerm = (table.options.meta?.searchTerm as string) || "";
      return (
        <div className=" text-xs text-center">
          {row.original.CostCode ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer text-blue-600 underline underline-offset-2 decoration-solid">
                  {highlight(row.original.CostCode.code, searchTerm)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs font-semibold">
                  {row.original.CostCode.name.split(" ").slice(1).join(" ")}
                </div>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      return (
        <div className=" text-xs text-center">
          {format(row.original.startTime, "hh:mm a")}
        </div>
      );
    },
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => {
      return (
        <div className=" text-xs text-center">
          {row.original.endTime ? format(row.original.endTime, "hh:mm a") : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "hoursWorked",
    header: "Duration",
    cell: ({ row }) => {
      if (!row.original.startTime || !row.original.endTime) {
        return <div className="text-xs text-center">-</div>;
      }

      try {
        // Calculate hours as decimal value directly
        const startDate = new Date(row.original.startTime);
        const endDate = new Date(row.original.endTime);
        const diffMs = endDate.getTime() - startDate.getTime();

        if (diffMs < 0) {
          return <div className="text-xs text-center">Invalid</div>;
        }

        // Convert to decimal hours with 1 decimal place
        const hours = (diffMs / (1000 * 60 * 60)).toFixed(1);

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              {parseFloat(hours) > 0.1 ? (
                <div className="text-xs text-center font-medium cursor-default">
                  {hours} hrs
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <Flag className="h-4 w-4 text-red-600" />
                </div>
              )}
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className={`${parseFloat(hours) > 0.1 ? "" : "bg-red-500 p-2 rounded-md"}`}
            >
              {parseFloat(hours) > 0.1 ? (
                <div className="text-xs">
                  {Math.floor(parseFloat(hours))} hours and{" "}
                  {Math.round((parseFloat(hours) % 1) * 60)} minutes
                </div>
              ) : (
                <div className="text-xs text-center">{`Flagged under ${Math.round((parseFloat(hours) % 1) * 60)} mins`}</div>
              )}
            </TooltipContent>
          </Tooltip>
        );
      } catch (error) {
        return <div className="text-xs text-center">Error</div>;
      }
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div className=" text-xs text-center min-w-[50px]">
          <Tooltip>
            <TooltipTrigger asChild>
              {row.original.status === "PENDING" ? (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-300 rounded-full cursor-pointer font-semibold">
                  P
                </span>
              ) : row.original.status === "DRAFT" ? (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-sky-200 rounded-full cursor-pointer font-semibold">
                  P
                </span>
              ) : row.original.status === "APPROVED" ? (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-300 rounded-full cursor-pointer font-semibold">
                  A
                </span>
              ) : (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-red-300 rounded-full cursor-pointer font-semibold">
                  R
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="center"
              className="w-[120px] justify-center"
            >
              <div className="text-xs text-center">
                {row.original.status === "PENDING"
                  ? "Pending"
                  : row.original.status === "DRAFT"
                    ? "In Progress"
                    : row.original.status === "APPROVED"
                      ? "Approved"
                      : "Rejected"}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Changes",
    cell: ({ row }) => {
      const ChangeLogs = row.original._count?.ChangeLogs || 0;
      return (
        <div className=" text-xs text-center">
          {ChangeLogs > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`font-semibold bg-red-500 rounded-full px-2 py-1 text-white`}
                >
                  {ChangeLogs}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="w-[120px] justify-center"
              >
                <div className="text-xs text-center">{`${ChangeLogs} ${ChangeLogs === 1 ? "change detected" : "changes detected"}`}</div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      // This is a placeholder - the actual implementation is in TimesheetDataTable
      return (
        <div className="sticky right-0 text-xs text-center">
          <div className="flex flex-row justify-center items-center">
            {/* Action buttons will be replaced */}
          </div>
        </div>
      );
    },
  },
];
