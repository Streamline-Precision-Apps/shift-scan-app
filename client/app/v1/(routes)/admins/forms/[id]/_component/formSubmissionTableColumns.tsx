import { ColumnDef } from "@tanstack/react-table";
import { Submission } from "./hooks/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { highlight } from "../../../_pages/highlight";
import { format } from "date-fns";
import Link from "next/link";

// Define the column configuration for the form submissions table
export const formSubmissionTableColumns: ColumnDef<Submission>[] = [
  {
    accessorKey: "submittedBy",
    header: "Submitted By",
    cell: ({ row }) => {
      const submission = row.original;
      return (
        <div className="text-xs text-center">
          {highlight(
            `${submission.User.firstName} ${submission.User.lastName}`,
            "",
          )}
        </div>
      );
    },
  },
  // Note: Form fields would be dynamically added based on the form template
  // This would be handled in the parent component or in a more complex solution

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <div className="text-xs text-center">{row.original.status}</div>;
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Submitted At",
    cell: ({ row }) => {
      const submission = row.original;
      return (
        <div className="text-xs text-center">
          {submission.submittedAt
            ? format(new Date(submission.submittedAt), "PPp")
            : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "signature",
    header: "Signature",
    cell: ({ row }) => {
      const submission = row.original;
      const hasSignature =
        submission.data?.signature || submission.data?.Signature;

      // We can't check isSignatureRequired directly from submission since we're using Submission type
      // This will be handled by a prop in the DataTable component

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
                onClick={() => {}} // This would be implemented in the parent component
              >
                <img
                  src="/formEdit.svg"
                  alt="Edit Submission"
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

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={"icon"}
                onClick={() => {}} // This would be implemented in the parent component
              >
                <img
                  src="/trash-red.svg"
                  alt="Delete Submission"
                  className="h-4 w-4 cursor-pointer"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Submission</TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
];
