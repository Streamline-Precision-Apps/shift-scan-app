export interface Submission {
  id: number;
  title: string;
  formTemplateId: string;
  userId: string;
  formType: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  status: string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
    signature: string;
  };
}

export interface FormIndividualTemplate {
  id: string;
  name: string;
  formType: string;
  createdAt: string;
  updatedAt: string;
  isActive: string;
  description: string | null;
  isSignatureRequired: boolean;
  isApprovalRequired: boolean;
  FormGrouping: Grouping[];
  Submissions: Submission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Grouping {
  id: string;
  title: string;
  order: number;
  Fields: Fields[];
}

export interface Fields {
  id: string;
  formGroupingId: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  placeholder?: string | null;
  minLength?: number | null;
  maxLength?: number | null;
  multiple: boolean | null;
  content?: string | null;
  filter?: string | null;
  Options?: FieldOption[];
}

interface FieldOption {
  id: string;
  fieldId: string;
  value: string;
}

export interface FormSubmissionWithTemplate {
  id: number;
  title: string | null;
  formTemplateId: string;
  userId: string;
  formType: string | null;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  status: string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
    signature: string;
  };
  Approvals?: Array<{
    id: string;
    formSubmissionId: number;
    signedBy: string | null;
    submittedAt: Date;
    updatedAt: Date;
    signature: string | null;
    comment: string | null;
    Approver: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  }>;
  FormTemplate: {
    id: string;
    name: string;
    description: string | null;
    formType: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: string;
    isSignatureRequired: boolean;
    isApprovalRequired: boolean;
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
