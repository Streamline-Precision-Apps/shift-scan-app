"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "../../types";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction } from "react";

interface NumberFieldOptionsProps {
  field: FormField;
  updateField: (fieldId: string, updatedProperties: Partial<FormField>) => void;
  validationErrors: Record<string, { minError?: string; maxError?: string }>;
  setValidationErrors: Dispatch<
    SetStateAction<
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

export const NumberFieldOptions: React.FC<NumberFieldOptionsProps> = ({
  field,
  updateField,
  validationErrors,
  setValidationErrors,
}) => {
  return (
    <div>
      <div className="flex flex-col gap-2 pb-2">
        <p className="text-sm font-semibold ">
          Number Range
          <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg ml-1 text-xs">
            Optional
          </span>
        </p>
        <p className="text-xs text-gray-500">
          Specify the maximum number a user can enter for this field.
        </p>
      </div>

      <div className="flex flex-row gap-2 p-2">
        {/* Min value is implicitly set to 0 */}
        <div className="flex flex-col w-full">
          <Label className="text-xs">Max Value</Label>
          <Input
            type="number"
            value={field.maxLength || ""}
            onChange={(e) => {
              const value = e.target.value
                ? parseInt(e.target.value)
                : undefined;
              const errors = {
                ...(validationErrors[field.id] || {}),
              };

              // Clear existing error
              delete errors.maxError;

              if (value !== undefined && value < 0) {
                errors.maxError = "Cannot be negative";
              } else {
                // Always set minLength to 0 when updating maxLength
                updateField(field.id, {
                  minLength: 0,
                  maxLength: value,
                });
              }

              setValidationErrors({
                ...validationErrors,
                [field.id]: errors,
              });
            }}
            min={0}
            className={`mt-1 bg-white rounded-lg text-xs w-fit ${
              validationErrors[field.id]?.maxError ? "border-red-500" : ""
            }`}
            placeholder="Enter max value"
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
