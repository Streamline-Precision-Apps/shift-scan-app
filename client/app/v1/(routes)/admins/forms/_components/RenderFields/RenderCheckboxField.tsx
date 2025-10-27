"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";

export default function RenderCheckboxField({
  field,
  value,
  handleFieldChange,
  handleFieldTouch,
  touchedFields,
  error,
  disabled,
  useNativeInput = false,
}: {
  field: {
    id: string;
    label: string;
    required: boolean;
  };
  value: string | boolean;
  handleFieldChange: (id: string, value: string | boolean) => void;
  handleFieldTouch: (id: string) => void;
  touchedFields: Record<string, boolean>;
  error: string | null;
  disabled?: boolean;
  useNativeInput?: boolean;
}) {
  useEffect(() => {
    console.log("RenderCheckboxField value changed in checkbox field:", value);
  }, [value]);
  return (
    <div key={field.id} className="flex flex-col">
      <div className="flex flex-row items-center gap-2">
        <Checkbox
          checked={!!value}
          onCheckedChange={(checked) => {
            handleFieldChange(field.id, checked);
            console.log("Checkbox checked Change:", field.id, checked);
          }}
          id={`checkbox-${field.id}`}
          onBlur={() => handleFieldTouch(field.id)}
          disabled={disabled}
          className={`${useNativeInput ? "w-8 h-8 data-[state=checked]:bg-green-500" : "h-4 w-4"} `}
        />
        <Label
          className={`${useNativeInput ? "text-base" : "text-sm font-medium"} `}
          htmlFor={`checkbox-${field.id}`}
        >
          {field.label}
        </Label>
      </div>
      {error && touchedFields[field.id] && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
