import * as React from "react";
import { ChevronsUpDownIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  [key: string]: string | number | boolean | undefined;
}

interface SingleComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string, option?: ComboboxOption) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  filterKeys?: string[];
  font?: "font-semibold" | "font-bold" | "font-normal";
  required?: boolean;
  errorMessage?: string;
}

export function SingleCombobox({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  disabled = false,
  filterKeys = ["label"],
  font = "font-semibold",
  required = false,
  errorMessage = "This field is required.",
}: SingleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [touched, setTouched] = React.useState(false);

  const filteredOptions = options.filter((option) => {
    if (!search.trim()) return true;
    if (!Array.isArray(filterKeys)) return true;
    return filterKeys.some((key) => {
      const value = key
        .split(".")
        .reduce<unknown>(
          (obj, k) =>
            obj && typeof obj === "object"
              ? (obj as Record<string, unknown>)[k]
              : undefined,
          option,
        );
      return (value ?? "")
        .toString()
        .toLowerCase()
        .includes(search.toLowerCase());
    });
  });

  const showError = required && touched && !value;

  return (
    <div>
      {label && <label className={`block text-xs ${font} mb-1`}>{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between text-xs overflow-hidden ${
              showError ? "border-red-500" : ""
            }`}
            disabled={disabled}
            onBlur={() => setTouched(true)}
          >
            {value
              ? options.find((option) => option.value === value)?.label ||
                placeholder
              : placeholder}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 min-w-[200px] text-xs ">
          <Command>
            <CommandInput
              placeholder={`Search...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const checked = value === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange(option.value, option);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={`mr-2 h-4 w-4 ${
                          checked ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
