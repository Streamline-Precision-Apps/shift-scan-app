"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

export default function RenderTimeField({
  field,
  value,
  handleFieldChange,
  handleFieldTouch,
  touchedFields,
  error,
}: {
  field: {
    id: string;
    label: string;
    required: boolean;
  };
  value: string;
  handleFieldChange: (id: string, value: string) => void;
  handleFieldTouch: (id: string) => void;
  touchedFields: Record<string, boolean>;
  error: string | null;
}) {
  return (
    <div key={field.id} className="flex flex-col">
      <Label htmlFor={field.id} className="text-sm font-medium mb-1">
        {field.label}{" "}
        {field.required && <span className="text-red-500">*</span>}
      </Label>

      <Input
        type="time"
        id={field.id}
        value={value ? value : ""}
        placeholder="Select time"
        className={`w-full border rounded px-2 py-1 cursor-pointer bg-white appearance-none  ${
          error && touchedFields[field.id] ? "border-red-500" : ""
        }`}
        onChange={(e) => handleFieldChange(field.id, e.target.value)}
        onBlur={() => handleFieldTouch(field.id)}
        required={field.required}
      />

      {error && touchedFields[field.id] && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}
