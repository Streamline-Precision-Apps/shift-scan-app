import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/app/lib/utils/utils";

const GridVariants = cva(
  "grid h-full", //this applies to all variants
  {
    variants: {
      cols: {
        "1": "grid-cols-1",
        "2": "grid-cols-2",
        "3": "grid-cols-3",
        "4": "grid-cols-4",
        "5": "grid-cols-5",
        "6": "grid-cols-6",
        "7": "grid-cols-7",
        "8": "grid-cols-8",
        "9": "grid-cols-9",
        "10": "grid-cols-10",
        "11": "grid-cols-11",
        "12": "grid-cols-12",
        "13": "grid-cols-13",
        "14": "grid-cols-14",
        "15": "grid-cols-15",
      },
      rows: {
        "1": "grid-rows-1",
        "2": "grid-rows-2",
        "3": "grid-rows-3",
        "4": "grid-rows-4",
        "5": "grid-rows-5",
        "6": "grid-rows-6",
        "7": "grid-rows-7",
        "8": "grid-rows-8",
        "9": "grid-rows-9",
        "10": "grid-rows-10",
        "11": "grid-rows-11",
        "12": "grid-rows-12",
      },
      gap: {
        "0": "gap-0",
        "1": "gap-1",
        "2": "gap-2",
        "3": "gap-3",
        "4": "gap-4",
        "5": "gap-5",
        "6": "gap-6",
      },
    },
    defaultVariants: {
      cols: "1",
      rows: "1",
      gap: "0",
    },
  }
);

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface GridProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof GridVariants> {}

const Grids: FC<GridProps> = ({ className, cols, rows, gap, ...props }) => {
  return (
    <div
      className={cn(GridVariants({ cols, rows, gap, className }))}
      {...props}
    />
  );
};

export { Grids, GridVariants };
