import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";

//This component determines the size aloted to a certain item. Focusing on width.
//Counterpart to Holds.
const HoldVariants = cva(
  "", //this applies to all variants
  {
    variants: {
      background: {
        //only variant attributes
        none: "bg-none",
        white: "bg-white rounded-xl",
        offWhite: "bg-neutral-200 rounded-xl",
        red: "bg-app-red rounded-xl border border-app-red border-8",
        green: "bg-app-green rounded-xl border border-app-green border-8",
        orange: "bg-app-orange rounded-xl border border-app-orange border-8",
        darkBlue:
          "bg-app-dark-blue rounded-xl border border-app-dark-blue border-8",
        lightBlue: "bg-app-blue rounded-xl border border-app-blue border-8",
        darkGray:
          "bg-app-dark-gray rounded-xl border border-app-dark-gray border-8",
        gray: "bg-[#AFB6C4] rounded-xl border border-[#AFB6C4] border-8",
        lightGray: "bg-app-gray rounded-xl border border-app-gray border-8",
        timeCardYellow: "bg-[#EBC68E] ",
        adminBlue: "bg-linear-to-b from-[#21355C]/60 to-[#4670C2]/60 ",
      },
      position: {
        //only position attributes
        row: "flex flex-row items-center",
        center: "flex flex-col self-center content-center",
        left: "flex flex-col self-start",
        right: "flex flex-col self-end ",
        absolute: "absolute top-0 left-0",
        test: "",
      },
      size: {
        //only width and height
        full: "w-full",
        "90": "w-[90%]",
        "80": "w-[80%]",
        "70": "w-[70%]",
        "60": "w-[60%]",
        "50": "w-[50%]",
        "40": "w-[40%]",
        "30": "w-[30%]",
        "20": "w-[20%]",
        "10": "w-[10%]",
      },
    },
    defaultVariants: {
      background: "none",
      position: "center",
      size: "full",
    },
  }
);

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface HoldProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof HoldVariants> {}

const Holds: FC<HoldProps> = ({
  className,
  background,
  position,
  size,
  ...props
}) => {
  return (
    <div
      className={cn(HoldVariants({ background, position, size, className }))}
      {...props}
    />
  );
};

export { Holds, HoldVariants };
