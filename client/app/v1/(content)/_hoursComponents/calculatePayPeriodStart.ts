import {
  startOfWeek as startOfWeekFn,
  differenceInCalendarWeeks as differenceInCalendarWeeksFn,
  addWeeks as addWeeksFn,
} from "date-fns";

export const useCalculatePayPeriodStart = () => {
  const startDate = new Date(2024, 7, 5); // August 5, 2024 (Monday)
  const now = new Date();

  // Find the most recent Monday
  const currentWeekStart = startOfWeekFn(now, { weekStartsOn: 1 }); // 1 = Monday

  // Calculate the number of weeks since the startDate
  const weeksSinceStart = differenceInCalendarWeeksFn(
    currentWeekStart,
    startDate,
    {
      weekStartsOn: 1,
    }
  );

  // Determine the current two-week period
  const payPeriodNumber = Math.floor(weeksSinceStart / 2);

  return addWeeksFn(startDate, payPeriodNumber * 2);
};
