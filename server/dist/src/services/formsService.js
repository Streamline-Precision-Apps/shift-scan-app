
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="05f6a391-ac69-5477-be36-5093e93be20a")}catch(e){}}();
import prisma from "../lib/prisma.js";
import { FormStatus } from "../../generated/prisma/client.js";
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
export const ServiceCreateFormSubmission = async ({ formTemplateId, userId, }) => {
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
    if (!formTemplate)
        throw new Error("Form template not found");
    // Initialize the data object with field.id as keys and field.content as default value
    const initialData = {};
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
export const ServiceDeleteFormSubmission = async (id) => {
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
export const ServiceSaveDraft = async (params) => {
    const { formData, formTemplateId, userId, formType, submissionId, title } = params;
    if (submissionId) {
        const existingSubmission = await prisma.formSubmission.findUnique({
            where: { id: submissionId },
        });
        if (!existingSubmission)
            throw new Error("Submission not found");
        let existingData = {};
        if (typeof existingSubmission.data === "object" &&
            existingSubmission.data !== null &&
            !Array.isArray(existingSubmission.data)) {
            existingData = existingSubmission.data;
        }
        const existingTitle = existingSubmission.title;
        // Only update changed fields
        const changedFields = {};
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
    }
    else {
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
export const ServiceSaveDraftToPending = async (params) => {
    const { formData, isApprovalRequired, formTemplateId, userId, formType, submissionId, title, } = params;
    if (submissionId) {
        const existingSubmission = await prisma.formSubmission.findUnique({
            where: { id: submissionId },
        });
        if (!existingSubmission)
            throw new Error("Submission not found");
        let existingData = {};
        if (typeof existingSubmission.data === "object" &&
            existingSubmission.data !== null &&
            !Array.isArray(existingSubmission.data)) {
            existingData = existingSubmission.data;
        }
        const existingTitle = existingSubmission.title;
        const changedFields = {};
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
    }
    else {
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
export const ServiceSavePending = async (params) => {
    const { formData, formTemplateId, userId, formType, submissionId, title } = params;
    if (submissionId) {
        const existingSubmission = await prisma.formSubmission.findUnique({
            where: { id: submissionId },
        });
        if (!existingSubmission)
            throw new Error("Submission not found");
        let existingData = {};
        if (typeof existingSubmission.data === "object" &&
            existingSubmission.data !== null &&
            !Array.isArray(existingSubmission.data)) {
            existingData = existingSubmission.data;
        }
        const existingTitle = existingSubmission.title;
        const changedFields = {};
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
    }
    else {
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
export const ServiceCreateFormApproval = async (params) => {
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
            data: { status: approval },
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
export const ServiceUpdateFormApproval = async (params) => {
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
export const ServiceGetEmployeeRequests = async ({ filter, skip, take, managerId, }) => {
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
    }
    else if (filter === "approved") {
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
    }
    else {
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
export const ServiceGetUserSubmissions = async ({ userId, status, startDate, endDate, skip, take, }) => {
    // Build where clause
    let whereClause = { userId };
    if (status === "pending") {
        whereClause = { ...whereClause, status: FormStatus.PENDING };
    }
    else if (status === "approved") {
        whereClause = { ...whereClause, status: FormStatus.APPROVED };
    }
    else if (status === "denied") {
        whereClause = { ...whereClause, status: FormStatus.DENIED };
    }
    else if (status === "draft") {
        whereClause = { ...whereClause, status: FormStatus.DRAFT };
    }
    else if (status === "all") {
        if (startDate && endDate) {
            whereClause = { ...whereClause, createdAt: { gte: startDate, lte: endDate } };
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
//# sourceMappingURL=formsService.js.map
//# debugId=05f6a391-ac69-5477-be36-5093e93be20a
