"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CrewData } from "../useCrewsData";
import { format } from "date-fns";
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

// Helper functions
const leadUser = (crew: CrewData) => {
  const firstName =
    crew.Users.find((u) => u.id === crew.leadId)?.firstName || "";
  const middleName =
    crew.Users.find((u) => u.id === crew.leadId)?.middleName || "";
  const lastName = crew.Users.find((u) => u.id === crew.leadId)?.lastName || "";
  const secondLastName =
    crew.Users.find((u) => u.id === crew.leadId)?.secondLastName || "";
  return `${firstName} ${middleName} ${lastName} ${secondLastName}`;
};

const crewType = (crew: CrewData) => {
  if (crew.crewType === "MECHANIC") return "Mechanic";
  if (crew.crewType === "TRUCK_DRIVER") return "Truck Driver";
  if (crew.crewType === "TASCO") return "TASCO";
  else return "General";
};

const getCrewTypeColor = (crewType: string) => {
  switch (crewType) {
    case "MECHANIC":
      return "bg-blue-100 border-blue-400 text-blue-600"; // Same as mechanicView
    case "TRUCK_DRIVER":
      return "bg-emerald-100 border-emerald-400 text-emerald-600"; // Same as truckView
    case "TASCO":
      return "bg-red-100 border-red-400 text-red-600"; // Same as tascoView
    default:
      return "bg-sky-100 border-sky-400 text-sky-600"; // Same as laborView/General
  }
};

// Define the column configuration
export const crewTableColumns: ColumnDef<CrewData>[] = [
  {
    accessorKey: "name",
    header: "Crew Name",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-left">
          {row.original.name ? row.original.name : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "leadId",
    header: "Supervisor",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-left">
          {row.original.leadId ? leadUser(row.original) : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "crewType",
    header: "Crew Type",
    cell: ({ row }) => {
      const bgColor = getCrewTypeColor(row.original.crewType);

      return (
        <div className="text-xs text-center">
          <span className={`${bgColor} border px-2 py-1 rounded-lg`}>
            {row.original.crewType ? crewType(row.original) : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-center">
          {row.original.createdAt
            ? format(row.original.createdAt, "MM/dd/yy")
            : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "Users",
    header: "Total Crew Members",
    cell: ({ row }) => {
      const users = row.original.Users;
      return (
        <div className="text-sm text-center">
          {users ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer text-blue-600 underline-offset-2 decoration-solid underline">
                  {users.length}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="p-0 min-w-[220px] max-w-[340px]">
                {users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-2 text-gray-700 text-center">
                          <p className="font-bold text-sm">Crew Members</p>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-200 bg-white border border-gray-200">
                      {users.map((u) => (
                        <TableRow
                          className="odd:bg-gray-100 even:bg-white"
                          key={u.id}
                        >
                          <TableCell className="px-2 py-1 whitespace-nowrap">
                            {[
                              u.firstName,
                              u.middleName,
                              u.lastName,
                              u.secondLastName,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-gray-400 italic text-xs">
                    No users in this crew.
                  </div>
                )}
              </HoverCardContent>
            </HoverCard>
          ) : (
            ""
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
