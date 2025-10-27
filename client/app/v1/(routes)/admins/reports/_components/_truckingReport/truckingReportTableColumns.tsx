"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
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

// Define interfaces for nested data
export interface EquipmentItem {
  id: string;
  name: string;
  source: string;
  destination: string;
  startMileage: number;
  endMileage: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  location: string;
  quantity: number;
  unit: string;
}

export interface FuelItem {
  id: string;
  milesAtFueling: number;
  gallonsRefueled: number;
}

export interface StateMileageItem {
  id: string;
  state: string;
  stateLineMileage: number;
}

// Define the TruckingReportRow interface
export interface TruckingReportRow {
  id: string;
  driver: string;
  truckId: string | null;
  truckName: string | null;
  trailerId: string | null;
  trailerName: string | null;
  trailerType?: string | null;
  date: string;
  jobId: string | null;
  Equipment: EquipmentItem[];
  Materials: MaterialItem[];
  StartingMileage: number;
  Fuel: FuelItem[];
  StateMileages: StateMileageItem[];
  EndingMileage: number;
  notes?: string;
}

// Create the columns for the TanStack table
export const truckingReportColumns: ColumnDef<TruckingReportRow>[] = [
  {
    accessorKey: "driver",
    header: () => <div className="text-center">Driver</div>,
    cell: ({ row }) => (
      <div className="text-xs text-center">{row.getValue("driver")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="text-center">Date</div>,
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return (
        <div className="text-xs text-center">
          {format(new Date(date), "yyyy/MM/dd")}
        </div>
      );
    },
  },
  {
    accessorKey: "truckName",
    header: () => <div className="text-center">Truck #</div>,
    cell: ({ row }) => {
      const truckName = row.getValue("truckName") as string | null;
      return <div className="text-xs text-center">{truckName || "-"}</div>;
    },
  },
  {
    accessorKey: "trailerName",
    header: () => <div className="text-center">Trailer #</div>,
    cell: ({ row }) => {
      const trailerName = row.getValue("trailerName") as string | null;
      return <div className="text-xs text-center">{trailerName || "-"}</div>;
    },
  },
  {
    accessorKey: "trailerType",
    header: () => <div className="text-center">Trailer Type</div>,
    cell: ({ row }) => {
      const trailerType = row.getValue("trailerType") as string | null;
      return <div className="text-xs text-center">{trailerType || "-"}</div>;
    },
  },
  {
    accessorKey: "jobId",
    header: () => <div className="text-center">Job #</div>,
    cell: ({ row }) => {
      const jobId = row.getValue("jobId") as string | null;
      return <div className="text-xs text-center">{jobId || "-"}</div>;
    },
  },
  {
    accessorKey: "StartingMileage",
    header: () => <div className="text-center">Starting Mileage</div>,
    cell: ({ row }) => {
      const startingMileage = row.getValue("StartingMileage") as number;
      return <div className="text-xs text-center">{startingMileage}</div>;
    },
  },
  {
    accessorKey: "EndingMileage",
    header: () => <div className="text-center">Ending Mileage</div>,
    cell: ({ row }) => {
      const endingMileage = row.getValue("EndingMileage") as number;
      return <div className="text-xs text-center">{endingMileage}</div>;
    },
  },
  {
    id: "equipment",
    header: () => <div className="text-center">Equipment</div>,
    cell: ({ row }) => {
      const equipment = row.original.Equipment;
      return (
        <div className="text-xs text-center">
          {Array.isArray(equipment) && equipment.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer underline text-blue-600">
                  {equipment.length}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="p-2 w-[500px]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100 ">
                          Name
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100 ">
                          Source
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100 ">
                          Destination
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          Start Mileage Overweight
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          End Mileage Overweight
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipment.map((eq: EquipmentItem, rowIdx: number) => (
                        <TableRow
                          key={eq.id}
                          className={
                            rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100"
                          }
                        >
                          <TableCell className="px-2 py-1 border-b">
                            {eq.name}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {eq.source}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {eq.destination}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {eq.startMileage}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {eq.endMileage}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    id: "materials",
    header: () => <div className="text-center">Material Hauled</div>,
    cell: ({ row }) => {
      const materials = row.original.Materials;
      return (
        <div className="text-xs text-center">
          {Array.isArray(materials) && materials.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer underline text-blue-600">
                  {materials.length}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="p-2 w-[300px]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          Name
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          Location
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          Qty
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          Unit
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((mat: MaterialItem, rowIdx: number) => (
                        <TableRow
                          key={mat.id}
                          className={
                            rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100"
                          }
                        >
                          <TableCell className="px-2 py-1 border-b">
                            {mat.name}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {mat.location}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {mat.quantity}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {mat.unit}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    id: "fuel",
    header: () => <div className="text-center">Refuel Details</div>,
    cell: ({ row }) => {
      const fuel = row.original.Fuel;
      return (
        <div className="text-xs text-center">
          {Array.isArray(fuel) && fuel.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer underline text-blue-600">
                  {fuel.length}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="p-2">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          Miles At Fueling
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          Gallons Refueled
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fuel.map((f: FuelItem, idx: number) => (
                        <TableRow
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}
                        >
                          <TableCell className="px-2 py-1 border-b">
                            {f.milesAtFueling}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {f.gallonsRefueled}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    id: "stateMileages",
    header: () => <div className="text-center">State Line Details</div>,
    cell: ({ row }) => {
      const stateMileages = row.original.StateMileages;
      return (
        <div className="text-xs text-center">
          {Array.isArray(stateMileages) && stateMileages.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="cursor-pointer underline text-blue-600">
                  {stateMileages.length}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="p-2">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          State
                        </TableHead>
                        <TableHead className="text-sm text-center border-r border-gray-200 bg-gray-100">
                          State Line Mileage
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stateMileages.map((s: StateMileageItem, idx: number) => (
                        <TableRow
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}
                        >
                          <TableCell className="px-2 py-1 border-b">
                            {s.state}
                          </TableCell>
                          <TableCell className="px-2 py-1 border-b">
                            {s.stateLineMileage}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            "-"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: () => <div className="text-center">Notes</div>,
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | undefined;
      return <div className="text-xs text-center">{notes || "-"}</div>;
    },
  },
];
