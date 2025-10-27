import { useState, useEffect, useCallback, useMemo } from "react";
import type { FormTemplate } from "./types";
import { FormTemplateCategory } from "../../../../../../../../prisma/generated/prisma/client";
import { useRouter } from "next/navigation";
import { useDashboardData } from "@/app/(routes)/admins/_pages/sidebar/DashboardDataContext";

/**
 * Custom hook to manage fetching, filtering, and paginating forms for the List view.
 * Handles loading, error, search, filter, and pagination state.
 */

export type FormTypeFilter = FormTemplateCategory | "ALL";

interface FilterOptions {
  formType: string[];
  status: string[];
}
export function useFormsList() {
  const { refresh } = useDashboardData();
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formType, setFormType] = useState<FormTypeFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();
  const [refilterKey, setRefilterKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const rerender = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refresh();
  }, [refresh]);

  const [filters, setFilters] = useState<FilterOptions>({
    formType: [],
    status: [],
  });

  const reFilterPage = useCallback(() => {
    setRefilterKey((k) => k + 1);
  }, []);

  const handleClearFilters = async () => {
    // First clear the URL
    router.replace("/admins/forms");

    // Reset all filter-related states
    setFilters({
      formType: [],
      status: [],
    });
    setFormType("ALL");
    setPage(1);

    // Trigger immediate refetch
    setRefilterKey((k) => k + 1);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const buildFilterQuery = () => {
    const params = new URLSearchParams();

    // Form Type
    if (filters.formType && filters.formType.length > 0) {
      filters.formType.forEach((type) => {
        // Skip if type is "ALL"
        if (type !== "ALL") {
          params.append("formType", type);
        }
      });
    }

    // Status (array)
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach((status) => {
        params.append("status", status);
      });
    }

    return params.toString();
  };

  async function fetchForms() {
    setLoading(true);
    setError(null);
    try {
      const filterQuery = buildFilterQuery();
      const encodedSearch = encodeURIComponent(searchTerm.trim());
      const res = await fetch(
        `/api/getAllForms?page=${page}&pageSize=${pageSize}&search=${encodedSearch}${filterQuery ? `&${filterQuery}` : ""}`,
      );
      if (!res.ok) throw new Error("Failed to fetch forms");
      const result = await res.json();
      setForms(result.data as FormTemplate[]);
      setTotalPages(result.totalPages || 1);
      setTotal(result.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load forms");
    } finally {
      setLoading(false);
    }
  }

  // Effect to handle filters and fetching
  useEffect(() => {
    fetchForms();
  }, [page, pageSize, searchTerm, refilterKey, refreshKey]);

  // Get unique form types from the current forms
  const formTypes = useMemo(() => {
    const types = new Set<string>();
    forms.forEach((form) => {
      if (form.formType) types.add(form.formType);
    });
    return Array.from(types).sort();
  }, [forms]);

  // Filter by search and formType
  const filteredForms = useMemo(() => {
    return forms
      .filter((form) => {
        const matchesName = searchTerm.trim()
          ? form.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
          : true;
        const matchesType =
          formType === "ALL" ? true : form.formType === formType;
        return matchesName && matchesType;
      })
      .map((form) => ({
        id: form.id,
        name: form.name,
        description: form.description,
        formType: form.formType || "UNKNOWN",
        _count: form._count,
        isActive: form.isActive,
        createdAt: form.createdAt || new Date().toISOString(),
        updatedAt: form.updatedAt || new Date().toISOString(),
      }));
  }, [forms, searchTerm, formType]);

  return {
    forms,
    filteredForms,
    loading,
    error,
    inputValue,
    setInputValue,
    formType,
    setFormType,
    formTypes,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    total,
    refetch: fetchForms,
    setForms,
    rerender,
    handleClearFilters,
    filters,
    setFilters,
    reFilterPage,
  };
}
