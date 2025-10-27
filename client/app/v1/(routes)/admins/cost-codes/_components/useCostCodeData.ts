"use client";
import { useState, useEffect } from "react";
import {
  deleteCostCode,
  archiveCostCode,
  restoreCostCode,
} from "@/actions/AssetActions";
export type CostCodeSummary = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  CCTags: Array<{
    id: string;
    name: string;
  }>;
  _count: {
    Timesheets: number;
  };
};

export const useCostCodeData = () => {
  const [CostCodeDetails, setCostCodeDetails] = useState<CostCodeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");

  // State for modals, dialogs, and pending actions
  // Cost Codes
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);

  const [editCostCodeModal, setEditCostCodeModal] = useState(false);
  const [createCostCodeModal, setCreateCostCodeModal] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const rerender = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const fetchEquipmentSummaries = async () => {
      try {
        setLoading(true);
        const encodedSearch = encodeURIComponent(searchTerm.trim());
        const response = await fetch(
          `/api/getCostCodeDetails?page=${page}&pageSize=${pageSize}&search=${encodedSearch}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        setCostCodeDetails(data.costCodes);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch CostCode details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentSummaries();
  }, [refreshKey, page, pageSize, searchTerm]);
  // Cost Codes helper functions
  const openHandleEdit = (id: string) => {
    setPendingEditId(id);
    setEditCostCodeModal(true);
  };
  // archive, restore
  const openHandleArchive = (id: string) => {
    setPendingArchiveId(id);
    setShowArchiveDialog(true);
  };
  const confirmArchive = async () => {
    if (pendingArchiveId) {
      await archiveCostCode(pendingArchiveId);
      setShowArchiveDialog(false);
      setPendingArchiveId(null);
      rerender();
    }
  };
  const cancelArchive = () => {
    setShowArchiveDialog(false);
    setPendingArchiveId(null);
  };

  const openHandleRestore = (id: string) => {
    setPendingRestoreId(id);
    setShowRestoreDialog(true);
  };
  const confirmRestore = async () => {
    if (pendingRestoreId) {
      await restoreCostCode(pendingRestoreId);
      setShowRestoreDialog(false);
      setPendingRestoreId(null);
      rerender();
    }
  };
  const cancelRestore = () => {
    setShowRestoreDialog(false);
    setPendingRestoreId(null);
  };

  // deletion handlers
  const confirmDelete = async () => {
    if (pendingDeleteId) {
      await deleteCostCode(pendingDeleteId);
      setShowDeleteDialog(false);
      setPendingDeleteId(null);
      rerender();
    }
  };
  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setPendingDeleteId(null);
  };
  const openHandleDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteDialog(true);
  };

  const filteredCostCodes = CostCodeDetails.filter((costCode) =>
    costCode.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Reset to page 1 if search or filter changes
  useEffect(() => {
    setPage(1);
  }, [inputValue]);

  return {
    loading,
    CostCodeDetails,
    rerender,
    total,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    inputValue,
    setInputValue,
    editCostCodeModal,
    setEditCostCodeModal,
    createCostCodeModal,
    setCreateCostCodeModal,
    pendingEditId,
    showDeleteDialog,
    setShowDeleteDialog,
    openHandleEdit,
    confirmDelete,
    openHandleDelete,
    cancelDelete,
    filteredCostCodes,
    showArchiveDialog,
    setShowArchiveDialog,
    openHandleArchive,
    confirmArchive,
    cancelArchive,
    showRestoreDialog,
    setShowRestoreDialog,
    openHandleRestore,
    confirmRestore,
    cancelRestore,
  };
};
