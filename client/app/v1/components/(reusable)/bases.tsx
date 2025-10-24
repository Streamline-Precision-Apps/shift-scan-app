import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";

const BaseVariants = cva("h-full w-full", {
  variants: {
    background: {
      // Only background attributes
      default: "bg-linear-to-b from-app-dark-blue to-app-blue ",
      modal: "bg-neutral-800 bg-opacity-80", // Will create the gray background for modals
    },
    position: {
      // Only position attributes
      center: "",
      start: "fixed top-0 left-0", // Use for modals
      fixed: "fixed top-0 left-0", // Fixed position for the whole page
    },
    size: {
      // Only width and height
      default: "pb-7 pt-3 h-dvh", // Use if data fits on screen //before pt-7 pb-3
      scroll: "pb-7 pt-3 h-full no-scrollbar overflow-y-auto", // Use if data exceeds screen size
      screen: "h-screen w-screen", // Use for modals
      noScroll: "pb-7 pt-3 h-full", // Ensure no scrolling behavior for fixed elements
      admin: "h-screen w-screen ", // Use for admin pages
    },
  },
  defaultVariants: {
    background: "default",
    position: "center", // You can change this if you want fixed by default
    size: "default", // Use default size unless you need full screen
  },
});

interface BaseProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof BaseVariants> {}

const Bases: FC<BaseProps> = ({
  className,
  background,
  position,
  size,
  ...props
}) => {
  return (
    <div
      className={cn(BaseVariants({ background, position, size, className }))}
      {...props}
    />
  );
};

export { Bases, BaseVariants };
