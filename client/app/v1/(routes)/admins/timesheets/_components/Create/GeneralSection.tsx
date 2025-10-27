"use client";
import { Combobox } from "@/components/ui/combobox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { format as formatDate, parseISO } from "date-fns";
import React, { Dispatch, SetStateAction, use, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { DateTimePicker } from "../../../_pages/DateTimePicker";
import { SingleCombobox } from "@/components/ui/single-combobox";
import { Textarea } from "@/components/ui/textarea";
export default function GeneralSection({
  form,
  setForm,
  handleChange,
  userOptions,
  jobsiteOptions,
  costCodeOptions,
  workTypeOptions,
  datePickerOpen,
  setDatePickerOpen,
  users,
  jobsites,
}: {
  form: {
    date: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
    jobsite: {
      id: string;
      name: string;
    };
    costcode: {
      id: string;
      name: string;
    };
    startTime: Date | null;
    endTime: Date | null;
    workType: string;
    comments: string;
  };
  setForm: Dispatch<
    SetStateAction<{
      date: Date;
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
      jobsite: {
        id: string;
        name: string;
      };
      costcode: {
        id: string;
        name: string;
      };
      startTime: Date | null;
      endTime: Date | null;
      workType: string;
      comments: string;
    }>
  >;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  userOptions: { value: string; label: string }[];
  jobsiteOptions: { value: string; label: string }[];
  costCodeOptions: { value: string; label: string }[];
  workTypeOptions: { value: string; label: string }[];
  datePickerOpen: boolean;
  setDatePickerOpen: (open: boolean) => void;
  users: { id: string; firstName: string; lastName: string }[];
  jobsites: { id: string; name: string }[];
}) {
  return (
    <>
      {/* Creation Date (disabled) */}
      <div className="w-full">
        <label className="block font-semibold text-xs mb-1">
          Creation Date
        </label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-1/2 justify-start text-left font-normal"
              disabled
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.date
                ? formatDate(new Date(form.date), "PPP")
                : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.date ? new Date(form.date) : undefined}
              onSelect={(date) => {
                setForm({
                  ...form,
                  date: date ? date : new Date(),
                });
                setDatePickerOpen(false);
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* User */}
      <div className="w-full">
        <SingleCombobox
          label="User"
          options={userOptions}
          value={form.user.id}
          onChange={(val, option) => {
            const selected = users.find((u) => u.id === val);
            setForm({
              ...form,
              user: selected || { id: "", firstName: "", lastName: "" },
            });
          }}
          placeholder="Select user"
          filterKeys={["value", "label"]}
        />
      </div>
      {/* Jobsite */}
      <div className="w-full">
        <SingleCombobox
          label="Jobsite"
          options={jobsiteOptions}
          value={form.jobsite.id}
          onChange={(val, option) => {
            const selected = jobsites.find((j) => j.id === val);
            setForm({
              ...form,
              jobsite: selected || { id: "", name: "" },
              costcode: { id: "", name: "" },
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
          value={form.costcode.id}
          onChange={(val, option) => {
            setForm({
              ...form,
              costcode: option
                ? { id: option.value, name: option.label }
                : { id: "", name: "" },
            });
          }}
          placeholder="Select cost code"
          filterKeys={["value", "label"]}
          disabled={!form.jobsite.id}
        />
        {!form.jobsite.id && (
          <p className="text-xs text-red-600 mt-1">
            Please select a jobsite first to see relevant cost codes.
          </p>
        )}
      </div>
      {/* Start Date & Time */}
      <div className="mb-2">
        <DateTimePicker
          label="Start Time"
          value={form.startTime ? form.startTime.toISOString() : undefined}
          onChange={(val) => {
            setForm({
              ...form,
              startTime: val ? new Date(val) : null,
            });
          }}
        />
      </div>
      <div className="mb-2">
        {/* End Date & Time */}
        <DateTimePicker
          label="End Time"
          value={form.endTime ? form.endTime.toISOString() : undefined}
          onChange={(val) => {
            setForm({
              ...form,
              endTime: val ? new Date(val) : null,
            });
          }}
        />
      </div>
      {/* Comments */}
      <div className="w-full mb-2">
        <label className="block font-semibold text-sm mb-1">
          Comments <span className="text-red-600">*</span>
        </label>
        <Textarea
          value={form.comments}
          onChange={(e) => setForm({ ...form, comments: e.target.value })}
          placeholder="Enter comments"
        />
      </div>
      {/* work type */}
      <div className="w-full mb-2">
        <label className="block font-semibold text-sm mb-1">
          Work Type <span className="text-red-600">*</span>
        </label>
        <Select
          value={form.workType}
          onValueChange={(val) => setForm({ ...form, workType: val })}
        >
          <SelectTrigger>
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
    </>
  );
}
