"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
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
import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
  Suspense,
} from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EquipmentSummary } from "../useEquipmentData";
import { createEquipmentTableColumns } from "./equipmentTableColumns";
import LoadingEquipmentTableState from "./loadingEquipmentTableState";

interface EquipmentDataTableProps {
  data: EquipmentSummary[];
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
  onQrClick?: (id: string) => void;
  showPendingOnly?: boolean;
  onArchiveClick?: (id: string) => void;
  onRestoreClick?: (id: string) => void;
}

export function EquipmentDataTable({
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
  onArchiveClick,
  onRestoreClick,
  onQrClick,
  showPendingOnly,
}: EquipmentDataTableProps) {
  // Create column definitions with the action handlers directly using our factory function
  const columns = useMemo(() => {
    return createEquipmentTableColumns({
      onEditClick,
      onDeleteClick,
      onQrClick,
      onArchiveClick,
      onRestoreClick,
    });
  }, [onEditClick, onDeleteClick, onQrClick, onArchiveClick, onRestoreClick]);

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  const table = useReactTable({
    data: safeData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          // Use a column that actually exists in the table
          id: "nameAndDescription",
          desc: false,
        },
      ],
    },
    state: {
      pagination: {
        pageIndex: page - 1, // TanStack Table uses 0-indexed pages
        pageSize,
      },
    },
    meta: {
      searchTerm, // Pass the search term to the table meta
    },
    manualPagination: true, // Tell TanStack Table we're handling pagination manually
    pageCount: totalPages || 1, // Ensure we always have at least 1 page
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
                        className="whitespace-nowrap first:text-left  font-semibold text-gray-700 text-center border-r bg-gray-100 border-gray-200 last:border-r-0 text-xs sticky top-0"
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
              <Suspense
                fallback={<LoadingEquipmentTableState columns={columns} />}
              >
                {loading ? (
                  <LoadingEquipmentTableState columns={columns} />
                ) : table.getRowModel() &&
                  table.getRowModel().rows &&
                  table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="odd:bg-white even:bg-gray-100 border-r border-gray-200 text-xs text-center py-2"
                    >
                      {row.getVisibleCells &&
                        row.getVisibleCells().map((cell) => (
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
                      {showPendingOnly
                        ? "No pending equipment found"
                        : "No equipment found"}
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
