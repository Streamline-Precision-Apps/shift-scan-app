import { useMemo } from "react";

/**
 * Custom hook that calculates the height of a bar based on the input value
 * @param value - The numeric value used to determine the bar height
 * @returns The calculated height in pixels
 */
export const useCalculateBarHeight = (value: number): number => {
  return useMemo(() => {
    if (value <= 4) return 50;
    if (value <= 5) return 60;
    if (value <= 6) return 70;
    if (value <= 7) return 80;
    if (value <= 8) return 90;
    return 100;
  }, [value]);
};
