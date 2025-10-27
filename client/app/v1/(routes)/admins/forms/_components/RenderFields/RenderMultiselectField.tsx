"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function RenderMultiselectField({
  field,
  value,
  handleFieldChange,
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
  value: string | string[];
  handleFieldChange: (id: string, value: string | string[]) => void;
  handleFieldTouch: (id: string) => void;
  touchedFields: Record<string, boolean>;
  error: string | null;
  disabled?: boolean;
  useNativeInput?: boolean;
}) {
  const arrayValue = Array.isArray(value) ? value : [];
  
  return (
    <div key={field.id} className="flex flex-col">
      <Label className="text-sm font-medium mb-1">
        {field.label}{" "}
        {field.required && <span className="text-red-500">*</span>}
      </Label>
      
      {useNativeInput ? (
        // Native multiselect element
        <select
          multiple
          value={arrayValue}
          onChange={(e) => {
            const selectedOptions = Array.from(
              e.target.selectedOptions,
              option => option.value
            );
            handleFieldChange(field.id, selectedOptions);
          }}
          disabled={disabled}
          className={`w-full border rounded px-2 py-2 bg-white min-h-[100px] ${
            error ? "border-red-500" : "border-input"
          }`}
          size={Math.min(options.length, 5)}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {opt.value}
            </option>
          ))}
        </select>
      ) : (
        // Custom checkbox multiselect
        <div className="flex flex-col gap-1 border rounded px-2 py-2 bg-white">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <Checkbox
                checked={arrayValue.includes(opt.value)}
                onCheckedChange={(checked) => {
                  const updatedValue = checked
                    ? [...arrayValue, opt.value]
                    : arrayValue.filter((v) => v !== opt.value);
                  handleFieldChange(field.id, updatedValue);
                }}
                id={`${field.id}-${opt.id}`}
                disabled={disabled}
              />
              <span>{opt.value}</span>
            </label>
          ))}
        </div>
      )}
      
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
