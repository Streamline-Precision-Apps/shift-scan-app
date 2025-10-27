"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { updateTagAdmin } from "@/actions/AssetActions";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { Tag, useTagDataById } from "./useTagDataById";
import { AlertCircle, X } from "lucide-react";
import Spinner from "@/components/(animations)/spinner";

export default function EditTagModal({
  cancel,
  pendingEditId,
  rerender,
}: {
  cancel: () => void;
  pendingEditId: string;
  rerender: () => void;
}) {
  const { tagDetails, costCodeSummaries, jobsiteSummaries, loading } =
    useTagDataById(pendingEditId);
  const [formData, setFormData] = useState<Tag | null>(null);
  const [originalForm, setOriginalForm] = useState<Tag | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (tagDetails) {
      setFormData(tagDetails);
      setOriginalForm(tagDetails);
    }
  }, [tagDetails]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [name]:
              type === "number" ? (value === "" ? null : Number(value)) : value,
          }
        : prev,
    );
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      if (!formData) {
        toast.error("No form data to save.", { duration: 3000 });
        return;
      }
      const fd = new FormData();
      fd.append("id", formData.id);
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("Jobsites", JSON.stringify(formData.Jobsites.map((j) => j.id)));
      fd.append(
        "CostCodeTags",
        JSON.stringify(formData.CostCodes.map((c) => c.id)),
      );

      const result = await updateTagAdmin(fd);

      if (result?.success) {
        toast.success("Tag updated successfully.", { duration: 3000 });
        cancel();
        rerender();
      } else {
        throw new Error(result?.message || "Failed to update Tag.");
      }
    } catch (err) {
      toast.error("Error updating Tag. Please try again.", { duration: 3000 });
      console.error(err);
    } finally {
      setIsSaving(false);
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
            <h2 className="text-lg font-semibold">{`Edit Tag`}</h2>
            <p className="text-xs text-gray-600">
              Edit the details below to update the tags information.
            </p>
          </div>

          <div className="flex-1 w-full gap-4 px-2 pt-2 pb-10 overflow-y-auto no-scrollbar">
            <div className="w-full bg-slate-50 h-full flex items-center justify-center">
              <Spinner />
            </div>
          </div>
          <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
            <div className="flex flex-row justify-end gap-2 w-full">
              <Button
                variant="outline"
                onClick={cancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800  hover:text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveChanges}
                className={`bg-sky-500 hover:bg-sky-400 hover:text-white  text-white px-4 py-2 rounded`}
                disabled={loading}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const safeJobsiteSummaries = Array.isArray(jobsiteSummaries)
    ? jobsiteSummaries
    : [];
  const allJobsites = [
    ...safeJobsiteSummaries,
    ...formData.Jobsites.filter(
      (js) => !safeJobsiteSummaries.some((j) => j.id === js.id),
    ),
  ];

  const safeCostCodeSummaries = Array.isArray(costCodeSummaries)
    ? costCodeSummaries
    : [];
  const allCostCodes = [
    ...safeCostCodeSummaries,
    ...formData.CostCodes.filter(
      (cc) => !safeCostCodeSummaries.some((c) => c.id === cc.id),
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
          <h2 className="text-lg font-semibold">{`Edit Tag`}</h2>
          <p className="text-xs text-gray-600">
            Edit the details below to update the tags information.
          </p>
        </div>

        <div className="flex-1 w-full gap-4 px-2 pt-2 pb-10 overflow-y-auto no-scrollbar">
          <div className="pt-2 space-y-1">
            <Label htmlFor="name" className="text-sm">
              Name
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full text-xs"
              required
              disabled={formData.name.toUpperCase() === "ALL"}
            />
          </div>
          <div className="pt-2 space-y-1">
            <Label htmlFor="description" className="text-sm">
              Description
            </Label>
            <Input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full text-xs"
              disabled={formData.name.toUpperCase() === "ALL"}
            />
          </div>
          <div className="border-b border-gray-200 pb-1 mt-4">
            <p className="text-sm font-semibold">{`Tag Associations`}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mt-1">
              Connect Jobsites and Costcode to build the tag associations.{" "}
            </p>
            <p className="text-xs text-gray-600 mt-1 mb-4 italic">
              {`When linking to jobsites, it's best to connect only one tag
              per jobsite. This helps prevent cost code overlap.`}
            </p>
          </div>

          <div>
            {jobsiteSummaries && (
              <div className="p-4 bg-slate-50 border border-gray-200 pb-4 rounded-lg">
                <div className="mb-2 space-y-2">
                  <Label className="text-sm font-semibold mb-2 ">
                    Jobsites
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-lg">
                      Optional
                    </span>
                  </Label>
                  {formData.name.toUpperCase() === "ALL" && (
                    <div className="bg-yellow-50 border border-yellow-500  p-4 rounded-lg mb-4">
                      <div className="flex items-center mb-2 gap-2">
                        <AlertCircle width={20} height={20} />
                        <p className="text-sm font-bold">
                          Please Read Carefully
                        </p>
                      </div>
                      <p className="text-sm font-medium ">
                        When removing the “All Tag” from a jobsite, make sure to
                        replace it with another tag. Failing to do so may result
                        in untagged jobsites, preventing users from accessing
                        them and clocking in.
                      </p>
                    </div>
                  )}
                  <Combobox
                    label={""}
                    options={
                      allJobsites
                        ? allJobsites
                            .filter(
                              (jobsite) => jobsite.name.toLowerCase() !== "all",
                            )
                            .map((jobsite) => ({
                              label: jobsite.name,
                              value: jobsite.id,
                            }))
                        : []
                    }
                    // name prop removed, not supported by ComboboxProps
                    value={formData.Jobsites.map((jobsite) => jobsite.id)}
                    onChange={(selectedIds: string[]) => {
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              Jobsites: allJobsites.filter((jobsite) =>
                                selectedIds.includes(jobsite.id),
                              ),
                            }
                          : prev,
                      );
                    }}
                  />
                </div>
                <div className="min-h-[100px] border border-gray-200 rounded p-2 mt-2">
                  <div className=" flex flex-wrap gap-2">
                    {formData.Jobsites.map((js) => (
                      <div
                        key={js.id}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                      >
                        <span>{js.name}</span>
                        <button
                          type="button"
                          className="text-blue-800 hover:text-blue-900"
                          onClick={() => {
                            setFormData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    Jobsites: prev.Jobsites.filter(
                                      (j) => j.id !== js.id,
                                    ),
                                  }
                                : prev,
                            );
                          }}
                          aria-label={`Remove ${js.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {costCodeSummaries && (
              <div className="mt-4 p-4 bg-slate-100 border border-gray-200 pb-4 rounded-lg">
                <div className="mb-2 space-y-2">
                  <Label className="text-sm font-semibold mb-2 ">
                    Cost Codes
                    <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-lg">
                      Optional
                    </span>
                  </Label>
                  {formData.name.toUpperCase() === "ALL" && (
                    <div>
                      <p className="text-xs text-red-600 font-bold italic mb-3">
                        You cannot modify Cost Codes for the ALL tag.
                      </p>
                    </div>
                  )}

                  <Combobox
                    label={""}
                    options={
                      allCostCodes
                        ? allCostCodes
                            .filter(
                              (costCode) =>
                                costCode.name.toLowerCase() !== "all",
                            )
                            .map((costCode) => ({
                              label: costCode.name,
                              value: costCode.id,
                            }))
                        : []
                    }
                    // name prop removed, not supported by ComboboxProps
                    value={formData.CostCodes.map((costCode) => costCode.id)}
                    onChange={(selectedIds: string[]) => {
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              CostCodes: allCostCodes.filter((costCode) =>
                                selectedIds.includes(costCode.id),
                              ),
                            }
                          : prev,
                      );
                    }}
                    disabled={formData.name.toUpperCase() === "ALL"}
                  />
                </div>
                <div
                  className={`min-h-[100px] ${formData.name.toUpperCase() === "ALL" ? "bg-slate-50" : "bg-white"} border border-gray-200 rounded p-2 mt-2`}
                >
                  <div className=" flex flex-wrap gap-2">
                    {formData.CostCodes.map((cc) => (
                      <div
                        key={cc.id}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                      >
                        <span>{cc.name}</span>
                        <button
                          type="button"
                          className="text-blue-800 hover:text-blue-900"
                          onClick={() => {
                            setFormData((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    CostCodes: prev.CostCodes.filter(
                                      (c) => c.id !== cc.id,
                                    ),
                                  }
                                : prev,
                            );
                          }}
                          disabled={formData.name.toUpperCase() === "ALL"}
                          aria-label={`Remove ${cc.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
          <div className="flex flex-row justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={cancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800  hover:text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveChanges}
              className={`bg-sky-500 hover:bg-sky-400 hover:text-white  text-white px-4 py-2 rounded`}
              disabled={loading}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
