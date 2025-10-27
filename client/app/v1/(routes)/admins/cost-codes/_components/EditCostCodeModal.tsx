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
import { updateCostCodeAdmin } from "@/actions/AssetActions";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { CostCode, useCostCodeDataById } from "./useCostCodeDataById";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Spinner from "@/components/(animations)/spinner";

export default function EditCostCodeModal({
  cancel,
  pendingEditId,
  rerender,
}: {
  cancel: () => void;
  pendingEditId: string;
  rerender: () => void;
}) {
  const { costCodeDetails, tagSummaries, loading } =
    useCostCodeDataById(pendingEditId);
  const [formData, setFormData] = useState<CostCode>();
  const [originalForm, setOriginalForm] = useState<CostCode | null>(null);

  useEffect(() => {
    if (costCodeDetails) {
      setFormData(costCodeDetails);
      setOriginalForm(costCodeDetails);
    }
  }, [costCodeDetails]);

  const handleSaveChanges = async () => {
    if (!formData) {
      toast.error("No form data to save.", { duration: 3000 });
      return;
    }
    try {
      const fd = new FormData();
      fd.append("id", formData.id);
      fd.append("code", formData.code); // Save code without #
      fd.append("name", `#${formData.code} ${getName()}`.trim()); // Save name as "#code name"
      fd.append("isActive", String(formData.isActive));
      fd.append("CCTags", JSON.stringify(formData.CCTags.map((tag) => tag.id)));

      const result = await updateCostCodeAdmin(fd);

      if (result?.success) {
        toast.success("CostCode updated successfully.", { duration: 3000 });
        cancel();
        rerender();
      } else {
        throw new Error(result?.message || "Failed to update CostCode.");
      }
    } catch (err) {
      toast.error("Error updating CostCode. Please try again.", {
        duration: 3000,
      });
      console.error(err);
    }
  };

  if (loading || !formData || !originalForm) {
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

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">{`Edit Cost Code`}</h2>
              <div className="flex flex-row gap-2 items-center">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          </div>
          <div className="flex-1 w-full px-2 pt-2 pb-10 overflow-y-auto no-scrollbar">
            <div className="flex flex-col bg-slate-50 w-full justify-center items-center h-full">
              <Spinner />
            </div>
          </div>
          <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
            <div className="flex flex-row justify-end gap-2 w-full">
              <Button
                variant="outline"
                onClick={cancel}
                disabled={loading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 hover:text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveChanges}
                disabled={loading}
                className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-md hover:text-white"
              >
                {"Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCode = () => {
    // Handle both cases: code with # or without #
    const code = formData.code;
    return code.startsWith("#") ? code.slice(1) : code;
  };
  const getName = () => {
    // If formData.name contains the full format "#code name", extract just the name part
    // Otherwise, return the name as-is
    const fullName = formData.name;
    if (fullName.startsWith("#")) {
      const parts = fullName.split(" ");
      return parts.slice(1).join(" "); // Return everything after the first space (the code part)
    }
    return fullName;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Update only the code field (store without #)
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        code: validNumericPart, // Store without # in formData
      };
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    // Store the name part separately from the code
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: newName, // Store just the name part
      };
    });
  };

  const safeTagSummaries = Array.isArray(tagSummaries) ? tagSummaries : [];
  // Merge all tags, ensuring no duplicates
  const allTags = [
    ...safeTagSummaries,
    ...formData.CCTags.filter(
      (tag) => !safeTagSummaries.some((t) => t.id === tag.id),
    ),
  ];

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

          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{`Edit Cost Code`}</h2>
            <div className="flex flex-row gap-2 items-center">
              {formData.isActive ? (
                <span className="text-xs bg-green-100 px-2 py-1.5 rounded-lg text-green-600">
                  Active
                </span>
              ) : (
                <span className="text-xs bg-red-100 px-2 py-1.5 rounded-lg text-red-600">
                  Archived
                </span>
              )}
              <span className="text-xs bg-gray-100 px-2 py-1.5 rounded-lg text-gray-800">
                {`Last Updated: ${format(formData.updatedAt, "MM/dd/yy")}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full px-2 pt-2 pb-10 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="code" className="text-sm">
                Code
              </Label>
              <Input
                type="text"
                name="code"
                value={`#${getCode()}`}
                onChange={handleCodeChange}
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
                className="w-full text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="name" className="text-sm">
                Name
              </Label>
              <Input
                type="text"
                name="name"
                value={getName()}
                onChange={handleNameChange}
                className="w-full text-xs"
                required
              />
            </div>

            <div>
              <Label htmlFor="cc-active-status" className="text-sm">
                Active Status
              </Label>
              <Select
                name="isActive"
                value={formData.isActive ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData((prev) => {
                    if (!prev) return prev;
                    return { ...prev, isActive: value === "true" };
                  })
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
            <div className="w-full flex flex-col p-4 border border-gray-200 rounded-md pb-8">
              <Label className="text-sm pb-2">
                Select Tags{" "}
                <span className="text-xs bg-blue-100 px-2 py-1 rounded-lg text-blue-800">
                  Optional
                </span>
              </Label>
              <Combobox
                label={``}
                options={
                  allTags
                    ? allTags.map((tag) => ({
                        label: tag.name,
                        value: tag.id,
                      }))
                    : []
                }
                // name prop removed, not supported by ComboboxProps
                value={formData.CCTags.map((tag) => tag.id)}
                onChange={(selectedIds: string[]) => {
                  // Ensure "All" tag is always included and cannot be removed
                  const hasAllTag = selectedIds.includes("All");
                  const finalSelectedIds = hasAllTag
                    ? selectedIds
                    : [...selectedIds, "All"];

                  setFormData((prev) =>
                    prev
                      ? {
                          ...prev,
                          CCTags: [
                            ...safeTagSummaries.filter((tag) =>
                              finalSelectedIds.includes(tag.id),
                            ),
                            // Ensure "All" tag is always present
                            ...(finalSelectedIds.includes("All") &&
                            !safeTagSummaries.some((t) => t.id === "All")
                              ? [{ id: "All", name: "All" }]
                              : []),
                          ],
                        }
                      : prev,
                  );
                }}
              />
              <div className="w-full flex flex-row justify-end">
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-semibold">Reminder:</span>{" "}
                  {`The All tag is required and cannot be removed.`}
                </p>
              </div>
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
              onClick={handleSaveChanges}
              className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-md hover:text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
