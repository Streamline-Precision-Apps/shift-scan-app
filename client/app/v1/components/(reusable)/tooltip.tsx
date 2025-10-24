import React, { ReactNode } from "react";

interface TooltipsProps {
  /** The content that will be displayed in the tooltip */
  content: string;
  /** The element that the tooltip will be attached to */
  children: ReactNode;
  /** Position of the tooltip relative to the children (default: "top") */
  position?: "top" | "bottom" | "left" | "right";
  /** Optional additional class name for styling */
  className?: string;
  /** Delay before the tooltip appears in milliseconds (set to 0 for immediate) */
  delay?: number;
}

/**
 * Reusable tooltip component that shows a tooltip when hovering over its children
 *
 * @example
 * <Tooltip content="Click to print QR code">
 *   <button>Print QR</button>
 * </Tooltip>
 */
export function Tooltips({
  content,
  children,
  position = "top",
  className = "",
  delay = 0,
}: TooltipsProps) {
  // Base styling for all tooltips
  const baseClasses =
    "absolute bg-gray-800 text-white text-xs rounded-sm py-1 px-2 pointer-events-none whitespace-nowrap z-10 opacity-0 group-hover:opacity-100";

  // Set transition based on delay
  const transitionClasses =
    delay === 0
      ? "transition-opacity duration-75"
      : "transition-opacity duration-300";

  // Position-specific classes
  const positionClasses = {
    top: "-top-10 left-1/2 transform -translate-x-1/2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "top-1/2 right-full transform -translate-y-1/2 mr-2",
    right: "top-1/2 left-full transform -translate-y-1/2 ml-2",
  };

  // Arrow classes and position
  const arrowClasses = {
    top: "absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800",
    bottom:
      "absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800",
    left: "absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-gray-800",
    right:
      "absolute top-1/2 right-full transform -translate-y-1/2 border-4 border-transparent border-r-gray-800",
  };

  return (
    <div className={`relative inline-block group ${className}`}>
      {children}
      <div
        className={`${baseClasses} ${transitionClasses} ${positionClasses[position]}`}
      >
        {content}
        <div className={arrowClasses[position]}></div>
      </div>
    </div>
  );
}
