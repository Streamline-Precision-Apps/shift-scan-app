"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "../../types";
import { Label } from "@/components/ui/label";

interface TextareaFieldOptionsProps {
  field: FormField;
  updateField: (fieldId: string, updatedProperties: Partial<FormField>) => void;
  validationErrors?: Record<string, { minError?: string; maxError?: string }>;
  setValidationErrors?: React.Dispatch<
    React.SetStateAction<
      Record<
        string,
        {
          minError?: string;
          maxError?: string;
        }
      >
    >
  >;
}

export const TextareaFieldOptions: React.FC<TextareaFieldOptionsProps> = ({
  field,
  updateField,
  validationErrors = {},
  setValidationErrors,
}) => {
  return (
    <div>
      <div className="flex flex-col gap-2 pb-2">
        <p className="text-sm font-semibold ">
          Character Limits
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg ml-1 text-xs">
            Optional
          </span>
        </p>
        <p className="text-xs text-gray-500">
          Specify the maximum number of characters for this field.
        </p>
      </div>
      <div className="flex flex-row mt-2 gap-2">
        <div className="flex flex-col w-full">
          <Label className="text-xs font-normal">Max Length</Label>
          <Input
            type="number"
            value={field.maxLength || ""}
            onChange={(e) => {
              const value = e.target.value
                ? parseInt(e.target.value)
                : undefined;

              if (setValidationErrors) {
                const errors = {
                  ...(validationErrors[field.id] || {}),
                };
                delete errors.maxError;

                if (value !== undefined && value < 0) {
                  errors.maxError = "Cannot be negative";
                  setValidationErrors({
                    ...validationErrors,
                    [field.id]: errors,
                  });
                  return;
                }

                setValidationErrors({
                  ...validationErrors,
                  [field.id]: errors,
                });
              }

              // Always set minLength to 0 when updating maxLength
              updateField(field.id, {
                minLength: 0,
                maxLength: value,
              });
            }}
            min={0}
            className={`bg-white rounded-lg text-xs w-full ${
              validationErrors[field.id]?.maxError ? "border-red-500" : ""
            }`}
            placeholder="Enter max length"
          />

          {validationErrors[field.id]?.maxError && (
            <p className="text-xs text-red-500 mt-1">
              {validationErrors[field.id]?.maxError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
