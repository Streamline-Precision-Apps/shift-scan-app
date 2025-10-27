// Shared types for equipment page and its components

// Define simple types that match the JSON structure
export type Priority = "PENDING" | "LOW" | "MEDIUM" | "HIGH" | "TODAY";

// Type for refuel log data
export type RefuelLogData = {
  id: string;
  gallonsRefueled: number | null;
};

// Type alias for RefuelLogData for backward compatibility
export type Refueled = RefuelLogData;

// Type for equipment vehicle info
export type EquipmentVehicleInfo = {
  make: string | null;
  model: string | null;
  year: string | null;
  licensePlate: string | null;
  mileage: number | null;
};

// Type for maintenance data
export type MaintenanceData = {
  id: string;
  equipmentIssue: string | null;
  additionalInfo: string | null;
};

// Type for maintenance data in the UI form
export type MaintenanceFormData = {
  id?: string;
  equipmentIssue: string | null;
  additionalInfo: string | null;
};

export type EquipmentState =
  | "AVAILABLE"
  | "IN_USE"
  | "MAINTENANCE"
  | "NEEDS_REPAIR"
  | "RETIRED";
// Type for equipment data
export type EquipmentData = {
  id: string;
  name: string;
  state: EquipmentState; // API returns state property
  equipmentTag: string;
  equipmentVehicleInfo: EquipmentVehicleInfo | null;
};

// Type for API response
export type EmployeeEquipmentLogData = {
  id: string;
  equipmentId: string;
  jobsiteId: string;
  employeeId: string;
  startTime: string | null;
  endTime: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  isFinished: boolean;
  status: string; // Replace FormStatus with string for status property, or define a local type if needed
  workType: string;
  relatedLogId: string | null;
  timeSheetId: string | null;
  Equipment: EquipmentData;
  RefuelLog: RefuelLogData | null; // Changed from RefuelLogs to RefuelLog to match API response
  MaintenanceId: MaintenanceData | null;
};

// Type for equipment log in the UI form
export type EquipmentLog = {
  id: string;
  equipmentId: string;
  startTime: string;
  endTime: string;
  comment?: string;
  isFinished: boolean;
  equipment: {
    name: string;
    status: string;
  };
  maintenanceId: MaintenanceFormData | null;
  refuelLogs: RefuelLogData | null;
  fullyOperational: boolean;
};

// Unified state type that includes all UI state and form data
export type UnifiedEquipmentState = {
  // Loading and UI state
  isLoading: boolean;
  hasChanged: boolean;
  markedForRefuel: boolean;
  // Form data (transformed from API response)
  formState: EquipmentLog;

  // Error handling
  error: string | null;
};
