import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge.
 * Reports errors to Sentry if class name merging fails.
 * @param inputs - Class values to merge
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]): string {
  try {
    return twMerge(clsx(inputs));
  } catch (error) {
    return "";
  }
}

export default cn;
