"use server";
import prisma from "@/lib/prisma";
import {
  FieldType,
  FormTemplateCategory,
  FormTemplateStatus,
} from "../../prisma/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { FormStatus } from "../../prisma/generated/prisma/client";

// ============================================================================
// Types for form builder
// ----------------------------------------------------------------------------
export interface FormFieldData {
  id: string;
  formGroupingId: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  placeholder?: string;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  multiple?: boolean;
  content?: string | null;
  filter?: string | null;
  Options?: { id: string; value: string }[];
}

export interface FormSettingsData {
  name: string;
  description: string;
  formType: string;
  requireSignature: boolean;
  isApprovalRequired: boolean;
  isActive: string;
}

export interface SaveFormData {
  settings: FormSettingsData;
  fields: FormFieldData[];
  companyId: string;
  formId?: string; // for updates
}
// ----------------------------------------------------------------------------
// Helper function to map field type string to FieldType enum
function mapFieldType(type: string): FieldType {
  const typeMap: Record<string, FieldType> = {
    TEXT: FieldType.TEXT,
    TEXTAREA: FieldType.TEXTAREA,
    NUMBER: FieldType.NUMBER,
    DATE: FieldType.DATE,
    TIME: FieldType.TIME, // Using DATE for time as well
    DROPDOWN: FieldType.DROPDOWN,
    CHECKBOX: FieldType.CHECKBOX,
    RADIO: FieldType.RADIO,
    MULTISELECT: FieldType.MULTISELECT,
    SEARCH_PERSON: FieldType.SEARCH_PERSON,
    SEARCH_ASSET: FieldType.SEARCH_ASSET,
    PARAGRAPH: FieldType.PARAGRAPH,
    HEADER: FieldType.HEADER,
  };

  return typeMap[type.toUpperCase()] || FieldType.TEXT;
}
// ----------------------------------------------------------------------------
export async function saveFormTemplate(data: SaveFormData) {
  try {
    const { settings, fields, companyId } = data;
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Create new form
      const formTemplate = await tx.formTemplate.create({
        data: {
          companyId: companyId || "1", // fallback for now
          name: settings.name,
          description: settings.description || null,
          formType: settings.formType as FormTemplateCategory,
          isActive: settings.isActive as FormTemplateStatus,
          isSignatureRequired: settings.requireSignature,
          isApprovalRequired: settings.isApprovalRequired,
        },
      });
      // Always create a grouping for this form
      const formGrouping = await tx.formGrouping.create({
        data: {
          title: settings.name,
          order: 0,
        },
      });
      // Connect form template to grouping
      await tx.formTemplate.update({
        where: { id: formTemplate.id },
        data: {
          FormGrouping: {
            connect: { id: formGrouping.id },
          },
        },
      });

      // Create all form fields
      for (const field of fields) {
        if (
          ["DROPDOWN", "RADIO", "MULTISELECT"].includes(
            field.type?.toUpperCase?.(),
          ) &&
          !field.Options
        ) {
        }
        const formField = await tx.formField.create({
          data: {
            formGroupingId: formGrouping.id,
            label: field.label,
            type: mapFieldType(field.type),
            required: field.required,
            order: field.order,
            placeholder: field.placeholder,
            multiple: field.multiple || false,
            content: field.content || null,
            filter: field.filter || null,
            minLength: field.minLength ?? undefined,
            maxLength: field.maxLength ?? undefined,
          },
        });

        // Handle field options for dropdowns, radios, multiselects
        if (
          ["DROPDOWN", "RADIO", "MULTISELECT"].includes(
            field.type?.toUpperCase?.(),
          ) &&
          field.Options &&
          field.Options.length > 0
        ) {
          for (const option of field.Options) {
            const optionData =
              typeof option === "string" ? { value: option } : option;
            await tx.formFieldOption.create({
              data: {
                fieldId: formField.id,
                value: optionData.value,
              },
            });
          }
        }
      }
      return;
    });

    revalidatePath("/admins/records/forms");
    return {
      success: true,
      message: "Form saved successfully",
    };
  } catch (error) {
    console.error("Error saving form template:", error);
    return { success: false, error: "Failed to save form template" };
  }
}
export async function updateFormTemplate(data: SaveFormData) {
  try {
    const { settings, fields, formId } = data;
    if (!formId) {
      return { success: false, error: "No formId provided for update" };
    }
    // Update the form template main settings
    await prisma.formTemplate.update({
      where: { id: formId },
      data: {
        name: settings.name,
        formType: settings.formType as FormTemplateCategory,
        isActive: (settings.isActive as FormTemplateStatus) || "DRAFT",
        isSignatureRequired: settings.requireSignature,
        isApprovalRequired: settings.isApprovalRequired,
        description: settings.description,
      },
    });

    // Get the grouping(s) for this form
    const groupings = await prisma.formGrouping.findMany({
      where: { FormTemplate: { some: { id: formId } } },
    });
    let formGroupingId = groupings[0]?.id;
    // If no grouping exists, create one
    if (!formGroupingId) {
      const newGrouping = await prisma.formGrouping.create({
        data: { title: settings.name, order: 0 },
      });
      await prisma.formTemplate.update({
        where: { id: formId },
        data: { FormGrouping: { connect: { id: newGrouping.id } } },
      });
      formGroupingId = newGrouping.id;
    }

    // Fetch all existing fields for this grouping
    const existingFields = await prisma.formField.findMany({
      where: { formGroupingId },
      include: { Options: true },
    });

    // Build a map for quick lookup
    const existingFieldMap = new Map(existingFields.map((f) => [f.id, f]));
    const submittedFieldIds = new Set(fields.map((f) => f.id));

    // Delete fields that are not in the submitted fields
    for (const oldField of existingFields) {
      if (!submittedFieldIds.has(oldField.id)) {
        await prisma.formFieldOption.deleteMany({
          where: { fieldId: oldField.id },
        });
        await prisma.formField.delete({ where: { id: oldField.id } });
      }
    }

    // Upsert submitted fields
    for (const field of fields) {
      let formFieldId = field.id;
      const isExisting = existingFieldMap.has(field.id);
      if (isExisting) {
        // Update the field
        await prisma.formField.update({
          where: { id: field.id },
          data: {
            label: field.label,
            type: mapFieldType(field.type),
            required: field.required,
            order: field.order,
            placeholder: field.placeholder,
            minLength: field.minLength,
            maxLength: field.maxLength,
            multiple: field.multiple,
            content: field.content,
            filter: field.filter,
            formGroupingId,
          },
        });
        // Remove all options for this field (will re-add below)
        await prisma.formFieldOption.deleteMany({
          where: { fieldId: field.id },
        });
      } else {
        // Create the field
        const created = await prisma.formField.create({
          data: {
            id: field.id,
            formGroupingId,
            label: field.label,
            type: mapFieldType(field.type),
            required: field.required,
            order: field.order,
            placeholder: field.placeholder,
            maxLength: field.maxLength,
            minLength: field.minLength,
            multiple: field.multiple || false,
            content: field.content || null,
            filter: field.filter || null,
          },
        });
        formFieldId = created.id;
      }

      // Handle field options for dropdowns, radios, multiselects
      if (
        ["DROPDOWN", "RADIO", "MULTISELECT"].includes(field.type) &&
        field.Options &&
        field.Options.length > 0
      ) {
        for (const option of field.Options) {
          await prisma.formFieldOption.create({
            data: {
              fieldId: formFieldId,
              value: option.value,
            },
          });
        }
      }

      // Handle additional types
      if (field.type === "TEXTAREA" || field.type === "TEXT") {
        await prisma.formField.update({
          where: { id: formFieldId },
          data: {
            maxLength: field.maxLength,
          },
        });
      }

      if (field.type === "NUMBER") {
        await prisma.formField.update({
          where: { id: formFieldId },
          data: {
            maxLength: field.maxLength,
          },
        });
      }

      if (field.type === "DATE" || field.type === "TIME") {
        await prisma.formField.update({
          where: { id: formFieldId },
          data: {
            placeholder: field.placeholder,
          },
        });
      }
    }

    revalidatePath("/admins/forms");
    return { success: true, formId, message: "Form updated successfully" };
  } catch (error) {
    console.error("Error updating form template:", error);
    return { success: false, error: "Failed to update form template" };
  }
}
export async function deleteFormTemplate(formId: string) {
  try {
    await prisma.formTemplate.delete({
      where: { id: formId },
    });

    revalidatePath("/admins/forms");
    revalidatePath(`/admins/forms/${formId}`);

    return { success: true, message: "Form deleted successfully" };
  } catch (error) {
    console.error("Error deleting form template:", error);
    return { success: false, error: "Failed to delete form template" };
  }
}
// ===========================================================================

// ===========================================================================
// */admins/form/[id]/page.tsx*
export async function archiveFormTemplate(formId: string) {
  try {
    await prisma.formTemplate.update({
      where: { id: formId },
      data: { isActive: "ARCHIVED" },
    });

    revalidatePath("/admins/records/forms");
    return { success: true, message: "Form archived successfully" };
  } catch (error) {
    console.error("Error archiving form template:", error);
    return { success: false, error: "Failed to archive form template" };
  }
}

export async function publishFormTemplate(formId: string) {
  try {
    await prisma.formTemplate.update({
      where: { id: formId },
      data: { isActive: "ACTIVE" },
    });

    revalidatePath("/admins/records/forms");
    return { success: true, message: "Form published successfully" };
  } catch (error) {
    console.error("Error publishing form template:", error);
    return { success: false, error: "Failed to publish form template" };
  }
}
export async function draftFormTemplate(formId: string) {
  try {
    await prisma.formTemplate.update({
      where: { id: formId },
      data: { isActive: "DRAFT" },
    });

    revalidatePath("/admins/records/forms");
    return { success: true, message: "Form drafted successfully" };
  } catch (error) {
    console.error("Error drafting form template:", error);
    return { success: false, error: "Failed to draft form template" };
  }
}
// ===========================================================================
export async function getFormTemplate(formId: string) {
  try {
    const formTemplate = await prisma.formTemplate.findUnique({
      where: { id: formId },
      include: {
        FormGrouping: {
          include: {
            Fields: true,
          },
        },
      },
    });
    return formTemplate;
  } catch (error) {
    console.error("Error fetching form template:", error);
    return null;
  }
}

/**
 * Represents a single form submission with all related data for editing.
 */
export interface FormSubmissionWithTemplate {
  id: string;
  title: string | null;
  formTemplateId: string;
  userId: string;
  formType: string | null;
  data: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  status: string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
  };
  FormTemplate: {
    id: string;
    name: string;
    description: string | null;
    formType: string;
    createdAt: string;
    updatedAt: string;
    isActive: string;
    isSignatureRequired: boolean;
    FormGrouping: Array<{
      id: string;
      title: string | null;
      order: number;
      Fields: Array<{
        id: string;
        formGroupingId: string;
        label: string;
        type: string;
        required: boolean;
        order: number;
        placeholder?: string | null;
        minLength?: number | null;
        maxLength?: number | null;
        multiple?: boolean | null;
        content?: string | null;
        filter?: string | null;
        Options?: Array<{
          id: string;
          fieldId: string;
          value: string;
        }>;
      }>;
    }>;
  };
}

export async function getFormSubmissionById(submissionId: number) {
  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            signature: true,
          },
        },
        FormTemplate: {
          include: {
            FormGrouping: {
              include: {
                Fields: {
                  include: {
                    Options: true, // if you need select/radio options
                  },
                },
              },
            },
          },
        },
        Approvals: {
          include: {
            Approver: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    return submission;
  } catch (error) {
    console.error("Error fetching form submission:", error);
    return null;
  }
}

export async function getFormTemplateById(templateId: string) {
  try {
    const template = await prisma.formTemplate.findUnique({
      where: { id: templateId },
      include: {
        FormGrouping: {
          include: {
            Fields: {
              include: {
                Options: true, // if you need select/radio options
              },
            },
          },
        },
      },
    });
    return template;
  } catch (error) {
    console.error("Error fetching form submission:", error);
    return null;
  }
}

export async function getFormSubmissions(
  formId: string,
  dateRange?: {
    from?: Date;
    to?: Date;
  },
) {
  try {
    const formSubmissions = await prisma.formSubmission.findMany({
      where: {
        formTemplateId: formId,
        submittedAt: { gte: dateRange?.from, lte: dateRange?.to },
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return formSubmissions;
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return null;
  }
}

// Update a form submission's data (for editing submissions)
export interface UpdateFormSubmissionInput {
  submissionId: number;
  data: Record<string, string | number | boolean | null>;
  adminUserId: string | null;
  comment?: string;
  signature?: string;
  updateStatus?: string;
}

export interface CreateFormSubmissionInput {
  formTemplateId: string;
  data: Record<string, string | number | boolean | null>;
  submittedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  adminUserId?: string | null;
  comment?: string;
  signature?: string;
  status?: string;
}

/**
 * Creates a new form submission record.
 * @param input - The form template id, data, and optional userId/status
 */
export async function createFormSubmission(input: CreateFormSubmissionInput) {
  try {
    const {
      formTemplateId,
      data,
      submittedBy,
      adminUserId,
      comment,
      signature,
    } = input;
    if (!submittedBy.id) {
      throw new Error("Submitted By is required");
    }

    const created = await prisma.formSubmission.create({
      data: {
        formTemplateId,
        userId: submittedBy.id,
        data,
        status: FormStatus.APPROVED,
        submittedAt: new Date(),
      },
    });

    await prisma.formApproval.create({
      data: {
        formSubmissionId: created.id,
        signedBy: adminUserId,
        comment: comment || null,
        signature: signature || null,
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/admins/forms/${formTemplateId}`);
    return { success: true, submission: created };
  } catch (error) {
    console.error("Error creating form submission:", error);
    return { success: false, error: "Failed to create form submission" };
  }
}

/**
 * Updates a form submission's data and updatedAt timestamp.
 * @param input - The submission id and new data object
 */
export async function updateFormSubmission(input: UpdateFormSubmissionInput) {
  try {
    const {
      submissionId,
      data,
      adminUserId,
      comment,
      signature,
      updateStatus,
    } = input;

    // First, update the form submission data
    const updated = await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        data,
        updatedAt: new Date(),
        // Update the status if specified
        ...(updateStatus && { status: updateStatus as FormStatus }),
      },
    });

    // If there's an admin user making the update, record this as an approval
    if (adminUserId) {
      // Check if there's an existing approval for this submission
      const existingApproval = await prisma.formApproval.findFirst({
        where: {
          formSubmissionId: submissionId,
          signedBy: adminUserId,
        },
      });

      if (existingApproval) {
        // Update existing approval
        await prisma.formApproval.update({
          where: { id: existingApproval.id },
          data: {
            updatedAt: new Date(),
            comment: comment || existingApproval.comment,
            signature: signature || existingApproval.signature,
          },
        });
      } else {
        // Create new approval record
        await prisma.formApproval.create({
          data: {
            formSubmissionId: submissionId,
            signedBy: adminUserId,
            updatedAt: new Date(),
            comment: comment || null,
            signature: signature || null,
          },
        });
      }
    }
    // update the notification
    const notification = await prisma.notification.findMany({
      where: {
        referenceId: submissionId.toString(),
        topic: "form-submissions",
        Response: {
          is: null,
        },
      },
    });
    if (notification.length > 0) {
      if (!adminUserId) {
        throw new Error(
          "Admin User ID is required to mark notifications as read",
        );
      }
      await prisma.$transaction([
        prisma.notificationResponse.createMany({
          data: notification.map((notification) => ({
            notificationId: notification.id,
            userId: adminUserId, // Ensure adminUserId is defined and correct
            response: "READ",
          })),
        }),
        prisma.notificationRead.createMany({
          data: notification.map((notification) => ({
            notificationId: notification.id,
            userId: adminUserId, // Ensure adminUserId is defined and correct
          })),
          skipDuplicates: true, // Avoid duplicate entries
        }),
      ]);
    }

    revalidatePath(`/admins/forms/${updated.formTemplateId}`);
    return { success: true, submission: updated };
  } catch (error) {
    console.error("Error updating form submission:", error);
    return { success: false, error: "Failed to update form submission" };
  }
}

export async function deleteFormSubmission(submissionId: number) {
  try {
    const submission = await prisma.formSubmission.delete({
      where: { id: submissionId },
    });
    revalidatePath(`/admins/forms/${submission.formTemplateId}`);
    return { success: true, message: "Form submission deleted successfully" };
  } catch (error) {
    console.error("Error deleting form submission:", error);
    return { success: false, error: "Failed to delete form submission" };
  }
}

export async function ApproveFormSubmission(
  submissionId: number,
  action: "APPROVED" | "REJECTED",
  formData: FormData,
) {
  try {
    const comment = formData.get("comment") as string;
    const adminUserId = formData.get("adminUserId") as string;

    const updated = await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        status: action as FormStatus,
        updatedAt: new Date(),
        Approvals: {
          create: {
            signedBy: adminUserId || null,
            comment: comment || null,
            submittedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });

    // update the notification
    const notification = await prisma.notification.findMany({
      where: {
        referenceId: submissionId.toString(),
        topic: "form-submissions",
        Response: {
          is: null,
        },
      },
    });
    if (notification.length > 0) {
      if (!adminUserId) {
        throw new Error(
          "Admin User ID is required to mark notifications as read",
        );
      }
      await prisma.$transaction([
        prisma.notificationResponse.createMany({
          data: notification.map((notification) => ({
            notificationId: notification.id,
            response: "Approved",
            respondedAt: new Date(),
            userId: adminUserId,
          })),
        }),
        prisma.notificationRead.createMany({
          data: notification.map((notification) => ({
            notificationId: notification.id,
            userId: adminUserId, // Ensure adminUserId is defined and correct
          })),
          skipDuplicates: true, // Avoid duplicate entries
        }),
      ]);
    }

    revalidatePath(`/admins/forms/${updated.formTemplateId}`);
    return { success: true, submission: updated };
  } catch (error) {
    console.error("Error approving/rejecting form submission:", error);
    return {
      success: false,
      error: "Failed to approve/reject form submission",
    };
  }
}
