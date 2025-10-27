"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { FormField } from "../../types";

interface RadioFieldOptionsProps {
  field: FormField;
  updateField: (fieldId: string, updatedProperties: Partial<FormField>) => void;
}

export const RadioFieldOptions: React.FC<RadioFieldOptionsProps> = ({
  field,
  updateField,
}) => {
  const addOption = () => {
    const newOptions = [
      ...(field.Options || []),
      { id: `opt_${Date.now()}`, value: "" },
    ];
    updateField(field.id, { Options: newOptions });
  };

  const updateOption = (optionId: string, value: string) => {
    const updatedOptions = (field.Options || []).map((option) =>
      option.id === optionId ? { ...option, value } : option,
    );
    updateField(field.id, { Options: updatedOptions });
  };

  const removeOption = (optionId: string) => {
    const updatedOptions = (field.Options || []).filter(
      (option) => option.id !== optionId,
    );
    updateField(field.id, { Options: updatedOptions });
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2 pb-2">
          <p className="text-sm font-semibold ">
            Radio Options
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-lg ml-1 text-xs">
              Required
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Add options to your Radio list. You must include at least two
            options.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const newOptions = [
              ...(field.Options || []).filter(
                (
                  opt,
                ): opt is {
                  id: string;
                  value: string;
                } => typeof opt !== "string",
              ),
              {
                id: Date.now().toString(),
                value: "",
              },
            ];
            updateField(field.id, {
              Options: newOptions,
            });
          }}
          className="w-fit bg-green-200 hover:bg-green-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Option
        </Button>
      </div>
      <div className="space-y-2 mt-2">
        {(field.Options || [])
          .filter(
            (
              opt,
            ): opt is {
              id: string;
              value: string;
            } => typeof opt !== "string",
          )
          .map((option, optionIndex) => (
            <div key={option.id || optionIndex} className="flex gap-2">
              <div className="flex items-center">
                <p>{optionIndex + 1}. </p>
              </div>
              <Input
                value={option.value}
                onChange={(e) => {
                  const newOptions = (field.Options || [])
                    .filter(
                      (
                        opt,
                      ): opt is {
                        id: string;
                        value: string;
                      } => typeof opt !== "string",
                    )
                    .map((opt, idx) =>
                      idx === optionIndex
                        ? {
                            ...opt,
                            value: e.target.value,
                          }
                        : opt,
                    );
                  updateField(field.id, {
                    Options: newOptions,
                  });
                }}
                className="bg-white rounded-lg text-xs"
                placeholder={`Option ${optionIndex + 1}`}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newOptions = (field.Options || [])
                    .filter(
                      (
                        opt,
                      ): opt is {
                        id: string;
                        value: string;
                      } => typeof opt !== "string",
                    )
                    .filter((_, i) => i !== optionIndex);
                  updateField(field.id, {
                    Options: newOptions,
                  });
                }}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
};
