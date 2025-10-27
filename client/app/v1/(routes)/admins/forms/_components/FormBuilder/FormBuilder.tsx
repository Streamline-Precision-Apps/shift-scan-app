"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

// Import types and API functions
/* Lines 12-18 omitted */
import { getFormValidationErrors } from "./utils/fieldValidation";
import {
  FormField,
  FormGrouping,
  FormSettings,
  FormDesignerProps,
} from "./types";

// Import our new components
import { FormFieldComponent } from "./components/FormFieldComponent";
import { PanelCenterPlaceholder } from "./components/panels/PanelCenterPlaceholder";
import { PanelLeft } from "./components/panels/PanelLeft";
import { FormBuilderPanelRight } from "./components/panels/PanelRight";
import { CancelModal } from "./components/CancelModal";
import { saveFormTemplate, updateFormTemplate } from "@/actions/records-forms";
import Spinner from "@/components/(animations)/spinner";

export default function FormBuilder({
  onCancel,
  formId,
  mode,
}: FormDesignerProps) {
  // Form state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [formSettings, setFormSettings] = useState<FormSettings>({
    id: "",
    companyId: "",
    name: "",
    formType: "",
    description: "",
    status: "",
    requireSignature: false,
    createdAt: "",
    updatedAt: "",
    isActive: "",
    isSignatureRequired: false,
    isApprovalRequired: false,
    FormGrouping: [],
  });

  const [popoverOpenFieldId, setPopoverOpenFieldId] = useState<string | null>(
    null,
  );
  const [loadingSave, setLoadingSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formSections, setFormSections] = useState<FormGrouping[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState<
    Record<string, boolean>
  >({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, { minError?: string; maxError?: string }>
  >({});

  // Validation: require name, category, and status
  const isValid = useMemo(() => {
    return (
      !!formSettings.name.trim() &&
      !!formSettings.formType &&
      !!formSettings.isActive
    );
  }, [formSettings.name, formSettings.formType, formSettings.isActive]);

  // Conditional data fetching for edit mode
  useEffect(() => {
    if (mode === "edit" && formId) {
      const fetchForm = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/getForms/${formId}`);
          if (!response.ok) throw new Error("Failed to fetch form");
          const data = await response.json();

          // Map the response data to the form state
          const formGrouping = data.FormGrouping.map((group: FormGrouping) => ({
            ...group,
            Fields: group.Fields.map((field: FormField) => ({
              ...field,
              Options: field.Options || [],
            })),
          }));

          setFormFields(
            formGrouping.flatMap((group: FormGrouping) => group.Fields),
          );
          setFormSections(formGrouping);
          setFormSettings({
            id: data.id,
            companyId: data.companyId,
            name: data.name,
            formType: data.formType,
            description: data.description || "",
            status: data.status,
            requireSignature: data.isSignatureRequired,
            isApprovalRequired: data.isApprovalRequired,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            isActive: data.isActive,
            isSignatureRequired: data.isSignatureRequired,
            FormGrouping: formGrouping,
          });
        } catch (error) {
          console.error("Error fetching form:", error);
          toast.error("Failed to fetch form data", { duration: 3000 });
        } finally {
          setLoading(false);
        }
      };

      fetchForm();
    }
  }, [formId, mode]);

  // Update field
  const updateField = (
    fieldId: string,
    updatedProperties: Partial<FormField>,
  ) => {
    setFormFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, ...updatedProperties } : field,
      ),
    );

    // If we're updating minLength or maxLength, we may need to clear validation errors
    if ("minLength" in updatedProperties || "maxLength" in updatedProperties) {
      setValidationErrors((prev) => {
        const fieldErrors = prev[fieldId] || {};
        const newErrors = { ...fieldErrors };

        if ("minLength" in updatedProperties) {
          delete newErrors.minError;
        }
        if ("maxLength" in updatedProperties) {
          delete newErrors.maxError;
        }

        return {
          ...prev,
          [fieldId]: newErrors,
        };
      });
    }
  };

  // Add field to form
  const addField = (fieldType: string) => {
    if (fieldType === "section") {
      // Create a new section
      const newSection: FormGrouping = {
        id: `section_${Date.now()}`,
        title: "New Section",
        order: formSections.length,
        Fields: [],
      };
      setFormSections([...formSections, newSection]);
    } else {
      // Create a regular field
      const newField: FormField = {
        id: `field_${Date.now()}`,
        formGroupingId: "",
        label: "",
        type: fieldType,
        required: false,
        order: formFields.length,
        placeholder: "",
        minLength: undefined,
        maxLength: undefined,
        multiple: false,
        content: null,
        filter: null,
      };
      setFormFields([...formFields, newField]);
      // Initialize with no validation errors
      setValidationErrors((prev) => ({
        ...prev,
        [newField.id]: {},
      }));
    }
  };

  // Remove field from form
  const removeField = (fieldId: string) => {
    setFormFields(formFields.filter((field) => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
      setEditingFieldId(null);
    }
    // Clean up advanced options state
    setAdvancedOptionsOpen((prev) => {
      const newState = { ...prev };
      delete newState[fieldId];
      return newState;
    });
    // Clean up validation errors
    setValidationErrors((prev) => {
      const newState = { ...prev };
      delete newState[fieldId];
      return newState;
    });
  };

  // Handle dragging and dropping fields to reorder them
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFormFields((fields) => {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      return arrayMove(fields, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index,
      }));
    });
  };

  // Update form settings
  const updateFormSettings = (
    key: keyof FormSettings,
    value: string | boolean,
  ) => {
    setFormSettings({
      ...formSettings,
      [key]: value,
    });
  };

  // Open the cancel confirmation modal
  const openCancelModal = () => {
    setShowCancelModal(true);
  };

  // Handle exiting the form builder/editor
  const handleExitBuild = () => {
    setShowCancelModal(false);
    if (onCancel) {
      onCancel();
    }
  };

  // Unified save function that handles both create and edit modes
  const handleSave = async () => {
    if (!formSettings.name.trim()) {
      toast.error("Please enter a form name");
      return;
    }

    // Validate all fields before saving
    const validationErrors = getFormValidationErrors(formFields);
    const hasErrors = Object.keys(validationErrors).length > 0;

    if (hasErrors) {
      toast.error("Cannot save form - there are incomplete or invalid fields");

      // Find the first field with validation errors and open its options
      const firstErrorFieldId = Object.keys(validationErrors)[0];
      if (firstErrorFieldId) {
        setAdvancedOptionsOpen({
          ...advancedOptionsOpen,
          [firstErrorFieldId]: true,
        });
      }

      return;
    }

    setLoadingSave(true);
    try {
      // Prepare the form data with fields
      const formData = {
        settings: {
          ...formSettings,
          isSignatureRequired: formSettings.requireSignature,
        },
        fields: formFields.map((field) => ({
          ...field,
          // Ensure any properties are properly formatted
          Options: field.Options || [],
        })),
        companyId: formSettings.companyId,
      };

      // Use different API calls based on mode
      let result;
      if (mode === "edit" && formId) {
        result = await updateFormTemplate({
          ...formData,
          formId,
        });
        if (result.success) {
          toast.success("Form updated successfully!");
        }
      } else {
        result = await saveFormTemplate(formData);
        if (result.success) {
          toast.success("Form saved successfully!");
        }
      }

      // Handle successful save/update (redirect or other actions could be added here)
      if (result.success && onCancel) {
        onCancel(); // Navigate away after successful save
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Error ${mode === "edit" ? "updating" : "saving"} form`);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="h-fit w-full flex flex-row  gap-4 mb-4">
        <Button
          variant={"outline"}
          size={"sm"}
          className="bg-red-300 border-none rounded-lg"
          onClick={openCancelModal}
        >
          <div className="flex flex-row items-center">
            <img
              src="/statusDenied.svg"
              alt="Cancel Icon"
              className="w-3 h-3 mr-2"
            />
            <p className="text-xs">Cancel</p>
          </div>
        </Button>
        <Button
          variant={"outline"}
          size={"sm"}
          className="bg-sky-400 border-none rounded-lg"
          onClick={handleSave}
          disabled={!isValid}
        >
          <div className="flex flex-row items-center">
            <img
              src="/formSave.svg"
              alt="Save Icon"
              className="w-3 h-3 mr-2 "
            />
            {mode === "edit" ? "Update" : "Save"}
          </div>
        </Button>
      </div>

      {/* Form Builder Content */}
      <div className="w-full bg-white h-[85vh] flex flex-row rounded-lg">
        {/* Left Panel */}
        <PanelLeft
          formFields={formFields}
          formSettings={formSettings}
          updateFormSettings={updateFormSettings}
        />

        {/* Center Panel */}
        <div className="w-full h-full flex flex-col relative col-span-1">
          <ScrollArea className="w-full h-full bg-slate-100 border-x border-t border-slate-200">
            {/* Form Builder Placeholder */}
            {formFields.length === 0 ? (
              <PanelCenterPlaceholder loading={loading} addField={addField} />
            ) : (
              <div className="w-full h-full pb-[500px]">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={formFields.map((field) => field.id)}>
                    <div className="w-full px-4 pt-3 rounded-lg">
                      <div className="space-y-4">
                        {formFields.map((field) => (
                          <FormFieldComponent
                            key={field.id}
                            field={field}
                            editingFieldId={editingFieldId}
                            updateField={updateField}
                            removeField={removeField}
                            popoverOpenFieldId={popoverOpenFieldId}
                            setPopoverOpenFieldId={setPopoverOpenFieldId}
                            advancedOptionsOpen={advancedOptionsOpen}
                            setAdvancedOptionsOpen={setAdvancedOptionsOpen}
                            validationErrors={validationErrors}
                            setValidationErrors={setValidationErrors}
                          />
                        ))}
                      </div>
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Additional UI for approval and signature requirements */}
                {formSettings && formSettings.isApprovalRequired && (
                  <div className="w-full flex flex-col px-4 mt-2">
                    <div className="bg-white border-slate-200 border rounded-md flex flex-row items-center gap-2 px-4 py-2">
                      <div className="flex items-center w-8 h-8 rounded-lg bg-sky-300 justify-center">
                        <img
                          src="/team.svg"
                          alt="Signature"
                          className="w-4 h-4"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          Submission Requires Approval
                        </p>
                        <p className="text-xs">
                          Form must be reviewed and approved before completion.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formSettings && formSettings.requireSignature && (
                  <div className="w-full flex flex-col px-4 mt-2">
                    <div className="bg-white border-slate-200 border rounded-md flex flex-row items-center gap-2 px-4 py-2">
                      <div className="flex items-center w-8 h-8 rounded-lg bg-lime-300 justify-center">
                        <img
                          src="/formEdit.svg"
                          alt="Signature"
                          className="w-4 h-4"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          Requires Digital Signature
                        </p>
                        <p className="text-xs">
                          A digital signature is needed to complete the
                          submission.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel */}
        <FormBuilderPanelRight addField={addField} />

        {/* Loading overlay */}
        {loadingSave && (
          <div className="absolute inset-0 z-40 w-full h-full bg-white bg-opacity-20 flex items-center justify-center rounded-lg">
            <Spinner size={40} />
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleExitBuild}
      />
    </>
  );
}
