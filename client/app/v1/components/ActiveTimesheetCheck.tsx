"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/app/lib/utils/api-Utils";

type ActiveTimesheetCheckProps = {
  userId: string;
};

export default function ActiveTimesheetCheck({
  userId,
}: ActiveTimesheetCheckProps) {
  const router = useRouter();

  useEffect(() => {
    const checkActiveTimesheet = async () => {
      try {
        // Call backend API to check active timesheet status
        const response = await apiRequest(
          `/api/v1/timesheet/user/${userId}/active-status`,
          "GET"
        );
        // If no active timesheet found, clear all cookies and redirect to home
        if (!response?.data?.hasActiveTimesheet) {
          // Clear all timesheet cookies
          await apiRequest(`/api/cookies/clear-all`, "DELETE");

          // Redirect to home page
          router.replace("/");
        }
      } catch (error) {
        console.error("Failed to check active timesheet status:", error);
        // Don't redirect on error to avoid disrupting user experience
      }
    };

    // Check immediately on mount
    checkActiveTimesheet();
  }, [userId]);

  // This component doesn't render anything visible
  return null;
}
