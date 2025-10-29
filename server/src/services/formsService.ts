import prisma from "../lib/prisma.js";
import { FormStatus } from "../../generated/prisma/client.js";

// --- Types ---
// Params for ServiceGetEmployeeRequests
export interface GetEmployeeRequestsParams {
  filter: string;
  skip: number;
  take: number;
  managerId: string;
}

export interface CreateFormSubmissionParams {
  formTemplateId: string;
  userId: string;
}

export interface SaveDraftParams {
  formData: Record<string, string>;
  formTemplateId: string;
  userId: string;
  formType?: string;
  submissionId?: number;
  title?: string;
}

export interface SaveDraftToPendingParams {
  formData: Record<string, string>;
  isApprovalRequired: boolean;
  formTemplateId: string;
  userId: string;
  formType?: string;
  submissionId?: number;
  title?: string;
}

export interface SavePendingParams {
  formData: Record<string, string>;
  formTemplateId: string;
  userId: string;
  formType?: string;
  submissionId?: number;
  title?: string;
}

export interface CreateFormApprovalParams {
  formSubmissionId: number;
  signedBy: string;
  signature: string;
  comment: string;
  approval: string;
}

export interface UpdateFormApprovalParams {
  id: string;
  formSubmissionId: number;
  comment: string;
  isApproved: boolean;
}

/**
 * Get all forms
 * @returns {
 *   id: string;
 *   name: string;
 * }[]
 */
export const ServiceGetForms = async () => {
  return await prisma.formTemplate.findMany({
    where: {
      isActive: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
    },
  });
};
/**
 * Create a form submission
 * @param {Object} params
 * @param {string} params.formTemplateId
 * @param {string} params.userId
 */
export const ServiceCreateFormSubmission = async ({
  formTemplateId,
  userId,
}: CreateFormSubmissionParams) => {
  // Fetch the form template to get the field names
  const formTemplate = await prisma.formTemplate.findUnique({
    where: { id: formTemplateId },
    include: {
      FormGrouping: {
        include: {
          Fields: true,
        },
      },
    },
  });
  if (!formTemplate) throw new Error("Form template not found");
  // Initialize the data object with field.id as keys and field.content as default value
  const initialData: Record<string, string> = {};
  for (const group of formTemplate.FormGrouping) {
    for (const field of group.Fields) {
      initialData[String(field.id)] = field.content || "";
    }
  }
  // Create the form submission with the initialized data
  const submission = await prisma.formSubmission.create({
    data: {
      formTemplateId,
      userId,
      title: "",
      data: initialData,
    },
  });
  return submission;
};

/**
 * Delete a form submission
 * @param {number} id
 */
export const ServiceDeleteFormSubmission = async (id: number) => {
  await prisma.formSubmission.delete({ where: { id } });
  return true;
};

/**
 * Save a draft form submission
 * @param {Object} params
 * @param {Record<string, string>} params.formData
 * @param {string} params.formTemplateId
 * @param {string} params.userId
 * @param {string} [params.formType]
 * @param {number} [params.submissionId]
 * @param {string} [params.title]
 */
export const ServiceSaveDraft = async (params: SaveDraftParams) => {
  const { formData, formTemplateId, userId, formType, submissionId, title } =
    params;
  if (submissionId) {
    const existingSubmission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!existingSubmission) throw new Error("Submission not found");
    let existingData: Record<string, string> = {};
    if (
      typeof existingSubmission.data === "object" &&
      existingSubmission.data !== null &&
      !Array.isArray(existingSubmission.data)
    ) {
      existingData = existingSubmission.data as Record<string, string>;
    }
    const existingTitle = existingSubmission.title;
    // Only update changed fields
    const changedFields: Record<string, string> = {};
    for (const key in formData) {
      if (formData[key] !== existingData[key]) {
        changedFields[key] = formData[key] ?? "";
      }
    }
    const updatedSubmission = await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        title: title || existingTitle,
        data: { ...existingData, ...changedFields },
      },
    });
    return updatedSubmission;
  } else {
    const newSubmission = await prisma.formSubmission.create({
      data: {
        title: title || "",
        formTemplateId,
        userId,
        formType: formType ?? null,
        data: formData,
        status: FormStatus.DRAFT,
        submittedAt: new Date().toISOString(),
      },
    });
    return newSubmission;
  }
};

/**
 * Save a draft and move to pending/approved
 * @param {Object} params
 * @param {Record<string, string>} params.formData
 * @param {boolean} params.isApprovalRequired
 * @param {string} params.formTemplateId
 * @param {string} params.userId
 * @param {string} [params.formType]
 * @param {number} [params.submissionId]
 * @param {string} [params.title]
 */
export const ServiceSaveDraftToPending = async (
  params: SaveDraftToPendingParams
) => {
  const {
    formData,
    isApprovalRequired,
    formTemplateId,
    userId,
    formType,
    submissionId,
    title,
  } = params;
  if (submissionId) {
    const existingSubmission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!existingSubmission) throw new Error("Submission not found");
    let existingData: Record<string, string> = {};
    if (
      typeof existingSubmission.data === "object" &&
      existingSubmission.data !== null &&
      !Array.isArray(existingSubmission.data)
    ) {
      existingData = existingSubmission.data as Record<string, string>;
    }
    const existingTitle = existingSubmission.title;
    const changedFields: Record<string, string> = {};
    for (const key in formData) {
      if (formData[key] !== existingData[key]) {
        changedFields[key] = formData[key] ?? "";
      }
    }
    const updatedSubmission = await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        title: title || existingTitle,
        data: { ...existingData, ...changedFields },
        submittedAt: new Date().toISOString(),
        status: isApprovalRequired ? FormStatus.PENDING : FormStatus.APPROVED,
      },
      include: {
        User: { select: { firstName: true, lastName: true } },
      },
    });
    return updatedSubmission;
  } else {
    const newSubmission = await prisma.formSubmission.create({
      data: {
        title: title || "",
        formTemplateId,
        userId,
        formType: formType ?? null,
        data: formData,
        status: isApprovalRequired ? FormStatus.PENDING : FormStatus.APPROVED,
        submittedAt: new Date().toISOString(),
      },
      include: {
        User: { select: { firstName: true, lastName: true } },
      },
    });
    return newSubmission;
  }
};

/**
 * Save a pending form submission
 * @param {Object} params
 * @param {Record<string, string>} params.formData
 * @param {string} params.formTemplateId
 * @param {string} params.userId
 * @param {string} [params.formType]
 * @param {number} [params.submissionId]
 * @param {string} [params.title]
 */
export const ServiceSavePending = async (params: SavePendingParams) => {
  const { formData, formTemplateId, userId, formType, submissionId, title } =
    params;
  if (submissionId) {
    const existingSubmission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!existingSubmission) throw new Error("Submission not found");
    let existingData: Record<string, string> = {};
    if (
      typeof existingSubmission.data === "object" &&
      existingSubmission.data !== null &&
      !Array.isArray(existingSubmission.data)
    ) {
      existingData = existingSubmission.data as Record<string, string>;
    }
    const existingTitle = existingSubmission.title;
    const changedFields: Record<string, string> = {};
    for (const key in formData) {
      if (formData[key] !== existingData[key]) {
        changedFields[key] = formData[key] ?? "";
      }
    }
    const updatedSubmission = await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        title: title || existingTitle,
        data: { ...existingData, ...changedFields },
        status: FormStatus.PENDING,
      },
    });
    return updatedSubmission;
  } else {
    const newSubmission = await prisma.formSubmission.create({
      data: {
        title: title || "",
        formTemplateId,
        userId,
        formType: formType ?? null,
        data: formData,
        status: FormStatus.PENDING,
      },
    });
    return newSubmission;
  }
};

export const ServiceGetFormsWithRequests = async () => {
  const forms = await prisma.formSubmission.findMany({
    where: { status: FormStatus.PENDING },
    include: {
      User: { select: { firstName: true, lastName: true } },
    },
  });
  return forms;
};

/**
 * Create a form approval
 * @param {Object} params
 * @param {number} params.formSubmissionId
 * @param {string} params.signedBy
 * @param {string} params.signature
 * @param {string} params.comment
 * @param {string} params.approval
 */
export const ServiceCreateFormApproval = async (
  params: CreateFormApprovalParams
) => {
  const { formSubmissionId, signedBy, signature, comment, approval } = params;
  const create = await prisma.formApproval.create({
    data: {
      formSubmissionId,
      signedBy,
      signature,
      comment,
    },
  });
  if (create) {
    await prisma.formSubmission.update({
      where: { id: formSubmissionId },
      data: { status: approval as FormStatus },
    });
  }
  return true;
};

/**
 * Update a form approval
 * @param {Object} params
 * @param {string} params.id
 * @param {number} params.formSubmissionId
 * @param {string} params.comment
 * @param {boolean} params.isApproved
 */
export const ServiceUpdateFormApproval = async (
  params: UpdateFormApprovalParams
) => {
  const { id, formSubmissionId, comment, isApproved } = params;
  // Use a transaction to ensure atomicity
  const [approval, updatedSubmission] = await prisma.$transaction([
    prisma.formApproval.update({
      where: { id },
      data: { comment },
    }),
    prisma.formSubmission.update({
      where: { id: formSubmissionId },
      data: { status: isApproved ? FormStatus.APPROVED : FormStatus.DENIED },
    }),
  ]);
  return { approval, updatedSubmission };
};

/**
 * Fetch employee requests for a manager, with filter, skip, take
 */
export const ServiceGetEmployeeRequests = async ({
  filter,
  skip,
  take,
  managerId,
}: GetEmployeeRequestsParams) => {
  // 'all' = all pending requests for employees in manager's team (not self),
  // 'approved' = all approved/denied (not pending/draft) for employees in manager's team (not self),
  // else: pending requests for a specific userId (employee), in manager's team (not self)
  if (filter === "all") {
    return await prisma.formSubmission.findMany({
      where: {
        status: "PENDING",
        User: {
          NOT: { id: managerId },
          Crews: { some: { leadId: managerId } },
        },
        Approvals: { none: {} },
      },
      include: {
        FormTemplate: { select: { formType: true } },
        User: { select: { id: true, firstName: true, lastName: true } },
        Approvals: { select: { signedBy: true } },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  } else if (filter === "approved") {
    return await prisma.formSubmission.findMany({
      where: {
        status: { not: { in: ["PENDING", "DRAFT"] } },
        User: {
          NOT: { id: managerId },
          Crews: { some: { leadId: managerId } },
        },
      },
      include: {
        FormTemplate: { select: { formType: true } },
        User: { select: { firstName: true, lastName: true } },
        Approvals: {
          select: {
            id: true,
            Approver: { select: { firstName: true, lastName: true } },
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  } else {
    // filter is a userId
    return await prisma.formSubmission.findMany({
      where: {
        status: "PENDING",
        userId: filter,
        User: {
          NOT: { id: managerId },
          Crews: { some: { leadId: managerId } },
        },
        Approvals: { none: {} },
      },
      include: {
        FormTemplate: { select: { formType: true } },
        User: { select: { firstName: true, lastName: true } },
        Approvals: { select: { signedBy: true } },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }
};

export const ServiceGetUserSubmissions = async ({
  userId,
  status,
  startDate,
  endDate,
  skip,
  take,
}: {
  userId: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  skip: number;
  take: number;
}) => {
  // Build where clause
  let whereClause: any = { userId };
  if (status === "pending") {
    whereClause = { ...whereClause, status: FormStatus.PENDING };
  } else if (status === "approved") {
    whereClause = { ...whereClause, status: FormStatus.APPROVED };
  } else if (status === "denied") {
    whereClause = { ...whereClause, status: FormStatus.DENIED };
  } else if (status === "draft") {
    whereClause = { ...whereClause, status: FormStatus.DRAFT };
  } else if (status === "all") {
    if (startDate && endDate) {
      whereClause = {
        ...whereClause,
        createdAt: { gte: startDate, lte: endDate },
      };
    }
  }

  const forms = await prisma.formSubmission.findMany({
    where: whereClause,
    include: {
      FormTemplate: { select: { name: true, formType: true } },
      User: { select: { id: true, firstName: true, lastName: true } },
    },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });

  // Sort: drafts first, then by createdAt desc
  forms.sort((a, b) => {
    if (a.status === FormStatus.DRAFT && b.status !== FormStatus.DRAFT)
      return -1;
    if (a.status !== FormStatus.DRAFT && b.status === FormStatus.DRAFT)
      return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return forms;
};

export const ServiceManagerFormApprovals = async (id: string) => {
  const forms = await prisma.formSubmission.findFirst({
    where: {
      id: Number(id),
    },
    include: {
      Approvals: {
        include: {
          Approver: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return forms;
};

export const ServiceFormSubmissions = async (id: string) => {
  const forms = await prisma.formSubmission.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      FormTemplate: {
        select: {
          id: true,
          name: true,
        },
      },
      User: {
        select: {
          signature: true,
        },
      },
      Approvals: {
        select: {
          id: true,
          comment: true,
          updatedAt: true,
          Approver: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return forms;
};

export const ServiceTeamSubmissions = async (id: string) => {
  const formSubmission = await prisma.formSubmission.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      User: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      Approvals: {
        select: {
          comment: true,
          Approver: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return formSubmission;
};

export const ServiceFormDraft = async (id: string, userId: string) => {
  const forms = await prisma.formSubmission.findUnique({
    where: {
      id: Number(id),
      userId,
      status: FormStatus.DRAFT,
    },

    select: {
      data: true,
      title: true,
      FormTemplate: {
        select: {
          name: true,
        },
      },
    },
  });

  return forms;
};

export const ServiceForm = async (id: string, userId: string) => {
  const formTemplate = await prisma.formTemplate.findUnique({
    where: {
      id,
    },
    include: {
      FormGrouping: {
        include: {
          Fields: {
            include: {
              Options: true, // Include dropdown options if any
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!formTemplate) throw new Error("Form template not found");

  const formattedForm = {
    id: formTemplate.id,
    name: formTemplate.name,
    formType: formTemplate.formType,
    isActive: formTemplate.isActive,
    isSignatureRequired: formTemplate.isSignatureRequired,
    groupings: formTemplate.FormGrouping.map((group) => ({
      id: group.id,
      title: group.title || "",
      order: group.order,
      fields: group.Fields.map((field) => ({
        id: field.id,
        label: field.label,
        name: field.id, // Use field.id as the name since FormField doesn't have a name property
        type: field.type,
        required: field.required,
        order: field.order,
        defaultValue: undefined, // FormField doesn't have defaultValue
        placeholder: field.placeholder,
        helperText: field.content, // Use content as helperText
        filter: field.filter, // Include the filter property for SEARCH_ASSET fields
        multiple: field.multiple, // Include multiple property for multi-select fields
        options: field.Options.map((option) => option.value), // Extract dropdown options
      })),
    })),
  };

  return formattedForm;
};
