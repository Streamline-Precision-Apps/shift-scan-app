import { ColumnDef } from "@tanstack/react-table";
import { CostCodeSummary } from "../useCostCodeData";
import { format } from "date-fns";
import { highlight } from "../../../_pages/highlight";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Archive, ArchiveRestore } from "lucide-react";
import { on } from "events";

// Define the column configuration
export const getCostCodeTableColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  onArchive: (id: string) => void,
  onRestore: (id: string) => void,
): ColumnDef<CostCodeSummary>[] => [
  {
    accessorKey: "nameAndStatus",
    header: "Cost Code Summary",
    cell: ({ row }) => {
      return (
        <div className="w-full flex flex-row items-center">
          <div className="text-sm">
            <div className="w-full h-full flex flex-col text-left">
              <p className="">{highlight(row.original.name, "")}</p>
            </div>
          </div>
          <div className="ml-2 flex flex-row gap-2">
            {row.original.isActive ? (
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs">
                Active
              </span>
            ) : (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs">
                Archived
              </span>
            )}
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs">
              Updated: {format(new Date(row.original.updatedAt), "MM/dd/yy")}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "CCTags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.CCTags || [];
      const filteredTags = tags.filter(
        (tag) => tag.name.toLowerCase() !== "all",
      );

      return (
        <div className="text-xs text-center">
          {filteredTags.length > 0 ? (
            <div className="flex flex-wrap gap-1 justify-center">
              {filteredTags.map((tag, index) => (
                <span
                  key={tag.id}
                  className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "timecardCount",
    header: "Linked Timesheets",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-center">
          {row.original._count?.Timesheets > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/admins/timesheets?costCode=${row.original.code}`}
                  className="cursor-pointer underline decoration-dotted decoration-1 text-sm hover:text-blue-600"
                >
                  {row.original._count?.Timesheets || 0}
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
      return (
        <div className="flex flex-row justify-center">
          {/* Edit button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={"icon"}
                onClick={() => onEdit(item.id)}
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
          {row.original._count?.Timesheets === 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={"icon"}
                  onClick={() => onDelete(item.id)}
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
              {row.original.isActive ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={"icon"}
                      onClick={() => onArchive(item.id)}
                    >
                      <Archive
                        className="h-4 w-4 cursor-pointer"
                        color="blue"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="">Archive</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={"icon"}
                      onClick={() => onRestore(item.id)}
                    >
                      <ArchiveRestore
                        className="h-4 w-4 cursor-pointer"
                        color="blue"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="">Restore Cost Code</span>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      );
    },
  },
];
