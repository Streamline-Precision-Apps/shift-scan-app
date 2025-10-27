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
 * Create a form submission
 * @param {Object} params
 * @param {string} params.formTemplateId
 * @param {string} params.userId
 */
export declare const ServiceCreateFormSubmission: ({ formTemplateId, userId, }: CreateFormSubmissionParams) => Promise<{
    data: import("../../generated/prisma/runtime/library.js").JsonValue | null;
    title: string | null;
    createdAt: Date;
    id: number;
    userId: string;
    updatedAt: Date;
    status: import("../../generated/prisma/index.js").$Enums.FormStatus;
    formTemplateId: string;
    formType: string | null;
    submittedAt: Date | null;
}>;
/**
 * Delete a form submission
 * @param {number} id
 */
export declare const ServiceDeleteFormSubmission: (id: number) => Promise<boolean>;
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
export declare const ServiceSaveDraft: (params: SaveDraftParams) => Promise<{
    data: import("../../generated/prisma/runtime/library.js").JsonValue | null;
    title: string | null;
    createdAt: Date;
    id: number;
    userId: string;
    updatedAt: Date;
    status: import("../../generated/prisma/index.js").$Enums.FormStatus;
    formTemplateId: string;
    formType: string | null;
    submittedAt: Date | null;
}>;
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
export declare const ServiceSaveDraftToPending: (params: SaveDraftToPendingParams) => Promise<{
    User: {
        firstName: string;
        lastName: string;
    };
} & {
    data: import("../../generated/prisma/runtime/library.js").JsonValue | null;
    title: string | null;
    createdAt: Date;
    id: number;
    userId: string;
    updatedAt: Date;
    status: import("../../generated/prisma/index.js").$Enums.FormStatus;
    formTemplateId: string;
    formType: string | null;
    submittedAt: Date | null;
}>;
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
export declare const ServiceSavePending: (params: SavePendingParams) => Promise<{
    data: import("../../generated/prisma/runtime/library.js").JsonValue | null;
    title: string | null;
    createdAt: Date;
    id: number;
    userId: string;
    updatedAt: Date;
    status: import("../../generated/prisma/index.js").$Enums.FormStatus;
    formTemplateId: string;
    formType: string | null;
    submittedAt: Date | null;
}>;
/**
 * Create a form approval
 * @param {Object} params
 * @param {number} params.formSubmissionId
 * @param {string} params.signedBy
 * @param {string} params.signature
 * @param {string} params.comment
 * @param {string} params.approval
 */
export declare const ServiceCreateFormApproval: (params: CreateFormApprovalParams) => Promise<boolean>;
/**
 * Update a form approval
 * @param {Object} params
 * @param {string} params.id
 * @param {number} params.formSubmissionId
 * @param {string} params.comment
 * @param {boolean} params.isApproved
 */
export declare const ServiceUpdateFormApproval: (params: UpdateFormApprovalParams) => Promise<{
    approval: {
        id: string;
        updatedAt: Date;
        signature: string | null;
        comment: string | null;
        submittedAt: Date;
        formSubmissionId: number;
        signedBy: string | null;
    };
    updatedSubmission: {
        data: import("../../generated/prisma/runtime/library.js").JsonValue | null;
        title: string | null;
        createdAt: Date;
        id: number;
        userId: string;
        updatedAt: Date;
        status: import("../../generated/prisma/index.js").$Enums.FormStatus;
        formTemplateId: string;
        formType: string | null;
        submittedAt: Date | null;
    };
}>;
//# sourceMappingURL=formsService.d.ts.map