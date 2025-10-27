"use client";
import { useState, useEffect, useCallback } from "react";

export type CostCode = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  CCTags: Array<{
    id: string;
    name: string;
  }>;
};

export const useCostCodeDataById = (id: string) => {
  const [costCodeDetails, setCostCodeDetails] = useState<CostCode | null>(null);
  const [tagSummaries, setTagSummaries] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const rerender = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const fetchEquipmentSummaries = async () => {
      try {
        setLoading(true);
        const [costCodeDetails, tag] = await Promise.all([
          fetch("/api/getCostCodeById/" + id),
          fetch("/api/getTagSummary"),
        ]).then((res) => Promise.all(res.map((r) => r.json())));

        setCostCodeDetails(costCodeDetails);
        setTagSummaries(tag);
      } catch (error) {
        console.error("Failed to fetch job site details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentSummaries();
  }, [refreshKey]);

  return {
    costCodeDetails,
    setCostCodeDetails,
    tagSummaries,
    loading,
    setLoading,
    rerender,
  };
};
