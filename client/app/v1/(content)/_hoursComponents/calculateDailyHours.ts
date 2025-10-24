import { useCallback } from "react";
import { useCalculatePayPeriodStart } from "./calculatePayPeriodStart";
import { usePayPeriodTimeSheet } from "@/app/context/PayPeriodTimeSheetsContext";

/**
 * Custom hook to calculate daily hours worked within a pay period
 *
 * @returns {Function} A memoized function that calculates daily hours data
 *
 * @example
 * const calculateDailyHours = useCalculateDailyHours();
 * const dailyHours = calculateDailyHours();
 */
export const useCalculateDailyHours = () => {
  const { payPeriodTimeSheet } = usePayPeriodTimeSheet();
  const calculatePayPeriodStart = useCalculatePayPeriodStart();

  return useCallback(() => {
    const startDate = calculatePayPeriodStart;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13); // 14-day period (0-13)

    const dateKey = (date: Date) => {
      date.setHours(0, 0, 0, 0);
      return date.toISOString(); // Better to use ISO string for consistency
    };

    const hoursMap: Record<string, number> = {};
    const currentDate = new Date(startDate);

    // Initialize all dates in period with 0 hours
    while (currentDate <= endDate) {
      hoursMap[dateKey(new Date(currentDate))] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate hours from timesheets
    if (payPeriodTimeSheet) {
      payPeriodTimeSheet.forEach((sheet) => {
        const sheetStart = new Date(sheet.startTime);
        const sheetEnd = new Date(sheet.endTime);
        const sheetDateKey = dateKey(new Date(sheetStart));

        if (hoursMap[sheetDateKey] !== undefined) {
          const hours =
            (sheetEnd.getTime() - sheetStart.getTime()) / (1000 * 60 * 60);
          hoursMap[sheetDateKey] += hours;
        }
      });
    }

    // Convert to sorted array
    return Object.entries(hoursMap)
      .map(([date, hours]) => ({ date, hours }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [payPeriodTimeSheet, calculatePayPeriodStart]);
};
