"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { TextareaHTMLAttributes, FC, ChangeEventHandler } from "react";
import { cn } from "@/components/(reusable)/utils";

const TextAreaVariants = cva(
  "items-center justify-center text-black text-lg rounded-xl ", //this applies to all variants
  {
    variants: {
      variant: {
        default:
          "bg-white border border-[3px] border-black disabled:bg-app-gray mb-3 last:mb-0 w-full p-3",
        validationMessage:
          "bg-white border border-[3px] border-black disabled:bg-app-gray w-full p-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof TextAreaVariants> {
  state?: string;
  data?: string | number | readonly string[];
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

const TextAreas: FC<TextAreaProps> = ({
  className,
  variant,
  state,
  data,
  placeholder,
  ...props
}) => {
  if (state === "disabled") {
    return (
      <textarea
        className={cn(TextAreaVariants({ variant, className }))}
        {...props}
        disabled
        value={data}
      />
    );
  } else {
    return (
      <>
        <textarea
          className={cn(TextAreaVariants({ variant, className }))}
          {...props}
          placeholder={placeholder}
        />
      </>
    );
  }
};

export { TextAreas, TextAreaVariants };
