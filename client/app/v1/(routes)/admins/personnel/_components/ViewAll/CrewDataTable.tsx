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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import React, { Dispatch, SetStateAction, useMemo, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CrewData } from "../useCrewsData";
import { crewTableColumns } from "./crewTableColumns";
import LoadingCrewTableState from "./loadingCrewTableState";

interface CrewDataTableProps {
  data: CrewData[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchTerm: string;
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
  onEditClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
  showInactive?: boolean;
}

export function CrewDataTable({
  data,
  loading,
  page,
  totalPages,
  total,
  pageSize,
  searchTerm,
  setPage,
  setPageSize,
  onEditClick,
  onDeleteClick,
  showInactive,
}: CrewDataTableProps) {
  // Create column definitions with the action handlers
  const columns = useMemo(() => {
    // Copy the base columns
    const cols = [...crewTableColumns];

    // Find and update the actions column
    const actionsColumnIndex = cols.findIndex((col) => col.id === "actions");
    if (actionsColumnIndex >= 0) {
      // Replace with a new definition that includes our handlers
      cols[actionsColumnIndex] = {
        ...cols[actionsColumnIndex],
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-row items-center justify-center">
              {/* Edit button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    onClick={() => onEditClick?.(item.id)}
                  >
                    <img
                      src="/formEdit.svg"
                      alt="Edit"
                      className="h-4 w-4 cursor-pointer"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>

              {/* Delete button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    onClick={() => onDeleteClick?.(item.id)}
                  >
                    <img
                      src="/trash-red.svg"
                      alt="Delete"
                      className="h-4 w-4 cursor-pointer"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
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
        <div className="rounded-md w-full h-full">
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
              <Suspense fallback={<LoadingCrewTableState columns={columns} />}>
                {loading ? (
                  <LoadingCrewTableState columns={columns} />
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
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {showInactive ? (
                        <p className="text-gray-500 italic">
                          No Inactive Crew.
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">
                          No Crew found. Click Plus to add new Crew.
                        </p>
                      )}
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
