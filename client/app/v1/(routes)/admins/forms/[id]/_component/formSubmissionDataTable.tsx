"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import React, { Dispatch, SetStateAction, useMemo, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FormIndividualTemplate, Submission } from "./hooks/types";
import { format } from "date-fns";
import { highlight } from "../../../_pages/highlight";
import { Check, X } from "lucide-react";
import LoadingFormSubmissionTableState from "./loadingFormSubmissionTableState";

interface FormsDataTableProps {
  formTemplate?: FormIndividualTemplate;
  loading: boolean;
  page: number;
  pageSize: number;
  inputValue?: string;
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
  isSignatureRequired?: boolean;
  setShowFormSubmission: Dispatch<SetStateAction<boolean>>;
  setSelectedSubmissionId: Dispatch<SetStateAction<number | null>>;
  openHandleDeleteSubmission: (id: number) => void;
  searchTerm?: string;
  showPendingOnly: boolean;
  onApprovalAction: (id: number, action: "APPROVED" | "REJECTED") => void;
}

export function FormSubmissionDataTable({
  formTemplate,
  loading,
  page,
  pageSize,
  inputValue,
  setPage,
  setPageSize,
  isSignatureRequired,
  setShowFormSubmission,
  setSelectedSubmissionId,
  openHandleDeleteSubmission,
  searchTerm = "",
  showPendingOnly,
  onApprovalAction,
}: FormsDataTableProps) {
  // Flatten all fields from all groupings, ordered
  const fields = useMemo(() => {
    if (!formTemplate?.FormGrouping) return [];
    return formTemplate.FormGrouping.flatMap((g) => g.Fields).sort(
      (a, b) => a.order - b.order,
    );
  }, [formTemplate]);

  // Dynamically create columns based on the form fields
  const columns = useMemo(() => {
    const baseColumns: ColumnDef<Submission>[] = [
      // ID column
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
          const submission = row.original;
          return (
            <div className="text-xs text-center">
              {highlight(submission.id.toString(), searchTerm || "")}
            </div>
          );
        },
      },
      {
        accessorKey: "submittedAt",
        header: "Date Submitted",
        cell: ({ row }) => {
          const submission = row.original;
          return (
            <div className="text-xs text-center">
              {submission.submittedAt
                ? format(new Date(submission.submittedAt), "M/d/yyyy")
                : "-"}
            </div>
          );
        },
      },
      // Submitted By column
      {
        accessorKey: "submittedBy",
        header: "Created By",
        cell: ({ row }) => {
          const submission = row.original;
          return (
            <div className="text-xs text-center">
              {highlight(
                `${submission.User.firstName} ${submission.User.lastName}`,
                searchTerm || "",
              )}
            </div>
          );
        },
      },
    ];
    // Add dynamic field columns based on the form template
    const fieldColumns: ColumnDef<Submission>[] = fields.map((field) => ({
      id: field.id,
      accessorKey: `data.${field.id}`,
      header: field.label,
      cell: ({ row }) => {
        const submission = row.original;
        // Use the same fallback pattern as in SubmissionTable
        const val = (submission.data?.[field.id] ??
          submission.data?.[field.label]) as
          | string
          | number
          | boolean
          | object
          | Array<unknown>
          | null
          | undefined;

        // If the field is a date or time, format it
        let display: string | number | undefined = val as
          | string
          | number
          | undefined;
        let isObject = false;
        let isArrayOfObjects = false;

        if (val && (field.type === "DATE" || field.type === "TIME")) {
          try {
            if (
              typeof val === "string" ||
              typeof val === "number" ||
              val instanceof Date
            ) {
              const dateObj = new Date(val);
              if (!isNaN(dateObj.getTime())) {
                display = format(dateObj, "P");
              } else {
                display = String(val);
              }
            } else {
              display = String(val);
            }
          } catch {
            display = String(val);
          }
        } else if (val && field.type === "CHECKBOX") {
          display = val ? "Yes" : "No";
        } else if (Array.isArray(val)) {
          if (
            val.length > 0 &&
            typeof val[0] === "object" &&
            val[0] !== null &&
            "name" in val[0]
          ) {
            // Array of objects with name property
            isArrayOfObjects = true;
          } else {
            display = (val as (string | number)[]).join(", ");
          }
        } else if (
          val &&
          typeof val === "object" &&
          val !== null &&
          "name" in val
        ) {
          // Single object with name property
          isObject = true;
          display = (val as { name?: string }).name || "";
        }

        return (
          <div className="text-xs text-center">
            {isArrayOfObjects && Array.isArray(val) ? (
              val.length > 3 ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="bg-blue-50 rounded-lg px-2 py-1 border border-blue-200 text-xs text-blue-700 cursor-pointer min-w-[48px]"
                    >
                      {val.length} items
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 max-h-64 overflow-y-auto">
                    <div className="flex flex-wrap gap-1 ">
                      {(val as { id: string; name: string }[]).map(
                        (item, idx) => (
                          <div
                            key={item.id || idx}
                            className="bg-blue-50 rounded-lg px-2 py-1 inline-block border border-blue-200 mb-1"
                          >
                            {item.name || ""}
                          </div>
                        ),
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {(val as { id: string; name: string }[]).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-sky-200 rounded-lg px-2 py-1 inline-block border border-blue-200"
                    >
                      {item.name || ""}
                    </div>
                  ))}
                </div>
              )
            ) : (
              (display ?? "")
            )}
          </div>
        );
      },
    }));

    // Add standard columns after the dynamic fields
    const endColumns: ColumnDef<Submission>[] = [
      // Status column
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
    ];

    // Add signature column if required
    const signatureColumn: ColumnDef<Submission>[] = isSignatureRequired
      ? [
          {
            accessorKey: "signature",
            header: "Signature",
            cell: ({ row }) => {
              const submission = row.original;
              const hasSignature =
                submission.data?.signature || submission.data?.Signature;

              return (
                <div className="text-xs text-center">
                  {hasSignature ? (
                    <span className="text-emerald-600 font-bold">Signed</span>
                  ) : (
                    <span className="text-red-500 font-bold">Not Signed</span>
                  )}
                </div>
              );
            },
          },
        ]
      : [];

    // Actions column
    const actionsColumn: ColumnDef<Submission>[] = [
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const submission = row.original;
          return (
            <div className="flex flex-row justify-center">
              {showPendingOnly && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size={"icon"}
                      variant={"link"}
                      aria-label="Approve Timesheet"
                      onClick={() =>
                        onApprovalAction?.(submission.id, "APPROVED")
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
                      aria-label="Deny Timesheet"
                      onClick={() =>
                        onApprovalAction?.(submission.id, "REJECTED")
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
                    variant="ghost"
                    size={"icon"}
                    onClick={() => {
                      setShowFormSubmission(true);
                      setSelectedSubmissionId(submission.id);
                    }}
                  >
                    <img
                      src="/formEdit.svg"
                      alt="Edit Form"
                      className="h-4 w-4 cursor-pointer"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Submission</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    onClick={() => {
                      openHandleDeleteSubmission(submission.id);
                    }}
                  >
                    <img
                      src="/trash-red.svg"
                      alt="Delete Form"
                      className="h-4 w-4 cursor-pointer"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Submission</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
    ];

    // Combine all columns
    return [
      ...baseColumns,
      ...fieldColumns,
      ...endColumns,
      ...signatureColumn,
      ...actionsColumn,
    ];
  }, [
    fields,
    isSignatureRequired,
    searchTerm,
    setShowFormSubmission,
    setSelectedSubmissionId,
    openHandleDeleteSubmission,
  ]);

  const table = useReactTable({
    data: formTemplate?.Submissions || [],
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
    pageCount: formTemplate?.totalPages || 1, // Important for proper page count display
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
        <div className="rounded-md w-full h-full relative">
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
              <Suspense
                fallback={
                  <LoadingFormSubmissionTableState
                    columnsCount={columns.length}
                  />
                }
              >
                {loading ? (
                  <LoadingFormSubmissionTableState
                    columnsCount={columns.length}
                  />
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
                      className="h-[74vh] text-center"
                    ></TableCell>
                  </TableRow>
                )}
              </Suspense>
            </TableBody>
          </Table>
          {!loading && formTemplate?.Submissions.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row items-center gap-2 justify-center rounded-lg">
              <span className="text-lg text-gray-500">
                No submissions found.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
