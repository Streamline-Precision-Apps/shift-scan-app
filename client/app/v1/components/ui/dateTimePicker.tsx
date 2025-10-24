"use client";
import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
export interface DateTimePickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  font?: string;
}

export function DateTimePicker({
  value,
  onChange,
  label,
  font,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  // Parse value to get date and time
  let date: Date | undefined = undefined;
  let time = "";
  if (value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      date = d;
      // Get time in HH:mm format
      time = d.toISOString().substring(11, 16);
    }
  }
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    // If time is set, combine date and time
    const newDate = new Date(selectedDate);
    if (time) {
      const [hours, minutes] = time.split(":");
      newDate.setHours(Number(hours));
      newDate.setMinutes(Number(minutes));
    }
    onChange(newDate.toISOString());
    setOpen(false);
  };
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    const newDate = date ? new Date(date) : new Date();
    const [hours, minutes] = newTime.split(":");
    newDate.setHours(Number(hours));
    newDate.setMinutes(Number(minutes));
    onChange(newDate.toISOString());
  };
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          {label || "Date"}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className={`w-32 justify-between ${font || "font-normal"}`}
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          value={time}
          onChange={handleTimeChange}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
