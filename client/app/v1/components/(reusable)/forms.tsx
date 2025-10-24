"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { FormHTMLAttributes, FC, useRef } from "react";
import { cn } from "@/components/(reusable)/utils";

//This determines styles of all forms
const FormVariants = cva(
  "", //this applies to all variants
  {
    variants: {
      background: {
        //only background attributes
        none: "bg-none",
        white: "bg-white rounded-2xl border border-white border-8",
      },
      position: {
        //only position attributes
        center: "self-center",
        left: "self-start",
        right: "self-end",
      },
      size: {
        //only width and height
        full: "w-full",
        half: "w-[50%]",
      },
    },
    defaultVariants: {
      background: "none",
      position: "center",
      size: "full",
    },
  }
);

interface FormProps
  extends FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof FormVariants> {
  ref?: React.RefObject<HTMLFormElement>;
}

const Forms: FC<FormProps> = ({
  className,
  background,
  position,
  size,

  ...props
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className={cn(FormVariants({ background, position, size, className }))}
      {...props}
    />
  );
};

export { Forms, FormVariants };
