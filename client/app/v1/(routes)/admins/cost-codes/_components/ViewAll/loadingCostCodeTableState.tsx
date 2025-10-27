import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef } from "@tanstack/react-table";
import { CostCodeSummary } from "../useCostCodeData";

type Props = {
  columnCount: number;
};

export default function LoadingCostCodeTableState({ columnCount }: Props) {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <TableRow
          key={`loading-row-${index}`}
          className="odd:bg-white even:bg-gray-100 border-r border-gray-200 text-xs text-center py-2"
        >
          {/* Create skeleton cells for each column */}
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <TableCell
              key={`loading-cell-${colIndex}`}
              className="whitespace-nowrap border-r border-gray-200 text-xs text-center"
            >
              <Skeleton className="h-4 w-16 mx-auto" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}