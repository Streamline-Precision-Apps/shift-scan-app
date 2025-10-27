import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { personnelTableColumns } from "./personnelTableColumns";

type Props = {
  columns: typeof personnelTableColumns;
};


export default function LoadingPersonnelTableState({ columns }: Props) {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow
          key={`loading-row-${index}`}
                  className="odd:bg-white even:bg-gray-100 border-r border-gray-200 text-xs text-center py-2"
                  >
                    {/* User cell skeleton (matches new layout) */}
                    <TableCell className="border-r border-gray-200 text-xs text-center">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="ml-2">
                          <Skeleton className="h-4 w-4 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    {/* Create other skeleton cells for each column */}
                    {Array.from({ length: columns.length - 1 }).map(
                      (_, colIndex) => (
                        <TableCell
                        key={`loading-cell-${colIndex}`}
                        className="whitespace-nowrap border-r border-gray-200 text-xs text-center"
                        >
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                ))}
              </>                    // Skeleton loading state with customized widths
  );
  }