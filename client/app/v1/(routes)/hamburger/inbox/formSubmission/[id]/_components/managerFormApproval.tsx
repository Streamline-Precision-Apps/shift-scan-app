"use client";
import { FormFieldRenderer } from "@/app/(routes)/hamburger/inbox/_components/FormFieldRenderer";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { createFormApproval } from "@/actions/hamburgerActions";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Buttons } from "@/components/(reusable)/buttons";
import { TextAreas } from "@/components/(reusable)/textareas";
import { Titles } from "@/components/(reusable)/titles";
import { Contents } from "@/components/(reusable)/contents";
import { format } from "date-fns";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { useTranslations } from "next-intl";
import { Images } from "@/components/(reusable)/images";

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

export default function ManagerFormApproval({
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
  const { data: session } = useSession();
  const managerName = session?.user.id;
  const [isSignatureShowing, setIsSignatureShowing] = useState<boolean>(false);
  const [managerSignature, setManagerSignature] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [comment, setComment] = useState<string>(
    managerFormApproval?.Approvals?.[0]?.comment || "",
  );
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await fetch("/api/getUserSignature");
        if (!response.ok) {
          throw new Error("Failed to fetch signature");
        }
        const signature = await response.json();
        setManagerSignature(signature.signature);
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };

    fetchSignature();
  }, []);

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newComment = e.target.value;
    setComment(newComment);
  };

  // Handle final approval or denial
  const handleApproveOrDeny = async (
    approval: FormStatus.APPROVED | FormStatus.DENIED,
  ) => {
    if (!isSignatureShowing) {
      setErrorMessage(t("PleaseProvideASignatureBeforeApproving"));
      return;
    }

    if (!comment || comment.length === 0) {
      setErrorMessage(t("PleaseAddACommentBeforeApproving"));
      return;
    }

    const formData = new FormData();
    formData.append("formSubmissionId", submissionId?.toString() || "");
    formData.append("signedBy", managerName || "");
    formData.append("signature", managerSignature || "");
    formData.append("comment", comment);

    try {
      await createFormApproval(formData, approval);
      router.back();
    } catch (error) {
      console.error("Error during final approval:", error);
      setErrorMessage(t("FailedToSubmitApprovalPleaseTryAgain"));
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col rounded-lg ">
      <TitleBoxes
        onClick={() => router.back()}
        className="h-16 border-b-2 pb-2 rounded-lg border-neutral-100 flex-shrink-0 sticky top-0 z-10 bg-white"
      >
        <div className="flex flex-col items-center">
          <Titles size={"md"} className="text-center">
            {formData.name}
          </Titles>
        </div>
      </TitleBoxes>

      <div className="bg-slate-50 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start items-center rounded-b-lg">
        <Contents width={"section"} className="pb-24 w-full max-w-md mx-auto">
          <div className="py-4 px-1 flex flex-col">
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
                readOnly={true}
                disabled={true}
                useNativeInput={true}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-40">
              <div className="mb-3">
                <h3 className="text-blue-600 font-semibold text-sm">
                  Manager Approval
                </h3>
              </div>

              {/* Manager Comments */}
              <div className="mb-4">
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
                    rows={4}
                    className="w-full border border-gray-200 rounded-md p-2 text-sm min-h-[80px] resize-none"
                  />
                  <span className="absolute right-2 bottom-2 px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-500">
                    {comment.length} / 40
                  </span>
                </div>
              </div>

              {/* Signature Section */}
              <div className="mb-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {t("Signature")}
                  </span>
                </div>

                {!isSignatureShowing ? (
                  <Buttons
                    className="w-full h-16 rounded-md shadow-sm bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors"
                    onClick={() => setIsSignatureShowing(true)}
                  >
                    <span className="text-gray-700 font-medium">
                      {t("TapToSign")}
                    </span>
                  </Buttons>
                ) : (
                  <div className="relative border-2 rounded-md border-gray-300 p-3 flex justify-center items-center">
                    <img
                      className="h-20 w-full object-contain"
                      src={managerSignature || ""}
                      alt="Signature"
                    />
                    <button
                      onClick={() => setIsSignatureShowing(false)}
                      className="absolute top-2 right-2 bg-orange-400 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:bg-orange-500 transition-colors"
                    >
                      <Images
                        className="w-5 h-5 object-contain"
                        titleImg="/eraser.svg"
                        titleImgAlt="eraser Icon"
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
            </div>
          </div>
        </Contents>
      </div>
      <div className="w-full h-20 flex px-2 gap-x-4 flex-shrink-0 sticky bottom-0 z-10 bg-white border-t rounded-lg">
        <div className="flex gap-4 w-full items-center justify-center p-2">
          <Buttons
            background={
              isSignatureShowing && comment.length > 0 ? "red" : "darkGray"
            }
            disabled={!isSignatureShowing || comment.length === 0}
            className="w-full h-10 rounded-md shadow-sm"
            onClick={() => handleApproveOrDeny(FormStatus.DENIED)}
          >
            <Titles size={"sm"}>{t("Deny")}</Titles>
          </Buttons>
          <Buttons
            background={
              isSignatureShowing && comment.length > 0 ? "green" : "darkGray"
            }
            disabled={!isSignatureShowing || comment.length === 0}
            onClick={() => handleApproveOrDeny(FormStatus.APPROVED)}
            className="w-full h-10 rounded-md shadow-sm"
          >
            <Titles size={"sm"}>{t("Approve")}</Titles>
          </Buttons>
        </div>
      </div>
    </div>
  );
}
