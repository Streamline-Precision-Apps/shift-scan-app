"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EquipmentSummary } from "../useEquipmentData";
import Link from "next/link";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { highlight } from "@/app/(routes)/admins/_pages/highlight";
import { ArchiveIcon, ArchiveRestore } from "lucide-react";
import { format } from "date-fns";

// Define types for action handlers
interface EquipmentActionHandlers {
  onEditClick?: (id: string) => void;
  onArchiveClick?: (id: string) => void;
  onRestoreClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
  onQrClick?: (id: string) => void;
}

// Define the column configuration as a function that accepts handlers
export const createEquipmentTableColumns = (
  actionHandlers?: EquipmentActionHandlers,
): ColumnDef<EquipmentSummary>[] => [
  {
    accessorKey: "nameAndDescription",
    header: "Equipment Summary",
    cell: ({ row, table }) => {
      const equipment = row.original;
      const tag = equipment.equipmentTag;
      const os = equipment.ownershipType;
      const condition = equipment.acquiredCondition;
      const searchTerm = table.options.meta?.searchTerm || "";
      const status = equipment.status;
      const approvalStatus = equipment.approvalStatus;

      return (
        <div className="w-full flex flex-row gap-4 items-center">
          <div className="text-sm flex-1">
            <div className="w-full h-full flex flex-col">
              <div className="flex flex-row gap-2 items-center">
                <div className="flex flex-row min-w-[220px]">
                  <p className="text-left pr-2">
                    <span className="font-semibold text-sm ">
                      {highlight(equipment.code || "", searchTerm)}
                    </span>
                    <span className="text-gray-600 text-xs pl-2">
                      {highlight(equipment.name || "", searchTerm)}
                    </span>
                  </p>
                </div>
                <div className="w-fit flex flex-row gap-2 items-center">
                  {/* Approval Status Badge */}
                  {approvalStatus === "APPROVED" ? null : approvalStatus ===
                    "PENDING" ? (
                    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg text-xs">
                      Pending
                    </span>
                  ) : approvalStatus === "DRAFT" ? null : (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs">
                      Rejected
                    </span>
                  )}

                  {/* Status Badge */}
                  {status === "ACTIVE" ? (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs">
                      Active
                    </span>
                  ) : status === "DRAFT" ? null : (
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs">
                      Archived
                    </span>
                  )}

                  <span
                    className={`${
                      tag === "VEHICLE"
                        ? "text-blue-600 bg-blue-100"
                        : tag === "TRUCK"
                          ? "text-blue-600 bg-blue-100"
                          : tag === "TRAILER"
                            ? "text-blue-600 bg-blue-100"
                            : tag === "EQUIPMENT"
                              ? "text-blue-600 bg-blue-100"
                              : ""
                    } px-2 py-1 rounded-lg text-xs `}
                  >
                    {tag ? tag.charAt(0) + tag.slice(1).toLowerCase() : " "}
                  </span>

                  {condition && (
                    <div className="text-xs text-center">
                      <span
                        className={` px-2 py-1 rounded-lg text-xs  ${
                          condition === "NEW"
                            ? "bg-green-100 text-green-800"
                            : condition === "USED"
                              ? "bg-orange-100 text-orange-600"
                              : ""
                        }`}
                      >
                        {condition
                          ? condition.charAt(0) +
                            condition.slice(1).toLowerCase()
                          : " "}
                      </span>
                    </div>
                  )}

                  <span
                    className={` px-2 py-1 rounded-lg text-xs  ${
                      os === "OWNED"
                        ? "bg-indigo-100 text-indigo-600"
                        : os === "LEASED"
                          ? "bg-purple-100 text-purple-600"
                          : os === "RENTAL"
                            ? "bg-cyan-100 text-cyan-600"
                            : ""
                    }`}
                  >
                    {os ? os.charAt(0) + os.slice(1).toLowerCase() : " "}
                  </span>

                  <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs">
                    Updated: {format(new Date(equipment.updatedAt), "MM/dd/yy")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "memo",
    header: "Memo",
    cell: ({ row }) => {
      const equipment = row.original;
      return (
        <div className="text-xs text-center text-gray-400 italic max-w-[100px]">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="whitespace-normal break-words overflow-hidden text-ellipsis line-clamp-2">
                {equipment.memo || ""}
              </p>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] whitespace-normal break-words">
              {equipment.memo || ""}
            </TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    accessorKey: "linkedTimesheets",
    header: "Linked Logs",
    cell: ({ row }) => {
      const equipment = row.original;
      // Calculate total timesheet-related logs
      const totalLogs =
        (equipment._count?.EmployeeEquipmentLogs || 0) +
        (equipment._count?.TascoLogs || 0) +
        (equipment._count?.HauledInLogs || 0) +
        (equipment._count?.UsedAsTrailer || 0) +
        (equipment._count?.UsedAsTruck || 0) +
        (equipment._count?.Maintenance || 0);

      return (
        <div className="text-xs text-center">
          {totalLogs > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/admins/timesheets?equipmentId=${equipment.id}`}
                  className="cursor-pointer underline decoration-dotted decoration-1 text-sm hover:text-blue-600"
                >
                  {totalLogs}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">See All Entries</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      const {
        onEditClick,
        onDeleteClick,
        onQrClick,
        onArchiveClick,
        onRestoreClick,
      } = actionHandlers || {};

      // Calculate total linked timesheet logs
      const totalTimesheetLogs =
        (item._count?.EmployeeEquipmentLogs || 0) +
        (item._count?.TascoLogs || 0) +
        (item._count?.HauledInLogs || 0) +
        (item._count?.UsedAsTrailer || 0) +
        (item._count?.UsedAsTruck || 0) +
        (item._count?.Maintenance || 0);

      return (
        <div className="flex flex-row justify-center">
          {/* QR Code button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={"icon"}
                onClick={() => onQrClick?.(item.id)}
              >
                <img
                  src="/qrCode.svg"
                  alt="QR"
                  className="h-4 w-4 cursor-pointer"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Print QR Code</TooltipContent>
          </Tooltip>

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
          {totalTimesheetLogs === 0 ? (
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
          ) : (
            <>
              {item.status === "ACTIVE" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={"icon"}
                      onClick={() => onArchiveClick?.(item.id)}
                    >
                      <ArchiveIcon
                        className="h-4 w-4 cursor-pointer"
                        color="red"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Archive</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={"icon"}
                      onClick={() => onRestoreClick?.(item.id)}
                    >
                      <ArchiveRestore
                        className="h-4 w-4 cursor-pointer"
                        color="red"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Unarchive</TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      );
    },
  },
];
