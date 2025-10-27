"use client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RenderRadioField({
  field,
  value,
  handleFieldChange,
  handleFieldTouch,
  touchedFields,
  error,
  options,
  disabled,
  useNativeInput = false,
}: {
  field: {
    id: string;
    label: string;
    required: boolean;
  };
  options: {
    id: string;
    value: string;
  }[];
  value: string;
  handleFieldChange: (id: string, value: string) => void;
  handleFieldTouch: (id: string) => void;
  touchedFields: Record<string, boolean>;
  error: string | null;
  disabled?: boolean;
  useNativeInput?: boolean;
}) {
  return (
    <div key={field.id} className="flex flex-col">
      <Label className="text-sm font-medium mb-1">
        {field.label}{" "}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => handleFieldChange(field.id, val)}
        onBlur={() => handleFieldTouch(field.id)}
        className="flex flex-col gap-4 py-2"
        disabled={disabled}
      >
        {options.map((opt) => (
          <Label
            key={opt.id}
            className="flex items-start gap-3 cursor-pointer border border-gray-200 rounded-md px-4 py-2 select-none"
          >
            <RadioGroupItem
              value={opt.value}
              className={`${useNativeInput ? "w-4 h-4   " : "h-4 w-4"} `}
              id={`${field.id}-radio-${opt.id}`}
            />

            <span
              className={`${useNativeInput ? "text-sm max-w-[200px] break-words" : "text-sm font-medium"} `}
            >
              {opt.value}
            </span>
          </Label>
        ))}
      </RadioGroup>
      {error && touchedFields[field.id] && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
