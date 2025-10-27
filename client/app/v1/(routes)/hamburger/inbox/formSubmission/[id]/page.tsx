"use client";
import { FormEvent, use, useEffect, useState, useMemo } from "react";
import Spinner from "@/components/(animations)/spinner";
import { useRouter, useSearchParams } from "next/navigation";
import FormDraft from "./_components/formDraft";
import ManagerFormApproval from "./_components/managerFormApproval";
import SubmittedForms from "./_components/submittedForms";
import ManagerFormEditApproval from "./_components/managerFormEdit";
import { saveDraftToPending } from "@/actions/hamburgerActions";
import { useSession } from "next-auth/react";
import { Bases } from "@/components/(reusable)/bases";
import { Contents } from "@/components/(reusable)/contents";
import { Grids } from "@/components/(reusable)/grids";
import { Holds } from "@/components/(reusable)/holds";
import { TitleBoxes } from "@/components/(reusable)/titleBoxes";
import SubmittedFormsApproval from "./_components/SubmittedFormsApproval";
import { Titles } from "@/components/(reusable)/titles";
import { useTranslations } from "next-intl";
import type { FormIndividualTemplate } from "@/app/(routes)/admins/forms/[id]/_component/hooks/types";

// Define FormFieldValue type to match RenderFields expectations
type FormFieldValue =
  | string
  | Date
  | string[]
  | object
  | boolean
  | number
  | null;

// Interface for backward compatibility with existing child components
interface FormTemplate {
  id: string;
  name: string;
  formType: string;
  isActive: boolean;
  isSignatureRequired: boolean;
  isApprovalRequired: boolean;
  groupings: FormGrouping[];
}

interface FormGrouping {
  id: string;
  title: string;
  order: number;
  fields: FormField[];
}

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

export default function DynamicForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = use(params).id;
  // Search params from URL
  const t = useTranslations("Hamburger-Inbox");
  const formSubmissions = useSearchParams();
  const submissionId = Number(formSubmissions.get("submissionId"));
  const submissionStatus = formSubmissions.get("status");
  const submissionApprovingStatus = formSubmissions.get("approvingStatus");
  const formApprover = formSubmissions.get("formApprover");

  // State variables
  const [formData, setFormData] = useState<FormIndividualTemplate | null>(null);
  const [formTitle, setFormTitle] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, FormFieldValue>>(
    {},
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [submittedForm, setSubmittedForm] = useState<string | null>(null);
  const [managerFormApproval, setManagerFormApproval] =
    useState<ManagerFormApprovalSchema | null>(null);

  // Get user that is logged in
  const { data: session } = useSession();
  const userId = session?.user.id;
  const router = useRouter();

  // Determine which API endpoints to fetch based on the current state
  const determineApiEndpoints = () => {
    const endpoints = {
      form: `/api/form/${id}`,
      submission: null as string | null,
      managerApproval: null as string | null,
    };

    if (!submissionId) return endpoints;

    // Determine submission endpoint based on status and approval status
    if (submissionStatus === "DRAFT") {
      endpoints.submission = `/api/formDraft/${submissionId}`;
    } else if (submissionApprovingStatus === "true") {
      endpoints.submission = `/api/teamSubmission/${submissionId}`;
    } else {
      endpoints.submission = `/api/formSubmission/${submissionId}`;
    }

    // Determine if manager approval data is needed
    if (
      submissionStatus === "APPROVED" ||
      submissionStatus === "DENIED" ||
      submissionApprovingStatus === "true"
    ) {
      endpoints.managerApproval = `/api/managerFormApproval/${submissionId}`;
    }

    return endpoints;
  };

  // Fetch data in parallel and process it efficiently
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoints = determineApiEndpoints();
        const fetchOptions = {
          // Use default caching instead of forcing no-cache
          // This will improve performance and reduce unnecessary reloads
        };

        // Build array of fetch promises based on required endpoints
        const fetchPromises = [fetch(endpoints.form, fetchOptions)];

        if (endpoints.submission) {
          fetchPromises.push(fetch(endpoints.submission, fetchOptions));
        }

        if (endpoints.managerApproval) {
          fetchPromises.push(fetch(endpoints.managerApproval, fetchOptions));
        }

        // Execute all fetches in parallel
        const responses = await Promise.all(fetchPromises);

        // Check if any response failed
        for (const response of responses) {
          if (!response.ok) {
            throw new Error(
              `API request failed with status ${response.status}`,
            );
          }
        }

        // Parse all responses in parallel
        const [formData, ...otherData] = await Promise.all(
          responses.map((res) => res.json()),
        );

        // Set form data first
        setFormData(formData);

        // If no submission ID, stop here
        if (!submissionId) {
          setLoading(false);
          return;
        }

        // Extract submission data and manager approval data from otherData
        let submissionData = null;
        let managerApprovalData = null;

        if (endpoints.submission && endpoints.managerApproval) {
          [submissionData, managerApprovalData] = otherData;
        } else if (endpoints.submission) {
          [submissionData] = otherData;
        } else if (endpoints.managerApproval) {
          [managerApprovalData] = otherData;
        }

        // Process and set submission data if available
        if (submissionData) {
          // Do these transformations once
          const legacyTemplate = convertToLegacyFormTemplate(formData);
          const convertedValues = convertFormValuesToIdBased(
            submissionData.data,
            legacyTemplate,
          );

          // Update all related state at once to minimize re-renders
          setFormValues(convertedValues);
          setFormTitle(
            submissionData.title ||
              (submissionData.user?.firstName && submissionData.user?.lastName
                ? `${submissionData.user.firstName} ${submissionData.user.lastName}`
                : "") ||
              "",
          );
          setSignature(submissionData.User?.signature || null);
          setSubmittedForm(submissionData.submittedAt || "");
        }

        // Set manager approval data if available
        if (managerApprovalData) {
          setManagerFormApproval(managerApprovalData);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        setError("Failed to fetch form data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, submissionId, submissionStatus, submissionApprovingStatus]);

  // Legacy method for backward compatibility with existing components
  const updateFormValuesLegacy = (
    newValues: Record<string, string | boolean>,
  ) => {
    setFormValues((prevValues) => {
      // Convert new values from potentially label-based keys to ID-based keys
      const convertedValues: Record<string, FormFieldValue> = {};

      Object.entries(newValues).forEach(([key, value]) => {
        convertedValues[key] = value;
      });

      return {
        ...prevValues,
        ...convertedValues,
      };
    });
  };

  // Convert FormFieldValue to string for legacy components
  const convertFormValuesToString = (
    values: Record<string, FormFieldValue>,
  ): Record<string, string | boolean> => {
    const stringValues: Record<string, string | boolean> = {};

    // Get the form template for mapping
    const template = formData ? convertToLegacyFormTemplate(formData) : null;

    // Create mappings from field IDs to field labels and vice versa
    const idToLabelMap: Record<string, string> = {};
    const labelToIdMap: Record<string, string> = {};
    const allFieldIds = new Set<string>();

    if (template) {
      template.groupings.forEach((group) => {
        group.fields.forEach((field) => {
          idToLabelMap[field.id] = field.label;
          labelToIdMap[field.label] = field.id;
          allFieldIds.add(field.id);
        });
      });
    }

    Object.entries(values).forEach(([key, value]) => {
      // Find the field to understand its type - check both by ID and label
      const field = template?.groupings
        ?.flatMap((group) => group.fields || [])
        .find((f) => f.id === key || f.label === key);

      // Convert the value to string based on field type
      let stringValue = "";

      if (field) {
        switch (field.type) {
          case "SEARCH_PERSON":
          case "SEARCH_ASSET":
            // For search fields, store as JSON string
            if (Array.isArray(value)) {
              stringValue = JSON.stringify(value);
            } else if (value && typeof value === "object") {
              stringValue = JSON.stringify(value);
            } else {
              stringValue = value ? String(value) : "";
            }
            break;
          case "MULTISELECT":
            // For multiselect, store as JSON array
            if (Array.isArray(value)) {
              stringValue = JSON.stringify(value);
            } else {
              stringValue = value ? String(value) : "";
            }
            break;
          case "CHECKBOX":
            // Convert to string for compatibility
            if (typeof value === "boolean") {
              stringValue = value ? "true" : "false";
            } else {
              stringValue = value ? "true" : "false";
            }
            break;
          case "NUMBER":
            stringValue = value ? String(value) : "0";
            break;
          case "DATE":
          case "DATE_TIME":
            if (value instanceof Date) {
              stringValue = value.toISOString();
            } else {
              stringValue = value ? String(value) : "";
            }
            break;
          default:
            stringValue = value ? String(value) : "";
        }
      } else {
        // Fallback conversion
        if (typeof value === "string") {
          stringValue = value;
        } else if (typeof value === "number" || typeof value === "boolean") {
          stringValue = String(value);
        } else if (value instanceof Date) {
          stringValue = value.toISOString();
        } else if (Array.isArray(value)) {
          stringValue = JSON.stringify(value);
        } else if (value && typeof value === "object") {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = "";
        }
      }

      // For rendering, always use field.id as the key to match RenderFields expectations
      // The RenderFields component will access values using field.id with field.label fallback
      if (allFieldIds.has(key)) {
        // Key is already a field ID
        stringValues[key] = stringValue;
      } else if (labelToIdMap[key]) {
        // Key is a field label, convert to field ID
        stringValues[labelToIdMap[key]] = stringValue;
      } else {
        // Unknown key, keep as-is
        stringValues[key] = stringValue;
      }
    });

    return stringValues;
  };

  // Convert API response to FormTemplate for legacy components
  const convertToLegacyFormTemplate = (
    template: FormIndividualTemplate | FormTemplate,
  ): FormTemplate => {
    // Check if the template is already in the correct format from the API
    if ((template as FormTemplate).groupings) {
      return template as FormTemplate;
    }

    // Otherwise, convert from FormIndividualTemplate format
    const typedTemplate = template as FormIndividualTemplate;
    return {
      id: typedTemplate.id,
      name: typedTemplate.name,
      formType: typedTemplate.formType,
      isActive: typedTemplate.isActive === "ACTIVE",
      isSignatureRequired: typedTemplate.isSignatureRequired,
      isApprovalRequired: typedTemplate.isApprovalRequired,
      groupings:
        typedTemplate.FormGrouping?.map(
          (group): FormGrouping => ({
            id: group.id,
            title: group.title || "",
            order: group.order,
            fields:
              group.Fields?.map(
                (field): FormField => ({
                  id: field.id,
                  label: field.label,
                  name: field.id, // Use field ID as name for consistency with admin
                  type: field.type,
                  required: field.required,
                  order: field.order,
                  placeholder: field.placeholder || undefined,
                  maxLength: field.maxLength || undefined,
                  options:
                    field.Options?.map((opt: { value: string }) => opt.value) ||
                    undefined,
                }),
              ) || [],
          }),
        ) || [],
    };
  };

  // Convert form values from label-based keys to ID-based keys
  const convertFormValuesToIdBased = (
    values: Record<string, FormFieldValue>,
    template: FormTemplate,
  ): Record<string, FormFieldValue> => {
    const result: Record<string, FormFieldValue> = {};

    // Create mappings from field labels to field IDs and field IDs to field labels
    const labelToIdMap: Record<string, string> = {};
    const idToLabelMap: Record<string, string> = {};
    const allFieldIds = new Set<string>();

    template.groupings.forEach((group) => {
      group.fields.forEach((field) => {
        labelToIdMap[field.label] = field.id;
        idToLabelMap[field.id] = field.label;
        allFieldIds.add(field.id);
      });
    });

    // Convert values using the mapping, handling both UUID keys and label keys
    Object.entries(values).forEach(([key, value]) => {
      // Check if key is already a field ID (UUID format)
      if (allFieldIds.has(key)) {
        result[key] = value;
      } else {
        // Try to find field ID by label
        const fieldId = labelToIdMap[key];
        if (fieldId) {
          result[fieldId] = value;
        } else {
          // If no mapping found, use the original key (fallback)
          result[key] = value;
        }
      }
    });

    return result;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData) {
      console.error("Form data is not available");
      return;
    }

    try {
      if (!userId || !submissionId) {
        console.error("User ID or submission ID is null");
        return;
      }

      // Get values with booleans preserved for checkboxes
      const mixedValues = convertFormValuesToString(formValues);

      // Convert all values to strings for API compatibility
      const dataToSaveAPI: Record<string, string> = {};
      Object.entries(mixedValues).forEach(([key, value]) => {
        dataToSaveAPI[key] =
          typeof value === "boolean" ? value.toString() : String(value || "");
      });

      // Save data and wait for completion before navigating
      const result = await saveDraftToPending(
        dataToSaveAPI,
        formData.isApprovalRequired,
        formData.id,
        userId,
        formData.formType,
        submissionId,
        formTitle,
      );

      if (result && formData.isApprovalRequired) {
        const response = await fetch("/api/notifications/send-multicast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: "form-submissions",
            title: "New Form Submission",
            message: `${result.User.firstName} ${result.User.lastName} has submitted a form titled "${result.formTemplateId}" for approval.`,
            link: `/admins/forms/${result.formTemplateId}`,
            referenceId: result.id,
          }),
        });
        await response.json();

        // Ensure the save is complete before navigating
      }
      setTimeout(() => {
        router.back(); // Redirect after a small delay to ensure save completes
      }, 100);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Create a memoized function to determine which component to render
  const getFormComponent = useMemo(() => {
    if (!formData) return null;

    const legacyTemplate = convertToLegacyFormTemplate(formData);
    const stringFormValues = convertFormValuesToString(formValues);

    // Convert to pure string values for legacy components
    const stringOnlyValues: Record<string, string> = {};
    Object.entries(stringFormValues).forEach(([key, value]) => {
      stringOnlyValues[key] =
        typeof value === "boolean"
          ? value
            ? "true"
            : "false"
          : String(value || "");
    });

    // Common props for all components
    const commonProps = {
      formData: legacyTemplate,
      formTitle,
      setFormTitle,
      formValues: stringOnlyValues,
      updateFormValues: updateFormValuesLegacy,
      userId: userId || "",
      submissionId: submissionId || null,
      signature,
      submittedForm,
      submissionStatus,
      managerFormApproval,
    };

    // Determine which component to show based on status
    if (submissionStatus === "DRAFT") {
      return (
        <FormDraft
          {...commonProps}
          handleSubmit={handleSubmit}
          submissionId={submissionId}
        />
      );
    }

    if (submissionApprovingStatus === null && submissionStatus !== "DRAFT") {
      if (submissionStatus === "PENDING") {
        return <SubmittedForms {...commonProps} />;
      }
      return <SubmittedFormsApproval {...commonProps} />;
    }

    if (
      submissionApprovingStatus === "true" &&
      submissionStatus === "PENDING" &&
      formApprover
    ) {
      return <ManagerFormApproval {...commonProps} />;
    }

    if (
      submissionApprovingStatus === "true" &&
      submissionStatus !== "PENDING" &&
      submissionStatus !== "DRAFT" &&
      formApprover
    ) {
      return <ManagerFormEditApproval {...commonProps} />;
    }

    return null;
  }, [
    formData,
    formValues,
    formTitle,
    submissionStatus,
    submissionApprovingStatus,
    formApprover,
    signature,
    submittedForm,
    submissionId,
    userId,
    managerFormApproval,
    handleSubmit,
  ]);

  // Loading state
  if (loading || !formData) {
    return (
      <Bases>
        <Contents>
          <Holds
            background={"white"}
            className="w-full h-full justify-center items-center animate-pulse"
          >
            <TitleBoxes
              className="h-20 border-b-2 border-neutral-100"
              onClick={() => {
                router.back();
              }}
            >
              <div className="w-full h-full flex items-end pb-2 justify-center">
                <Titles size={"md"} className="truncate max-w-[200px]">
                  {t("Loading")}
                </Titles>
              </div>
            </TitleBoxes>

            <form className="bg-slate-50 h-full w-full overflow-y-auto no-scrollbar rounded-b-lg">
              <Holds className="row-start-1 row-end-7 h-full w-full justify-center ">
                <Spinner />
              </Holds>
            </form>
          </Holds>
        </Contents>
      </Bases>
    );
  }

  // Render the form based on submission status
  return (
    <Bases>
      <Contents>{getFormComponent}</Contents>
    </Bases>
  );
}
