"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { createTag } from "@/actions/AssetActions";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalStatus } from "../../../../../../prisma/generated/prisma/client";
import { X } from "lucide-react";
import { validate } from "uuid";

type JobsiteSummary = {
  id: string;
  name: string;
  approvalStatus: ApprovalStatus;
};

type CostCodeSummary = {
  id: string;
  name: string;
  isActive: boolean;
};

// Validation function with detailed error messages
const validateTagFormData = (formData: {
  name: string;
  description: string;
  Jobsites: Array<{ id: string; name: string }>;
  CostCodes: Array<{ id: string; name: string }>;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Validate name
  if (!formData.name.trim()) {
    errors.name = "Tag name is required";
  } else if (formData.name.trim().length < 2) {
    errors.name = "Tag name must be at least 2 characters";
  } else if (formData.name.trim().length > 100) {
    errors.name = "Tag name must not exceed 100 characters";
  }

  // Validate description
  if (!formData.description.trim()) {
    errors.description = "Tag description is required";
  } else if (formData.description.trim().length < 2) {
    errors.description = "Tag description must be at least 2 characters";
  } else if (formData.description.trim().length > 500) {
    errors.description = "Tag description must not exceed 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default function CreateTagModal({
  cancel,
  rerender,
}: {
  cancel: () => void;
  rerender: () => void;
}) {
  const [jobsite, setJobsite] = useState<JobsiteSummary[]>([]);
  const [costCode, setCostCode] = useState<CostCodeSummary[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    Jobsites: Array<{ id: string; name: string }>;
    CostCodes: Array<{ id: string; name: string }>;
  }>({
    name: "",
    description: "",
    Jobsites: [],
    CostCodes: [],
  });

  useEffect(() => {
    const fetchJobsites = async () => {
      try {
        const res = await fetch("/api/getJobsiteSummary");
        const data = await res.json();
        const filteredJobsites = data
          .filter(
            (jobsite: {
              id: string;
              name: string;
              approvalStatus: ApprovalStatus;
            }) => jobsite.approvalStatus !== ApprovalStatus.REJECTED,
          )
          .map((jobsite: { id: string; name: string }) => ({
            id: jobsite.id,
            name: jobsite.name,
          }));

        setJobsite(filteredJobsites || []);
      } catch (error) {
        console.error("Failed to fetch jobsites:", error);
      }
    };
    fetchJobsites();
  }, []);

  useEffect(() => {
    const fetchCostCodes = async () => {
      try {
        const res = await fetch("/api/getCostCodeSummary");
        const data = await res.json();
        const filteredCostCodes = data
          .filter(
            (costCode: { id: string; name: string; isActive: boolean }) =>
              costCode.isActive === true,
          )
          .map((costCode: { id: string; name: string }) => ({
            id: costCode.id,
            name: costCode.name,
          }));

        setCostCode(filteredCostCodes || []);
      } catch (error) {
        console.error("Failed to fetch jobsites:", error);
      }
    };
    fetchCostCodes();
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate individual field on blur
  const validateField = (fieldName: string, value: string) => {
    let fieldError = "";

    if (fieldName === "name") {
      if (!value.trim()) {
        fieldError = "Tag name is required";
      } else if (value.trim().length < 2) {
        fieldError = "Tag name must be at least 2 characters";
      } else if (value.trim().length > 100) {
        fieldError = "Tag name must not exceed 100 characters";
      }
    } else if (fieldName === "description") {
      if (!value.trim()) {
        fieldError = "Tag description is required";
      } else if (value.trim().length < 2) {
        fieldError = "Tag description must be at least 2 characters";
      } else if (value.trim().length > 500) {
        fieldError = "Tag description must not exceed 500 characters";
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

    if (fieldName === "name") {
      validateField("name", formData.name);
    } else if (fieldName === "description") {
      validateField("description", formData.description);
    }
  };

  const handleCreateJobsite = async () => {
    // Validate form data
    const validation = validateTagFormData(formData);
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
      // Prepare payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        CostCode: formData.CostCodes.map((costCode) => ({
          id: costCode.id,
          name: costCode.name,
        })),
        Jobsites: formData.Jobsites.map((jobsite) => ({
          id: jobsite.id,
          name: jobsite.name,
        })),
      };

      const result = await createTag(payload);
      if (result.success) {
        toast.success("Tag created successfully!", { duration: 3000 });
        rerender();
        cancel();
      } else {
        toast.error("Failed to create Tag", { duration: 3000 });
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create Tag. Please try again.", {
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
          <h2 className="text-lg font-semibold">Create Tag</h2>
          <p className="text-xs text-gray-600">
            Fill in the details to create a new tag.
          </p>
        </div>
        <div className="flex-1 w-full gap-4 px-2 pt-2 pb-10 overflow-y-auto no-scrollbar">
          <div className="pt-2 space-y-1">
            <Label htmlFor="cc-name" className={`text-xs `}>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cc-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={() => handleFieldBlur("name")}
              placeholder="Enter tag name"
              className="w-full text-xs"
              required
            />
            {touched.name && errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="pt-2 space-y-1">
            <Label htmlFor="cc-number" className={`text-xs `}>
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cc-number"
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              onBlur={() => handleFieldBlur("description")}
              placeholder="Enter tag description"
              className="w-full text-xs"
              required
            />
            {touched.description && errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
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
          {jobsite && (
            <div className="p-4 bg-slate-50 border border-gray-200 pb-4 rounded-lg">
              <div className="mb-2 space-y-2">
                <Label className="text-sm font-semibold mb-2 ">
                  Jobsites
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-lg">
                    Optional
                  </span>
                </Label>
                <Combobox
                  label={""}
                  options={jobsite.map((j) => ({
                    label: j.name,
                    value: j.id,
                  }))}
                  value={formData.Jobsites.map((tag) => tag.id)}
                  onChange={(selectedIds: string[]) => {
                    setFormData((prev) => ({
                      ...prev,
                      Jobsites: jobsite.filter((j) =>
                        selectedIds.includes(j.id),
                      ),
                    }));
                  }}
                  placeholder="Select Jobs..."
                />
              </div>
              <div className="min-h-[100px] bg-white border border-gray-200 rounded p-2 mt-2">
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
                          setFormData((prev) => ({
                            ...prev,
                            Jobsites: prev.Jobsites.filter(
                              (j) => j.id !== js.id,
                            ),
                          }));
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

          {costCode && (
            <div className="mt-4 p-4 bg-slate-50 border border-gray-200 pb-4 rounded-lg">
              <div className="mb-2 space-y-1">
                <Label className="text-sm font-semibold mb-2  ">
                  Cost Codes
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-lg">
                    Optional
                  </span>
                </Label>
                <Combobox
                  label={""}
                  options={costCode.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                  value={formData.CostCodes.map((tag) => tag.id)}
                  onChange={(selectedIds: string[]) => {
                    setFormData((prev) => ({
                      ...prev,
                      CostCodes: costCode.filter((c) =>
                        selectedIds.includes(c.id),
                      ),
                    }));
                  }}
                  placeholder="Select Cost Codes..."
                />
              </div>
              <div className="min-h-[100px] bg-white border border-gray-200 rounded p-2 mt-2">
                <div className=" flex flex-wrap gap-2">
                  {formData.CostCodes.map((cc) => (
                    <div
                      key={cc.id}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1"
                    >
                      <span>{cc.name}</span>
                      <button
                        type="button"
                        className="text-green-800 hover:text-green-900"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            CostCodes: prev.CostCodes.filter(
                              (c) => c.id !== cc.id,
                            ),
                          }));
                        }}
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
        <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
          <div className="flex flex-row justify-end gap-2 w-full">
            <Button
              variant="outline"
              onClick={cancel}
              className="bg-gray-200 hover:bg-gray-300 hover:text-gray-800 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateJobsite}
              className="bg-sky-500 hover:bg-sky-400 text-white hover:text-white px-4 py-2 rounded"
              disabled={submitting || !validateTagFormData(formData).isValid}
            >
              {submitting ? "Creating..." : "Create Tag"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
