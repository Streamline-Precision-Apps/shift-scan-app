export const formatTimeHHMM = (timestamp: string | Date): string => {
  // Convert the UTC time to local time
  const localDate = new Date(timestamp);

  // Format the local time
  return localDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 12-hour format with AM/PM
  });
};
