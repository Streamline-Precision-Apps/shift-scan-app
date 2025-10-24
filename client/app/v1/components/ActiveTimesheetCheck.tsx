"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
        // Check if user has any active timesheets (draft status and no endTime)
        const response = await fetch(`/api/check-active-timesheet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to check active timesheet status");
        }

        const data = await response.json();

        // If no active timesheet found, clear all cookies and redirect to home
        if (!data.hasActiveTimesheet) {
          // Clear all timesheet cookies
          await fetch("/api/clear-timesheet-cookies", {
            method: "POST",
          });

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
