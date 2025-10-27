"use client";
import {
  ApprovalStatus,
  WorkType,
} from "../../../../../../prisma/generated/prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminUpdateTimesheetStatus,
  adminExportTimesheets,
  adminDeleteTimesheet,
} from "@/actions/records-timesheets";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { EXPORT_FIELDS } from "@/app/(routes)/admins/timesheets/_components/Export/ExportModal";
import { useDashboardData } from "../../_pages/sidebar/DashboardDataContext";
import { useRouter } from "next/navigation";

/**
 * Timesheet domain entity.
 * @property equipmentUsages - Array of equipment usage records for this timesheet.
 */
export type Timesheet = {
  id: number;
  date: Date | string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
  };
  Jobsite: {
    id: string;
    code: string;
    name: string;
  };
  CostCode: {
    id: string;
    name: string;
    code: string;
  };
  nu: string;
  Fp: string;
  startTime: Date | string;
  endTime: Date | string | null;
  comment: string;
  status: ApprovalStatus;
  workType: WorkType;
  createdAt: Date | string;
  updatedAt: Date | string;
  EmployeeEquipmentLogs: {
    id: string;
    equipmentId: string;
    Equipment: {
      id: string;
      name: string;
    };
    startTime: Date | string;
    endTime: Date | string;
  }[];
  TruckingLogs: {
    truckNumber: string;
    startingMileage: number | null;
    endingMileage: number | null;
    RefuelLogs: {
      milesAtFueling: number | null;
    }[];
  }[];
  TascoLogs: {
    shiftType: string;
    LoadQuantity: number | null;
  }[];
  _count?: {
    ChangeLogs: number;
  };
};

export interface FilterOptions {
  jobsiteId: string[];
  costCode: string[];
  equipmentId: string[];
  equipmentLogTypes: string[];
  dateRange: { from?: Date; to?: Date };
  status: string[];
  changes: string[];
  notificationId: string[];
  id: string[];
}

export interface CrewData {
  id: string;
  name: string;
  leadId: string;
  crewType: "MECHANIC" | "TRUCK_DRIVER" | "LABOR" | "TASCO" | "";
  Users: { id: string; firstName: string; lastName: string }[];
}

export interface User {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  permission: string;
  terminationDate: Date | null;
}

export default function useAllTimeSheetData({
  jobsiteId,
  costCode,
  id,
  notificationId,
  equipmentId,
}: {
  jobsiteId: string | null;
  costCode: string | null;
  id: string | null;
  notificationId: string | null;
  equipmentId: string | null;
}) {
  const router = useRouter();
  const { refresh } = useDashboardData();
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [allTimesheets, setAllTimesheets] = useState<Timesheet[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const pageSizeOptions = [25, 50, 75, 100];
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [approvalInbox, setApprovalInbox] = useState<number>(0);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  // Loading state for status change
  const [statusLoading, setStatusLoading] = useState<
    Record<string, "APPROVED" | "REJECTED" | undefined>
  >({});

  const [notificationIds, setNotificationIds] = useState<string | null>(null);

  // set Filters  feature
  // Filter options state
  const [exportFileName, setExportFileName] = useState<string | null>(null);

  const [refilterKey, setRefilterKey] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({
    jobsiteId: [],
    costCode: [],
    equipmentId: [],
    equipmentLogTypes: [],
    dateRange: {},
    status: [],
    changes: [],
    id: [],
    notificationId: [],
  });
  const [costCodes, setCostCodes] = useState<{ code: string; name: string }[]>(
    [],
  );
  const [jobsites, setJobsites] = useState<{ code: string; name: string }[]>(
    [],
  );
  const [equipment, setEquipment] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [crew, setCrew] = useState<CrewData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const rerender = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refresh();
  }, [refresh]);

  const reFilterPage = useCallback(() => {
    setRefilterKey((k) => k + 1);
    refresh();
  }, [refresh]);

  /**
   * Build filter query params from all filters (including multi-select and date range)
   */
  const buildFilterQuery = () => {
    const params = new URLSearchParams();
    // JobsiteId (array)
    if (filters.jobsiteId && filters.jobsiteId.length > 0) {
      filters.jobsiteId.forEach((id) => params.append("jobsiteId", id));
    } else if (jobsiteId) {
      params.append("jobsiteId", jobsiteId);
    }
    // CostCode (array)
    if (filters.costCode && filters.costCode.length > 0) {
      filters.costCode.forEach((code) => params.append("costCode", code));
    } else if (costCode) {
      params.append("costCode", costCode);
    }
    // Equipment (array)
    if (filters.equipmentId && filters.equipmentId.length > 0) {
      filters.equipmentId.forEach((equipmentId) =>
        params.append("equipmentId", equipmentId),
      );
    }
    // Equipment Log Types (array)
    if (filters.equipmentLogTypes && filters.equipmentLogTypes.length > 0) {
      filters.equipmentLogTypes.forEach((logType) =>
        params.append("equipmentLogTypes", logType),
      );
    }
    // Status (array)
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach((status) => params.append("status", status));
    }
    // Changes (array)
    if (filters.changes && filters.changes.length > 0) {
      filters.changes.forEach((change) => params.append("changes", change));
    }
    // Date Range
    if (filters.dateRange && filters.dateRange.from) {
      params.append("dateFrom", filters.dateRange.from.toISOString());
    }
    if (filters.dateRange && filters.dateRange.to) {
      params.append("dateTo", filters.dateRange.to.toISOString());
    }
    // Id (array)
    if (filters.id && filters.id.length > 0) {
      filters.id.forEach((idVal) => params.append("id", idVal));
    } else if (id) {
      params.append("id", id);
    }
    return params.toString();
  };

  useEffect(() => {
    const fetchCostCodes = async () => {
      // Replace with your API call
      const res = await fetch("/api/getCostCodeSummary");
      const data = await res.json();
      const filteredCostCodes = data
        .filter(
          (costCode: {
            id: string;
            code: string;
            name: string;
            isActive: boolean;
          }) => costCode.isActive === true,
        )
        .map((costCode: { code: string; name: string }) => ({
          code: costCode.code,
          name: costCode.name,
        }));
      setCostCodes(filteredCostCodes || []);
    };
    fetchCostCodes();
  }, []);

  useEffect(() => {
    const fetchJobsites = async () => {
      // Replace with your API call
      const res = await fetch("/api/getJobsiteSummary");
      const data = await res.json();
      const filteredJobsites = data
        .filter(
          (jobsite: {
            id: string;
            name: string;
            code: string;
            approvalStatus: ApprovalStatus;
          }) => jobsite.approvalStatus !== ApprovalStatus.REJECTED,
        )
        .map((jobsite: { code: string; name: string }) => ({
          code: jobsite.code,
          name: jobsite.name,
        }));
      setJobsites(filteredJobsites || []);
    };
    fetchJobsites();
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      // Replace with your API call
      const res = await fetch("/api/equipmentIdNameQrIdAndCode");
      const data = await res.json();
      const filteredEquipment = data.map(
        (equipment: { id: string; name: string }) => ({
          id: equipment.id,
          name: equipment.name,
        }),
      );
      setEquipment(filteredEquipment || []);
    };
    fetchEquipment();
  }, []);

  useEffect(() => {
    const fetchCrews = async () => {
      const response = await fetch("/api/getAllCrews", {
        next: { tags: ["crews"] },
      });
      const data = await response.json();
      setCrew(data || []);
    };
    fetchCrews();
  }, []);

  useEffect(() => {
    // Fetch users from the server or context
    const fetchUsers = async () => {
      const response = await fetch("/api/getAllEmployees?filter=all");
      const data = await response.json();
      setUsers(data as User[]);
    };

    fetchUsers();
  }, []);

  // Track if URL params have been processed to avoid initial fetch without filters
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);

  // On mount, apply jobsiteId/costCode from props to filters before first fetch
  const urlParams = useMemo(
    () => ({
      jobsiteId,
      costCode,
      id,
      notificationId,
      equipmentId,
    }),
    [jobsiteId, costCode, id, notificationId, equipmentId],
  );

  useEffect(() => {
    if (
      urlParams.jobsiteId ||
      urlParams.costCode ||
      urlParams.id ||
      urlParams.notificationId ||
      urlParams.equipmentId
    ) {
      setNotificationIds(urlParams.notificationId || null);
      setFilters((prev) => {
        const newFilters = {
          ...prev,
          jobsiteId: urlParams.jobsiteId ? [urlParams.jobsiteId] : prev.jobsiteId,
          costCode: urlParams.costCode ? [urlParams.costCode] : prev.costCode,
          id: urlParams.id ? [urlParams.id] : prev.id,
          notificationId: urlParams.notificationId ? [urlParams.notificationId] : prev.notificationId,
          equipmentId: urlParams.equipmentId ? [urlParams.equipmentId] : prev.equipmentId,
        };
        
        // If equipmentId is provided via URL, auto-select all equipment log types
        if (urlParams.equipmentId && !prev.equipmentId.includes(urlParams.equipmentId)) {
          newFilters.equipmentLogTypes = [
            "employeeEquipmentLogs",
            "truckingLogs", 
            "tascoLogs",
            "mechanicProjects"
          ];
        }
        
        return newFilters;
      });
    }
    // Mark URL params as processed (even if none were present)
    setUrlParamsProcessed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParams]);

  // Fetch all timesheets (paginated) or all pending timesheets (no pagination)
  const fetchTimesheets = async () => {
    try {
      setLoading(true);

      const filterQuery = buildFilterQuery();
      const encodedSearch = encodeURIComponent(searchTerm.trim());

      const response = await fetch(
        `/api/getAllTimesheetInfo?status=${showPendingOnly ? "pending" : "all"}&page=${page}&pageSize=${pageSize}&search=${encodedSearch}${filterQuery ? `&${filterQuery}` : ""}`,
        {
          next: { tags: ["timesheets"] },
        },
      );
      const data = await response.json();
      setAllTimesheets(data.timesheets);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setApprovalInbox(data.pendingTimesheets || 0);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Track if we have URL params to determine if we should auto-apply filters
  const hasUrlParams = useMemo(() => {
    return !!(
      urlParams.jobsiteId ||
      urlParams.costCode ||
      urlParams.id ||
      urlParams.notificationId ||
      urlParams.equipmentId
    );
  }, [urlParams]);

  // Create stable filter strings for dependency tracking
  const filterDependencies = useMemo(() => ({
    jobsiteId: (filters.jobsiteId || []).join(','),
    costCode: (filters.costCode || []).join(','),
    equipmentId: (filters.equipmentId || []).join(','),
    equipmentLogTypes: (filters.equipmentLogTypes || []).join(','),
    id: (filters.id || []).join(','),
    notificationId: (filters.notificationId || []).join(',')
  }), [
    filters.jobsiteId || [],
    filters.costCode || [],
    filters.equipmentId || [],
    filters.equipmentLogTypes || [],
    filters.id || [],
    filters.notificationId || []
  ]);

  // Fetch timesheets when page/pageSize, search, or explicit refilter triggers change
  useEffect(() => {
    // Only fetch after URL params have been processed to avoid initial fetch without filters
    if (urlParamsProcessed) {
      fetchTimesheets();
    }
  }, [
    urlParamsProcessed,
    page,
    pageSize,
    showPendingOnly,
    searchTerm,
    refreshKey,
    refilterKey,
    // Include filter dependencies only when we have URL params (to auto-apply them)
    hasUrlParams ? filterDependencies.jobsiteId : '',
    hasUrlParams ? filterDependencies.costCode : '',
    hasUrlParams ? filterDependencies.equipmentId : '',
    hasUrlParams ? filterDependencies.equipmentLogTypes : '',
    hasUrlParams ? filterDependencies.id : '',
    hasUrlParams ? filterDependencies.notificationId : ''
  ]);

  // Approve or deny a timesheet (no modal)
  const handleApprovalAction = async (
    id: number,
    action: "APPROVED" | "REJECTED",
  ) => {
    setStatusLoading((prev) => ({ ...prev, [id]: action }));
    try {
      // add who approved/denied it
      const changes: Record<string, { old: unknown; new: unknown }> = {};

      changes["status"] = {
        old: "PENDING",
        new: action,
      };
      const res = await adminUpdateTimesheetStatus(id, action, changes);
      if (!res || res.success !== true)
        throw new Error("Failed to update timesheet status");
      setAllTimesheets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: action } : t)),
      );
      toast.success(
        `Timesheet ${action === "APPROVED" ? "approved" : "denied"}!`,
        { duration: 3000 },
      );
      // Only update approval inbox count after approval/denial
      rerender();
    } catch (e) {
      toast.error(
        `Failed to ${action === "APPROVED" ? "approve" : "deny"} timesheet.`,
        { duration: 3000 },
      );
    } finally {
      setStatusLoading((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setIsDeleting(true);
  };

  const handleDeleteCancel = () => {
    setDeletingId(null);
    setIsDeleting(false);
  };
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await adminDeleteTimesheet(deletingId);
      setAllTimesheets((prev) => prev.filter((t) => t.id !== deletingId));
      setDeletingId(null);
      toast.success("Timesheet deleted successfully!", { duration: 3000 });
      refresh();
    } catch (e) {
      // Optionally show error
      console.error("Error deleting timesheet:", e);
      toast.error("Failed to delete timesheet. Please try again.", {
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage(1);
    setPageSize(Number(e.target.value));
  };

  const handleClearFilters = async () => {
    const emptyFilters: FilterOptions = {
      jobsiteId: [],
      costCode: [],
      equipmentId: [],
      equipmentLogTypes: [],
      dateRange: {},
      status: [],
      changes: [],
      id: [],
      notificationId: [],
    };
    router.replace("/admins/timesheets");
    setFilters(emptyFilters);
    //avoids race condition with router.replace
    setTimeout(() => {
      reFilterPage();
    }, 500);
  };

  //----------------------------------------------------------------------------
  // Methods to export filtered timesheets
  //----------------------------------------------------------------------------

  const filteredTimesheets = useMemo(() => {
    if (!allTimesheets || !Array.isArray(allTimesheets)) {
      return [];
    }

    return allTimesheets.filter((ts) => {
      const id = ts.id || "";
      const firstName = ts?.User?.firstName || "";
      const lastName = ts?.User?.lastName || "";
      const jobsite = ts?.Jobsite?.name || "";
      const costCode = ts?.CostCode?.name || "";

      // Split search term into words, ignore empty
      const terms = searchTerm
        .toLowerCase()
        .split(" ")
        .filter((t) => t.trim().length > 0);

      // Date filter: support single date (entire day) or range
      let inDateRange = true;
      if (dateRange.from && !dateRange.to) {
        const fromStart = new Date(dateRange.from);
        fromStart.setHours(0, 0, 0, 0);
        const fromEnd = new Date(dateRange.from);
        fromEnd.setHours(23, 59, 59, 999);
        const tsDate = new Date(ts.date);
        inDateRange = tsDate >= fromStart && tsDate <= fromEnd;
      } else {
        if (dateRange.from) {
          inDateRange = inDateRange && new Date(ts.date) >= dateRange.from;
        }
        if (dateRange.to) {
          inDateRange = inDateRange && new Date(ts.date) <= dateRange.to;
        }
      }

      // Each term must match at least one field
      const matches = terms.every(
        (term) =>
          id.toString().includes(term) ||
          firstName.toLowerCase().includes(term) ||
          lastName.toLowerCase().includes(term) ||
          jobsite.toLowerCase().includes(term) ||
          costCode.toLowerCase().includes(term),
      );

      return inDateRange && (terms.length === 0 || matches);
    });
  }, [allTimesheets, searchTerm, dateRange]);

  const sortedTimesheets = useMemo(() => {
    if (!filteredTimesheets || !Array.isArray(filteredTimesheets)) {
      return [];
    }

    return [...filteredTimesheets].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [filteredTimesheets]);

  const handleExport = async (
    exportFormat: "csv" | "xlsx",
    dateRange?: { from?: Date; to?: Date },
    selectedFields?: string[],
    selectedUsers?: string[],
    selectedCrew?: string[],
    selectedProfitCenters?: string[],
    filterByUser?: boolean,
  ) => {
    try {
      // Call server action to get filtered data with only the selected fields
      const exportedData = await adminExportTimesheets(
        dateRange,
        selectedFields,
        selectedUsers,
        selectedCrew,
        selectedProfitCenters,
        filterByUser,
      );

      if (!exportedData || exportedData.length === 0) {
        toast.error("No timesheets found matching your filters.");
        setExportModal(false);
        return;
      }

      // Format dates and times for display
      const formattedTimesheets = exportedData.map((ts) => {
        const result: Record<
          string,
          string | number | Date | null | undefined
        > = { ...ts };

        // Format date values if present
        if (result.Date) {
          const dateObj = new Date(result.Date as string | Date);
          if (!isNaN(dateObj.getTime())) {
            result.Date = format(dateObj, "MM/dd/yyyy");
          }
        }

        // Format time values if present
        if (result.Start) {
          const dateObj = new Date(result.Start as string | Date);
          if (!isNaN(dateObj.getTime())) {
            result.Start = format(dateObj, "hh:mm a");
          }
        }

        if (result.End) {
          const dateObj = new Date(result.End as string | Date);
          if (!isNaN(dateObj.getTime())) {
            result.End = format(dateObj, "hh:mm a");
          }
        }

        // Format Duration if present (should already be calculated on server)
        if (typeof result.Duration === "number") {
          result.Duration = result.Duration.toFixed(1);
        }

        return result;
      });

      // Get the field labels mapping from the ExportModal's EXPORT_FIELDS
      const fieldLabels = Object.fromEntries(
        EXPORT_FIELDS.map((field) => [field.key, field.label]),
      );

      // Determine which fields are actually present in our data
      const availableFields =
        selectedFields ||
        Object.keys(formattedTimesheets[0] || {}).filter((k) => k !== "_raw");

      if (exportFormat === "csv") {
        // Create CSV header with display labels
        const header = availableFields
          .map((field) => fieldLabels[field] || field)
          .join(",");

        // Fields that might contain leading zeros that should be preserved
        const preserveLeadingZerosFields = ["Jobsite", "CostCode"];

        // Create CSV rows
        const rows = formattedTimesheets
          .map((item) =>
            availableFields
              .map((field) => {
                let value = item[field] ?? "";

                // For fields that might have leading zeros, ensure they're treated as text
                // by adding a special prefix that Excel recognizes
                if (
                  preserveLeadingZerosFields.includes(field) &&
                  value !== null &&
                  value !== undefined
                ) {
                  // Prefix with ="<value>" syntax that Excel uses to force text format
                  value = `="${String(value).replace(/"/g, '""')}"`;
                  return value;
                } else {
                  value = String(value);
                  // For other fields, use standard CSV escaping
                  return `"${value.replace(/"/g, '""')}"`;
                }
              })
              .join(","),
          )
          .join("\n");

        const csv = `${header}\n${rows}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(
          blob,
          exportFileName && exportFileName.length > 0
            ? `${exportFileName.trim()}.csv`
            : `timesheets_${new Date().toISOString().slice(0, 10)}.csv`,
        );
      } else {
        // Export as XLSX
        // Create a clean object with properly formatted data to avoid type errors
        const preparedData = formattedTimesheets.map((item) => {
          // Create a new object with all the existing properties
          const prepared: Record<string, unknown> = {};

          // Copy all properties, ensuring proper formatting for fields that need it
          Object.entries(item).forEach(([key, value]) => {
            if (key === "Jobsite" || key === "CostCode") {
              // Force these fields to be strings with leading zeros preserved
              // Add a single quote prefix in the raw data, which Excel interprets as "format as text"
              const strValue =
                value !== null && value !== undefined ? String(value) : "";
              prepared[key] = strValue.startsWith("0")
                ? `'${strValue}`
                : strValue;
            } else {
              // Keep other fields as they are
              prepared[key] = value;
            }
          });

          return prepared;
        });

        // Create the worksheet with our prepared data
        const ws = XLSX.utils.json_to_sheet(preparedData);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Timesheets");

        // Set options to preserve formatting
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(
          blob,
          exportFileName && exportFileName.length > 0
            ? `${exportFileName.trim()}.xlsx`
            : `timesheets_${new Date().toISOString().slice(0, 10)}.xlsx`,
        );
      }

      setExportModal(false);
      toast.success("Export completed successfully!");
    } catch (error) {
      console.error("Error exporting timesheets:", error);
      toast.error("Error exporting timesheets. Please try again.");
      setExportModal(false);
    }
  };

  // --------------------------------------------------------------------------
  return {
    inputValue,
    setInputValue,
    allTimesheets,
    setAllTimesheets,
    loading,
    setLoading,
    page,
    setPage,
    totalPages,
    setTotalPages,
    total,
    setTotal,
    pageSize,
    pageSizeOptions,
    setPageSize,
    dateRange,
    setDateRange,
    showCreateModal,
    setShowCreateModal,
    deletingId,
    setDeletingId,
    isDeleting,
    setIsDeleting,
    showEditModal,
    setShowEditModal,
    editingId,
    setEditingId,
    approvalInbox,
    setApprovalInbox,
    showPendingOnly,
    setShowPendingOnly,
    exportModal,
    setExportModal,
    statusLoading,
    setStatusLoading,
    // Helper functions
    sortedTimesheets,
    rerender,
    handleApprovalAction,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handlePageSizeChange,
    handleExport,
    // Filters
    filters,
    setFilters,
    reFilterPage,
    costCodes,
    jobsites,
    equipment,
    notificationIds,
    setNotificationIds,
    handleClearFilters,
    crew,
    users,
    exportFileName,
    setExportFileName,
  };
}
