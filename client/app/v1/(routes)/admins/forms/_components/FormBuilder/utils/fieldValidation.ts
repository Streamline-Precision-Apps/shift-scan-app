import { FormField } from "../types";

/**
 * Types of validation errors
 */
export type ValidationErrorType = "invalidValue" | "incompleteField";

/**
 * Structure of field validation errors
 */
export interface FieldValidationError {
  type: ValidationErrorType;
  message: string;
}

/**
 * Check if a field has validation errors
 * @param field The form field to validate
 * @returns An array of validation errors, empty if no errors
 */
export function validateField(field: FormField): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // Common validation for all field types
  if (field.required && !field.label?.trim()) {
    errors.push({
      type: "incompleteField",
      message: "Label is required",
    });
  }

  // Type-specific validations
  switch (field.type) {
    case "NUMBER":
      errors.push(...validateNumberField(field));
      break;
    case "TEXT":
      errors.push(...validateTextField(field));
      break;
    case "TEXTAREA":
      errors.push(...validateTextAreaField(field));
      break;
    case "DROPDOWN":
      errors.push(...validateDropdownField(field));
      break;
    case "MULTISELECT":
      errors.push(...validateMultiselectField(field));
      break;
    case "RADIO":
      errors.push(...validateRadioField(field));
      break;
    case "SEARCH_ASSET":
      errors.push(...validateSearchAssetField(field));
      break;
  }

  return errors;
}

/**
 * Validates a number field
 */
function validateNumberField(field: FormField): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // No validation needed for min/max as we'll implicitly use 0 as the minimum
  // Only validate if a maxLength is provided and it's less than 0
  if (field.maxLength !== undefined && field.maxLength < 0) {
    errors.push({
      type: "invalidValue",
      message: "Maximum value cannot be negative",
    });
  }

  return errors;
}

/**
 * Validates a text field
 */
function validateTextField(field: FormField): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // No validation needed for min/max as we'll implicitly use 0 as the minimum
  // Only validate if maxLength is provided and it's less than 0
  if (field.maxLength !== undefined && field.maxLength < 0) {
    errors.push({
      type: "invalidValue",
      message: "Maximum length cannot be negative",
    });
  }

  return errors;
}

/**
 * Validates a textarea field
 */
function validateTextAreaField(field: FormField): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // No validation needed for min/max as we'll implicitly use 0 as the minimum
  // Only validate if maxLength is provided and it's less than 0
  if (field.maxLength !== undefined && field.maxLength < 0) {
    errors.push({
      type: "invalidValue",
      message: "Maximum length cannot be negative",
    });
  }

  return errors;
}

/**
 * Validates a dropdown field
 */
function validateDropdownField(field: FormField): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // Check if there are at least 2 options
  if (!field.Options || field.Options.length < 2) {
    errors.push({
      type: "incompleteField",
      message: "Dropdown must have at least 2 options",
    });
  } else {
    // Check if all options have values
    const emptyOptions = field.Options.filter(
      (option) => !option.value?.trim(),
    );
    if (emptyOptions.length > 0) {
      errors.push({
        type: "incompleteField",
        message: "All options must have a value",
      });
    }
  }

  return errors;
}

/**
 * Validates a multiselect field
 */
function validateMultiselectField(field: FormField): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // Check if there are at least 2 options
  if (!field.Options || field.Options.length < 2) {
    errors.push({
      type: "incompleteField",
      message: "Multi-select must have at least 2 options",
    });
  } else {
    // Check if all options have values
    const emptyOptions = field.Options.filter(
      (option) => !option.value?.trim(),
    );
    if (emptyOptions.length > 0) {
      errors.push({
        type: "incompleteField",
        message: "All options must have a value",
      });
    }
  }

  return errors;
}

/**
 * Validates a radio field
 */
function validateRadioField(field: FormField): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // Check if there are at least 2 options
  if (!field.Options || field.Options.length < 2) {
    errors.push({
      type: "incompleteField",
      message: "Radio field must have at least 2 options",
    });
  } else {
    // Check if all options have values
    const emptyOptions = field.Options.filter(
      (option) => !option.value?.trim(),
    );
    if (emptyOptions.length > 0) {
      errors.push({
        type: "incompleteField",
        message: "All options must have a value",
      });
    }
  }

  return errors;
}

/**
 * Validates a search asset field
 */
function validateSearchAssetField(field: FormField): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  // Check if asset type is selected
  // The filter field stores a direct string value like "Equipment", "Jobsites", or "Cost Codes"
  if (!field.filter) {
    errors.push({
      type: "incompleteField",
      message: "Asset type must be selected",
    });
  }

  return errors;
}

/**
 * Helper function to check if a field has any validation errors
 */
export function hasValidationErrors(field: FormField): boolean {
  return validateField(field).length > 0;
}

/**
 * Check if a field has a specific type of validation error
 */
export function hasValidationErrorType(
  field: FormField,
  errorType: ValidationErrorType,
): boolean {
  return validateField(field).some((error) => error.type === errorType);
}

/**
 * Get all validation errors across an array of fields
 */
export function getFormValidationErrors(
  fields: FormField[],
): Record<string, FieldValidationError[]> {
  const errors: Record<string, FieldValidationError[]> = {};

  fields.forEach((field) => {
    const fieldErrors = validateField(field);
    if (fieldErrors.length > 0) {
      errors[field.id] = fieldErrors;
    }
  });

  return errors;
}

/**
 * Count validation errors of a specific type across all fields
 */
export function countValidationErrorsByType(
  fields: FormField[],
  errorType: ValidationErrorType,
): number {
  let count = 0;

  fields.forEach((field) => {
    count += validateField(field).filter(
      (error) => error.type === errorType,
    ).length;
  });

  return count;
}
