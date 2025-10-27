"use client";
import React, { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
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
import { Notification } from "../../../../../prisma/generated/prisma/client";
import { notificationTableColumns } from "./notificationTableColumns";
import { Bell, BellDot, BellElectric, BellPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationTableProps {
  data: Notification[];
  totalCount: number;
  loading?: boolean;

  setData: React.Dispatch<React.SetStateAction<Notification[] | undefined>>;
}

export function NotificationTable({
  data,
  totalCount,
  loading,
  setData,
}: NotificationTableProps) {
  const columns = useMemo(() => notificationTableColumns(setData), [data]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-[90vh] w-full flex flex-col bg-neutral-100 pb-2 rounded-lg">
      <div className="p-3 h-[5vh] flex flex-col bg-white rounded-lg border-b border-gray-200">
        <div className="flex flex-row items-center gap-2 w-full">
          <BellPlus className="h-4 w-4 text-blue-500" />
          <h2 className="text-md">Needs Attention</h2>
          <div className="ml-auto flex flex-row items-center gap-2">
            <Badge
              variant="secondary"
              className="py-1 px-2 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
            >
              {totalCount}
            </Badge>
            <span className="text-xs text-gray-500">Unresolved</span>
          </div>
        </div>
      </div>

      <Table className="flex-1 overflow-y-auto rounded-lg mb-5 pb-2 px-4">
        <TableHeader className="sticky top-0 z-10 bg-white rounded-lg">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-white rounded-lg">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="whitespace-nowrap font-semibold text-gray-500 text-center  bg-neutral-100 border-gray-200  text-sm sticky top-0 "
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
        <TableBody className="h-full divide-y divide-gray-300 bg-white rounded-b-lg">
          {loading ? (
            Array.from({ length: 10 }).map((_, idx) => (
              <TableRow key={`loading-row-${idx}`}>
                {columns.map((col, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className="first:rounded-bl-lg last:rounded-br-lg"
                  >
                    <div className="h-4 w-3/4 bg-gray-200 rounded-lg  animate-pulse " />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="first:rounded-bl-lg last:rounded-br-lg"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-3 py-2 first:rounded-bl-lg last:rounded-br-lg text-center "
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="h-full first:rounded-bl-lg last:rounded-br-lg">
              <TableCell
                colSpan={columns.length}
                className="text-center h-full align-middle bg-gray-100 first:rounded-bl-lg last:rounded-br-lg "
              >
                <div className="flex flex-col items-center justify-center h-full w-full pt-5 ">
                  <span className="text-gray-400 text-md">
                    {`You're all caught up 🎉`}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
