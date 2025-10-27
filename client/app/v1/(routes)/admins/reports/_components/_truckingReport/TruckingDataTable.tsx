"use client";

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import {
  TruckingReportRow,
  truckingReportColumns,
} from "./truckingReportTableColumns";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/(animations)/spinner";
import { FooterPagination } from "../../../_pages/FooterPagination";
import React, { Suspense } from "react";
import LoadingTruckingReportTableState from "./loadingTruckingReportTableState";

interface TruckingDataTableProps {
  data: TruckingReportRow[];
  loading: boolean;
}

export function TruckingDataTable({ data, loading }: TruckingDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const table = useReactTable({
    data,
    columns: truckingReportColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  React.useEffect(() => {
    setTotal(data.length);
    setTotalPages(Math.ceil(data.length / pageSize));
  }, [data, pageSize]);

  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  React.useEffect(() => {
    table.setPageIndex(page - 1);
  }, [page, table]);

  return (
    <div className="h-[85vh] rounded-lg w-full relative bg-white overflow-hidden">
      <div className="h-full w-full overflow-auto pb-10">
        <div className="relative w-full">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-row items-center gap-2 justify-center bg-white bg-opacity-70 rounded-lg">
              <Spinner size={20} />
              <span className="text-lg text-gray-500">Loading...</span>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-sm text-center border-r border-gray-200 bg-gray-100"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <Suspense
                fallback={
                  <TableBody className="divide-y divide-gray-200 bg-white">
                    <LoadingTruckingReportTableState
                      columns={truckingReportColumns}
                    />
                  </TableBody>
                }
              >
                {loading ? (
                  <TableBody className="divide-y divide-gray-200 bg-white">
                    <LoadingTruckingReportTableState
                      columns={truckingReportColumns}
                    />
                  </TableBody>
                ) : (
                  <TableBody className="divide-y divide-gray-200 bg-white">
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row, rowIdx) => (
                        <TableRow
                          key={row.id}
                          className={
                            rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100"
                          }
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="border-r border-gray-200 text-xs text-center"
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
                          colSpan={truckingReportColumns.length}
                          className="h-[73vh] text-center"
                        >
                          No data available for a Trucking Report.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                )}
              </Suspense>
            </Table>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4 ">
          <FooterPagination
            page={loading ? 1 : page}
            totalPages={loading ? 1 : totalPages}
            total={loading ? 0 : total}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </div>
      </div>
    </div>
  );
}
