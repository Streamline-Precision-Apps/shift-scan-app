// Types for useFormsList hook

export interface FormFieldOptions {
  id: string;
  fieldId: string;
  value: string;
}

export interface FormField {
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
  options?: FormFieldOptions[];
}

export interface FormGrouping {
  id: string;
  title: string;
  order: number;
  fields: FormField[];
}

export interface FormTemplate {
  _count: {
    Submissions: number;
  };
  id: string;
  name: string;
  description: string | null;
  formType?: string;
  isActive: "ACTIVE" | "DRAFT" | "ARCHIVED" | string;
  isApprovalRequired?: boolean;
  isSignatureRequired?: boolean;
  groupings: FormGrouping[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormItem {
  id: string;
  name: string;
  description: string | null;
  formType: string;
  _count: {
    Submissions: number;
  };
  isActive: "ACTIVE" | "DRAFT" | "ARCHIVED" | string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
