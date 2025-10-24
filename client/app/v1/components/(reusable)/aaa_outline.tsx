//This file is for creating new reusable components, copy this
//code and paste it into your new component for a starting point
//Ctrl F and find "xxxxx" and replace it with your component name

import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";

const xxxxxVariants = cva(
  "", //this applies to all variants
  {
    variants: {
      variant: {
        default: "bg-blue-500",
      },
      size: {
        default: "p-10",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface xxxxxProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof xxxxxVariants> {
}

const xxxxx: FC<xxxxxProps> = ({className, variant, size, ...props}) => {
    return (
      <div className={cn(xxxxxVariants({variant, size, className}))} {...props}/>
    )
}

export {xxxxx, xxxxxVariants}



