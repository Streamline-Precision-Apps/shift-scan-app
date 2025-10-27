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
  equipmentOptions,
  jobsiteOptions,
  costCodeOptions,
  handleFieldTouch,
  touchedFields,
  error,
  disabled,
  useNativeInput = false,
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
  error?: string | null;
  disabled?: boolean;
  useNativeInput?: boolean;
}) {
  let assetOptions = [{ value: "", label: "" }];
  let assetType = "client";

  if (field.filter) {
    switch (field.filter.toUpperCase()) {
      case "EQUIPMENT":
        assetOptions = equipmentOptions || [];
        assetType = "equipment";
        break;
      case "JOBSITES":
        assetOptions = jobsiteOptions || [];
        assetType = "jobsite";
        break;
      case "COST CODES":
      case "COST_CODES":
        assetOptions = costCodeOptions || [];
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
          disabled={disabled}
        />
        {/* Display selected assets as tags */}
        {selectedAssets.length > 0 && (
          <div className="max-w-md flex flex-wrap gap-2 mt-3 mb-2">
            {selectedAssets.map((asset: Asset, idx: number) => (
              <div
                key={asset.id || `asset-${idx}`}
                className="bg-green-100 text-green-800 text-xl px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <span className="text-lg font-medium">{asset.name}</span>
                <button
                  type="button"
                  className="text-green-800 hover:text-green-900 text-2xl font-bold leading-none"
                  onClick={() => {
                    const updatedAssets = selectedAssets.filter(
                      (_: Asset, i: number) => i !== idx,
                    );
                    handleFieldChange(
                      field.id,
                      updatedAssets.length ? updatedAssets : null,
                    );
                  }}
                  aria-label={`Remove ${asset.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Show error message if required and no assets selected */}
        {(showError || error) && touchedFields[field.id] && (
          <p className="text-xs text-red-500 mt-1">
            {error || "This field is required."}
          </p>
        )}
      </div>
    );
  } else {
    // For single asset selection (existing behavior)
    const currentValue = formData[field.id] as Asset | undefined;
    const displayValue = currentValue?.id || "";

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
          value={displayValue}
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
          placeholder={`Select ${assetType}...`}
          filterKeys={["value", "label"]}
        />
        {/* Display selected asset as tag */}
        {currentValue && (
          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            <div className="bg-green-100 text-green-800 text-lg px-3 py-2 rounded-lg flex items-center gap-2">
              <span className="text-lg font-medium">{currentValue.name}</span>
              <button
                type="button"
                className="text-green-800 hover:text-green-900 text-2xl font-bold leading-none"
                onClick={() => {
                  handleFieldChange(field.id, null);
                }}
                aria-label={`Remove ${currentValue.name}`}
              >
                ×
              </button>
            </div>
          </div>
        )}
        {/* Show error message if required and no asset selected */}
        {((field.required && !currentValue) || error) &&
          touchedFields[field.id] && (
            <p className="text-xs text-red-500 mt-1">
              {error || "This field is required."}
            </p>
          )}
      </div>
    );
  }
}
