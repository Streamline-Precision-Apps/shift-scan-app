"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { InputHTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import React from "react";
import { Anton } from "next/font/google";
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
});
//this determines styles of all inputs
const InputVariants = cva(
  "items-center justify-center text-black text-lg rounded-[10px]", //this applies to all variants
  {
    variants: {
      variant: {
        noBorder: "border-black disabled:bg-app-gray mb-1 last:mb-0 w-full p-1",
        default:
          "border border-[3px] border-black disabled:bg-app-gray mb-1 last:mb-0 w-full p-1",
        white: "border border-2 border-black mb-3 last:mb-0 w-full p-1",
        titleFont: `border border-2 border-black mb-3 last:mb-0 w-full p-1 ${anton.className}`,
        matchSelects: `border border-[3px] border-black disabled:bg-app-gray mb-3 last:mb-0 w-full p-1`,
        transparent:
          "border border-[3px] border-black disabled:bg-app-gray mb-3 last:mb-0 w-full p-1 bg-transparent",
        empty: "",
        validationMessage:
          "bg-white border border-[3px] border-black disabled:bg-app-gray last:mb-0 w-full p-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof InputVariants> {
  state?: string;
  data?: string | number | readonly string[] | undefined;
  background?: "orange" | "white" | "transparent" | null;
}

const Inputs: FC<InputProps> = ({
  className,
  variant,
  state,
  data,
  background,
  ...props
}) => {
  // Create a style object based on the background prop
  const backgroundStyle = background
    ? {
        backgroundColor:
          background === "orange"
            ? "#fb923c" // orange-400 equivalent
            : background === "white"
              ? "#ffffff"
              : background === "transparent"
                ? "transparent"
                : undefined,
      }
    : undefined;

  if (state === "disabled") {
    return (
      <input
        className={cn(InputVariants({ variant, className }))}
        style={backgroundStyle}
        {...props}
        disabled
        value={data}
      />
    );
  } else {
    return (
      <>
        <input
          className={cn(InputVariants({ variant, className }))}
          style={backgroundStyle}
          {...props}
        />
      </>
    );
  }
};

export { Inputs, InputVariants };
