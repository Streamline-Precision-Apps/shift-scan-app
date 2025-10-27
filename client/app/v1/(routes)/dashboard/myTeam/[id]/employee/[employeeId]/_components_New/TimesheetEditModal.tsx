import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTimecardIdData } from "./useTimecardIdData";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
type AppManagerEditTimesheetModalProps = {
  timesheetId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function AppManagerEditTimesheetModal(
  props: AppManagerEditTimesheetModalProps,
) {
  const { timesheetId, isOpen, onClose } = props;
  const {
    data,
    setEdited,
    loading,
    error,
    save,
    costCodes,
    jobSites,
    reset,
    setChangeReason,
  } = useTimecardIdData(timesheetId);

  const [isSaving, setIsSaving] = useState(false);

  const [editGeneral, setEditGeneral] = useState(false);
  const [changeReason, setLocalChangeReason] = useState("");

  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    startTime?: string;
    endTime?: string;
    jobsite?: string;
    costCode?: string;
  }>({});
  const [showValidation, setShowValidation] = useState(false);

  // State for date and time pickers
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<string>("");

  // We no longer need popover state variables since we're using native inputs

  // Initialize date/time state when entering edit mode or when data changes
  useEffect(() => {
    if (data && editGeneral) {
      // Only set these values when entering edit mode to avoid unnecessary updates
      if (data.startTime) {
        const startDateTime = new Date(data.startTime);
        setStartDate(startDateTime);
        setStartTime(format(startDateTime, "HH:mm"));
      }

      if (data.endTime) {
        const endDateTime = new Date(data.endTime);
        setEndDate(endDateTime);
        setEndTime(format(endDateTime, "HH:mm"));
      }
    }
  }, [data, editGeneral]); // Update timesheet only when user interacts with inputs
  const updateStartDateTime = useCallback(() => {
    if (startDate && startTime && editGeneral) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const newStartDate = new Date(startDate);
      newStartDate.setHours(hours, minutes, 0, 0);

      setEdited((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          startTime: newStartDate,
        };
      });
    }
  }, [startDate, startTime, editGeneral, setEdited]);

  const updateEndDateTime = useCallback(() => {
    if (endDate && endTime && editGeneral) {
      const [hours, minutes] = endTime.split(":").map(Number);
      const newEndDate = new Date(endDate);
      newEndDate.setHours(hours, minutes, 0, 0);

      setEdited((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          endTime: newEndDate,
        };
      });
    }
  }, [endDate, endTime, editGeneral, setEdited]);

  // Validation function
  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!data) return errors;

    // Check if start time is missing
    if (!data.startTime && !startDate) {
      errors.startTime = "Start time is required";
    }

    // Check if end time is missing
    if (!data.endTime && !endDate) {
      errors.endTime = "End time is required";
    }

    // Check if jobsite is missing
    if (!data.Jobsite?.id) {
      errors.jobsite = "Jobsite is required";
    }

    // Check if cost code is missing
    if (!data.CostCode?.id) {
      errors.costCode = "Cost code is required";
    }

    // Check if end time is before start time
    if (data.startTime && data.endTime) {
      const startDateTime = new Date(data.startTime);
      const endDateTime = new Date(data.endTime);

      if (endDateTime <= startDateTime) {
        errors.endTime = "End time must be after start time";
      }
    }

    return errors;
  };

  // Only run the updates when start/end time or date changes
  useEffect(() => {
    updateStartDateTime();
  }, [updateStartDateTime]);

  useEffect(() => {
    updateEndDateTime();
  }, [updateEndDateTime]);

  if (!isOpen) return null;

  const onSave = async () => {
    // Validate form before saving
    const errors = validateForm();
    setValidationErrors(errors);
    setShowValidation(true);

    // If there are validation errors, don't proceed with save
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Save edited start/end time if validation passes
    setIsSaving(true);
    await save();
    // Add a short delay for a smoother transition
    setTimeout(() => {
      setEditGeneral(false);
      setIsSaving(false);
      setShowValidation(false);
      setValidationErrors({});
    }, 1000); // 1s delay for smoothness
  };

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center bg-black bg-opacity-60 overflow-x-hidden">
      <div className="bg-white shadow-2xl  w-full max-w-md h-full flex flex-col overflow-hidden transition-all duration-300 overflow-x-hidden">
        {/* Header */}
        <div className="px-4 pt-4 border-b bg-neutral-200">
          <div className="flex items-center justify-between pb-1 relative">
            <h2 className="text-lg font-bold text-center absolute left-1/2 -translate-x-1/2 w-full pointer-events-none tracking-wide">
              <span className="inline-flex items-center gap-2">
                <img src="/form.svg" alt="Timesheet" className="w-6 h-6" />
                Timesheet
              </span>
            </h2>
            <div className="w-8 h-8" />
          </div>
          <div className="flex flex-col items-center justify-center pb-2">
            <span className="text-xs text-muted-foreground mt-0.5 break-all">
              ID: {timesheetId}
            </span>
          </div>
        </div>
        {/* Content */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-32 pt-4 transition-colors duration-300 no-scrollbar"
          style={{
            background: "white",
            maxWidth: "100vw",
            opacity: isSaving ? 0.5 : 1,
            pointerEvents: isSaving ? "none" : "auto",
          }}
        >
          {isSaving && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              {/* Replace with your spinner component if available */}
              <svg
                className="animate-spin h-8 w-8 text-app-green"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-0 mt-2 animate-pulse">
              {/* Start Time Skeleton */}
              <div className="flex flex-col py-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-4 h-4 rounded bg-gray-200" />
                  <Skeleton className="h-4 w-20 rounded bg-gray-200" />
                </div>
                <Skeleton className="h-10 w-full rounded bg-gray-200" />
              </div>
              {/* End Time Skeleton */}
              <div className="flex flex-col py-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="w-4 h-4 rounded bg-gray-200" />
                  <Skeleton className="h-4 w-20 rounded bg-gray-200" />
                </div>
                <Skeleton className="h-10 w-full rounded bg-gray-200" />
              </div>
              {/* Jobsite Skeleton */}
              <div className="flex items-center gap-2 py-3 border-b">
                <Skeleton className="w-4 h-4 rounded bg-gray-200" />
                <Skeleton className="h-4 w-20 rounded bg-gray-200" />
                <Skeleton className="h-10 w-32 rounded bg-gray-200 ml-auto" />
              </div>
              {/* Cost Code Skeleton */}
              <div className="flex items-center gap-2 py-3 border-b">
                <Skeleton className="w-4 h-4 rounded bg-gray-200" />
                <Skeleton className="h-4 w-20 rounded bg-gray-200" />
                <Skeleton className="h-10 w-32 rounded bg-gray-200 ml-auto" />
              </div>
              {/* Comment Skeleton */}
              <div className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="w-4 h-4 rounded bg-gray-200" />
                  <Skeleton className="h-4 w-20 rounded bg-gray-200" />
                </div>
                <Skeleton className="h-20 w-full rounded bg-gray-200" />
                <div className="flex justify-end mt-1">
                  <Skeleton className="h-3 w-12 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-xs text-red-500">{error}</div>
          ) : data ? (
            <div className="flex flex-col gap-0 mt-2">
              {/* Start Time */}
              <div className="flex flex-col py-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="/clock.svg"
                    alt="Start"
                    className="w-4 h-4 opacity-70"
                  />
                  <label className="text-xs font-semibold">Start Time</label>
                </div>
                <div className="w-full">
                  {editGeneral ? (
                    <div className="flex gap-4 justify-center">
                      <div className="flex flex-col">
                        <input
                          id="start-date-picker"
                          type="date"
                          value={
                            startDate
                              ? format(new Date(startDate), "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              // Convert the date string to ISO format
                              const selectedDate = new Date(e.target.value);
                              setStartDate(selectedDate);
                            } else {
                              setStartDate(null);
                            }
                          }}
                          className="w-32 bg-white  appearance-none rounded-md"
                        />
                      </div>
                      <div className="flex flex-col">
                        <input
                          type="time"
                          id="start-time-picker"
                          step="60"
                          value={startTime}
                          onChange={(e) => {
                            setStartTime(e.target.value);
                            // No need to call updateStartDateTime here,
                            // the useEffect with useCallback dependency will handle it
                          }}
                          className="bg-white  appearance-none rounded-md"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <span className="text-sm">
                        {data.startTime
                          ? new Date(data.startTime).toLocaleString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            })
                          : "-"}
                      </span>
                    </div>
                  )}
                </div>
                {showValidation && validationErrors.startTime && (
                  <div className="text-red-500 text-xs mt-1 px-1">
                    {validationErrors.startTime}
                  </div>
                )}
              </div>
              {/* End Time */}
              <div className="flex flex-col py-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="/clock.svg"
                    alt="End"
                    className="w-4 h-4 opacity-70"
                  />
                  <label className="text-xs font-semibold">End Time</label>
                </div>
                <div className="w-full">
                  {editGeneral ? (
                    <div className="flex gap-4 justify-center">
                      <div className="flex flex-col">
                        <input
                          type="date"
                          id="end-date-picker"
                          value={
                            endDate
                              ? format(new Date(endDate), "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              // Convert the date string to ISO format
                              const selectedDate = new Date(e.target.value);
                              setEndDate(selectedDate);
                            } else {
                              setEndDate(null);
                            }
                          }}
                          className="w-32 bg-white appearance-none rounded-md"
                        />
                      </div>
                      <div className="flex flex-col">
                        <input
                          type="time"
                          id="end-time-picker"
                          step="60"
                          value={endTime}
                          onChange={(e) => {
                            setEndTime(e.target.value);
                            // No need to call updateEndDateTime here,
                            // the useEffect with useCallback dependency will handle it
                          }}
                          className="bg-white  appearance-none rounded-md"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <span className="text-sm">
                        {data.endTime
                          ? new Date(data.endTime).toLocaleString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                            })
                          : "-"}
                      </span>
                    </div>
                  )}
                </div>
                {showValidation && validationErrors.endTime && (
                  <div className="text-red-500 text-xs mt-1 px-1">
                    {validationErrors.endTime}
                  </div>
                )}
              </div>
              {/* Jobsite */}
              {/* Jobsite */}
              <div className="flex flex-col py-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="/jobsite.svg"
                    alt="Jobsite"
                    className="w-4 h-4 opacity-70"
                  />
                  <label className="text-xs font-semibold">Jobsite</label>
                </div>
                <div className="w-full">
                  <Select
                    value={data.Jobsite?.id ?? ""}
                    onValueChange={(val) => {
                      const newJobsite = jobSites.find((j) => j.id === val);
                      setEdited((prev) =>
                        prev
                          ? {
                              ...prev,
                              Jobsite:
                                jobSites.find((j) => j.id === val) ?? null,
                            }
                          : prev,
                      );
                    }}
                    disabled={!editGeneral}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select jobsite" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobSites.map((jobsite) => (
                        <SelectItem key={jobsite.id} value={jobsite.id}>
                          {jobsite.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {showValidation && validationErrors.jobsite && (
                  <div className="text-red-500 text-xs mt-1 px-1">
                    {validationErrors.jobsite}
                  </div>
                )}
              </div>
              {/* Cost Code */}
              <div className="flex flex-col py-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="/number.svg"
                    alt="Cost Code"
                    className="w-4 h-4 opacity-70"
                  />
                  <label className="text-xs font-semibold">Cost Code</label>
                </div>
                <div className="w-full">
                  <Select
                    value={data.CostCode?.id ?? ""}
                    onValueChange={(val) => {
                      setEdited((prev) =>
                        prev
                          ? {
                              ...prev,
                              CostCode:
                                costCodes.find((c) => c.id === val) ?? null,
                            }
                          : prev,
                      );
                    }}
                    disabled={!editGeneral}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cost code" />
                    </SelectTrigger>
                    <SelectContent>
                      {costCodes.map((code) => (
                        <SelectItem key={code.id} value={code.id}>
                          {code.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {showValidation && validationErrors.costCode && (
                  <div className="text-red-500 text-xs mt-1 px-1">
                    {validationErrors.costCode}
                  </div>
                )}
              </div>
              {/* Comment */}
              <div className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="/comment.svg"
                    alt="Comment"
                    className="w-4 h-4 opacity-70"
                  />
                  <label className="text-xs font-semibold flex-1 max-w-[100px] truncate">
                    Comment
                  </label>
                </div>
                <Textarea
                  value={data.comment ?? ""}
                  maxLength={40}
                  onChange={(e) => {
                    if (!editGeneral) return;
                    const val = e.target.value.slice(0, 40);
                    setEdited((prev) =>
                      prev ? { ...prev, comment: val } : prev,
                    );
                  }}
                  disabled={!editGeneral}
                  className={
                    editGeneral
                      ? "truncate border border-gray-300 bg-gray-50"
                      : "truncate"
                  }
                  style={{ overflowX: "auto", textOverflow: "ellipsis" }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-muted-foreground">
                    {data.comment?.length ?? 0} / 40
                  </span>
                </div>
              </div>
              {/* Reason for change */}
              {editGeneral && (
                <div className="py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src="/comment.svg"
                      alt="Reason"
                      className="w-4 h-4 opacity-70"
                    />
                    <label className="text-xs font-semibold flex-1 max-w-[140px] truncate">
                      Reason for change <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <Textarea
                    maxLength={100}
                    placeholder="Enter reason for change..."
                    value={changeReason}
                    onChange={(e) => {
                      setLocalChangeReason(e.target.value);
                      setChangeReason(e.target.value);
                    }}
                    className="ring-2 ring-app-orange truncate"
                    required
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
        {/* Sticky Action Bar for Edit/Exit and Save/Cancel */}
        {!editGeneral ? (
          <div className="fixed bottom-0 left-0 w-full max-w-md bg-gradient-to-tr from-app-dark-blue/20 to-app-blue/20 border-t flex gap-2 px-4 pt-3 pb-8 z-50 shadow-lg">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-lg text-base font-medium"
              onClick={onClose}
              aria-label="Exit"
            >
              <img src="/arrowBack.svg" alt="Exit" className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-lg text-base font-medium bg-app-orange hover:bg-app-orange/80 text-black transition-colors"
              onClick={() => setEditGeneral(true)}
              aria-label="Edit"
            >
              <img src="/formEdit.svg" alt="Edit" className="w-5 h-5" />
              Edit
            </Button>
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 w-full max-w-md bg-neutral-200 border-t flex gap-2 px-4 pt-3 pb-8 z-50 shadow-lg animate-fade-in">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-lg text-base font-medium bg-white hover:bg-gray-100 transition-colors"
              onClick={() => {
                setEditGeneral(false);
                setShowValidation(false);
                setValidationErrors({});
                reset();
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 flex items-center justify-center gap-2 min-h-[48px] rounded-lg text-base font-semibold bg-app-green text-white shadow-md transition-colors disabled:bg-app-green"
              onClick={onSave}
              disabled={isSaving || !editGeneral || !changeReason.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
