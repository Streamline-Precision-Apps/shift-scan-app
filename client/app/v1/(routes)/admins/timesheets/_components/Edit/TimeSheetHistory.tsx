import React from "react";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define types for our change log data
interface ChangeLogEntry {
  id: string;
  changedBy: string;
  changedAt: string | Date;
  changes: Record<string, { old: unknown; new: unknown }>;
  changeReason?: string;
  User?: {
    firstName: string;
    lastName: string;
  };
}

interface TimeSheetHistoryProps {
  changeLogs: ChangeLogEntry[];
  users: { id: string; firstName: string; lastName: string }[]; // Using a more specific type
}

// Helper function to format field names for display
const formatFieldName = (fieldName: string): string => {
  // Special case mappings for better readability
  const fieldMappings: Record<string, string> = {
    startTime: "Start Time",
    endTime: "End Time",
    status: "Status",
    workType: "Work Type",
    comment: "Comment",
    date: "Date",
    User: "Employee",
    Jobsite: "Job Site",
    CostCode: "Cost Code",
  };

  if (fieldMappings[fieldName]) {
    return fieldMappings[fieldName];
  }

  // Convert camelCase to Title Case with spaces
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

// Helper function to format field values for display
const formatFieldValue = (fieldName: string, value: unknown): string => {
  if (value === null || value === undefined) return "None";

  // Format based on field type
  if (
    fieldName === "startTime" ||
    fieldName === "endTime" ||
    fieldName.includes("Time")
  ) {
    if (typeof value === "string") {
      return format(new Date(value), "MMM d, h:mm a");
    }
    if (value instanceof Date) {
      return format(value, "MMM d, h:mm a");
    }
  }

  if (fieldName === "date") {
    if (typeof value === "string") {
      return format(new Date(value), "MMM d, yyyy");
    }
    if (value instanceof Date) {
      return format(value, "MMM d, yyyy");
    }
  }

  if (fieldName === "status") {
    const statusMap: Record<string, string> = {
      DRAFT: "Draft",
      PENDING: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    };
    if (typeof value === "string") {
      return statusMap[value] || value;
    }
  }

  if (fieldName === "workType") {
    const workTypeMap: Record<string, string> = {
      MECHANIC: "Maintenance",
      TRUCK_DRIVER: "Trucking",
      TASCO: "Tasco",
      LABOR: "General Labor",
    };
    if (typeof value === "string") {
      return workTypeMap[value] || value;
    }
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

// Get the user's full name from their ID
const getUserName = (
  userId: string,
  users: { id: string; firstName: string; lastName: string }[],
): string => {
  const user = users.find((u) => u.id === userId);
  if (user) {
    return `${user.firstName} ${user.lastName}`;
  }
  return userId; // Return the ID if user not found
};

export const TimeSheetHistory: React.FC<TimeSheetHistoryProps> = ({
  changeLogs,
  users,
}) => {
  if (!changeLogs || changeLogs.length === 0) {
    return (
      <div className="text-gray-500 italic">No change history available</div>
    );
  }

  // Sort logs by date, newest first
  const sortedLogs = [...changeLogs].sort((a, b) => {
    const dateA = new Date(a.changedAt);
    const dateB = new Date(b.changedAt);
    return dateB.getTime() - dateA.getTime();
  });

  // Separate the most recent change from older changes
  const mostRecentChange = sortedLogs[0];
  const olderChanges = sortedLogs.slice(1);

  // Helper function to render a change log entry
  const renderChangeLogEntry = (log: ChangeLogEntry) => {
    const changedFields = Object.keys(log.changes);
    return (
      <div className="mt-1">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-1 w-1/4">Update Field</th>
              <th className="text-left p-1 w-1/3">From</th>
              <th className="text-left p-1 w-1/3">To</th>
            </tr>
          </thead>
          <tbody>
            {changedFields.map((field, index) => (
              <tr key={field} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-1 font-medium">{formatFieldName(field)}</td>
                <td className="p-1 text-gray-600">
                  {formatFieldValue(field, log.changes[field].old)}
                </td>
                <td className="p-1 font-medium text-blue-600">
                  {formatFieldValue(field, log.changes[field].new)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto">
      {/* Accordion for older changes */}
      {olderChanges.length > 0 && (
        <Accordion type="single" collapsible className="mb-4">
          {olderChanges.map((log) => {
            const changeDate = new Date(log.changedAt);
            const changerName = log.User
              ? `${log.User.firstName} ${log.User.lastName}`
              : getUserName(log.changedBy, users);

            return (
              <AccordionItem key={log.id} value={log.id}>
                <AccordionTrigger className="py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{changerName}</span>
                    <span className="text-gray-500">
                      {format(changeDate, "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {log.changeReason && (
                    <div className="text-xs text-gray-600 mb-2 italic">
                      &ldquo;{log.changeReason}&rdquo;
                    </div>
                  )}
                  {renderChangeLogEntry(log)}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Most recent change always visible at the bottom */}
      {mostRecentChange && (
        <div className="border rounded-md p-3 bg-blue-50">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {mostRecentChange.User
                  ? `${mostRecentChange.User.firstName} ${mostRecentChange.User.lastName}`
                  : getUserName(mostRecentChange.changedBy, users)}
              </span>
              <span className="text-xs text-gray-500">
                {format(
                  new Date(mostRecentChange.changedAt),
                  "MMM d, yyyy h:mm a",
                )}
              </span>
            </div>
          </div>

          {mostRecentChange.changeReason && (
            <div className="text-xs text-gray-600 mb-2 italic">
              &ldquo;{mostRecentChange.changeReason}&rdquo;
            </div>
          )}

          {renderChangeLogEntry(mostRecentChange)}
        </div>
      )}
    </div>
  );
};
