"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ClockOutCheckProps = {
  userId: string;
  timesheetId: string | null;
};

export default function ClockOutCheck({
  userId,
  timesheetId,
}: ClockOutCheckProps) {
  const router = useRouter();

  useEffect(() => {
    const checkClockOutStatus = async () => {
      // Only check if we have a timesheet ID
      if (!timesheetId) {
        return;
      }

      try {
        // Check if the current timesheet is still active (no endTime)
        const response = await fetch(`/api/check-timesheet-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            timesheetId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to check timesheet status");
        }

        const data = await response.json();

        // If the timesheet has been clocked out (has endTime), clear cookies and redirect
        if (data.isClockedOut) {
          // Clear timesheet cookies
          await fetch("/api/clear-timesheet-cookies", {
            method: "POST",
          });

          // Redirect to home page
          router.replace("/");
        }
      } catch (error) {
        console.error("Failed to check clock-out status:", error);
        // Don't redirect on error to avoid disrupting user experience
      }
    };

    // Check immediately on mount
    checkClockOutStatus();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkClockOutStatus, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [userId, timesheetId, router]);

  // This component doesn't render anything visible
  return null;
}
