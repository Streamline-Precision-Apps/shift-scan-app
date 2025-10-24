"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { SelectHTMLAttributes, FC, ChangeEventHandler } from "react";
import { cn } from "@/components/(reusable)/utils";

const SelectsVariants = cva("text-lg ", {
  variants: {
    variant: {
      default:
        "border border-[3px] rounded-[10px] border-black disabled:bg-app-gray mb-3 last:mb-0 w-full p-1",
      validationMessage:
        "border border-[3px] rounded-[10px] border-black disabled:bg-app-gray w-full p-1",
      NoPadding: "disabled:bg-app-gray w-full ",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface SelectsProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof SelectsVariants> {
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  data?: string[];
}

const Selects: FC<SelectsProps> = ({
  className,
  variant,
  onChange,
  data,
  ...props
}) => {
  if (data) {
    return (
      <select
        className={cn(SelectsVariants({ variant, className }))}
        onChange={onChange}
        {...props}
      >
        {data.map((item: string) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    );
  }
  return (
    <select
      className={cn(SelectsVariants({ variant, className }))}
      onChange={onChange}
      {...props}
    >
      {props.children}
    </select>
  );
};

export { Selects, SelectsVariants };
