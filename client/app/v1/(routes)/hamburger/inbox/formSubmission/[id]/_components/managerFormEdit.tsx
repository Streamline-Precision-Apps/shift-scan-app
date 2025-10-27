"use client";
import { FormFieldRenderer } from "@/app/(routes)/hamburger/inbox/_components/FormFieldRenderer";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { updateFormApproval } from "@/actions/hamburgerActions";
import { useRouter } from "next/navigation";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Titles } from "@/components/(reusable)/titles";
import { Contents } from "@/components/(reusable)/contents";
import { Selects } from "@/components/(reusable)/selects";
import { useAutoSave } from "@/hooks/(inbox)/useAutoSave";
import { format } from "date-fns";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { useTranslations } from "next-intl";

interface FormField {
  id: string;
  label: string;
  name: string;
  type: string;
  required: boolean;
  order: number;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  helperText?: string;
  options?: string[];
}

interface FormGrouping {
  id: string;
  title: string;
  order: number;
  fields: FormField[];
}

interface FormTemplate {
  id: string;
  name: string;
  formType: string;
  isActive: boolean;
  isSignatureRequired: boolean;
  isApprovalRequired: boolean;
  groupings: FormGrouping[];
}

type ManagerFormApprovalSchema = {
  id: number;
  title: string;
  formTemplateId: string;
  userId: string;
  formType: string | null;
  data: {
    comments: string;
    request_type: string;
    request_end_date: string;
    request_start_date: string;
  };
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  status: FormStatus;
  Approvals: Array<{
    id: string;
    formSubmissionId: number;
    signedBy: string;
    submittedAt: string;
    updatedAt: string;
    signature: string;
    comment: string;
    Approver: {
      firstName: string;
      lastName: string;
    };
  }>;
};

enum FormStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
  DRAFT = "DRAFT",
}

export default function ManagerFormEditApproval({
  formData,
  formTitle,
  formValues,
  submissionStatus,
  signature,
  submittedForm,
  submissionId,
  managerFormApproval,
  setFormTitle,
  updateFormValues,
}: {
  formData: FormTemplate;
  formValues: Record<string, string>;
  formTitle: string;
  submissionStatus: string | null;
  signature: string | null;
  submittedForm: string | null;
  submissionId: number | null;
  managerFormApproval: ManagerFormApprovalSchema | null;
  setFormTitle: Dispatch<SetStateAction<string>>;
  updateFormValues: (newValues: Record<string, string>) => void;
}) {
  const t = useTranslations("Hamburger-Inbox");
  const router = useRouter();
  const [comment, setComment] = useState<string>(
    managerFormApproval?.Approvals?.[0]?.comment || "",
  );
  const [approvalStatus, setApprovalStatus] = useState<FormStatus>(
    managerFormApproval?.status || FormStatus.PENDING,
  );
  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
  };
  // Handle approval status change
  const handleApprovalStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value as FormStatus;
    setApprovalStatus(newStatus);
  };
  // Handle updating approval
  const handleAutoSave = async (data: {
    comment: string;
    approvalStatus: FormStatus;
  }) => {
    if (!submissionId || !managerFormApproval) return;
    const updatedData = new FormData();
    updatedData.append("id", managerFormApproval.Approvals[0].id);
    updatedData.append("formSubmissionId", submissionId.toString());
    updatedData.append("comment", data.comment);
    // Map approvalStatus to isApproved (boolean)
    const isApproved = data.approvalStatus === FormStatus.APPROVED;
    updatedData.append("isApproved", isApproved.toString()); // Convert boolean to string
    try {
      await updateFormApproval(updatedData);
    } catch (error) {
      console.error("Error during auto-save:", error);
    }
  };

  const { autoSave: debouncedAutoSave } = useAutoSave(handleAutoSave, 500);
  useEffect(() => {
    debouncedAutoSave({ comment, approvalStatus });
  }, [comment, approvalStatus, debouncedAutoSave]);

  return (
    <div className="h-full w-full bg-white flex flex-col rounded-lg ">
      <TitleBoxes
        onClick={() => router.back()}
        className="h-16 border-b-2 pb-2 rounded-lg border-neutral-100 flex-shrink-0 sticky top-0 z-10 bg-white"
      >
        <div className="flex flex-col items-center">
          <Titles size={"h3"} className="text-center">
            {formData.name}
          </Titles>
        </div>
      </TitleBoxes>

      <div className="flex-grow flex flex-col overflow-y-auto no-scrollbar">
        <Contents width={"section"}>
          <div className="h-full overflow-y-auto no-scrollbar py-4 px-1">
            {/* Form Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
              <div className="mb-3">
                <h3 className="text-blue-600 font-semibold text-sm">
                  Form Details
                </h3>
              </div>
              <FormFieldRenderer
                formData={formData}
                formValues={formValues}
                setFormValues={() => {}}
                useNativeInput={true}
                readOnly={true}
              />

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {`${t("OriginallySubmitted")} ${format(
                    managerFormApproval?.submittedAt?.toString() ||
                      new Date().toISOString(),
                    "M/dd/yy",
                  )}`}
                </p>
                <p className="text-xs text-gray-500">
                  {`${t("LastEdited")} ${format(
                    managerFormApproval?.Approvals?.[0]?.updatedAt?.toString() ||
                      new Date().toISOString(),
                    "M/dd/yy",
                  )}`}
                </p>
              </div>
            </div>

            {/* Manager Approval Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
              <div className="mb-3">
                <h3 className="text-blue-600 font-semibold text-sm">
                  Manager Approval
                </h3>
              </div>

              {/* Manager Name */}
              <div className="mb-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {t("Manager")}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center">
                  <span className="text-sm text-gray-700">
                    {`${managerFormApproval?.Approvals?.[0]?.Approver?.firstName} ${managerFormApproval?.Approvals?.[0]?.Approver?.lastName}`}
                  </span>
                </div>
              </div>

              {/* Approval Status */}
              <div className="mb-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {t("ApprovalStatus")}
                  </span>
                </div>
                <Selects
                  id="approvalStatus"
                  value={approvalStatus}
                  onChange={handleApprovalStatusChange}
                  className="w-full border border-gray-200 rounded-md p-2 bg-white"
                >
                  <option value="APPROVED">{t("Approved")}</option>
                  <option value="DENIED">{t("Denied")}</option>
                </Selects>
              </div>

              {/* Manager Comments */}
              <div className="mb-3">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {t("ManagerComments")}
                  </span>
                </div>
                <div className="relative">
                  <TextAreas
                    name="comment"
                    id="comment"
                    value={comment}
                    onChange={handleCommentChange}
                    maxLength={40}
                    className="w-full border border-gray-200 rounded-md p-2 min-h-[80px] resize-none"
                  />
                  <span className="absolute right-2 bottom-2 px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-500">
                    {comment.length} / 40
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs italic text-gray-500">
                  {`${t("ApprovalStatusLastUpdated")} ${format(
                    managerFormApproval?.updatedAt?.toString() ||
                      new Date().toISOString(),
                    "M/dd/yy",
                  )}`}
                </p>
              </div>
            </div>
          </div>
        </Contents>
      </div>
    </div>
  );
}
