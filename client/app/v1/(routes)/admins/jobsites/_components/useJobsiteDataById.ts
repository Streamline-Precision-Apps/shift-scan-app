"use client";

import { useState, useEffect } from "react";
import {
  ApprovalStatus,
  FormStatus,
  FormTemplateStatus,
} from "../../../../../../prisma/generated/prisma";

export type Jobsite = {
  id: string;
  code?: string;
  name: string;
  description?: string;
  creationReason?: string;
  approvalStatus: ApprovalStatus;
  status: FormTemplateStatus;
  archivedDate: boolean;
  createdById: string;
  updatedAt: Date;
  createdVia: "ADMIN" | "API";
  Address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  Client: {
    id: string;
    name: string;
  };
  CCTags: Array<{
    id: string;
    name: string;
  }>;
  createdBy: {
    firstName: string;
    lastName: string;
  };
};

export const useJobsiteDataById = (id: string) => {
  const [jobSiteDetails, setJobSiteDetails] = useState<Jobsite | null>(null);
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
        const [jobsiteDetails, tag] = await Promise.all([
          fetch("/api/getJobsiteById/" + id),
          fetch("/api/getTagSummary"),
        ]).then((res) => Promise.all(res.map((r) => r.json())));

        // If there's a dash, remove code from the start of the name; otherwise, leave as is
        if (jobsiteDetails.name.includes("-")) {
          setJobSiteDetails({
            ...jobsiteDetails,
            name: jobsiteDetails.name.replace(/^[A-Z0-9]+\s*-\s*/, ""),
          });
        } else {
          setJobSiteDetails(jobsiteDetails);
        }

        const filteredTags = tag.tags.map(
          (tag: { id: string; name: string }) => ({
            id: tag.id,
            name: tag.name,
          }),
        );
        setTagSummaries(filteredTags);
      } catch (error) {
        console.error("Failed to fetch job site details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentSummaries();
  }, [refreshKey]);

  return {
    jobSiteDetails,
    setJobSiteDetails,
    tagSummaries,
    loading,
    setLoading,
    rerender,
  };
};
