"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fieldTypes, FormField } from "../types";
import { Button } from "@/components/ui/button";
import { o } from "framer-motion/dist/types.d-Cjd591yU";

interface FieldTypePopoverProps {
  fieldId: string;
  fieldType: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  updateField: (fieldId: string, updatedProperties: Partial<FormField>) => void;
}

export const FieldTypePopover: React.FC<FieldTypePopoverProps> = ({
  fieldId,
  fieldType,
  isOpen,
  onOpenChange,
  updateField,
}) => {
  // Find the current field type from the fieldTypes array
  const currentFieldType = fieldTypes.find(
    (type) => type.name === fieldType,
  ) || {
    name: "",
    label: "Select Type",
    icon: "/form.svg",
    color: "bg-gray-300",
    hover: "hover:bg-gray-200",
  };

  return (
    <div className="w-fit h-full">
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            onClick={() => onOpenChange(!isOpen)}
            variant="ghost"
            className={`w-fit h-full border border-slate-200 justify-center items-center rounded-md gap-0 ${
              currentFieldType?.color || "bg-white"
            } ${currentFieldType?.hover || "hover:bg-white"}`}
          >
            <img
              src={currentFieldType?.icon || "/default-icon.svg"}
              alt={currentFieldType?.label}
              className="w-4 h-4 "
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={9}
          className="min-w-[1000px] h-[25vh] overflow-y-auto p-4 gap-2 bg-white rounded-lg shadow-lg"
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">Select Field Type</p>
            <div className="w-full grid grid-cols-4 gap-2">
              {[...fieldTypes]
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((fieldType) => (
                  <button
                    key={fieldType.name}
                    type="button"
                    className={`flex items-center w-full px-2 py-2 rounded hover:bg-gray-100 gap-2 ${
                      currentFieldType.name === fieldType.name
                        ? "ring-2 ring-slate-100"
                        : ""
                    }`}
                    onClick={() => {
                      updateField(fieldId, {
                        type: fieldType.name,
                        maxLength: undefined,
                      });
                      onOpenChange(false);
                    }}
                  >
                    <div
                      className={`w-6 h-6 flex justify-center items-center rounded-sm ${fieldType.color}`}
                    >
                      <img
                        src={fieldType.icon}
                        alt={fieldType.label}
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium">
                        {fieldType.label}
                      </span>
                      <span className="text-xs text-gray-400 ">
                        {fieldType.description}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
