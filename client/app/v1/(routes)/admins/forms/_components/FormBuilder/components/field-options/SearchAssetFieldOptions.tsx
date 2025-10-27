"use client";

import { FormField } from "../../types";
import { Input } from "@/components/ui/input";

interface SearchAssetFieldOptionsProps {
  field: FormField;
  updateField: (fieldId: string, updatedProperties: Partial<FormField>) => void;
}

export const SearchAssetFieldOptions: React.FC<
  SearchAssetFieldOptionsProps
> = ({ field, updateField }) => {
  return (
    <div className="bg-white py-2 rounded-md flex flex-col my-2">
      <div>
        <div className="flex flex-col gap-2 pb-2">
          <p className="text-sm font-semibold ">
            Asset Type
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-lg ml-1 text-xs">
              Required
            </span>
          </p>
          <p className="text-xs text-gray-500">
            Select the asset type to filter, the filter will show a list of
            assets of the selected type.
          </p>
        </div>

        <div className="flex flex-row items-center gap-4 font-normal pb-2">
          {["Equipment", "Jobsites", "Cost Codes"].map((type) => (
            <div
              key={type}
              className="flex flex-row items-center gap-1 font-normal"
            >
              <Input
                id={`assetType_${field.id}_${type}`}
                name={`assetType_${field.id}`}
                value={type}
                type="radio"
                className="w-fit"
                checked={field.filter === type}
                onChange={() => {
                  updateField(field.id, {
                    filter: type,
                  });
                }}
              />
              <label
                htmlFor={`assetType_${field.id}_${type}`}
                className="text-xs font-normal"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </div>
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

        <div className="flex flex-row items-center gap-2 px-2 font-normal">
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
