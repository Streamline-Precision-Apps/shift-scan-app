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
export declare const ServiceGetForms: () => Promise<{
    id: string;
    name: string;
}[]>;
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
export declare const ServiceGetFormsWithRequests: () => Promise<({
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
})[]>;
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
/**
 * Fetch employee requests for a manager, with filter, skip, take
 */
export declare const ServiceGetEmployeeRequests: ({ filter, skip, take, managerId, }: GetEmployeeRequestsParams) => Promise<({
    User: {
        firstName: string;
        lastName: string;
    };
    FormTemplate: {
        formType: import("../../generated/prisma/index.js").$Enums.FormTemplateCategory;
    };
    Approvals: {
        id: string;
        Approver: {
            firstName: string;
            lastName: string;
        } | null;
    }[];
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
})[] | ({
    User: {
        firstName: string;
        lastName: string;
    };
    FormTemplate: {
        formType: import("../../generated/prisma/index.js").$Enums.FormTemplateCategory;
    };
    Approvals: {
        signedBy: string | null;
    }[];
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
})[]>;
export declare const ServiceGetUserSubmissions: ({ userId, status, startDate, endDate, skip, take, }: {
    userId: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    skip: number;
    take: number;
}) => Promise<({
    User: {
        id: string;
        firstName: string;
        lastName: string;
    };
    FormTemplate: {
        name: string;
        formType: import("../../generated/prisma/index.js").$Enums.FormTemplateCategory;
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
})[]>;
export declare const ServiceManagerFormApprovals: (id: string) => Promise<({
    Approvals: ({
        Approver: {
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        updatedAt: Date;
        signature: string | null;
        comment: string | null;
        submittedAt: Date;
        formSubmissionId: number;
        signedBy: string | null;
    })[];
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
}) | null>;
export declare const ServiceFormSubmissions: (id: string) => Promise<({
    User: {
        signature: string | null;
    };
    FormTemplate: {
        id: string;
        name: string;
    };
    Approvals: {
        id: string;
        updatedAt: Date;
        comment: string | null;
        Approver: {
            firstName: string;
            lastName: string;
        } | null;
    }[];
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
}) | null>;
export declare const ServiceTeamSubmissions: (id: string) => Promise<({
    User: {
        firstName: string;
        lastName: string;
    };
    Approvals: {
        comment: string | null;
        Approver: {
            firstName: string;
            lastName: string;
        } | null;
    }[];
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
}) | null>;
export declare const ServiceFormDraft: (id: string, userId: string) => Promise<{
    data: import("../../generated/prisma/runtime/library.js").JsonValue;
    title: string | null;
    FormTemplate: {
        name: string;
    };
} | null>;
export declare const ServiceForm: (id: string, userId: string) => Promise<{
    id: string;
    name: string;
    formType: import("../../generated/prisma/index.js").$Enums.FormTemplateCategory;
    isActive: import("../../generated/prisma/index.js").$Enums.FormTemplateStatus;
    isSignatureRequired: boolean;
    groupings: {
        id: string;
        title: string;
        order: number;
        fields: {
            id: string;
            label: string;
            name: string;
            type: import("../../generated/prisma/index.js").$Enums.FieldType;
            required: boolean;
            order: number;
            defaultValue: undefined;
            placeholder: string | null;
            helperText: string | null;
            filter: string | null;
            multiple: boolean | null;
            options: string[];
        }[];
    }[];
}>;
//# sourceMappingURL=formsService.d.ts.map