"use client";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useCallback } from "react";
import { FormIndividualTemplate } from "./types";
import {
  ApproveFormSubmission,
  archiveFormTemplate,
  deleteFormSubmission,
  deleteFormTemplate,
  draftFormTemplate,
  getFormSubmissions,
  getFormTemplate,
  publishFormTemplate,
} from "@/actions/records-forms";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Fields as FormField } from "./types";
import { useDashboardData } from "@/app/(routes)/admins/_pages/sidebar/DashboardDataContext";
import { useSession } from "next-auth/react";

export default function useSubmissionDataById(id: string) {
  const { refresh } = useDashboardData();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { data: session } = useSession();
  const ApproverId = session?.user.id;

  // Filter state: always include dateRange and status
  const [filter, setFilter] = useState<{
    dateRange: { from?: Date; to?: Date };
    status: string;
  }>({ dateRange: {}, status: "ALL" });

  // Handler for filter UI
  const handleFilterChange = useCallback(
    (newFilter: { dateRange: { from?: Date; to?: Date }; status: string }) => {
      setFilter({
        dateRange: newFilter.dateRange || {},
        status: newFilter.status || "ALL",
      });
    },
    [],
  );

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [showDeleteSubmissionDialog, setShowDeleteSubmissionDialog] =
    useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formTemplate, setFormTemplate] = useState<FormIndividualTemplate>();
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<
    "archive" | "publish" | "draft" | null
  >(null);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [showFormSubmission, setShowFormSubmission] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);
  const [pendingSubmissionDeleteId, setPendingSubmissionDeleteId] = useState<
    number | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);

  //pending only state for inbox
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [approvalInbox, setApprovalInbox] = useState(0);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  // Fetch form template data when component mounts or when formId, page, pageSize, or statusFilter changes
  useEffect(() => {
    const fetchFormTemplate = async () => {
      try {
        setLoading(true);
        const params = [];
        if (filter.dateRange.from)
          params.push(
            `startDate=${encodeURIComponent(format(filter.dateRange.from, "yyyy-MM-dd"))}`,
          );
        if (filter.dateRange.to)
          params.push(
            `endDate=${encodeURIComponent(format(filter.dateRange.to, "yyyy-MM-dd"))}`,
          );
        if (filter.status) params.push(`statusFilter=${filter.status}`);
        params.push(`pendingOnly=${showPendingOnly}`);
        params.push(`page=${page}`);
        params.push(`pageSize=${pageSize}`);
        const query = params.length ? `?${params.join("&")}` : "";
        const response = await fetch(
          `/api/getFormSubmissionsById/${id}${query}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch form template");
        }
        const data = await response.json();
        setFormTemplate(data);
        setApprovalInbox(data.pendingForms || 0);
        return data;
      } catch (error) {
        console.error("Error fetching form template:", error);
        return null;
      } finally {
        setLoading(false);
      }
    };
    fetchFormTemplate();
  }, [id, page, pageSize, filter, refreshKey, searchTerm, showPendingOnly]);

  //helper functions

  // Statuses and their display info
  const STATUS_OPTIONS = useMemo(
    () => [
      {
        value: "ACTIVE",
        label: "Active",
        color: "bg-emerald-500",
      },
      {
        value: "ARCHIVED",
        label: "Archived",
        color: "bg-gray-400",
      },
      {
        value: "DRAFT",
        label: "Draft",
        color: "bg-blue-400",
      },
    ],
    [],
  );

  const currentStatus = useMemo(() => {
    if (!formTemplate) return null;
    return (
      STATUS_OPTIONS.find((s) => s.value === formTemplate.isActive) ||
      STATUS_OPTIONS[0]
    );
  }, [formTemplate, STATUS_OPTIONS]);

  const handleDelete = async (submissionId: string) => {
    try {
      const isDeleted = await deleteFormTemplate(submissionId);
      if (isDeleted) {
        // Optionally, you can show a success message or update the UI
        toast.success("Form template deleted successfully", { duration: 3000 });
        router.push("/admins/forms");
      }
    } catch (error) {
      console.error("Error deleting form template:", error);
      toast.error("Failed to delete form template", { duration: 3000 });
    }
  };

  const openHandleDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId) {
      await handleDelete(pendingDeleteId);
      setShowDeleteDialog(false);
      setPendingDeleteId(null);
      refresh();
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setPendingDeleteId(null);
  };
  //================================================
  // modal helper function for submission deletion
  const openHandleDeleteSubmission = (id: number) => {
    setPendingSubmissionDeleteId(id);
    setShowDeleteSubmissionDialog(true);
  };

  const confirmSubmissionDelete = async () => {
    if (pendingSubmissionDeleteId) {
      const isDeleted = await deleteFormSubmission(pendingSubmissionDeleteId);
      if (isDeleted) {
        toast.success("Form submission deleted successfully", {
          duration: 3000,
        });
        setShowDeleteSubmissionDialog(false);
        setPendingSubmissionDeleteId(null);
        setRefreshKey((prev) => prev + 1);
      } else {
        toast.error("Failed to delete form submission", { duration: 3000 });
      }
    }
  };

  const cancelSubmissionDelete = () => {
    setShowDeleteSubmissionDialog(false);
    setPendingSubmissionDeleteId(null);
  };

  const triggerRerender = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refresh();
  }, [refresh]);

  const handleStatusChange = async (
    status: "ACTIVE" | "ARCHIVED" | "DRAFT",
  ) => {
    if (!formTemplate) return;
    if (formTemplate.isActive === status) return;
    try {
      setActionLoading(
        status === "ACTIVE"
          ? "publish"
          : status === "ARCHIVED"
            ? "archive"
            : "draft",
      );
      if (status === "ACTIVE") {
        const isPublished = await publishFormTemplate(formTemplate.id);
        if (isPublished) {
          toast.success("Form template published successfully", {
            duration: 3000,
          });
          setFormTemplate((prev) =>
            prev ? { ...prev, isActive: "ACTIVE" } : prev,
          );
        }
      } else if (status === "ARCHIVED") {
        const isArchived = await archiveFormTemplate(formTemplate.id);
        if (isArchived) {
          toast.success("Form template archived successfully", {
            duration: 3000,
          });
          setFormTemplate((prev) =>
            prev ? { ...prev, isActive: "ARCHIVED" } : prev,
          );
        }
      } else if (status === "DRAFT") {
        // Optionally implement draft logic if needed
        const isDrafted = await draftFormTemplate(formTemplate.id);
        if (isDrafted) {
          toast.success("Form template drafted successfully", {
            duration: 3000,
          });
          setFormTemplate((prev) =>
            prev ? { ...prev, isActive: "DRAFT" } : prev,
          );
        }
      }
    } catch (error) {
      toast.error("Failed to update form template status", { duration: 3000 });
    } finally {
      setActionLoading(null);
      setStatusPopoverOpen(false);
    }
  };

  const handleExport = async (exportFormat = "xlsx") => {
    if (id) {
      try {
        const template = await getFormTemplate(id);
        const submissions = await getFormSubmissions(id, {
          from: exportDateRange.from,
          to: exportDateRange.to,
        });

        if (!template || !template.FormGrouping) {
          toast.error("Form template or groupings not found", {
            duration: 3000,
          });
          return;
        }
        const groupings = template.FormGrouping;
        const fields = groupings
          .flatMap((group) => (Array.isArray(group.Fields) ? group.Fields : []))
          .filter((field) => field && field.id && field.label);

        // Build headers: field labels, plus some submission metadata
        const headers = [
          "Submission ID",
          "Submitted By",
          "Submitted At",
          ...fields.map((field: FormField) => field.label),
        ];

        // Build rows from submissions
        const rows = (submissions || []).map((submission) => {
          const typedSubmission = submission as unknown as {
            id: string;
            User?: { firstName: string; lastName: string };
            submittedAt?: Date;
            createdAt: Date;
            data?: Record<string, unknown>;
          };

          const user = typedSubmission.User
            ? `${typedSubmission.User.firstName} ${typedSubmission.User.lastName}`
            : "";
          const submittedAt =
            (typedSubmission.submittedAt &&
              format(typedSubmission.submittedAt, "yyyy-MM-dd")) ||
            format(typedSubmission.createdAt, "yyyy-MM-dd") ||
            "";
          return [
            typedSubmission.id,
            user,
            submittedAt,
            ...fields.map((field: FormField) => {
              const data = typedSubmission.data as
                | Record<string, unknown>
                | undefined;
              const value = data?.[field.id] ?? data?.[field.label] ?? "";
              // Custom export logic for SEARCH_PERSON and SEARCH_ASSET
              if (field.type === "SEARCH_PERSON") {
                if (Array.isArray(value)) {
                  return value
                    .map((v) => {
                      const person = v as { name?: string };
                      return person?.name;
                    })
                    .filter(Boolean)
                    .join(", ");
                }
                if (typeof value === "object" && value !== null) {
                  const person = value as { name?: string };
                  return person.name || "";
                }
                return "";
              }
              if (field.type === "SEARCH_ASSET") {
                if (Array.isArray(value)) {
                  return value
                    .map((v) => {
                      const asset = v as { name?: string };
                      return asset?.name;
                    })
                    .filter(Boolean)
                    .join(", ");
                }
                if (typeof value === "object" && value !== null) {
                  const asset = value as { name?: string };
                  return asset.name || "";
                }
                return "";
              }
              // Default: handle objects/arrays as before
              if (typeof value === "object" && value !== null) {
                if (Array.isArray(value)) {
                  return value.join(", ");
                }
                return JSON.stringify(value);
              }
              return value;
            }),
          ];
        });

        const exportData = [headers, ...rows];

        if (exportFormat === "csv") {
          const csv = exportData
            .map((row) =>
              row
                .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
                .join(","),
            )
            .join("\n");
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          saveAs(
            blob,
            `form_submissions_${exportDateRange.from
              ?.toISOString()
              .slice(0, 10)}_${exportDateRange.to
              ?.toISOString()
              .slice(0, 10)}.csv`,
          );
        } else {
          const ws = XLSX.utils.aoa_to_sheet(exportData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Form Submissions");
          const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
          const blob = new Blob([wbout], { type: "application/octet-stream" });
          saveAs(
            blob,
            `form_submissions_${exportDateRange.from
              ?.toISOString()
              .slice(0, 10)}_${exportDateRange.to
              ?.toISOString()
              .slice(0, 10)}.xlsx`,
          );
        }

        toast.success("Export completed successfully", { duration: 3000 });
      } catch (error) {
        console.error("Error exporting form template:", error);
        toast.error("Failed to export form template", { duration: 3000 });
      } finally {
        setShowExportModal(false);
      }
    }
  };

  const onApprovalAction = async (
    id: number,
    action: "APPROVED" | "REJECTED",
  ) => {
    const formData = new FormData();
    if (!ApproverId) {
      toast.error("User not authenticated", { duration: 3000 });
      return;
    }
    formData.append("comment", "Approved on Dashboard using Quick Approval"); // Example comment
    formData.append("adminUserId", ApproverId || ""); // Append the ApproverId from session

    const { success } = await ApproveFormSubmission(id, action, formData);

    if (success) {
      toast.success("Form submission approved successfully", {
        duration: 3000,
      });
      triggerRerender();
    } else {
      toast.error("Failed to approve form submission", { duration: 3000 });
    }
  };

  return {
    inputValue,
    setInputValue,
    page,
    setPage,
    pageSize,
    setPageSize,
    filter,
    setFilter,
    handleFilterChange,
    showExportModal,
    setShowExportModal,
    exportDateRange,
    setExportDateRange,
    showDeleteSubmissionDialog,
    setShowDeleteSubmissionDialog,
    showCreateModal,
    setShowCreateModal,
    formTemplate,
    loading,
    setLoading,
    showDeleteDialog,
    setShowDeleteDialog,
    actionLoading,
    statusPopoverOpen,
    setStatusPopoverOpen,
    showFormSubmission,
    setShowFormSubmission,
    selectedSubmissionId,
    setSelectedSubmissionId,
    refreshKey,
    setRefreshKey,
    STATUS_OPTIONS,
    currentStatus,
    openHandleDelete,
    setPendingSubmissionDeleteId,
    confirmDelete,
    cancelDelete,
    openHandleDeleteSubmission,
    confirmSubmissionDelete,
    cancelSubmissionDelete,
    triggerRerender,
    handleStatusChange,
    handleExport,
    setShowPendingOnly,
    showPendingOnly,
    approvalInbox,
    onApprovalAction,
  };
}
