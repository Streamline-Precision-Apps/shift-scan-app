"use client";
import { SingleCombobox } from "@/components/ui/single-combobox";
import { Label } from "@/components/ui/label";
import type { ComboboxOption } from "@/components/ui/single-combobox";
export interface Fields {
  id: string;
  formGroupingId: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  placeholder?: string | null;
  minLength?: number | null;
  maxLength?: number | null;
  multiple: boolean | null;
  content?: string | null;
  filter?: string | null;
  Options?: FieldOption[];
}

interface FieldOption {
  id: string;
  fieldId: string;
  value: string;
}

// Define a Person interface to replace any type
interface Person {
  id: string;
  name: string;
}
export default function RenderSearchPersonField({
  field,
  value,
  handleFieldChange,
  handleFieldTouch,
  touchedFields,
  error,
  userOptions,
  formData,
}: {
  field: {
    id: string;
    formGroupingId: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
    placeholder?: string | null;
    minLength?: number | null;
    maxLength?: number | null;
    multiple?: boolean | null;
    content?: string | null;
    filter?: string | null;
    Options?: Array<{
      id: string;
      fieldId: string;
      value: string;
    }>;
  };
  userOptions: {
    value: string;
    label: string;
  }[];
  value: string;
  handleFieldChange: (
    fieldId: string,
    value: string | Date | string[] | object | boolean | number | null
  ) => void;
  formData: Record<string, unknown>;
  handleFieldTouch: (id: string) => void;
  touchedFields: Record<string, boolean>;
  error: string | null;
}) {
  if (field.multiple) {
    const selectedPeople: Person[] = Array.isArray(formData[field.id])
      ? (formData[field.id] as Person[])
      : formData[field.id]
      ? [formData[field.id] as Person]
      : [];

    // Filter out already selected people from userOptions
    const filteredUserOptions = userOptions.filter(
      (option) => !selectedPeople.some((p: Person) => p.id === option.value)
    );

    const showError = field.required && selectedPeople.length === 0;

    return (
      <div
        key={field.id}
        className="flex flex-col"
        onBlur={() => handleFieldTouch(field.id)}
      >
        <Label className="text-sm font-medium mb-1">
          {field.label}{" "}
          {field.required && <span className="text-red-500">*</span>}
        </Label>

        {/* Combobox for selecting people */}
        <SingleCombobox
          options={filteredUserOptions}
          value={""}
          onChange={(val, option) => {
            if (option) {
              // Check if person is already selected
              const isSelected = selectedPeople.some(
                (p: Person) => p.id === option.value
              );

              if (!isSelected) {
                const newPerson = {
                  id: option.value,
                  name: option.label,
                };

                const updatedPeople = [...selectedPeople, newPerson];
                handleFieldChange(field.id, updatedPeople);
              }
            }
          }}
          placeholder="Select people..."
          filterKeys={["value", "label"]}
        />
        {/* Display selected people as tags */}
        {selectedPeople.length > 0 && (
          <div className="max-w-md flex flex-wrap gap-1 mt-2 mb-1">
            {selectedPeople.map((person: Person, idx: number) => (
              <div
                key={idx}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                <span>{person.name}</span>
                <button
                  type="button"
                  className="text-blue-800 hover:text-blue-900"
                  onClick={() => {
                    const updatedPeople = selectedPeople.filter(
                      (_: Person, i: number) => i !== idx
                    );
                    handleFieldChange(
                      field.id,
                      updatedPeople.length ? updatedPeople : null
                    );
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Show error message if required and no people selected */}
        {showError && touchedFields[field.id] && (
          <p className="text-xs text-red-500 mt-1">Field is required.</p>
        )}
      </div>
    );
  } else {
    const showError = error && touchedFields[field.id];
    return (
      <div
        key={field.id}
        className="flex flex-col"
        onBlur={() => handleFieldTouch(field.id)}
      >
        <Label className="text-sm font-medium mb-1">
          {field.label}{" "}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        <SingleCombobox
          options={userOptions}
          value={(formData[field.id] as Person | undefined)?.id || ""}
          onChange={(val, option) => {
            if (option) {
              // Store the selected value in formData instead of a separate asset state
              handleFieldChange(field.id, {
                id: option.value,
                name: option.label,
              });
            } else {
              handleFieldChange(field.id, null);
            }
          }}
        />
        {showError && touchedFields[field.id] && (
          <p className="text-xs text-red-500 mt-1">This field is required.</p>
        )}
      </div>
    );
  }
}
