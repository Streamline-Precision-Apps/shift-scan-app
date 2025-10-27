"use client";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  archiveEquipment,
  deleteEquipment,
  restoreEquipment,
} from "@/actions/AssetActions";
import { useDashboardData } from "../../_pages/sidebar/DashboardDataContext";
import { FilterOptions } from "./ViewAll/EquipmentFilter";
import { useSearchParams } from "next/navigation";

/**
 * EquipmentSummary type for equipment/vehicle/truck/trailer asset
 */
export interface EquipmentSummary {
  id: string;
  qrId: string;
  code?: string;
  name: string;
  description: string;
  memo?: string;
  ownershipType?: "OWNED" | "LEASED" | "RENTAL";
  equipmentTag: "TRUCK" | "TRAILER" | "VEHICLE" | "EQUIPMENT";
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | "DRAFT";
  status: "ACTIVE" | "ARCHIVED" | "DRAFT";
  state: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "NEEDS_REPAIR" | "RETIRED";
  createdAt: string | Date;
  updatedAt: string | Date;
  // Direct vehicle/equipment properties
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  serialNumber?: string;
  acquiredDate?: string | Date;
  acquiredCondition?: "NEW" | "USED";
  licensePlate?: string;
  licenseState?: string;
  registrationExpiration?: string | Date;
  createdVia?: "MOBILE" | "WEB" | "IMPORT";
  overWeight?: boolean;
  currentWeight?: number;
  creationReason?: string;
  createdBy: {
    firstName?: string;
    lastName?: string;
  };
  _count?: {
    EmployeeEquipmentLogs: number;
    TascoLogs: number;
    HauledInLogs: number;
    UsedAsTrailer: number;
    UsedAsTruck: number;
    Maintenance: number;
  };
}
export const useEquipmentData = () => {
  const searchParams = useSearchParams();
  const isPendingApproval = searchParams.get("isPendingApproval");

  const { refresh } = useDashboardData();
  const [equipmentDetails, setEquipmentDetails] = useState<EquipmentSummary[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [editEquipmentModal, setEditEquipmentModal] = useState(false);
  const [createEquipmentModal, setCreateEquipmentModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingQrId, setPendingQrId] = useState<string | null>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    equipmentTags: [],
    ownershipTypes: [],
    conditions: [],
    statuses: [],
    activityStatuses: [],
  });
  const [open, setOpen] = useState(false);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [useFilters, setUseFilters] = useState(false);
  const [searchBarActive, setSearchBarActive] = useState(false);

  useEffect(() => {
    const fetchEquipmentSummaries = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = new URLSearchParams();

        // Always include search term if present
        if (searchTerm.trim()) {
          queryParams.set("search", searchTerm);
        }

        // Add status filter for pending items - only check showPendingOnly since it's now synced with URL
        if (showPendingOnly) {
          queryParams.set("status", "pending");
        }

        // Add filters when they should be applied
        if (useFilters || searchBarActive) {
          const filtersString = JSON.stringify(filters);
          queryParams.set("filters", filtersString);
        }

        // Add pagination params when not searching or filtering
        if (!searchBarActive && !showPendingOnly && !useFilters) {
          queryParams.set("page", page.toString());
          queryParams.set("pageSize", pageSize.toString());
        } else {
          // Always include pagination for better cache consistency
          queryParams.set("page", page.toString());
          queryParams.set("pageSize", pageSize.toString());
        }

        // Build the URL with all applicable parameters
        const url = `/api/getEquipmentDetails?${queryParams.toString()}`;

        const response = await fetch(url, {
          cache: "no-store",
          // Add a cache-busting parameter to prevent duplicate requests
          headers: {
            pragma: "no-cache",
            "cache-control": "no-cache",
          },
        });

        const data = await response.json();

        setEquipmentDetails(data.equipment);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPendingCount(data.pendingEquipment);
      } catch (error) {
        console.error("Failed to fetch equipment details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Use a debounce to prevent rapid consecutive API calls
    const timeoutId = setTimeout(() => {
      fetchEquipmentSummaries();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [
    refreshKey,
    page,
    pageSize,
    showPendingOnly,
    useFilters,
    searchBarActive,
    searchTerm,
    useFilters ? JSON.stringify(filters) : "{}",
  ]);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setSearchBarActive(true);
    } else {
      setSearchBarActive(false);
    }
  }, [searchTerm]);

  // Handle URL parameters on initial load and when URL changes
  useEffect(() => {
    if (isPendingApproval === "true" && !showPendingOnly) {
      setShowPendingOnly(true);
    }
  }, [isPendingApproval]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, showPendingOnly, filters]);

  /* 
    ---------------------------------------
    Restore modals helper functions
    ---------------------------------------
    */

  const openHandleRestore = (id: string) => {
    setPendingRestoreId(id);
    setShowRestoreDialog(true);
  };
  const confirmRestore = async () => {
    if (pendingRestoreId) {
      await restoreEquipment(pendingRestoreId);
      setShowRestoreDialog(false);
      setPendingRestoreId(null);
      refresh();
      rerender();
    }
  };
  const cancelRestore = () => {
    setShowRestoreDialog(false);
    setPendingRestoreId(null);
  };

  /* 
  ---------------------------------------
  Archive modals helper functions 
  ---------------------------------------
  */

  const openHandleArchive = (id: string) => {
    setPendingArchiveId(id);
    setShowArchiveDialog(true);
  };
  const cancelArchive = () => {
    setShowArchiveDialog(false);
    setPendingArchiveId(null);
  };

  const confirmArchive = async () => {
    if (pendingArchiveId) {
      await archiveEquipment(pendingArchiveId);
      setShowArchiveDialog(false);
      setPendingArchiveId(null);
      refresh();
      rerender();
    }
  };

  /* 
  ---------------------------------------
  delete modals helper functions
  ---------------------------------------
*/
  const openHandleDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteDialog(true);
  };
  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setPendingDeleteId(null);
  };
  const confirmDelete = async () => {
    if (pendingDeleteId) {
      await deleteEquipment(pendingDeleteId);
      setShowDeleteDialog(false);
      setPendingDeleteId(null);
      refresh();
      rerender();
    }
  };

  // open edit modal
  const openHandleEdit = (id: string) => {
    setPendingEditId(id);
    setEditEquipmentModal(true);
  };

  // filter helper functions
  const handleClearFilters = async () => {
    const emptyFilters: FilterOptions = {
      equipmentTags: [],
      ownershipTypes: [],
      conditions: [],
      statuses: [],
      activityStatuses: [],
    };
    setFilters(emptyFilters);
    // Immediately update to not use filters
    setUseFilters(false);
    // Force refresh data without filters
    rerender();
  };

  // Refresh function to trigger data reload
  const rerender = () => setRefreshKey((k) => k + 1);

  // Function to handle notification-specific behavior
  const handleNotificationHighlight = (notificationId: string) => {
    // This could be used to highlight or scroll to a specific equipment item
    // based on the notification ID
    // You would typically map notification IDs to equipment IDs in your application
    console.log(`Handling notification with ID: ${notificationId}`);

    // Example: You could add logic here to find equipment related to this notification
    // and then set some state to highlight it in the UI
  };

  /* 
    ---------------------------------------
    print QR helper functions
    ---------------------------------------
    */
  const openHandleQr = (id: string) => {
    setPendingQrId(id);
    const equipment = equipmentDetails.find((j) => j.id === id);
    if (equipment) {
      printQRCode(equipment);
    }
  };

  const printQRCode = async (equipment: EquipmentSummary) => {
    if (!pendingQrId) return;
    const url = await QRCode.toDataURL(equipment.qrId || "");
    // Open a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the QR code");
      return;
    }

    // Write HTML content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Code - ${equipment.name || "Equipment"}</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
          }
          .qr-code-container {
            text-align: center;
          }
          .qr-code {
            width: 300px;
            height: 300px;
            border: 4px solid black;
            border-radius: 10px;
            margin-bottom: 20px;
          }
          .equipment-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .equipment-id {
            font-size: 16px;
            color: #555;
            margin-bottom: 8px;
          }
          .equipment-description {
            font-size: 16px;
            color: #555;
            max-width: 350px;
            padding: 0 20px;
            line-height: 1.4;
            margin-top: 8px;
            white-space: pre-wrap;
            overflow-wrap: break-word;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="qr-code-container">
          <div class="equipment-name">${equipment.name || "N/A"}</div>
          <img src="${url}" alt="QR Code" class="qr-code" />
          <div class="equipment-id">ID: ${equipment.qrId || "N/A"}</div>
          <div class="equipment-description">${
            equipment.description
              ? `Brief Description:\n${equipment.description || ""}`
              : ""
          }</div>
        </div>
        <script>
          // Print and close window when loaded
          window.onload = function() {
            window.print();
            // Close after printing is done or canceled
            setTimeout(() => window.close());
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return {
    setEquipmentDetails,
    loading,
    setLoading,
    rerender,
    total,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    showPendingOnly,
    setShowPendingOnly,
    showArchiveDialog,
    setShowArchiveDialog,
    showRestoreDialog,
    setShowRestoreDialog,
    pendingArchiveId,
    setPendingArchiveId,
    pendingRestoreId,
    setPendingRestoreId,
    pendingCount,
    editEquipmentModal,
    setEditEquipmentModal,
    createEquipmentModal,
    setCreateEquipmentModal,
    showDeleteDialog,
    setShowDeleteDialog,
    pendingEditId,
    openHandleEdit,
    openHandleDelete,
    confirmDelete,
    openHandleQr,
    cancelDelete,
    equipmentDetails,
    searchTerm,
    setSearchTerm,
    handleClearFilters,
    filters,
    setFilters,
    setUseFilters,
    open,
    setOpen,
    cancelArchive,
    confirmArchive,
    openHandleArchive,
    cancelRestore,
    confirmRestore,
    openHandleRestore,
    handleNotificationHighlight,
  };
};
