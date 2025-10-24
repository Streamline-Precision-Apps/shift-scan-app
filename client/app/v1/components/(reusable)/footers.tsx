"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import { Texts } from "./texts";

const FooterVariants = cva(
  "flex items-center justify-center", //this applies to all variants
  {
    variants: {
      variant: {
        default: "flex-row bg-none",
        relative: "relative bg-none",
      },
      size: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface FooterProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof FooterVariants> {}

const Footers: FC<FooterProps> = ({ className, variant, size, ...props }) => {
  return (
    <div
      className={cn(FooterVariants({ variant, size, className }))}
      {...props}
    >
      <Texts text={"white"} size={"p4"}>
        {Array.isArray(props.children) ? props.children : [props.children]}
      </Texts>
    </div>
  );
};

export { Footers, FooterVariants };
