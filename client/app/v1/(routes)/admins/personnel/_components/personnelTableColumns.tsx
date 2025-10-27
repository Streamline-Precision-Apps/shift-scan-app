"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PersonnelSummary } from "./usePersonnelData";
import { format } from "date-fns";
import { formatPhoneNumber } from "@/utils/phoneNumberFormater";
import { UserX } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bg } from "date-fns/locale";

// Define the column configuration
export const personnelTableColumns: ColumnDef<PersonnelSummary>[] = [
  {
    accessorKey: "name",
    header: "Employee Summary",
    cell: ({ row }) => {
      const personnel = row.original;

      // Helper function to get access level styling
      const getAccessLevelTag = (permission: string) => {
        const permissionDisplay =
          permission.slice(0, 1) + permission.slice(1).toLowerCase();
        let bgColor = "bg-white-100";
        let textColor = "text-gray-600";
        let border = "border-gray-200";

        switch (permission) {
          case "SUPERADMIN":
            bgColor = "bg-blue-100";
            textColor = "text-purple-600";
            border = "border-purple-400";
            break;
          case "ADMIN":
            bgColor = "bg-blue-100";
            textColor = "text-indigo-600";
            border = "border-indigo-400";
            break;
          case "MANAGER":
            bgColor = "bg-blue-100";
            textColor = "text-blue-600";
            border = "border-blue-400";
            break;
          case "USER":
            bgColor = "bg-blue-100";
            textColor = "text-violet-600";
            border = "border-violet-400";
            break;
        }

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`${bgColor} ${textColor} ${border} border px-2 py-1 rounded-lg text-xs`}
              >
                {permissionDisplay}
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className={`bg-white backdrop-blur border text-black border-black`}
            >
              Permission
            </TooltipContent>
          </Tooltip>
        );
      };

      // Helper function to get active/inactive tag
      const getActiveStatusTag = (isActive: boolean) => {
        return isActive ? (
          <span className="bg-green-100 text-green-600 border-2 border-green-200 px-2 py-1 rounded-lg text-xs">
            Active
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-600 border-2 border-gray-200 px-2 py-1 rounded-lg text-xs">
            Inactive
          </span>
        );
      };

      return (
        <div className="flex items-center gap-3 w-full">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {personnel.image ? (
              <img
                src={personnel.image}
                alt={`${personnel.firstName} ${personnel.lastName}`}
                className="h-10 w-10 rounded-full border border-slate-300 object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full border border-slate-300 flex items-center justify-center bg-gray-50">
                <span className="text-[10px] text-gray-400 text-center leading-tight whitespace-pre-line">
                  {"No\nImg"}
                </span>
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* First row: Name, Access Level, Active Status on left; Account Setup on right */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <span className="text-black text-sm truncate">
                  {`${personnel.firstName} ${personnel.middleName ? personnel.middleName : ""} ${personnel.lastName} ${personnel.secondLastName ? personnel.secondLastName : ""}`
                    .replace(/\s+/g, " ")
                    .trim()}
                </span>
                {getAccessLevelTag(personnel.permission)}
                {getActiveStatusTag(!personnel.terminationDate)}
              </div>

              <div className="flex-shrink-0">
                {!personnel.accountSetup && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="ml-2 bg-white border border-gray-300 rounded-md px-2 py-1 flex items-center">
                        <UserX className="h-4 w-4 text-red-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Account Not Set Up
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Second row: Roles on left; Account Setup on right (if needed) */}
            <div className="flex justify-between items-center w-full pt-1">
              <div className="flex items-center gap-2">
                {personnel.truckView && (
                  <div className="bg-emerald-100 border border-emerald-500 text-emerald-800 rounded-lg px-2 py-1">
                    <p className="text-xs">Trucking</p>
                  </div>
                )}
                {personnel.tascoView && (
                  <div className="bg-red-100 border border-red-500 text-red-800 rounded-lg px-2 py-1">
                    <p className="text-xs">Tasco</p>
                  </div>
                )}
                {personnel.mechanicView && (
                  <div className="bg-blue-100 border border-blue-500 text-blue-800 rounded-lg px-2 py-1">
                    <p className="text-xs">Mechanic</p>
                  </div>
                )}
                {personnel.laborView && (
                  <div className="bg-sky-100 border border-sky-500 text-sky-800 rounded-lg px-2 py-1">
                    <p className="text-xs">General</p>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                {/* Spacer to maintain layout balance */}
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-center">
          {row.original.username ? row.original.username : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-center">
          {row.original.email ? row.original.email : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "Contact.phoneNumber",
    header: "Phone Number",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-center">
          {formatPhoneNumber(row.original.Contact.phoneNumber)}
        </div>
      );
    },
  },
  {
    accessorKey: "DOB",
    header: "Date of Birth",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-center">
          {row.original.DOB
            ? format(new Date(row.original.DOB), "MM/dd/yyyy")
            : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "Contact.emergencyContact",
    header: "Emergency Contact",
    cell: ({ row }) => {
      const personnel = row.original;
      return (
        <div className="text-xs text-center">
          {`${personnel.Contact.emergencyContact ? personnel.Contact.emergencyContact + "-" : ""} ${personnel.Contact.emergencyContactNumber ? formatPhoneNumber(personnel.Contact.emergencyContactNumber) : ""}`}
        </div>
      );
    },
  },
  {
    accessorKey: "crews",
    header: () => <div className="text-center">Crews</div>,
    cell: ({ row }) => {
      const personnel = row.original;
      const crews = personnel.Crews || [];
      const crewCount = crews.length;

      return (
        <div className="text-xs text-center">
          {crewCount > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer underline text-blue-600">
                  {crewCount}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="p-2 w-[400px]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          Crew Name
                        </TableHead>
                        <TableHead className="text-sm text-center border-gray-200 bg-gray-100">
                          Crew Lead
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crews.map((crew, rowIdx) => (
                        <TableRow
                          key={crew.id}
                          className={
                            rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100"
                          }
                        >
                          <TableCell className="px-2 py-1 border-b text-center">
                            {crew.name}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b text-center">
                            {crew.leadName}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            "0"
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      // This is a placeholder - actual implementation will be in the DataTable component
      return (
        <div className="flex flex-row justify-center items-center">
          {/* Action buttons will be replaced */}
        </div>
      );
    },
  },
];
