"use client";
import { FormField } from "../../types";
import { Input } from "@/components/ui/input";

interface SearchPersonFieldOptionsProps {
  field: FormField;
  updateField: (fieldId: string, updatedProperties: Partial<FormField>) => void;
}

export const SearchPersonFieldOptions: React.FC<
  SearchPersonFieldOptionsProps
> = ({ field, updateField }) => {
  return (
    <div className="bg-white py-2 rounded-md flex flex-col">
      <div>
        <div className="flex flex-col gap-2 pb-2">
          <p className="text-sm font-semibold ">
            Multiple Selections
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg ml-1 text-xs">
              Optional
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Allow users to select multiple options from the list if selected.
          </p>
        </div>
        <div className="flex flex-row items-center gap-2 font-normal px-2">
          <Input
            id={`multipleSelection_${field.id}`}
            name={`multipleSelection_${field.id}`}
            type="checkbox"
            className="w-fit"
            checked={field.multiple}
            onChange={() =>
              updateField(field.id, {
                multiple: !field.multiple,
              })
            }
          />
          <label
            htmlFor={`multipleSelection_${field.id}`}
            className="text-xs font-normal"
          >
            Allow Multiple Selections
          </label>
        </div>
      </div>
    </div>
  );
};
