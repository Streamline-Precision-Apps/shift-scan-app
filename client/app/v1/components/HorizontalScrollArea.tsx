import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import React from "react";

/**
 * HorizontalScrollArea
 * Wraps children in a horizontally scrollable area using shadcn/ui ScrollArea.
 *
 * @param {React.ReactNode} children - The content to scroll horizontally.
 * @param {string} [className] - Optional additional class names for the ScrollArea.
 * @param {number|string} [height] - Optional height for the scroll area (default: 'auto').
 * @param {number|string} [width] - Optional width for the scroll area (default: '100%').
 */
export function HorizontalScrollArea({
  children,
  className = "",
  height = "auto",
  width = "100%",
}: {
  children: React.ReactNode;
  className?: string;
  height?: number | string;
  width?: number | string;
}) {
  return (
    <ScrollArea
      className={`w-full overflow-x-auto ${className}`}
      style={{ height, width, whiteSpace: "nowrap" }}
      type="auto"
    >
      <div className="inline-block min-w-max w-full">{children}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
