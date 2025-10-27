import { ColumnDef } from "@tanstack/react-table";
import { FormItem } from "./hooks/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { highlight } from "../../../_pages/highlight";
import Link from "next/link";
import { Archive, ArchiveRestore } from "lucide-react";

// Define the column configuration for the forms table
export function getFormsTableColumns({
  openHandleArchive,
  openHandleUnarchive,
  openHandleDelete,
  handleShowExportModal,
}: {
  openHandleArchive: (id: string) => void;
  openHandleUnarchive: (id: string) => void;
  openHandleDelete: (id: string) => void;
  handleShowExportModal: (id: string) => void;
}): ColumnDef<FormItem>[] {
  return [
    {
      accessorKey: "nameAndDescription",
      header: "Form Summary",
      cell: ({ row }) => {
        const form = row.original;
        return (
          <div className="w-full flex flex-row gap-4 items-center">
            <div className="text-sm flex-1 ">
              <div className="w-full h-full flex flex-col">
                <div className="flex flex-row gap-4 items-center ">
                  <p className="">{highlight(form.name, "")}</p>
                  <div className="flex flex-row gap-2 items-center">
                    {row.original.isActive === "ACTIVE" ? (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-xs">
                        {`${row.original.isActive.slice(0, 1).toUpperCase()}${row.original.isActive.slice(1).toLowerCase()}`}
                      </span>
                    ) : row.original.isActive === "DRAFT" ? (
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs">
                        {`${row.original.isActive.slice(0, 1).toUpperCase()}${row.original.isActive.slice(1).toLowerCase()}`}
                      </span>
                    ) : (
                      <span className="w-fit bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs">
                        {`${row.original.isActive.slice(0, 1).toUpperCase()}${row.original.isActive.slice(1).toLowerCase()}`}
                      </span>
                    )}

                    <span className="bg-sky-100 text-sky-600 px-2 py-1 rounded-lg text-xs">
                      {row.original.formType}
                    </span>
                  </div>
                </div>
                <p className="truncate max-w-[750px] text-[10px] text-left text-gray-400 italic">
                  {row.original.description || " No description provided."}
                </p>
              </div>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "submissions",
      header: "Submissions",
      cell: ({ row }) => {
        return (
          <div className="text-sm text-center">
            <Link
              href={`/admins/forms/${row.original.id}`}
              className="text-blue-600 underline-offset-2 decoration-solid underline hover:text-sky-600 cursor-pointer"
            >
              {row.original._count.Submissions}
            </Link>
          </div>
        );
      },
    },

    // {
    //   accessorKey: "createdAt",
    //   header: "Created",
    //   cell: ({ row }) => {
    //     return (
    //       <div className="text-xs text-center">
    //         {row.original.createdAt
    //           ? new Date(row.original.createdAt).toLocaleDateString()
    //           : "-"}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        return (
          <div className="text-xs text-center">
            {row.original.updatedAt
              ? new Date(row.original.updatedAt).toLocaleDateString()
              : "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const form = row.original;

        return (
          <div className="flex flex-row justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size={"icon"} asChild>
                  <Link href={`/admins/forms/${form.id}`}>
                    <img
                      src="/eye.svg"
                      alt="View Form"
                      className="h-4 w-4 cursor-pointer"
                    />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Submissions</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={"icon"}
                  onClick={() => handleShowExportModal(form.id)}
                >
                  <img
                    src="/export.svg"
                    alt="Export Form"
                    className="h-4 w-4 cursor-pointer"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Submissions</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size={"icon"} asChild>
                  <Link href={`/admins/forms/edit/${form.id}`}>
                    <img
                      src="/formEdit.svg"
                      alt="Edit Form"
                      className="h-4 w-4 cursor-pointer"
                    />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Form Template</TooltipContent>
            </Tooltip>

            {form._count.Submissions > 0 && form.isActive === "ACTIVE" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    onClick={() => {
                      openHandleArchive(form.id);
                    }}
                  >
                    <Archive className="h-4 w-4 cursor-pointer" color="red" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Archive</TooltipContent>
              </Tooltip>
            ) : form._count.Submissions > 0 && form.isActive === "ARCHIVED" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    onClick={() => {
                      openHandleUnarchive(form.id);
                    }}
                  >
                    <ArchiveRestore
                      className="h-4 w-4 cursor-pointer "
                      color="red"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unarchive</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={"icon"}
                    onClick={() => openHandleDelete(form.id)}
                  >
                    <img
                      src="/trash-red.svg"
                      alt="Delete Form"
                      className={`h-4 w-4 cursor-pointer `}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="w-fit max-w-56 ">
                  {"Delete Form Template"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];
}
