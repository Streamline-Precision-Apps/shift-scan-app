"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { createCostCode } from "@/actions/AssetActions";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { TagSummary } from "./useTagData";
import { X } from "lucide-react";

// Validation function with detailed error messages
const validateFormData = (formData: {
  code: string;
  name: string;
  isActive: boolean;
  CCTags: TagSummary[];
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate code
  if (!formData.code.trim()) {
    errors.code = "Cost code number is required";
  } else if (!/^\d+(\.\d+)?$/.test(formData.code)) {
    errors.code =
      "Cost code must contain only numbers and optional decimal point";
  }

  // Validate name
  if (!formData.name.trim()) {
    errors.name = "Cost code name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Cost code name must be at least 2 characters";
  } else if (formData.name.trim().length > 100) {
    errors.name = "Cost code name must not exceed 100 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default function CreateCostCodeModal({
  cancel,
  rerender,
}: {
  cancel: () => void;
  rerender: () => void;
}) {
  const [tagSummaries, setTagSummaries] = useState<TagSummary[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/getTagSummary");
        const data = await res.json();
        setTagSummaries(data.tags || []);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };
    fetchTags();
  }, []);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    isActive: boolean;
    CCTags: TagSummary[];
  }>({
    code: "",
    name: "", // This should always contain ONLY the name part, never the code
    isActive: true,
    CCTags: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate individual field on blur
  const validateField = (fieldName: string, value: string) => {
    let fieldError = "";

    if (fieldName === "code") {
      if (!value.trim()) {
        fieldError = "Cost code number is required";
      } else if (!/^\d+(\.\d+)?$/.test(value)) {
        fieldError =
          "Cost code must contain only numbers and optional decimal point";
      }
    } else if (fieldName === "name") {
      if (!value.trim()) {
        fieldError = "Cost code name is required";
      } else if (value.trim().length < 2) {
        fieldError = "Cost code name must be at least 2 characters";
      } else if (value.trim().length > 100) {
        fieldError = "Cost code name must not exceed 100 characters";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError,
    }));
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    if (fieldName === "code") {
      validateField("code", formData.code);
    } else if (fieldName === "name") {
      validateField("name", formData.name);
    }
  };

  const handleCreateJobsite = async () => {
    // Validate form data
    const validation = validateFormData(formData);
    setErrors(validation.errors);

    if (!validation.isValid) {
      toast.error("Please fill in all required fields correctly", {
        duration: 3000,
      });
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      // Prepare payload - ensure clean separation of code and name
      const cleanCode = formData.code.trim();
      const cleanName = formData.name.trim();

      const payload = {
        code: cleanCode, // Save code without #
        name: `#${cleanCode} ${cleanName}`.trim(), // Save name as "#code name"
        isActive: formData.isActive,
        CCTags: [
          ...formData.CCTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          })),
          { id: "All", name: "All" },
        ],
      };

      const result = await createCostCode(payload);
      if (result.success) {
        toast.success("Cost Code created successfully!", { duration: 3000 });
        rerender();
        cancel();
      } else {
        toast.error("Failed to create Cost Code", { duration: 3000 });
      }
    } catch (error) {
      console.error("Error creating cost code:", error);
      toast.error("An error occurred while creating the Cost Code", {
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[600px] h-[80vh]  px-6 py-4 flex flex-col items-center">
        <div className="w-full flex flex-col border-b border-gray-100 pb-3 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={cancel}
            className="absolute top-0 right-0 cursor-pointer"
          >
            <X width={20} height={20} />
          </Button>
          <h2 className="text-lg font-semibold">Create Cost Code</h2>
          <p className="text-xs text-gray-600">
            Fill in the details to create a new cost code.
          </p>
        </div>

        <div className="flex-1 w-full gap-4 px-2 pt-2 pb-10 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-4">
            <div className="">
              <Label htmlFor="cc-number" className={`text-xs `}>
                Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cc-number"
                type="text"
                name="code"
                value={`#${formData.code}`}
                onChange={(e) => {
                  let value = e.target.value;
                  // Ensure it starts with # and prevent multiple #
                  if (!value.startsWith("#")) {
                    value = "#" + value;
                  }
                  // Remove any additional # characters
                  value = "#" + value.slice(1).replace(/#/g, "");

                  // Extract the numeric part after #
                  const numericPart = value.slice(1);
                  // Only allow numbers and one decimal point
                  const validNumericPart = numericPart
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*?)\..*/g, "$1");

                  // Update ONLY the code field, never touch the name field
                  setFormData((prev) => ({
                    ...prev,
                    code: validNumericPart,
                  }));
                }}
                onKeyDown={(e) => {
                  // Prevent deletion of # at the beginning
                  if (e.key === "Backspace" || e.key === "Delete") {
                    const input = e.target as HTMLInputElement;
                    const selectionStart = input.selectionStart || 0;
                    const selectionEnd = input.selectionEnd || 0;

                    // If trying to delete the # or select text that includes #
                    if (
                      selectionStart === 0 ||
                      (selectionStart === 0 && selectionEnd > 0)
                    ) {
                      e.preventDefault();
                    }
                  }
                }}
                onClick={(e) => {
                  // Prevent cursor from going before #
                  const input = e.target as HTMLInputElement;
                  if (input.selectionStart === 0) {
                    input.setSelectionRange(1, 1);
                  }
                }}
                onBlur={() => handleFieldBlur("code")}
                placeholder="#100.00"
                className="w-full text-xs"
                required
              />
              {touched.code && errors.code && (
                <p className="text-xs text-red-500 mt-1">{errors.code}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="mt-4">
              <Label htmlFor="cc-name" className={`text-xs `}>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cc-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => {
                  // Update ONLY the name field, never touch the code field
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
                onBlur={() => handleFieldBlur("name")}
                className="w-full text-xs"
                required
              />
              {touched.name && errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="mt-4">
              <Label htmlFor="cc-active-status" className={`text-xs `}>
                Active Status <span className="text-red-500">*</span>
              </Label>
              <Select
                name="isActive"
                value={formData.isActive ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: value === "true",
                  }))
                }
              >
                <SelectTrigger id="cc-active-status" className="text-xs">
                  <SelectValue placeholder="Select Active Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6">
            <p className="block font-semibold text-base mb-1">{`Add Costcode to Tags`}</p>
          </div>
          {tagSummaries && (
            <div className="p-4 border border-gray-200 rounded-md pb-8">
              <Combobox
                label={` Tags (Optional)`}
                options={tagSummaries
                  .filter((tag) => tag.name.toLowerCase() !== "all")
                  .map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                  }))}
                value={formData.CCTags.map((tag) => tag.id)}
                onChange={(selectedIds: string[]) => {
                  setFormData((prev) => ({
                    ...prev,
                    CCTags: tagSummaries.filter((tag) =>
                      selectedIds.includes(tag.id),
                    ),
                  }));
                }}
                placeholder="Select one or more tags..."
              />
              <p className="text-xs pt-1 flex flex-row justify-end text-gray-400">
                {`Automatically connects to main list.`}
              </p>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
          <div className="flex flex-row justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={cancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 hover:text-gray-800 px-4 py-2 rounded-md"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateJobsite}
              className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-md hover:text-white"
              disabled={submitting || !validateFormData(formData).isValid}
            >
              {submitting ? "Creating..." : "Create Cost Code"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
