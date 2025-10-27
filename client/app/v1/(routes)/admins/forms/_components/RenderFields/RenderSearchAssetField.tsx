"use client";
import { SingleCombobox } from "@/components/ui/single-combobox";
import { Label } from "@/components/ui/label";
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

// Define an Asset interface to replace any type
interface Asset {
  id: string;
  name: string;
  type: string;
}

export default function RenderSearchAssetField({
  field,
  handleFieldChange,
  formData,
  // clientOptions,
  equipmentOptions,
  jobsiteOptions,
  costCodeOptions,
  handleFieldTouch,
  touchedFields,
}: {
  equipmentOptions: { value: string; label: string }[];
  jobsiteOptions: { value: string; label: string }[];
  costCodeOptions: { value: string; label: string }[];
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
  value: string;
  handleFieldChange: (
    fieldId: string,
    value: string | Date | string[] | object | boolean | number | null,
  ) => void;
  formData: Record<string, unknown>;
  handleFieldTouch: (fieldId: string) => void;
  touchedFields: Record<string, boolean>;
}) {
  let assetOptions = equipmentOptions;
  let assetType = "client";

  if (field.filter) {
    switch (field.filter.toUpperCase()) {
      case "Equipment":
      case "EQUIPMENT":
        assetOptions = equipmentOptions;
        assetType = "equipment";
        break;
      case "Jobsites":
      case "JOBSITES":
        assetOptions = jobsiteOptions;
        assetType = "jobsite";
        break;
      case "Cost Codes":
      case "COST_CODES":
        assetOptions = costCodeOptions;
        assetType = "costCode";
        break;
    }
  }

  if (field.multiple) {
    // For multiple selection of assets
    const selectedAssets: Asset[] = Array.isArray(formData[field.id])
      ? (formData[field.id] as Asset[])
      : formData[field.id]
        ? [formData[field.id] as Asset]
        : [];

    const showError = field.required && selectedAssets.length === 0;

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

        {/* Combobox for selecting assets */}
        <SingleCombobox
          options={assetOptions}
          value={""}
          onChange={(val, option) => {
            if (option) {
              // Check if asset is already selected
              const isSelected = selectedAssets.some(
                (a: Asset) => a.id === option.value,
              );

              if (!isSelected) {
                const newAsset = {
                  id: option.value,
                  name: option.label,
                  type: assetType,
                };

                const updatedAssets = [...selectedAssets, newAsset];
                handleFieldChange(field.id, updatedAssets);
              }
            }
          }}
          placeholder={`Select ${assetType}...`}
          filterKeys={["value", "label"]}
        />
        {/* Display selected assets as tags */}
        {selectedAssets.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 mb-1">
            {selectedAssets.map((asset: Asset, idx: number) => (
              <div
                key={idx}
                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                <span>{asset.name}</span>
                <button
                  type="button"
                  className="text-green-800 hover:text-green-900"
                  onClick={() => {
                    const updatedAssets = selectedAssets.filter(
                      (_: Asset, i: number) => i !== idx,
                    );
                    handleFieldChange(
                      field.id,
                      updatedAssets.length ? updatedAssets : null,
                    );
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Show error message if required and no assets selected */}
        {showError && touchedFields[field.id] && (
          <p className="text-xs text-red-500 mt-1">This field is required.</p>
        )}
      </div>
    );
  } else {
    // For single asset selection (existing behavior)
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
          options={assetOptions}
          value={(formData[field.id] as Asset | undefined)?.id || ""}
          onChange={(val, option) => {
            if (option) {
              // Store the selected value in formData instead of a separate asset state
              handleFieldChange(field.id, {
                id: option.value,
                name: option.label,
                type: assetType,
              });
            } else {
              handleFieldChange(field.id, null);
            }
          }}
        />
        {/* Show error message if required and no assets selected */}
        {field.required && touchedFields[field.id] && (
          <p className="text-xs text-red-500 mt-1">This field is required.</p>
        )}
      </div>
    );
  }
}
