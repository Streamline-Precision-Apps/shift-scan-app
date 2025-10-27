"use client";

import { Dispatch, SetStateAction, useState, useMemo } from "react";
import { X, TriangleAlert, CircleAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import { FormField } from "../types";

import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { SortableItem } from "./SortableItem";
import { FieldTypePopover } from "./FieldTypePopover";
import { FieldOptions } from "./field-options/FieldOptions";
import { Badge } from "@/components/ui/badge";
import { hasValidationErrors } from "../utils/fieldValidation";

interface FormFieldProps {
  field: FormField;
  editingFieldId: string | null;
  updateField: (fieldId: string, updatedProperties: Partial<FormField>) => void;
  removeField: (fieldId: string) => void;
  popoverOpenFieldId: string | null;
  setPopoverOpenFieldId: (fieldId: string | null) => void;
  advancedOptionsOpen: Record<string, boolean>;
  setAdvancedOptionsOpen: (value: Record<string, boolean>) => void;
  validationErrors: Record<string, { minError?: string; maxError?: string }>;
  setValidationErrors: Dispatch<
    SetStateAction<
      Record<
        string,
        {
          minError?: string;
          maxError?: string;
        }
      >
    >
  >;
}

export const FormFieldComponent: React.FC<FormFieldProps> = ({
  field,
  editingFieldId,
  updateField,
  removeField,
  popoverOpenFieldId,
  setPopoverOpenFieldId,
  advancedOptionsOpen,
  setAdvancedOptionsOpen,
  validationErrors,
  setValidationErrors,
}) => {
  return (
    <div
      className={`bg-white border-slate-200 border px-2 py-2 rounded-lg transition-all duration-200 ${
        editingFieldId === field.id
          ? "border-sky-400 shadow-md"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Top portion of field */}
      <div className="w-full flex flex-row items-start gap-2">
        {/* Drag handle icon */}
        <SortableItem id={field.id} editingFieldId={editingFieldId}>
          <div className="w-fit h-full bg-transparent flex flex-col p-1 items-center justify-center">
            <img
              src="/dragDots.svg"
              alt="Drag Handle"
              className="w-6 h-6 object-contain cursor-move"
            />
          </div>
        </SortableItem>

        {/* Field type icon */}
        <div className="w-fit h-full">
          <FieldTypePopover
            fieldId={field.id}
            fieldType={field.type}
            isOpen={popoverOpenFieldId === field.id}
            onOpenChange={(open) =>
              setPopoverOpenFieldId(open ? field.id : null)
            }
            updateField={updateField}
          />
        </div>

        {/* Field label */}
        <div className="flex-1 h-full">
          <Textarea
            value={field.label || ""}
            onChange={(e) => {
              updateField(field.id, {
                label: e.target.value,
              });
            }}
            className="bg-white border border-slate-200 rounded-lg text-xs"
            placeholder="Enter Question Label here"
          />
        </div>

        {/* Field options */}
        {field.type !== "DATE" &&
          field.type !== "TIME" &&
          field.type !== "CHECKBOX" && (
            <Toggle
              className="bg-white border border-slate-200 rounded-lg text-xs relative"
              pressed={advancedOptionsOpen[field.id] || false}
              onPressedChange={(value: boolean) => {
                setAdvancedOptionsOpen({
                  ...advancedOptionsOpen,
                  [field.id]: value,
                });
              }}
            >
              <img
                src="/arrowRightSymbol.svg"
                alt="Options Icon"
                className="w-2 h-2 "
              />
              <p className="text-xs ">Options</p>
              {hasValidationErrors(field) && (
                <Badge className="absolute rounded-full -right-1 -top-1 bg-red-500 p-1 w-4 h-4 flex items-center justify-center">
                  <CircleAlert className="w-3 h-3 text-white" />
                </Badge>
              )}
            </Toggle>
          )}

        {/* Field Required */}
        {field.required === true ? (
          <Button
            variant={"outline"}
            onClick={() => {
              updateField(field.id, {
                required: false,
              });
            }}
            className="bg-red-200 border border-slate-200 hover:bg-red-100 rounded-lg"
          >
            <p className="text-xs text-red-600">Required</p>
          </Button>
        ) : (
          <Button
            variant={"outline"}
            onClick={() => {
              updateField(field.id, {
                required: true,
              });
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
          >
            <p className="text-xs text-black">Optional</p>
          </Button>
        )}

        {/* Remove Field Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700"
          onClick={() => removeField(field.id)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Advanced Options Section - Collapsible */}
      {advancedOptionsOpen[field.id] &&
        !["DATE", "TIME"].includes(field.type) && (
          <FieldOptions
            field={field}
            updateField={updateField}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
        )}
    </div>
  );
};
