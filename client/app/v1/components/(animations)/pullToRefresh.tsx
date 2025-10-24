import React from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  maxPullDistance?: number;
  threshold?: number;
  resistanceFactor?: number;
  containerClassName?: string;
  loadingIndicatorClassName?: string;
  pullIndicatorClassName?: string;
  contentClassName?: string;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
  bgColor?: string;
  textColor?: string;
}

/**
 * A reusable Pull-to-Refresh component that can be wrapped around any content
 * to provide a smooth, interactive pull-to-refresh experience.
 */
export function PullToRefresh({
  children,
  onRefresh,
  maxPullDistance = 30,
  threshold = 30, // Reduced from 70 to 50 to match hook default
  resistanceFactor = 0.4,
  containerClassName = "",
  loadingIndicatorClassName = "",
  pullIndicatorClassName = "",
  contentClassName = "",
  refreshingText = "Loading...",
  pullText = "Pull to refresh",
  releaseText = "Release to refresh",
  bgColor = "bg-darkBlue/70",
  textColor = "text-white",
}: PullToRefreshProps) {
  const { isRefreshing, pullToRefreshHandlers, pullDistance, pullProgress } =
    usePullToRefresh({
      onRefresh,
      maxDistance: maxPullDistance,
      threshold,
      resistanceFactor,
      scrollCheckDelay: 100, // Check scrolling more frequently for responsive feel
    });

  return (
    <div
      className={`relative h-full overflow-y-auto no-scrollbar ${containerClassName}`}
      {...pullToRefreshHandlers}
    >
      {/* Loading indicator - visible only when refreshing */}
      {isRefreshing && (
        <div
          className={`sticky top-0 left-0 right-0 flex items-center justify-center z-10 h-8 ${bgColor} backdrop-blur-sm ${loadingIndicatorClassName}`}
        >
          <span className={`${textColor} flex items-center gap-2`}>
            <svg
              className={`animate-spin h-5 w-5 ${textColor}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {refreshingText}
          </span>
        </div>
      )}

      {/* Content container with pull effect */}
      <div
        className={`w-full ${contentClassName}`}
        style={{
          transform:
            pullDistance > 0 ? `translateY(${pullDistance * 0.8}px)` : "none",
          transition:
            pullDistance > 0
              ? "none"
              : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        {/* Pull indicator that appears above content */}
        {pullDistance > 10 &&
          !isRefreshing && ( // Show indicator earlier (reduced from > 0)
            <div
              className={`flex items-center justify-center h-8 ${textColor} opacity-80 mb-1 ${pullIndicatorClassName}`}
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`h-5 w-5 ${textColor} transition-transform`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    transform:
                      pullProgress >= 1
                        ? "rotate(180deg)"
                        : `rotate(${pullProgress * 180}deg)`,
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                {pullProgress >= 1 ? releaseText : pullText}
              </div>
            </div>
          )}

        {children}
      </div>
    </div>
  );
}
