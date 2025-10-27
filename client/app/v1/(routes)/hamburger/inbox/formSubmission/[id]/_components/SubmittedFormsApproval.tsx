"use client";
import { FormFieldRenderer } from "@/app/(routes)/hamburger/inbox/_components/FormFieldRenderer";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { Titles } from "@/components/(reusable)/titles";
import { Contents } from "@/components/(reusable)/contents";
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

export default function SubmittedFormsApproval({
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

  // Helper function to validate date string
  const isValidDate = (dateString: string | undefined): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  let managerName = "";
  if (
    managerFormApproval &&
    Array.isArray(managerFormApproval.Approvals) &&
    managerFormApproval.Approvals.length > 0 &&
    managerFormApproval.Approvals[0].Approver
  ) {
    managerName =
      (managerFormApproval.Approvals[0].Approver.firstName || "") +
      " " +
      (managerFormApproval.Approvals[0].Approver.lastName || "");
  }

  const status = managerFormApproval?.status;
  const comment = managerFormApproval?.Approvals[0]?.comment || "";

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      {/* Header */}
      <TitleBoxes
        className="h-20 border-b-2 pb-2 border-neutral-100 flex-shrink-0 sticky top-0 z-10 bg-white rounded-lg"
        onClick={() => router.back()}
      >
        <div className="flex flex-col items-ends pb-2 ">
          <Titles size={"md"} className="text-center">
            {formTitle
              ? formTitle.charAt(0).toUpperCase() +
                formTitle.slice(1).slice(0, 24)
              : formData.name.charAt(0).toUpperCase() +
                formData.name.slice(1).slice(0, 24)}
          </Titles>
          {formTitle !== "" && (
            <Titles size={"xs"} className="text-gray-500">
              {formData.name}
            </Titles>
          )}
        </div>
      </TitleBoxes>

      {/* Scrollable Middle Content */}
      <div className="bg-slate-50 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start items-center rounded-b-lg">
        <Contents width={"section"} className="pb-24 w-full max-w-md mx-auto">
          <div className="py-4 px-1 flex flex-col">
            {/* Summary Card */}
            {formData.isApprovalRequired && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
                {/* Approval Details Section */}

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-blue-600 font-semibold text-sm">
                      Approval Details
                    </h3>
                    <p className="text-xs italic text-gray-500">
                      {`${t("OriginallySubmitted")} ${
                        isValidDate(
                          managerFormApproval?.Approvals[0]?.updatedAt?.toString(),
                        )
                          ? format(
                              new Date(
                                managerFormApproval?.Approvals[0]?.updatedAt?.toString() ||
                                  "",
                              ),
                              "M/dd/yy",
                            )
                          : format(new Date(), "M/dd/yy")
                      }`}
                    </p>
                  </div>

                  {/* Status indicator */}
                  <div className="flex flex-col gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Status:
                      </span>
                      <div
                        className={`py-1 px-3 rounded-md ${
                          status === FormStatus.APPROVED
                            ? "bg-green-100 border border-app-green"
                            : "bg-red-100 border border-app-red"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            status === FormStatus.APPROVED
                              ? "text-app-green"
                              : "text-app-red"
                          }`}
                        >
                          {status === FormStatus.APPROVED
                            ? t("Approved")
                            : t("Denied")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {`${status === FormStatus.APPROVED ? t("ApprovedBy") : t("DeniedBy")}`}
                      </span>
                      <span className="text-sm text-gray-700">
                        {managerName ? managerName : "Admin"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Manager Comments Section */}
                <div className="mb-4">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t("ManagerComments")}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    {comment ? (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comment}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        No comments provided
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submission Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-40">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-blue-600 font-semibold text-sm">
                  Submission Details
                </h3>
                <p className="text-xs italic text-gray-500">
                  {`${t("OriginallySubmitted")} ${
                    isValidDate(managerFormApproval?.submittedAt?.toString())
                      ? format(
                          new Date(
                            managerFormApproval?.submittedAt?.toString() || "",
                          ),
                          "M/dd/yy",
                        )
                      : format(new Date(), "M/dd/yy")
                  }`}
                </p>
              </div>

              {/* Form Fields */}
              <div className="bg-white rounded-lg">
                <FormFieldRenderer
                  formData={formData}
                  formValues={formValues}
                  setFormValues={() => {}}
                  useNativeInput={true}
                  readOnly={true}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </Contents>
      </div>
    </div>
  );
}
