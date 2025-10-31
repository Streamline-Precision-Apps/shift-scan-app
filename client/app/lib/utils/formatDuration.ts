import {
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";

export function formatDuration(
  startDate: Date | string,
  endDate: Date = new Date(),
) {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;

  const hours = differenceInHours(endDate, start);
  const minutes = differenceInMinutes(endDate, start) % 60;

  if (hours > 0) {
    return `${hours} hrs ${minutes} mins`;
  } else {
    return `${minutes} mins `;
  }
}
