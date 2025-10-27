"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Timesheet } from "../useAllTimeSheetData";
import { timesheetTableColumns } from "./timesheetTableColumns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import React, { Dispatch, SetStateAction, useMemo, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Check } from "lucide-react";
import LoadingTimesheetTableState from "./loadingTimesheetTableState";

interface TimesheetDataTableProps {
  data: Timesheet[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPageChange: (page: number) => void;
  onDeleteClick?: (id: number) => void;
  deletingId?: number | null;
  isDeleting?: boolean;
  onEditClick?: (id: number) => void;
  editingId?: number | null;
  isEditing?: boolean;
  showPendingOnly: boolean;
  onApprovalAction?: (id: number, action: "APPROVED" | "REJECTED") => void;
  statusLoading?: Record<number, "APPROVED" | "REJECTED" | undefined>;
  searchTerm: string;
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
}

export function TimesheetDataTable({
  data,
  loading,
  page,
  totalPages,
  total,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  onPageChange,
  onDeleteClick,
  deletingId,
  isDeleting,
  onEditClick,
  editingId,
  isEditing,
  showPendingOnly,
  onApprovalAction,
  statusLoading,
  searchTerm,
  setPage,
  setPageSize,
}: TimesheetDataTableProps) {
  // Create column definitions with the action handlers
  const columns = useMemo(() => {
    // Copy the base columns
    const cols = [...timesheetTableColumns];

    // Find and update the actions column
    const actionsColumnIndex = cols.findIndex((col) => col.id === "actions");
    if (actionsColumnIndex >= 0) {
      // Replace with a new definition that includes our handlers
      cols[actionsColumnIndex] = {
        ...cols[actionsColumnIndex],
        cell: ({ row }) => {
          const timesheet = row.original;
          return (
            <div className="sticky right-0 text-xs text-center">
              <div className="flex flex-row justify-center items-center">
                {showPendingOnly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size={"icon"}
                        variant={"link"}
                        className="border-none w-fit h-full justify-center mr-4"
                        aria-label="Approve Timesheet"
                        onClick={() =>
                          onApprovalAction?.(timesheet.id, "APPROVED")
                        }
                      >
                        <Check className="h-4 w-4 " color="green" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Approve</TooltipContent>
                  </Tooltip>
                )}
                {showPendingOnly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size={"icon"}
                        variant={"link"}
                        className="border-none w-fit h-full justify-center mr-4"
                        aria-label="Deny Timesheet"
                        onClick={() =>
                          onApprovalAction?.(timesheet.id, "REJECTED")
                        }
                      >
                        <X className="h-4 w-4 " color="red" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Deny</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"link"}
                      size={"icon"}
                      className="border-none w-fit h-full"
                      aria-label="Edit Timesheet"
                      onClick={() => onEditClick?.(timesheet.id)}
                    >
                      <img
                        src="/formEdit.svg"
                        alt="Edit Form"
                        className="h-4 w-4 mr-4"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Edit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"link"}
                      className="border-none w-fit h-full justify-center"
                      aria-label="Delete Timesheet"
                      onClick={() => onDeleteClick?.(timesheet.id)}
                    >
                      <img
                        src="/trash-red.svg"
                        alt="Delete Form"
                        className="h-4 w-4"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        },
      };
    }

    return cols;
  }, [onEditClick, onDeleteClick]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: page - 1, // TanStack Table uses 0-indexed pages
        pageSize,
      },
    },
    manualPagination: true, // Tell TanStack Table we're handling pagination manually
    pageCount: totalPages, // Important for proper page count display
    meta: {
      searchTerm, // Pass the search term to the table meta
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize })
          : updater;

      setPage(newState.pageIndex + 1);
      if (newState.pageSize !== pageSize) {
        setPageSize(newState.pageSize);
      }
    },
  });

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 overflow-visible pb-[50px]">
        <div className="rounded-md  w-full h-full">
          <Table className="w-full">
            <TableHeader className="sticky top-0 z-10 bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="whitespace-nowrap font-semibold text-gray-700 text-center border-r bg-gray-100 border-gray-200 last:border-r-0 text-xs sticky top-0"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="h-full divide-y divide-gray-200 bg-white">
              <Suspense fallback={<LoadingTimesheetTableState columns={columns} />}>
              {loading ? (
                <LoadingTimesheetTableState columns={columns} />
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="odd:bg-white even:bg-gray-100 border-r border-gray-200 text-xs text-center py-2"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap border-r border-gray-200 text-xs text-center"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={timesheetTableColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
              </Suspense>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
