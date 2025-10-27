import { ColumnDef } from "@tanstack/react-table";
import { TagSummary } from "../useTagData";
import { highlight } from "../../../_pages/highlight";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

// Define the column configuration
export const getTagTableColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
): ColumnDef<TagSummary>[] => [
  {
    accessorKey: "nameAndDescription",
    header: "Tag Summary",
    cell: ({ row }) => {
      const isAllTag = row.original.name.toUpperCase() === "ALL";
      return (
        <div className="text-sm text-left">
          <div className="w-full h-full flex flex-col">
            <p className="">{highlight(row.original.name, "")}</p>
            <p className="text-[10px] text-gray-400 italic">
              {row.original.description || "No description provided."}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "CostCodes",
    header: "Cost Codes",
    cell: ({ row }) => {
      const costCodes = row.original.CostCodes || [];
      return (
        <div className="text-sm text-center">
          {costCodes.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer text-blue-600 underline-offset-2 decoration-solid underline">
                  {costCodes.length}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="p-4 min-w-[500px] max-w-[720px] w-[720px]">
                <div className="space-y-2">
                  <p className="font-bold text-sm text-gray-700 mb-3">
                    Associated Cost Codes
                  </p>
                  {costCodes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {costCodes.map((costCode) => (
                        <span
                          key={costCode.id}
                          className={`inline-block px-4 py-1 rounded-full text-xs whitespace-nowrap text-center ${
                            costCode.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {costCode.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic text-xs">
                      No cost codes associated with this tag.
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <span className="text-gray-400">0</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "Jobsites",
    header: "Jobsites",
    cell: ({ row }) => {
      const jobsites = row.original.Jobsites || [];
      return (
        <div className="text-sm text-center">
          {jobsites.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer text-blue-600 underline-offset-2 decoration-solid underline">
                  {jobsites.length}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="p-4 min-w-[500px] max-w-[720px] w-[720px]">
                <div className="space-y-2">
                  <p className="font-bold text-sm text-gray-700 mb-3">
                    Associated Jobsites
                  </p>
                  {jobsites.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {jobsites.map((jobsite) => (
                        <span
                          key={jobsite.id}
                          className="inline-block px-4 py-1 rounded-full text-xs whitespace-nowrap text-center bg-blue-100 text-blue-700"
                        >
                          {jobsite.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic text-xs">
                      No jobsites associated with this tag.
                    </div>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <span className="text-gray-400">0</span>
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
      const isAllTag = item.name.toUpperCase() === "ALL";

      return (
        <div className="flex flex-row justify-center">
          {/* Edit button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={"icon"}
                onClick={() => (isAllTag ? onEdit("All") : onEdit(item.id))}
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
          {isAllTag ? null : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={"icon"}
                  onClick={() => onDelete(item.id)}
                  disabled={isAllTag}
                  className={isAllTag ? "opacity-30 cursor-not-allowed" : ""}
                >
                  <img
                    src="/trash-red.svg"
                    alt="Delete"
                    className="h-4 w-4 cursor-pointer"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAllTag ? "This tag cannot be deleted" : "Delete"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];
