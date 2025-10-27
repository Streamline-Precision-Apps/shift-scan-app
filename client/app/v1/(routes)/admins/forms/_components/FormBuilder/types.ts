// Types for form building
export interface FormField {
  id: string;
  formGroupingId: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  placeholder?: string;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  multiple?: boolean;
  content?: string | null;
  filter?: string | null;
  Options?: { id: string; value: string }[];
}

export interface FormGrouping {
  id: string;
  title: string;
  order: number;
  Fields: FormField[];
}

export interface FormSettings {
  id: string;
  companyId: string;
  name: string;
  formType: string;
  description: string;
  status: string;
  requireSignature: boolean;
  isApprovalRequired: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: string;
  isSignatureRequired: boolean;
  FormGrouping: FormGrouping[];
}

export const fieldTypes = [
  {
    name: "TEXT",
    label: "Text",
    description: "Single line Input",
    icon: "/title.svg",
    color: "bg-sky-400",
    hover: "hover:bg-sky-300",
  },
  {
    name: "NUMBER",
    label: "Number",
    description: "Numeric Input",
    icon: "/number.svg",
    color: "bg-fuchsia-400",
    hover: "hover:bg-fuchsia-300",
  },
  {
    name: "DATE",
    label: "Date",
    description: "Date picker",
    icon: "/calendar.svg",
    color: "bg-purple-400",
    hover: "hover:bg-purple-300",
  },
  {
    name: "TIME",
    label: "Time",
    description: "Time picker",
    icon: "/clock.svg",
    color: "bg-orange-300",
    hover: "hover:bg-orange-200",
  },
  {
    name: "DROPDOWN",
    label: "Dropdown",
    description: "Multiple options",
    icon: "/layout.svg",
    color: "bg-red-400",
    hover: "hover:bg-red-300",
  },
  {
    name: "TEXTAREA",
    label: "Text Area",
    description: "Multi-line Input",
    icon: "/formList.svg",
    color: "bg-indigo-400",
    hover: "hover:bg-indigo-300",
  },
  {
    name: "CHECKBOX",
    label: "Checkbox",
    description: "Checkbox",
    icon: "/checkbox.svg",
    color: "bg-green-400",
    hover: "hover:bg-green-300",
  },
  {
    name: "RADIO",
    label: "Radio",
    description: "Single choice selection",
    icon: "/radio.svg",
    color: "bg-teal-400",
    hover: "hover:bg-teal-300",
  },
  {
    name: "MULTISELECT",
    label: "Multiselect",
    description: "Select multiple options",
    icon: "/moreOptionsCircle.svg",
    color: "bg-yellow-500",
    hover: "hover:bg-yellow-400",
  },
  {
    name: "SEARCH_PERSON",
    label: "Worker",
    description: "Search and select a worker",
    icon: "/team.svg",
    color: "bg-pink-400",
    hover: "hover:bg-pink-300",
  },
  {
    name: "SEARCH_ASSET",
    label: "Asset",
    description: "Search and select an asset",
    icon: "/equipment.svg",
    color: "bg-orange-400",
    hover: "hover:bg-orange-300",
  },
];

// Props for the unified FormDesigner component
export interface FormDesignerProps {
  onCancel?: () => void; // Callback function for cancellation
  formId?: string; // Optional form ID for editing mode
  mode: "create" | "edit"; // Explicitly specify component mode
}