"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createFormSubmission } from "@/actions/records-forms";
import RenderFields from "../../_components/RenderFields/RenderFields"; // Import the RenderFields component
import Spinner from "@/components/(animations)/spinner";
import { FormIndividualTemplate } from "./hooks/types";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Submission {
  id: string;
  title: string;
  formTemplateId: string;
  userId: string;
  formType: string;
  data: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  status: string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Grouping {
  id: string;
  title: string;
  order: number;
  Fields: Fields[];
}

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

interface CreateFormSubmissionModalProps {
  formTemplate: FormIndividualTemplate;
  closeModal: () => void;
  onSuccess?: () => void;
}

const CreateFormSubmissionModal: React.FC<CreateFormSubmissionModalProps> = ({
  formTemplate,
  closeModal,
  onSuccess,
}) => {
  const { data: session } = useSession();
  const adminUserId = session?.user?.id || null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<
    Record<string, string | number | boolean | null>
  >({});
  const [submittedBy, setSubmittedBy] = useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [submittedByTouched, setSubmittedByTouched] = useState(false);

  // State for manager approval
  const [managerComment, setManagerComment] = useState<string>("");
  const [managerSignature, setManagerSignature] = useState<boolean>(false);

  // State for different asset types
  const [equipment, setEquipment] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [jobsites, setJobsites] = useState<{ id: string; name: string }[]>([]);
  const [costCodes, setCostCodes] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [users, setUsers] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  const userOptions = users.map((u) => ({
    value: u.id,
    label: `${u.firstName} ${u.lastName}`,
  }));

  const equipmentOptions = equipment.map((e) => ({
    value: e.id,
    label: e.name,
  }));

  const jobsiteOptions = jobsites.map((j) => ({
    value: j.id,
    label: j.name,
  }));

  const costCodeOptions = costCodes.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await fetch("/api/getAllActiveEmployeeName");
      const employees = await res.json();
      setUsers(employees);
    };
    fetchEmployees();
  }, []);

  // Fetch equipment data
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/getEquipmentSummary");
        if (!res.ok) throw new Error("Failed to fetch equipment");
        const data = await res.json();
        setEquipment(data);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      }
    };
    fetchEquipment();
  }, []);

  // Fetch jobsites data
  useEffect(() => {
    const fetchJobsites = async () => {
      try {
        const res = await fetch("/api/getJobsiteSummary");
        if (!res.ok) throw new Error("Failed to fetch jobsites");
        const data = await res.json();

        setJobsites(data);
      } catch (error) {
        console.error("Error fetching jobsites:", error);
      }
    };
    fetchJobsites();
  }, []);

  // Fetch cost codes data
  useEffect(() => {
    const fetchCostCodes = async () => {
      try {
        const res = await fetch("/api/getCostCodeSummary");
        if (!res.ok) throw new Error("Failed to fetch cost codes");
        const data = await res.json();
        setCostCodes(data);
      } catch (error) {
        console.error("Error fetching cost codes:", error);
      }
    };
    fetchCostCodes();
  }, []);

  const handleFieldChange = (
    fieldId: string,
    value: string | Date | string[] | object | boolean | number | null,
  ) => {
    // Convert value to a format compatible with our formData state
    let compatibleValue: string | number | boolean | null = null;

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      compatibleValue = value;
    } else if (value instanceof Date) {
      compatibleValue = value.toISOString();
    } else if (Array.isArray(value)) {
      compatibleValue = value.join(",");
    } else if (value !== null && typeof value === "object") {
      compatibleValue = JSON.stringify(value);
    }

    setFormData((prev) => ({ ...prev, [fieldId]: compatibleValue }));
  };

  // Signature state is now tied to manager signature
  const [signatureChecked, setSignatureChecked] = useState(false);

  const handleSubmit = async () => {
    setSubmittedByTouched(true);
    if (!submittedBy) {
      toast.error("'Submitted By' is required", { duration: 3000 });
      return;
    }
    if (formTemplate.isSignatureRequired && !signatureChecked) {
      toast.error("You must electronically sign this submission.", {
        duration: 3000,
      });
      return;
    }
    if (formTemplate.isApprovalRequired && !managerSignature) {
      toast.error("You must sign the submission as a manager to approve it.", {
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Process formData to ensure asset data is properly formatted
      const processedFormData: Record<
        string,
        string | number | boolean | null
      > = { ...formData };

      if (formTemplate.isSignatureRequired) {
        processedFormData.signature = true;
      }

      const res = await createFormSubmission({
        formTemplateId: formTemplate.id,
        data: processedFormData,
        submittedBy: {
          id: submittedBy.id,
          firstName: submittedBy.firstName,
          lastName: submittedBy.lastName,
        },
        adminUserId,
        comment: managerComment,
        signature: `${session?.user.firstName} ${session?.user.lastName}`,
        status: "APPROVED",
        // Include manager approval data if signed by manager
      });

      if (res.success) {
        toast.success("Submission created and approved");
        closeModal();
        onSuccess?.();
      } else {
        toast.error(res.error || "Failed to create submission", {
          duration: 3000,
        });
      }
    } catch (err) {
      toast.error("An unexpected error occurred", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[600px] h-[80vh] overflow-y-auto no-scrollbar px-6 py-4 flex flex-col items-center">
        <div className="w-full flex flex-col border-b border-gray-100 pb-3 relative">
          <Button
            type="button"
            variant={"ghost"}
            size={"icon"}
            onClick={closeModal}
            className="absolute top-0 right-0 cursor-pointer"
          >
            <X width={20} height={20} />
          </Button>
          <div className="w-full flex flex-col justify-center  ">
            <div>
              <p className="text-lg text-black font-semibold ">
                {formTemplate?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                Please complete the form fields to create a new submission.
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full px-2 pb-10 overflow-y-auto no-scrollbar">
          <div className="w-full mt-3">
            <RenderFields
              formTemplate={formTemplate}
              userOptions={userOptions}
              submittedBy={submittedBy}
              setSubmittedBy={setSubmittedBy}
              submittedByTouched={submittedByTouched}
              formData={formData}
              handleFieldChange={handleFieldChange}
              // clientOptions={clientOptions}
              equipmentOptions={equipmentOptions}
              jobsiteOptions={jobsiteOptions}
              costCodeOptions={costCodeOptions}
            />
          </div>

          {/* Manager Approval Section */}
          {adminUserId &&
          formTemplate.isApprovalRequired &&
          formTemplate.isSignatureRequired ? (
            <div className="w-full border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-md font-semibold">Manager Approval</h3>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
                <div className="mb-4">
                  <Label
                    htmlFor="manager-comment"
                    className="text-sm font-medium mb-1 block"
                  >
                    Comment (Optional)
                  </Label>
                  <Textarea
                    id="manager-comment"
                    placeholder="Add any comments about this submission..."
                    value={managerComment}
                    onChange={(e) => setManagerComment(e.target.value)}
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manager-signature"
                    checked={managerSignature}
                    onChange={(e) => {
                      setManagerSignature(e.target.checked);
                      setSignatureChecked(e.target.checked);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="manager-signature"
                    className="text-sm text-gray-700 select-none cursor-pointer"
                  >
                    I,{" "}
                    <span className="font-semibold">
                      {session?.user.firstName} {session?.user.lastName}
                    </span>
                    , electronically sign and approve this submission.
                  </label>
                </div>
              </div>
            </div>
          ) : adminUserId &&
            formTemplate.isApprovalRequired &&
            !formTemplate.isSignatureRequired ? (
            <div className="w-full border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-md font-semibold">Manager Approval</h3>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
                <div className="mb-4">
                  <Label
                    htmlFor="manager-comment"
                    className="text-sm font-medium mb-1 block"
                  >
                    Comment (Optional)
                  </Label>
                  <Textarea
                    id="manager-comment"
                    placeholder="Add any comments about this submission..."
                    value={managerComment}
                    onChange={(e) => setManagerComment(e.target.value)}
                    className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manager-signature"
                    checked={managerSignature}
                    onChange={(e) => {
                      setManagerSignature(e.target.checked);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="manager-signature"
                    className="text-sm text-gray-700 select-none cursor-pointer"
                  >
                    I,{" "}
                    <span className="font-semibold">
                      {session?.user.firstName} {session?.user.lastName}
                    </span>
                    , electronically sign and approve this submission.
                  </label>
                </div>
              </div>
            </div>
          ) : adminUserId &&
            !formTemplate.isApprovalRequired &&
            formTemplate.isSignatureRequired ? (
            <div className="w-full border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-md font-semibold">Electronic Signature </h3>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="signature"
                    checked={signatureChecked}
                    onChange={(e) => {
                      setSignatureChecked(e.target.checked);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="signature"
                    className="text-sm text-gray-700 select-none cursor-pointer"
                  >
                    I,{" "}
                    <span className="font-semibold">
                      {session?.user.firstName} {session?.user.lastName}
                    </span>
                    , electronically sign and approve this submission.
                  </label>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="w-full flex flex-row justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          <Button
            size={"sm"}
            onClick={closeModal}
            variant="outline"
            className="bg-gray-100 text-gray-800 hover:bg-gray-50 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size={"sm"}
            onClick={handleSubmit}
            variant="outline"
            className={`bg-sky-500 text-white hover:bg-sky-400 hover:text-white`}
            disabled={
              loading ||
              (!managerSignature && formTemplate.isApprovalRequired) ||
              (!signatureChecked && formTemplate.isSignatureRequired)
            }
          >
            {loading ? <Spinner size={20} /> : "Create & Approve"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateFormSubmissionModal;
