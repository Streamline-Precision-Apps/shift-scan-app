"use client";
import { useState, useEffect } from "react";
import { deleteUser } from "@/actions/adminActions";
import { isAuthenticationError } from "@/utils/authErrorUtils";

export interface PersonnelFilterOptions {
  roles: string[];
  accessLevel: string[];
  accountSetup: string[];
  crews: string[];
}

export type PersonnelSummary = {
  id: string;
  username: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  image: string | null;
  email: string | null;
  DOB: Date;
  terminationDate: Date | null;
  accountSetup: boolean;
  permission: string;
  truckView: boolean;
  tascoView: boolean;
  mechanicView: boolean;
  laborView: boolean;
  Crews?: {
    id: string;
    name: string;
    leadId: string;
    leadName: string;
  }[];
  Contact: {
    phoneNumber: string | null;
    emergencyContact: string | null;
    emergencyContactNumber: string | null;
  };
};

export const usePersonnelData = () => {
  const [personnelDetails, setPersonnelDetails] = useState<PersonnelSummary[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(""); // debounced value
  const [searchInput, setSearchInput] = useState<string>(""); // immediate input

  // Filter state
  const [useFilters, setUseFilters] = useState<boolean>(false);
  const [appliedFilters, setAppliedFilters] = useState<PersonnelFilterOptions>({
    roles: [],
    accessLevel: [],
    accountSetup: [],
    crews: [],
  });
  const [pendingFilters, setPendingFilters] = useState<PersonnelFilterOptions>({
    roles: [],
    accessLevel: [],
    accountSetup: [],
    crews: [],
  });

  //   // State for modals
  const [editUserModal, setEditUserModal] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  //   // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const rerender = () => setRefreshKey((k) => k + 1);

  // Filter handlers
  const handleFilterChange = (newFilters: PersonnelFilterOptions) => {
    setPendingFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
    const hasActiveFilters =
      pendingFilters.roles.length > 0 ||
      pendingFilters.accessLevel.length > 0 ||
      pendingFilters.accountSetup.length > 0 ||
      pendingFilters.crews.length > 0;
    setUseFilters(hasActiveFilters);
  };

  const handleClearFilters = async () => {
    const emptyFilters = {
      roles: [],
      accessLevel: [],
      accountSetup: [],
      crews: [],
    };
    setPendingFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setUseFilters(false);
  };

  useEffect(() => {
    const fetchPersonnelSummaries = async () => {
      try {
        setLoading(true);
        let url = "";
        const encodedSearch = encodeURIComponent(searchTerm.trim());

        // Build filter query parameters
        const filterParams = new URLSearchParams();

        if (useFilters) {
          if (appliedFilters.roles.length > 0) {
            filterParams.append("roles", appliedFilters.roles.join(","));
          }
          if (appliedFilters.accessLevel.length > 0) {
            filterParams.append(
              "accessLevel",
              appliedFilters.accessLevel.join(","),
            );
          }
          if (appliedFilters.accountSetup.length > 0) {
            filterParams.append(
              "accountSetup",
              appliedFilters.accountSetup.join(","),
            );
          }
          if (appliedFilters.crews.length > 0) {
            filterParams.append("crews", appliedFilters.crews.join(","));
          }
        }

        if (showInactive) {
          url = `/api/personnelManager?status=inactive${searchTerm ? `&search=${encodedSearch}` : ""}`;
          if (filterParams.toString()) {
            url += `&${filterParams.toString()}`;
          }
        } else {
          url = `/api/personnelManager?page=${page}&pageSize=${pageSize}${searchTerm ? `&search=${encodedSearch}` : ""}`;
          if (filterParams.toString()) {
            url += `&${filterParams.toString()}`;
          }
        }

        const response = await fetch(url);
        if (!response.ok) {
          // Check if we're being redirected to sign-in
          if (
            response.status === 200 &&
            response.headers.get("content-type")?.includes("text/html")
          ) {
            throw new Error("Authentication required - please sign in");
          }
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        setPersonnelDetails(data.users);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (error) {
        // Silently handle authentication errors during sign-out
        if (isAuthenticationError(error)) {
          // User is likely being redirected to sign-in, don't log these errors
          return;
        }
        // Log other errors that are not related to authentication
        console.error("Failed to fetch personnel details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonnelSummaries();
  }, [
    refreshKey,
    page,
    pageSize,
    showInactive,
    searchTerm,
    useFilters,
    appliedFilters,
  ]);

  const openHandleEdit = (id: string) => {
    setPendingEditId(id);
    setEditUserModal(true);
  };

  const openHandleDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId) {
      await deleteUser(pendingDeleteId);
      setShowDeleteDialog(false);
      setPendingDeleteId(null);
      rerender();
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setPendingDeleteId(null);
  };

  // Reset to page 1 if search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, showInactive, useFilters, appliedFilters]);

  return {
    personnelDetails,
    setPersonnelDetails,
    loading,
    setLoading,
    rerender,
    // Pagination state
    total,
    page,
    pageSize,
    totalPages,
    // Pagination handlers
    setTotal,
    setPage,
    setPageSize,
    setTotalPages,
    // Show inactive employee only

    showInactive,
    // Search
    searchTerm: searchInput,
    setSearchTerm: setSearchInput,
    editUserModal,
    setEditUserModal,
    createUserModal,
    setCreateUserModal,
    showDeleteDialog,
    setShowDeleteDialog,
    openHandleEdit,
    openHandleDelete,
    confirmDelete,
    cancelDelete,
    pendingEditId,
    // Filter functionality
    useFilters,
    setUseFilters,
    filters: pendingFilters,
    setFilters: setPendingFilters,
    appliedFilters,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
  };
};
