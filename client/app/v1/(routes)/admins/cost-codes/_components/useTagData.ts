"use client";
import { useState, useEffect } from "react";
import { deleteTag } from "@/actions/AssetActions";

export type TagSummary = {
  id: string;
  name: string;
  description: string;
  CostCodes: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
  Jobsites: Array<{
    id: string;
    name: string;
  }>;
};

export const useTagData = () => {
  const [tagDetails, setTagDetails] = useState<TagSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Tags
  const [createTagModal, setCreateTagModal] = useState(false);
  const [editTagModal, setEditTagModal] = useState(false);
  const [showDeleteTagDialog, setShowDeleteTagDialog] = useState(false);
  const [pendingTagEditId, setPendingTagEditId] = useState<string | null>(null);
  const [pendingTagDeleteId, setPendingTagDeleteId] = useState<string | null>(
    null,
  );

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
          `/api/getTagSummary?page=${page}&pageSize=${pageSize}&search=${encodedSearch}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        setTagDetails(data.tags);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch Tag details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentSummaries();
  }, [refreshKey, page, pageSize, searchTerm]);

  // Tag helper functions
  const confirmTagDelete = async () => {
    if (pendingTagDeleteId) {
      await deleteTag(pendingTagDeleteId);
      setShowDeleteTagDialog(false);
      setPendingTagDeleteId(null);
      rerender();
    }
  };
  const cancelTagDelete = () => {
    setShowDeleteTagDialog(false);
    setPendingTagDeleteId(null);
  };
  const openHandleTagEdit = (id: string) => {
    setPendingTagEditId(id);
    setEditTagModal(true);
  };

  const openHandleTagDelete = (id: string) => {
    // Find the tag to check if it's the ALL tag
    const tag = tagDetails.find((tag) => tag.id === id);
    if (tag && tag.name.toUpperCase() === "ALL") {
      // Don't allow deleting the ALL tag
      console.warn("The ALL tag cannot be deleted");
      return;
    }
    setPendingTagDeleteId(id);
    setShowDeleteTagDialog(true);
  };

  // Simple filter by tag name
  const filteredTags = tagDetails.filter((tag) =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Reset to page 1 if search or filter changes
  useEffect(() => {
    setPage(1);
  }, [inputValue]);

  return {
    createTagModal,
    setCreateTagModal,
    editTagModal,
    setEditTagModal,
    showDeleteTagDialog,
    setShowDeleteTagDialog,
    pendingTagEditId,
    loading,
    rerender,
    inputValue,
    setInputValue,
    confirmTagDelete,
    cancelTagDelete,
    openHandleTagEdit,
    openHandleTagDelete,
    totalPages,
    filteredTags,
    total,
  };
};
