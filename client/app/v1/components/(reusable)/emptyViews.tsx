import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import { Images } from "./images";
import { Grids } from "./grids";

const EmptyViewsVariants = cva(
  " h-full w-full relative rounded-[10px] ", //this applies to all variants
  {
    variants: {
      size: {
        default: "h-full w-full",
      },
      topChildPosition: {
        default: "",
      },
      logoPosition: {
        default: "row-start-2 row-end-3 justify-center items-center",
        center: "row-start-2 row-end-3 justify-center items-center",
        top: "row-start-1 row-end-2 justify-center items-center",
        bottom: "row-start-3 row-end-4 justify-center items-center",
      },
      logoSize: {
        default: "mx-auto px-4",
        xs: "mx-auto px-[30%]",
        sm: "mx-auto px-[25%]",
        med: "mx-auto px-[20%]",
        lg: "mx-auto px-[15%]",
        full: "mx-auto px-[10%]",
      },

      background: {
        default: "bg-app-gray",
        none: "bg-none",
        white: "bg-white",
      },
    },
    defaultVariants: {
      background: "default",
      logoSize: "default",
      size: "default",
    },
  }
);

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface EmptyViewsProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof EmptyViewsVariants> {
  TopChild?: React.ReactNode;
  BottomChild?: React.ReactNode;
}

const EmptyViews: FC<EmptyViewsProps> = ({
  className,
  size,
  background,
  logoPosition,
  logoSize,
  TopChild,
  topChildPosition,
  BottomChild,
  ...props
}) => {
  return (
    <div
      className={cn(EmptyViewsVariants({ size, className, background }))}
      {...props}
    >
      <Grids rows={"3"} className="h-full w-full">
        {TopChild}
        <div className={cn(EmptyViewsVariants({ logoPosition, background }))}>
          <img
            src={"/shiftscanlogoHorizontal.svg"}
            alt="personnel"
            className={cn(EmptyViewsVariants({ logoSize, background }))}
          />
        </div>
        <div className="row-span-1 h-full w-full">{BottomChild}</div>
      </Grids>
    </div>
  );
};

export { EmptyViews, EmptyViewsVariants };
