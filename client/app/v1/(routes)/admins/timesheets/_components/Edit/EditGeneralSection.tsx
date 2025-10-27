"use client";
import { Button } from "@/components/ui/button";
import {
  SingleCombobox,
  ComboboxOption,
} from "@/components/ui/single-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { DateTimePicker } from "../../../_pages/DateTimePicker";
import { TimesheetData } from "./hooks/useTimesheetData";

// Skeleton component for loading state

export interface EditGeneralSectionProps {
  form: TimesheetData; // Allow form to be null initially
  setForm: React.Dispatch<React.SetStateAction<TimesheetData | null>>;
  userOptions: { value: string; label: string }[];
  jobsiteOptions: { value: string; label: string }[];
  costCodeOptions: { value: string; label: string }[];
  users: { id: string; firstName: string; lastName: string }[];
  jobsites: { id: string; name: string }[];
  originalForm: TimesheetData | null;
  handleUndoField: (field: keyof TimesheetData) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  workTypeOptions: {
    value: string;
    label: string;
  }[];
}

export default function EditGeneralSection({
  form,
  setForm,
  userOptions,
  jobsiteOptions,
  costCodeOptions,
  jobsites,
  originalForm,
  handleUndoField,
  handleChange,
  workTypeOptions,
}: EditGeneralSectionProps) {
  return (
    <>
      {/* <div className="w-full flex flex-row items-end gap-2  ">
        <div className="w-full">
          <Popover>
            <PopoverTrigger asChild>
              <div className="w-full flex flex-col">
                <label className="w-full text-xs font-semibold mb-1">
                  Created On
                </label>

                <Button
                  disabled
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.date ? (
                    format(form.date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </div>
            </PopoverTrigger>
          </Popover>
        </div>
      </div> */}
      <div className="flex flex-row items-end col-span-2">
        <div className="w-full">
          <SingleCombobox
            label="User"
            options={userOptions}
            value={form.User?.id}
            onChange={(val: string, option?: ComboboxOption) => {
              const selected = option
                ? {
                    id: option.value,
                    firstName:
                      (option as ComboboxOption & { firstName?: string })
                        .firstName || "",
                    lastName:
                      (option as ComboboxOption & { lastName?: string })
                        .lastName || "",
                  }
                : { id: "", firstName: "", lastName: "" };
              setForm({
                ...form,
                User: selected,
              });
            }}
            placeholder="Select user"
            filterKeys={["value", "label"]}
            disabled
          />
        </div>
      </div>

      {/* Jobsite */}
      <div className="w-full">
        <SingleCombobox
          label="Project"
          options={jobsiteOptions}
          value={form.Jobsite?.id}
          onChange={(val: string, option?: ComboboxOption) => {
            const selected = jobsites.find((j) => j.id === val);
            setForm({
              ...form,
              Jobsite: selected || { id: "", name: "" },
              CostCode: { id: "", name: "" },
            });
          }}
          placeholder="Select jobsite"
          filterKeys={["value", "label"]}
        />
      </div>
      {/* Costcode */}
      <div className="w-full">
        <SingleCombobox
          label="Cost Code"
          options={costCodeOptions}
          value={form.CostCode?.id}
          onChange={(val: string, option?: ComboboxOption) => {
            setForm({
              ...form,
              CostCode: option
                ? { id: option.value, name: option.label }
                : { id: "", name: "" },
            });
          }}
          placeholder="Select cost code"
          filterKeys={["value", "label"]}
        />
      </div>
      <div className="w-full flex flex-row items-end">
        <DateTimePicker
          label="Start Time"
          value={form.startTime}
          onChange={(val) => setForm({ ...form, startTime: val })}
        />
        <div>
          {originalForm && form.startTime !== originalForm.startTime && (
            <Button
              type="button"
              size="sm"
              className="ml-2"
              onClick={() => handleUndoField("startTime")}
            >
              Undo
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-row items-end">
        <DateTimePicker
          label="End Time"
          value={form.endTime}
          onChange={(val) => setForm({ ...form, endTime: val })}
        />
        <div>
          {originalForm && form.endTime !== originalForm.endTime && (
            <Button
              type="button"
              size="sm"
              className="ml-2"
              onClick={() => handleUndoField("endTime")}
            >
              Undo
            </Button>
          )}
        </div>
      </div>
      <div className="w-full">
        <div className="flex flex-row items-end">
          <div className="w-full">
            <label className="block text-xs font-semibold mb-1">
              Work Type
            </label>
            <Select
              name="workType"
              value={form.workType || ""}
              onValueChange={(val) =>
                handleChange({
                  target: { name: "workType", value: val },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              <SelectTrigger className="border rounded px-2 py-1 w-full">
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent>
                {workTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {originalForm && form.workType !== originalForm.workType && (
              <Button
                type="button"
                size="sm"
                className="ml-2"
                onClick={() => handleUndoField("workType")}
              >
                Undo
              </Button>
            )}
          </div>
        </div>
        <div className="col-span-1 w-full pt-1 flex flex-row flex-wrap items-end">
          <p className="text-xs text-red-500 break-words">
            <span className="font-semibold">Warning: </span>
            Changing the work type will delete all related logs!
          </p>
        </div>
      </div>
    </>
  );
}
