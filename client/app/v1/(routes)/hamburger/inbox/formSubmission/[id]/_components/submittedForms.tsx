"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { FormFieldRenderer } from "@/app/(routes)/hamburger/inbox/_components/FormFieldRenderer";
import { useEffect, useState } from "react";
import { deleteFormSubmission, savePending } from "@/actions/hamburgerActions";
import { Titles } from "@/components/(reusable)/titles";
import { useRouter } from "next/navigation";
import { Images } from "@/components/(reusable)/images";
import { format } from "date-fns";
import { useAutoSave } from "@/hooks/(inbox)/useAutoSave";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
export default function SubmittedForms({
  formData,
  formTitle,
  setFormTitle,
  formValues,
  updateFormValues,
  userId,
  signature,
  submittedForm,
  submissionId,
  submissionStatus,
}: {
  formData: FormTemplate;
  formValues: Record<string, string | boolean>;
  formTitle: string;
  setFormTitle: (title: string) => void;
  updateFormValues: (values: Record<string, string | boolean>) => void;
  userId: string;
  signature: string | null;
  submittedForm: string | null;
  submissionId: number | null;
  submissionStatus: string | null;
}) {
  const t = useTranslations("Hamburger-Inbox");
  const router = useRouter();
  const [deleteRequestModal, setDeleteRequestModal] = useState(false);

  // Track if deleted to prevent auto-save after delete
  const [isDeleted, setIsDeleted] = useState(false);

  type FormValues = Record<string, string | boolean>;

  // Convert mixed values to strings for API
  const convertValuesToString = (
    values: FormValues,
  ): Record<string, string> => {
    const stringValues: Record<string, string> = {};
    Object.entries(values).forEach(([key, value]) => {
      stringValues[key] =
        typeof value === "boolean" ? String(value) : String(value || "");
    });
    return stringValues;
  };

  // Helper function to validate date string
  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const saveDraftData = async (values: FormValues, title: string) => {
    // Don't save if the form has been deleted
    if (isDeleted) {
      console.log("Preventing save for deleted form");
      return;
    }

    if ((Object.keys(values).length > 0 || title) && formData) {
      try {
        // Convert boolean values to strings for API
        const stringValues = convertValuesToString(values);

        await savePending(
          stringValues,
          formData.id,
          userId,
          formData.formType,
          submissionId ? submissionId : undefined,
          title,
        );
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }
  };

  // Use the auto-save hook with the FormValues type
  const { autoSave, cancel } = useAutoSave<{
    values: FormValues;
    title: string;
  }>((data) => saveDraftData(data.values, data.title), 500);

  // Trigger auto-save when formValues or formTitle changes, unless deleted
  useEffect(() => {
    if (!isDeleted) {
      autoSave({ values: formValues, title: formTitle });
    }
  }, [formValues, formTitle, autoSave, isDeleted]);

  const handleDelete = async () => {
    try {
      if (!submissionId) {
        console.error("No submission ID found");
        return;
      }

      // Cancel any pending auto-saves immediately
      cancel();
      // Set the deleted flag to prevent future auto-saves
      setIsDeleted(true);

      const deleted = await deleteFormSubmission(submissionId);
      if (deleted) {
        // Navigate away after successful deletion
        return router.back();
      }
    } catch (error) {
      console.error("Error deleting form submission:", error);
      // Reset deleted flag if deletion fails
      setIsDeleted(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white rounded-lg">
        {/* Header */}
        <TitleBoxes
          className="h-20 border-b-2 pb-2 border-neutral-100 flex-shrink-0 rounded-lg sticky top-0 z-10 bg-white"
          onClick={() => {
            router.back();
          }}
        >
          <div className="flex  flex-col items-center justify-center h-full">
            <Titles size={"lg"} className="text-center truncate max-w-[70vw]">
              {formTitle
                ? formTitle.charAt(0).toUpperCase() +
                  formTitle.slice(1).slice(0, 24)
                : formData.name.charAt(0).toUpperCase() +
                  formData.name.slice(1).slice(0, 24)}
            </Titles>
            {formTitle !== "" && (
              <Titles
                size={"xs"}
                className="text-gray-500 truncate max-w-[90vw]"
              >
                {formData.name}
              </Titles>
            )}
          </div>
        </TitleBoxes>

        {/* Scrollable Middle Content */}
        <div className="bg-slate-50 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start items-center rounded-b-lg">
          <Contents width={"section"} className="pb-24 w-full max-w-md mx-auto">
            <div className="py-4 px-1 flex flex-col">
              {/* Submission Details Card */}
              <div
                className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${formData.isSignatureRequired ? "mb-4" : "mb-40"}`}
              >
                {/* Status indicator */}
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <h3 className="text-blue-600 font-semibold text-sm">
                        Details
                      </h3>
                      <p className="text-xs italic text-gray-500">
                        {`${t("OriginallySubmitted")} ${
                          submittedForm && isValidDate(submittedForm)
                            ? format(new Date(submittedForm), "M/dd/yy")
                            : ""
                        }`}
                      </p>
                    </div>
                    <div className="py-1 px-3 rounded-md bg-orange-100 border border-app-orange">
                      <p className="text-sm font-medium text-app-orange">
                        Pending
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="bg-white rounded-lg">
                  <FormFieldRenderer
                    formData={formData}
                    formValues={formValues}
                    setFormValues={updateFormValues}
                    useNativeInput={true}
                    readOnly={true}
                    disabled={true}
                  />
                </div>
              </div>

              {/* Signature Section */}
              {formData.isSignatureRequired && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-40">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t("Signature")}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-2 flex justify-center items-center">
                    {signature ? (
                      <Images
                        titleImgAlt={"Signature"}
                        titleImg={signature}
                        className="w-full h-12 object-contain"
                      />
                    ) : (
                      <p className="text-sm text-gray-400 italic py-2">
                        {t("NoSignature")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Contents>
        </div>

        {/* Footer */}
        {submissionStatus === "PENDING" && (
          <div className="w-full h-16 flex gap-x-4 flex-shrink-0 rounded-lg sticky bottom-0 z-10 bg-white border-t p-4">
            <Buttons
              background={"red"}
              type="button"
              onClick={() => setDeleteRequestModal(true)}
              className="w-full h-10 rounded-md shadow-sm"
              shadow={"none"}
            >
              <Titles size={"sm"}>{t("DeleteRequest")}</Titles>
            </Buttons>
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      <AlertDialog
        open={deleteRequestModal}
        onOpenChange={setDeleteRequestModal}
      >
        <AlertDialogContent className="w-[90%] bg-white rounded-xl max-w-md mx-auto">
          <AlertDialogHeader className="flex-grow flex justify-center items-center">
            <AlertDialogTitle className="text-lg font-medium text-gray-700 text-center">
              {t("AreYouSureYouWantToDeleteThisRequest")}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-4 mt-4 ">
            <AlertDialogCancel className="w-full h-10 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 sm:w-auto border-0 mt-0">
              <span className="font-medium">{t("Cancel")}</span>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full h-10 rounded-md bg-app-red text-white hover:bg-app-red/90 "
            >
              <span className="font-medium">{t("Yes")}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
