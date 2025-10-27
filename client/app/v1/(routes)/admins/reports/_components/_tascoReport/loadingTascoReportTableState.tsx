import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { tascoReportColumns } from "./tascoReportTableColumns";

type Props = {
  columns: typeof tascoReportColumns;
};

export default function LoadingTascoReportTableState({ columns }: Props) {
  return (
    <>
      {Array.from({ length: 20 }).map((_, index) => (
        <TableRow
          key={`loading-row-${index}`}
          className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
        >
          {/* Create skeleton cells for each column */}
          {columns.map((col, colIndex) => (
            <TableCell
              key={`loading-cell-${colIndex}`}
              className="text-center border-r border-gray-200"
            >
              <Skeleton className="h-4 w-16 mx-auto" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
