"use client";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, FC } from "react";
import { cn } from "@/components/(reusable)/utils";
import { min } from "date-fns";

// this extends the capability of HTMLAttributes or the VariantProps that it can hold, specify your props here
interface EditableFieldsProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof EditableFieldsVariants> {
  value: string;
  type?: string;
  checked?: boolean;
  disable?: boolean;
  placeholder?: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  isChanged: boolean;
  onRevert?: () => void;
  iconSrc?: string;
  iconAlt?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  name?: string;
  readonly?: boolean;
  formDatatype?: "input" | "select" | "textarea";
  options?: { label: string; value: string }[]; // Added options prop for select type
  rows?: number; // Added rows prop for textarea
}

const EditableFieldsVariants = cva(
  "flex items-start rounded-[10px] overflow-hidden", // Changed items-center to items-start for textarea compatibility
  {
    variants: {
      variant: {
        default: "border-black  border-[3px]",
        danger: "border-red-500  border-[3px]",
        success: "border-green-500  border-[3px]",
        edited: "border-app-orange  border-[3px]",
        noFrames: "border-none rounded-none",
      },
      size: {
        default: "min-h-10 text-base", // Changed h-10 to min-h-10 for textarea
        sm: "min-h-8 text-xs", // Changed h-8 to min-h-8 for textarea
        lg: "min-h-12 text-lg", // Changed h-12 to min-h-12 for textarea
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const EditableFields: FC<EditableFieldsProps> = ({
  className = "",
  variant,
  size,
  value,
  checked,
  disable = false,
  type = "text",
  onChange,
  isChanged,
  placeholder,
  onRevert,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  iconSrc = "/arrowBack.svg",
  iconAlt = "revert",
  name,
  readonly = false, // Added readonly prop
  formDatatype = "input", // Added formDatatype prop
  options = [], // Added options prop for select type
  rows = 3, // Added rows prop for textarea
}) => {
  if (formDatatype === "input") {
    if (type === "number") {
      return (
        <div
          className={cn(
            EditableFieldsVariants({ variant, size, className }),
            "w-full",
          )}
        >
          {/* Input container with flex-1 to take available space */}
          <div className="flex-1 h-full">
            <input
              type={type}
              value={value}
              name={name}
              disabled={disable}
              checked={checked}
              onChange={onChange}
              placeholder={placeholder || ""}
              className="h-full w-full border-none focus:outline-hidden px-3 bg-transparent disabled:bg-app-gray text-sm"
              max={max}
              min={min}
              readOnly={readonly}
            />
          </div>

          {/* Revert button - only appears when needed */}
          {isChanged && onRevert && (
            <button
              type="button"
              className="w-10 h-full shrink-0 flex items-center justify-center   transition-colors"
              title="Revert changes"
              onClick={onRevert}
            >
              {/* eslint-disable-next-line @next/next/no-img-element*/}
              <img src={iconSrc} alt={iconAlt} className="w-5 h-5" />
            </button>
          )}
        </div>
      );
    } else {
      return (
        <div
          className={cn(
            EditableFieldsVariants({ variant, size, className }),
            "w-full",
          )}
        >
          {/* Input container with flex-1 to take available space */}
          <div className="flex-1 h-full">
            <input
              type={type}
              value={value}
              name={name}
              disabled={disable}
              checked={checked}
              onChange={onChange}
              placeholder={placeholder || ""}
              className="text-sm h-full w-full border-none focus:outline-hidden px-3 bg-transparent disabled:bg-app-gray"
              minLength={minLength}
              maxLength={maxLength}
              pattern={pattern}
              readOnly={readonly}
            />
          </div>

          {/* Revert button - only appears when needed */}
          {isChanged && onRevert && (
            <button
              type="button"
              className="w-10 h-full shrink-0 flex items-center justify-center   transition-colors"
              title="Revert changes"
              onClick={onRevert}
            >
              {/* eslint-disable-next-line @next/next/no-img-element*/}
              <img src={iconSrc} alt={iconAlt} className="w-5 h-5" />
            </button>
          )}
        </div>
      );
    }
  }

  if (formDatatype === "textarea") {
    return (
      <div
        className={cn(
          EditableFieldsVariants({ variant, size, className }),
          "w-full",
        )}
      >
        {/* Textarea container with flex-1 to take available space */}
        <div className="flex-1 min-h-full">
          <textarea
            value={value}
            name={name}
            disabled={disable}
            onChange={onChange}
            placeholder={placeholder || ""}
            className="text-sm h-full w-full min-h-[100px] border-none focus:outline-hidden px-3 py-2 bg-transparent disabled:bg-app-gray resize-none"
            readOnly={readonly}
            rows={rows}
          />
        </div>

        {/* Revert button - only appears when needed */}
        {isChanged && onRevert && (
          <button
            type="button"
            className="w-10 shrink-0 flex items-start justify-center pt-2 transition-colors"
            title="Revert changes"
            onClick={onRevert}
          >
            {/* eslint-disable-next-line @next/next/no-img-element*/}
            <img src={iconSrc} alt={iconAlt} className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  if (formDatatype === "select") {
    return (
      <div
        className={cn(
          EditableFieldsVariants({ variant, size, className }),
          "w-full",
        )}
      >
        {/* Select container with flex-1 to take available space */}
        <div className="flex-1 h-full">
          <select
            value={value}
            name={name}
            disabled={disable}
            onChange={onChange}
            className="h-full text-sm w-full border-none focus:outline-hidden px-3 bg-transparent disabled:bg-app-gray"
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Revert button - only appears when needed */}
        {isChanged && onRevert && (
          <button
            type="button"
            className="w-10 h-full shrink-0 flex items-center justify-center   transition-colors"
            title="Revert changes"
            onClick={onRevert}
          >
            {/* eslint-disable-next-line @next/next/no-img-element*/}
            <img src={iconSrc} alt={iconAlt} className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
};

export { EditableFields, EditableFieldsVariants };
