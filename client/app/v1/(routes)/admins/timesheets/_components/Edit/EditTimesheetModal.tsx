import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditMechanicProjects } from "./EditMechanicProjects";
import { EditTruckingLogs } from "./EditTruckingLogs";
import { EditTascoLogs } from "./EditTascoLogs";
import { EditEmployeeEquipmentLogs } from "./EditEmployeeEquipmentLogs";
import { adminSetNotificationToRead } from "@/actions/records-timesheets";
import { adminUpdateTimesheetOptimized } from "@/actions/optimized-timesheet-updates";
import EditGeneralSection from "./EditGeneralSection";
import { SquareCheck, SquareXIcon, X, ClockIcon } from "lucide-react";
import { isMechanicProjectComplete } from "./utils/validation";
import {
  EditTimesheetModalProps,
  TimesheetData,
  useTimesheetData,
} from "./hooks/useTimesheetData";
import { useTimesheetChanges } from "./hooks/useTimesheetChanges";
import { useTimesheetLogs } from "./hooks/useTimesheetLogs";
import { toast } from "sonner";
import { TimeSheetHistory } from "./TimeSheetHistory";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardData } from "../../../_pages/sidebar/DashboardDataContext";
import { format } from "date-fns";
import Spinner from "@/components/(animations)/spinner";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for change logs
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

export const EditTimesheetModal: React.FC<EditTimesheetModalProps> = ({
  timesheetId,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<TimesheetData | null>(null);
  const [originalForm, setOriginalForm] = useState<TimesheetData | null>(null);
  const [changeLogs, setChangeLogs] = useState<ChangeLogEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const { data: session } = useSession();
  const { refresh } = useDashboardData();

  const editor = session?.user?.id;

  // Fetch dropdown and related data with memoized options
  const {
    users,
    jobsites,
    userOptions,
    jobsiteOptions,
    costCodeOptions,
    equipmentOptions,
    truckOptions,
    trailerOptions,
    materialTypeOptions,
  } = useTimesheetData(form);

  // Log handlers
  const logs = useTimesheetLogs(form, setForm, originalForm);

  useEffect(() => {
    if (!isOpen || !timesheetId) return;
    setLoading(true);
    setError(null);

    // Fetch timesheet data
    fetch(`/api/getTimesheetById?id=${timesheetId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch timesheet");
        return res.json();
      })
      .then((json) => {
        setForm(json); // Pre-populate form
        setOriginalForm(json); // Store original for undo
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    // Fetch change logs separately
    fetch(`/api/getTimesheetChangeLogs?timeSheetId=${timesheetId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch change logs");
        return res.json();
      })
      .then((json) => {
        setChangeLogs(json);
      })
      .catch((e) => {
        console.error("Error fetching change logs:", e);
        // Don't set the error state for this, as it's not critical
      });
  }, [isOpen, timesheetId]);

  // Work type options and log section mapping
  const workTypeOptions = [
    { value: "MECHANIC", label: "Maintenance" },
    { value: "TRUCK_DRIVER", label: "Trucking" },
    { value: "TASCO", label: "Tasco" },
    { value: "LABOR", label: "General" },
  ];
  const showMaintenance = form?.workType === "MECHANIC";
  const showTrucking = form?.workType === "TRUCK_DRIVER";
  const showTasco = form?.workType === "TASCO";
  const showEquipment = form?.workType === "LABOR";

  // Initialize change detection hook
  const { detectChanges } = useTimesheetChanges();

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !originalForm) return;

    // Validate that a change reason is provided
    if (!changeReason.trim()) {
      toast.error("Please provide a reason for the changes", {
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the hook to detect changes between original and current form
      const { changes, wasStatusChanged, numberOfChanges } = detectChanges(
        originalForm,
        form,
      );

      // Deep comparison check for any changes in the form
      const hasAnyChanges =
        JSON.stringify(originalForm) !== JSON.stringify(form);

      // If no changes were made at any level, inform the user
      if (!hasAnyChanges) {
        toast.info("No changes were made to the timesheet", { duration: 3000 });
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("id", timesheetId.toString());
      formData.append("data", JSON.stringify(form));
      formData.append("originalData", JSON.stringify(originalForm)); // Include original data for diffing
      formData.append("changes", JSON.stringify(changes));
      formData.append("editorId", editor || "");
      formData.append("changeReason", changeReason);
      formData.append("wasStatusChanged", wasStatusChanged.toString());
      formData.append("numberOfChanges", numberOfChanges.toString());
      console.log("Submitting changes:", formData);
      const result = await adminUpdateTimesheetOptimized(formData); // Use the optimized function
      if (result.success) {
        //after a successful update, refresh the dashboard data and close the modal the notification will be sent in the background
        if (onUpdated) onUpdated();
        onClose();
        toast.success("Timesheet updated successfully", { duration: 3000 });
        setLoading(false);

        if (!result.onlyStatusUpdated && numberOfChanges > 0) {
          await fetch("/api/notifications/send-multicast", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topic: "timecards-changes",
              title: "Timecard Modified ",
              message: `${result.editorFullName} made ${numberOfChanges} changes to ${result.userFullname}'s timesheet #${timesheetId}.`,
              link: `/admins/timesheets?id=${timesheetId}`,
              referenceId: timesheetId,
            }),
          });
        }
      }
    } catch (error) {
      toast.error(`Failed to update timesheet ${form.id}`, { duration: 3000 });
      setError("Failed to update timesheet in admin records.");
      setLoading(false);
    }
  };

  // For work types that should only have one log (Trucking, Tasco)
  const ensureSingleLog = (logType: "TruckingLogs" | "TascoLogs") => {
    if (!form) return;
    setForm((prev) => {
      if (!prev) return prev;
      // If no log exists, add one
      if (prev[logType].length === 0) {
        if (logType === "TruckingLogs") {
          return {
            ...prev,
            TruckingLogs: [
              {
                id: Date.now().toString(),
                truckNumber: "",
                trailerNumber: "",
                startingMileage: 0,
                endingMileage: 0,
                EquipmentHauled: [],
                Materials: [],
                RefuelLogs: [],
                StateMileages: [],
              },
            ],
          };
        } else if (logType === "TascoLogs") {
          return {
            ...prev,
            TascoLogs: [
              {
                id: Date.now().toString(),
                shiftType: "",
                laborType: "",
                materialType: "",
                LoadQuantity: 0,
                RefuelLogs: [],
                Equipment: null,
              },
            ],
          };
        }
      }
      // If more than one log exists, keep only the first
      if (prev[logType].length > 1) {
        return {
          ...prev,
          [logType]: [prev[logType][0]],
        };
      }
      return prev;
    });
  };

  // Call ensureSingleLog when workType changes to TRUCK_DRIVER or TASCO
  useEffect(() => {
    if (!form) return;
    if (form.workType === "TRUCK_DRIVER") {
      ensureSingleLog("TruckingLogs");
    } else if (form.workType === "TASCO") {
      ensureSingleLog("TascoLogs");
    }
  }, [form?.workType]);

  // Using memoized dropdown options from the hook
  // No need to map the data here as it's already done in the hook

  const setNotificationToRead = async () => {
    try {
      if (!editor) return;

      await adminSetNotificationToRead(editor, timesheetId, "Verified");
    } catch (error) {
      console.error("Error setting notification to read:", error);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[600px] h-[80vh] px-6 py-4 flex flex-col items-center">
        <div className="w-full flex flex-col border-b border-gray-100 pb-3 relative">
          {error && (
            <div className=" text-xs text-red-600 mb-2 bg-red-400 bg-opacity-20 px-6 py-4 rounded max-w-[700px]">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <Button
            type="button"
            variant={"ghost"}
            size={"icon"}
            onClick={onClose}
            className="absolute top-0 right-0 cursor-pointer"
          >
            <X width={20} height={20} />
          </Button>
          <div className="flex flex-col pt-2">
            <h2 className="text-xl font-bold">{`Edit Timesheet #${timesheetId}`}</h2>
            <div className="w-full flex flex-row gap-x-2 justify-between items-center pt-1 ">
              <div className="w-full flex flex-row gap-x-2 items-center ">
                {loading ? (
                  <div className="flex flex-row gap-x-2 items-center">
                    <div className="w-16 h-6 rounded-lg overflow-hidden">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <div className="w-32 h-6 rounded-lg overflow-hidden">
                      <Skeleton className="w-full h-full" />
                    </div>
                  </div>
                ) : (
                  <>
                    <span
                      className={`text-xs  px-2 py-1 rounded-lg ${form?.status === "DRAFT" ? "bg-blue-100 text-blue-600" : form?.status === "APPROVED" ? "bg-green-100 text-green-600" : form?.status === "REJECTED" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}
                    >{`${form?.status === "DRAFT" ? "In Progress" : form?.status === "APPROVED" ? "Approved" : form?.status === "REJECTED" ? "Rejected" : "Pending"}`}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                      {`Created on: ${form?.createdAt ? format(new Date(form.createdAt), "MMM d, yyyy") : "Loading"}`}
                    </span>
                  </>
                )}
              </div>
              <div className="w-fit relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowHistory(!showHistory);
                    setNotificationToRead();
                  }}
                  className="flex items-center gap-1 pl-4 pr-10 py-1 rounded-md hover:bg-gray-50"
                >
                  <ClockIcon size={16} />
                  <span className="pl-1">
                    {showHistory ? "Close " : "Show Changes"}
                  </span>
                </Button>
                {changeLogs.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute rounded-full px-2 py-0.5  top-1/2 -translate-y-1/2 right-1 bg-blue-500 text-white hover:bg-blue-500"
                  >
                    {changeLogs.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <>
            <div className="bg-gray-50 flex-1 w-full p-2 pb-10 overflow-y-auto no-scrollbar">
              <div className=" w-full h-full flex flex-col justify-center animate-pulse">
                <Spinner size={30} />
              </div>
            </div>
            <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
              <div className="flex flex-row justify-end gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  form="timesheet-form"
                  type="submit"
                  className={`bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded ${
                    loading || !changeReason.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={loading || !changeReason.trim()}
                  title={
                    loading
                      ? "Please complete all required fields in the logs before submitting."
                      : !changeReason.trim()
                        ? "Please provide a reason for the changes"
                        : ""
                  }
                >
                  <p>Save</p>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {form && (
              <>
                <div className="flex-1 w-full p-2 pb-10 overflow-y-auto no-scrollbar">
                  <form
                    id="timesheet-form"
                    className="w-full flex flex-col gap-4"
                    onSubmit={handleSubmit}
                  >
                    {changeLogs && (
                      <div className="">
                        {showHistory && changeLogs.length > 0 && (
                          <>
                            <h3 className="text-sm font-semibold pb-2">
                              Change History
                            </h3>
                            <div className="border rounded-lg p-3 bg-gray-50">
                              <TimeSheetHistory
                                changeLogs={changeLogs}
                                users={users}
                              />
                            </div>
                          </>
                        )}

                        {showHistory && changeLogs.length === 0 && (
                          <div className="text-gray-500 italic p-3 border text-xs rounded-lg">
                            No changes have been recorded for this timesheet
                          </div>
                        )}
                      </div>
                    )}
                    {!showHistory && (
                      <>
                        <EditGeneralSection
                          form={form}
                          setForm={setForm}
                          userOptions={userOptions}
                          jobsiteOptions={jobsiteOptions}
                          costCodeOptions={costCodeOptions}
                          users={users}
                          jobsites={jobsites}
                          originalForm={originalForm}
                          handleChange={logs.handleChange}
                          handleUndoField={logs.handleUndoField}
                          workTypeOptions={workTypeOptions}
                        />

                        {/* Related logs - conditional rendering by workType */}

                        {showMaintenance && (
                          <EditMechanicProjects
                            equipmentOptions={equipmentOptions}
                            projects={form.Maintenance}
                            onProjectChange={(idx, field, value) =>
                              logs.handleLogChange(
                                "Maintenance",
                                idx,
                                field,
                                value,
                              )
                            }
                            onAddProject={logs.addMechanicProject}
                            onRemoveProject={logs.removeMechanicProject}
                            originalProjects={originalForm?.Maintenance || []}
                            onUndoProjectField={
                              logs.handleUndoMechanicProjectField
                            }
                            disableAdd={
                              form.Maintenance.length > 0 &&
                              !isMechanicProjectComplete(
                                form.Maintenance[form.Maintenance.length - 1],
                              )
                            }
                          />
                        )}

                        {showTrucking && (
                          <EditTruckingLogs
                            logs={form.TruckingLogs}
                            onLogChange={(idx, field, value) =>
                              logs.handleLogChange(
                                "TruckingLogs",
                                idx,
                                field,
                                value,
                              )
                            }
                            handleNestedLogChange={(
                              logIndex,
                              nestedType,
                              nestedIndex,
                              field,
                              value,
                            ) =>
                              logs.handleNestedLogChange(
                                "TruckingLogs",
                                logIndex,
                                nestedType,
                                nestedIndex,
                                field,
                                value,
                              )
                            }
                            truckOptions={truckOptions}
                            trailerOptions={trailerOptions}
                            equipmentOptions={equipmentOptions}
                            jobsiteOptions={jobsiteOptions}
                            addEquipmentHauled={logs.addEquipmentHauled}
                            deleteEquipmentHauled={logs.deleteEquipmentHauled}
                            addMaterial={logs.addMaterial}
                            deleteMaterial={logs.deleteMaterial}
                            addRefuelLog={logs.addRefuelLog}
                            deleteRefuelLog={logs.deleteRefuelLog}
                            addStateMileage={logs.addStateMileage}
                            deleteStateMileage={logs.deleteStateMileage}
                            originalLogs={originalForm?.TruckingLogs || []}
                            onUndoLogField={logs.handleUndoTruckingLogField}
                            onUndoNestedLogField={
                              logs.handleUndoTruckingNestedField
                            }
                          />
                        )}
                        {showTasco && (
                          <EditTascoLogs
                            equipmentOptions={equipmentOptions}
                            materialTypeOptions={materialTypeOptions}
                            logs={form.TascoLogs}
                            onLogChange={(idx, field, value) =>
                              logs.handleLogChange(
                                "TascoLogs",
                                idx,
                                field,
                                value,
                              )
                            }
                            handleNestedLogChange={
                              logs.handleTascoNestedLogChange
                            }
                            addTascoRefuelLog={logs.addTascoRefuelLog}
                            deleteTascoRefuelLog={logs.deleteTascoRefuelLog}
                            originalLogs={originalForm?.TascoLogs || []}
                            onUndoLogField={logs.handleUndoTascoLogField}
                          />
                        )}
                        {showEquipment && (
                          <EditEmployeeEquipmentLogs
                            equipmentOptions={equipmentOptions}
                            logs={form.EmployeeEquipmentLogs}
                            onLogChange={(idx, field, value) =>
                              logs.handleLogChange(
                                "EmployeeEquipmentLogs",
                                idx,
                                field,
                                value,
                              )
                            }
                            onAddLog={logs.addEmployeeEquipmentLog}
                            onRemoveLog={logs.removeEmployeeEquipmentLog}
                            originalLogs={
                              originalForm?.EmployeeEquipmentLogs || []
                            }
                          />
                        )}

                        {/* Change Reason Section */}
                        <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                          <h3 className="font-semibold text-sm mb-2">
                            Reason for Changes{" "}
                            <span className="text-red-500">*</span>
                          </h3>
                          <p className="text-xs text-gray-600 mb-2">
                            Please provide a reason for the changes you&apos;re
                            making to this timesheet.
                          </p>
                          <Textarea
                            value={changeReason}
                            onChange={(e) => setChangeReason(e.target.value)}
                            placeholder="Enter change reason (required)"
                            className={`w-full bg-white ${!changeReason.trim() ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                            required
                          />
                          {!changeReason.trim() && (
                            <p className="text-xs text-red-500 mt-1">
                              A reason is required before saving changes
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </form>
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col justify-end gap-3 pt-4 border-t border-gray-100">
                  <div className="flex flex-row justify-end gap-2 w-full">
                    {originalForm && originalForm.status === "PENDING" && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className={`bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded ${
                            form.status !== "REJECTED"
                              ? "bg-opacity-50 "
                              : " border-red-800 hover:border-red-900 border-2"
                          }`}
                          onClick={() =>
                            setForm({ ...form, status: "REJECTED" })
                          }
                          disabled={loading}
                        >
                          {form.status === "REJECTED" ? "" : "Reject Timesheet"}
                          {form.status === "REJECTED" && (
                            <SquareXIcon className="text-red-800" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className={`bg-green-400 hover:bg-green-300 text-green-800 px-4 py-2 rounded ${
                            form.status !== "APPROVED"
                              ? "bg-opacity-50 "
                              : " border-green-800 hover:border-green-900 border-2"
                          }`}
                          onClick={() =>
                            setForm({ ...form, status: "APPROVED" })
                          }
                          disabled={loading}
                        >
                          <div className="flex flex-row items-center gap-2">
                            {form.status === "APPROVED"
                              ? ``
                              : "Approve Timesheet"}
                            {form.status === "APPROVED" && (
                              <SquareCheck className="text-green-800" />
                            )}
                          </div>
                        </Button>
                      </>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      form="timesheet-form"
                      type="submit"
                      className={`bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded ${
                        loading || !changeReason.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={loading || !changeReason.trim()}
                      title={
                        loading
                          ? "Please complete all required fields in the logs before submitting."
                          : !changeReason.trim()
                            ? "Please provide a reason for the changes"
                            : ""
                      }
                    >
                      {loading
                        ? "Save"
                        : `Save${
                            originalForm &&
                            originalForm.status === "PENDING" &&
                            form.status === "APPROVED"
                              ? " & Approve"
                              : originalForm &&
                                  originalForm.status === "PENDING" &&
                                  form.status === "REJECTED"
                                ? " & Reject "
                                : ""
                          }`}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
