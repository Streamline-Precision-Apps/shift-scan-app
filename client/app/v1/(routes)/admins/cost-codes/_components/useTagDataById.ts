"use client";
import { useState, useEffect } from "react";

export type Tag = {
  id: string;
  name: string;
  description: string;
  Jobsites: Array<{
    id: string;
    name: string;
  }>;
  CostCodes: Array<{
    id: string;
    name: string;
  }>;
};

export const useTagDataById = (id: string) => {
  const [tagDetails, setTagDetails] = useState<Tag | null>(null);
  const [costCodeSummaries, setCostCodeSummaries] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);
  const [jobsiteSummaries, setJobsiteSummaries] = useState<
    Array<{
      id: string;
      name: string;
    }>
  >([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const rerender = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const fetchTagDetails = async () => {
      try {
        setLoading(true);
        const [tag, costCode, Jobsite] = await Promise.all([
          fetch("/api/getTagById/" + id),
          fetch("/api/getCostCodeSummary"),
          fetch("/api/getJobsiteSummary"),
        ]).then((res) => Promise.all(res.map((r) => r.json())));
        setTagDetails(tag);
        setCostCodeSummaries(costCode);
        setJobsiteSummaries(Jobsite);
      } catch (error) {
        console.error("Failed to fetch tag details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTagDetails();
  }, [refreshKey]);

  return {
    tagDetails,
    costCodeSummaries,
    jobsiteSummaries,
    setTagDetails,
    loading,
    setLoading,
    rerender,
  };
};
