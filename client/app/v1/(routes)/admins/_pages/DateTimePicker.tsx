import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// DateTimePicker component for date and time selection
export function DateTimePicker({
  value,
  onChange,
  label,
  font = "font-semibold",
  row = true,
}: {
  value?: string;
  onChange: (val: string) => void;
  label: string;
  font?: "font-semibold" | "font-bold" | "font-normal";
  row?: boolean;
}) {
  // Always derive date and time from value prop
  const dateValue = value ? new Date(value) : undefined;
  const timeValue = value ? format(new Date(value), "HH:mm") : "";

  // Handlers update only the changed part and call onChange
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    const [hours, minutes] = timeValue ? timeValue.split(":") : ["00", "00"];
    date.setHours(Number(hours), Number(minutes), 0, 0);
    onChange(date.toISOString());
  };
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    if (!dateValue) return;
    const [hours, minutes] = time.split(":");
    const newDate = new Date(dateValue);
    newDate.setHours(Number(hours), Number(minutes), 0, 0);
    onChange(newDate.toISOString());
  };

  // A type for HTMLInputElement that may have the showPicker method
  type HTMLInputElementWithShowPicker = HTMLInputElement & {
    showPicker?: () => void;
  };

  // Try to open the native time picker when the input is focused or clicked.
  // Many Chromium-based browsers expose `HTMLInputElement.showPicker()` which
  // opens the native picker programmatically. If that's not available we
  // fall back to selecting the input so the user can type immediately.
  const openTimePicker = (el: HTMLInputElement | null) => {
    if (!el) return;
    const inputWithPicker = el as HTMLInputElementWithShowPicker;
    if (typeof inputWithPicker.showPicker === "function") {
      try {
        inputWithPicker.showPicker();
      } catch (e) {
        // ignore if it throws; we'll still select the input below
        el.select?.();
      }
    } else {
      // fallback: select the value so typing replaces it immediately
      el.select?.();
    }
  };

  return (
    <div className="w-full">
      <label className={`block text-xs ${font} mb-1`}>{label}</label>
      <div className={`w-full flex ${row ? "flex-row" : "flex-col"} gap-2`}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? (
                <p className="text-xs">{format(dateValue, "PPP")}</p>
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 ">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleDateChange}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          onFocus={(e) => openTimePicker(e.currentTarget)}
          onClick={(e) => openTimePicker(e.currentTarget)}
          className="border rounded px-2 py-1 text-xs w-full"
        />
      </div>
    </div>
  );
}
