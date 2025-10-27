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
import React, { Dispatch, SetStateAction, useMemo, Suspense } from "react";
import { FormItem } from "./hooks/types";
import { getFormsTableColumns } from "./formsTableColumns";
import LoadingFormsTableState from "./loadingFormsTableState";

interface FormsDataTableProps {
  data: FormItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchTerm: string;
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
  openHandleDelete: (id: string) => void;
  openHandleArchive: (id: string) => void;
  openHandleUnarchive: (id: string) => void;
  handleShowExportModal: (id: string) => void;
}

export function FormsDataTable({
  data,
  loading,
  page,
  totalPages,
  total,
  pageSize,
  searchTerm,
  setPage,
  setPageSize,
  openHandleDelete,
  openHandleArchive,
  openHandleUnarchive,
  handleShowExportModal,
}: FormsDataTableProps) {
  const columns = useMemo(
    () =>
      getFormsTableColumns({
        openHandleArchive,
        openHandleUnarchive,
        openHandleDelete,
        handleShowExportModal,
      }),
    [
      openHandleArchive,
      openHandleUnarchive,
      openHandleDelete,
      handleShowExportModal,
    ],
  );

  const table = useReactTable({
    data,
    columns: getFormsTableColumns({
      openHandleArchive,
      openHandleUnarchive,
      openHandleDelete,
      handleShowExportModal,
    }),
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
                        className="whitespace-nowrap font-semibold text-gray-700 text-center border-r bg-gray-100 border-gray-200 first:text-left first:pl-3   last:border-r-0 text-xs sticky top-0"
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
              <Suspense fallback={<LoadingFormsTableState columns={columns} />}>
                {loading ? (
                  <LoadingFormsTableState columns={columns} />
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
                          className="whitespace-nowrap border-r border-gray-200 text-xs text-center px-3 py-2"
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
