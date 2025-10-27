"use client";
import { useEffect, useState, useCallback } from "react";
import { FormFieldRenderer } from "@/app/(routes)/hamburger/inbox/_components/FormFieldRenderer";
import { FormEvent } from "react";
import { deleteFormSubmission, saveDraft } from "@/actions/hamburgerActions";
import { Buttons } from "@/components/(reusable)/buttons";
import { Contents } from "@/components/(reusable)/contents";
import { Inputs } from "@/components/(reusable)/inputs";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import { Titles } from "@/components/(reusable)/titles";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
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
  isApprovalRequired: boolean;
  isSignatureRequired: boolean;
  groupings: FormGrouping[];
}

export default function FormDraft({
  formData,
  handleSubmit,
  formTitle,
  setFormTitle,
  formValues,
  updateFormValues,
  userId,
  submissionId,
}: {
  formData: FormTemplate;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  formValues: Record<string, string | boolean>;
  formTitle: string;
  setFormTitle: (title: string) => void;
  updateFormValues: (values: Record<string, string | boolean>) => void;
  userId: string;
  submissionId: number;
}) {
  type FormValues = Record<string, string | boolean>;
  const t = useTranslations("Hamburger-Inbox");
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteRequestModal, setDeleteRequestModal] = useState(false);

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await fetch("/api/getUserSignature");
        const data = await response.json();
        setSignature(data.signature);
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };
    fetchSignature();
  }, [signature]);

  // Update formValues when showSignature changes
  const setSignatureData = (value: boolean) => {
    setShowSignature(value);
    // Add signature status to formValues as boolean
    updateFormValues({
      ...formValues,
      signature: value, // Store as boolean
    });
  };

  const saveDraftData = async (values: FormValues, title: string) => {
    if ((Object.keys(values).length > 0 || title) && formData) {
      try {
        // Include the title in the values object
        const dataToSave = { ...values };
        // Convert boolean values to strings for the API
        const stringValues: Record<string, string> = {};

        for (const [key, value] of Object.entries(dataToSave)) {
          if (typeof value === "boolean") {
            stringValues[key] = value.toString();
          } else if (value !== null && value !== undefined) {
            stringValues[key] = String(value);
          } else {
            stringValues[key] = "";
          }
        }

        await saveDraft(
          stringValues,
          formData.id,
          userId,
          formData.formType,
          submissionId,
          title,
        );
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }
  };

  // Create a save function that can be called manually instead of using auto-save
  const saveFormData = useCallback(async () => {
    if (!isSubmitting) {
      await saveDraftData(formValues, formTitle);
    }
  }, [formValues, formTitle, isSubmitting, saveDraftData]);

  // No longer using auto-save hook for each change

  //validation map function to required all fields that are required within form template
  const validateForm = (
    formValues: Record<string, string | boolean>,
    formData: FormTemplate,
  ): boolean => {
    // Check signature requirement separately
    if (formData.isSignatureRequired && !showSignature) {
      return false;
    }

    for (const group of formData.groupings) {
      for (const field of group.fields) {
        if (field.required) {
          // Check both field ID and field label as keys
          const fieldValue = formValues[field.id] || formValues[field.label];

          // Handle CHECKBOX field type specially
          if (field.type === "CHECKBOX") {
            // For checkboxes, any defined value is valid (true or false)
            if (fieldValue === undefined || fieldValue === null) {
              return false;
            }
            // All other validation is skipped for checkboxes
            continue;
          }

          // For string values
          if (typeof fieldValue === "string") {
            if (!fieldValue || fieldValue.trim() === "") {
              return false;
            }
          }
          // For boolean values (other than checkboxes)
          else if (typeof fieldValue === "boolean") {
            // Booleans are considered valid
            continue;
          }
          // For undefined/null values
          else if (fieldValue === undefined || fieldValue === null) {
            return false;
          }

          // For JSON fields, check if they contain meaningful data
          if (
            typeof fieldValue === "string" &&
            (field.type === "SEARCH_PERSON" ||
              field.type === "SEARCH_ASSET" ||
              field.type === "MULTISELECT")
          ) {
            try {
              const parsed = JSON.parse(fieldValue);
              if (Array.isArray(parsed) && parsed.length === 0) {
                return false;
              }
              if (parsed === null || parsed === undefined) {
                return false;
              }
            } catch (e) {
              // If it's not valid JSON, treat as string validation
              if (!fieldValue || fieldValue.trim() === "") {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  };

  const handleDeleteForm = async (id: number) => {
    try {
      await deleteFormSubmission(id);
      router.back();
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };

  return (
    <>
      <form
        onSubmit={async (e) => {
          setIsSubmitting(true);
          try {
            await handleSubmit(e);
          } finally {
            setIsSubmitting(false);
          }
        }}
        className="h-full w-full bg-white flex flex-col rounded-lg "
      >
        <TitleBoxes
          className="h-16 border-b-2 pb-2 rounded-lg border-neutral-100 flex-shrink-0 sticky top-0 z-10 bg-white"
          onClick={async () => {
            // Save draft before navigating back
            await saveFormData();
            router.push("/hamburger/inbox");
          }}
        >
          <div className="w-full h-full flex items-end  justify-center">
            <Titles size={"md"} className="truncate max-w-[200px]">
              {formData.name}
            </Titles>
          </div>
        </TitleBoxes>

        <div className="bg-slate-50 flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start items-center">
          <Contents width={"section"} className="pb-24 w-full max-w-md mx-auto">
            <div className="py-4 px-1 flex flex-col">
              {/* Title input section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {t("TitleOptional")}
                  </span>
                </div>
                <Inputs
                  type="text"
                  placeholder={t("EnterATitleHere")}
                  name="title"
                  value={formTitle}
                  className="text-center text-base border border-gray-200 rounded-md p-2 w-full"
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Form fields section */}
              <div
                className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${formData.isSignatureRequired ? "mb-4" : "mb-40"}`}
              >
                <div className="mb-3">
                  <h3 className="text-blue-600 font-semibold text-sm">
                    Form Details
                  </h3>
                </div>
                <FormFieldRenderer
                  formData={formData}
                  formValues={formValues}
                  setFormValues={updateFormValues}
                  readOnly={false}
                  useNativeInput={true}
                />
              </div>

              {/* Signature section - only shown if required */}
              {formData.isSignatureRequired && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-40">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t("Signature")}
                    </span>
                  </div>
                  {showSignature ? (
                    <div
                      onClick={() => setSignatureData(false)}
                      className="w-full border-2 rounded-md border-gray-300 cursor-pointer p-2 flex justify-center"
                    >
                      {signature && (
                        <img
                          src={signature}
                          alt="signature"
                          className="h-20 w-full object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <Buttons
                      onClick={() => setSignatureData(true)}
                      type="button"
                      className="w-full h-16 rounded-md shadow-sm bg-gray-50 hover:bg-gray-100 border border-gray-300 transition-colors"
                    >
                      <span className="text-gray-700 font-medium">
                        {t("TapToSign")}
                      </span>
                    </Buttons>
                  )}
                </div>
              )}
            </div>
          </Contents>
        </div>

        {/* Action buttons */}

        <div className="w-full h-20 flex px-2 gap-x-4 flex-shrink-0 sticky bottom-0 z-10 bg-white border-t rounded-lg">
          <Buttons
            type="button"
            background={"red"}
            onClick={() => setDeleteRequestModal(true)}
            className="w-full h-12 rounded-md shadow-sm"
          >
            <Titles size={"sm"}>{t("DeleteDraft")}</Titles>
          </Buttons>
          <Buttons
            type="submit"
            background={
              !validateForm(formValues, formData) ? "darkGray" : "green"
            }
            disabled={!validateForm(formValues, formData) || isSubmitting}
            className="w-full h-12 rounded-md shadow-sm"
          >
            <Titles size={"sm"}>
              {isSubmitting ? t("Submitting") : t("SubmitRequest")}
            </Titles>
          </Buttons>
        </div>
      </form>
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
              onClick={async () => {
                setDeleteRequestModal(false);

                await handleDeleteForm(submissionId);
              }}
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
