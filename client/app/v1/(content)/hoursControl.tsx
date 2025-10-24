"use client";

import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Holds } from "@/components/(reusable)/holds";
import { Grids } from "@/components/(reusable)/grids";
import ViewComponent from "../(content)/hourView";
import TopControlPanel from "./_hoursComponents/topControlPanel";
import { useCalculateDailyHours } from "./_hoursComponents/calculateDailyHours";
import { motion, LayoutGroup } from "framer-motion";
import Panel, { PanelData } from "./hourViewPanels";
import HorizontalScrollbar from "@/components/HorizontalScrollbar";

// ----------------------------------------
// Type guard: checks if a data entry is a placeholder (i.e. label like "Start of Pay Period")
// ----------------------------------------
function isPlaceholderData(data: {
  date: string;
  hours?: number;
  isPlaceholder?: boolean;
}): data is { date: string; isPlaceholder: boolean } {
  return data.isPlaceholder === true;
}

// ----------------------------------------
// Custom interface for scroll container to store scroll timeout
// ----------------------------------------
interface ScrollTimeoutDiv extends HTMLDivElement {
  _scrollTimeout?: ReturnType<typeof setTimeout>;
}

// ----------------------------------------
// Main Component: Controls the hourly scrollable view with navigation and center focus behavior
// ----------------------------------------
export default function ControlComponent({
  toggle,
}: {
  toggle: (toggle: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [initialIndexSet, setInitialIndexSet] = useState(false); // Track if initial index is set
  const dailyHoursCache = useRef<{ date: string; hours: number }[] | null>(
    null,
  ); // caching calculated hours
  const calculateDailyHours = useCalculateDailyHours(); // hook to calculate work hours per day
  const containerRef = useRef<ScrollTimeoutDiv>(
    null!,
  ) as React.MutableRefObject<ScrollTimeoutDiv>; // ref to the scrolling container
  const wasProgrammaticScroll = useRef(false); // flag to distinguish between user and programmatic scroll

  // ----------------------------------------
  // Memoize the hours data so it's only calculated once
  // ----------------------------------------
  const dailyHours = useMemo(() => {
    if (dailyHoursCache.current) return dailyHoursCache.current;
    const calculated = calculateDailyHours();
    dailyHoursCache.current = calculated;
    return calculated;
  }, [calculateDailyHours]);

  // ----------------------------------------
  // Add placeholder panels to the beginning and end
  // ----------------------------------------
  const extendedDailyHours = useMemo(() => {
    if (dailyHours.length === 0) return [];
    return [
      { date: "Start of Pay Period", isPlaceholder: true },
      ...dailyHours,
      { date: "End of Pay Period", isPlaceholder: true },
    ];
  }, [dailyHours]);

  // ----------------------------------------
  // Scroll a panel into the center position of the viewport
  // ----------------------------------------
  const scrollToIndexCentered = (index: number, smooth = true) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const panelWidth = container.clientWidth / 3; // panel occupies 1/3 of the container

    let scrollLeft = (index - 1) * panelWidth;

    // Clamp scrolling within container bounds
    scrollLeft = Math.max(
      0,
      Math.min(scrollLeft, container.scrollWidth - container.clientWidth),
    );

    wasProgrammaticScroll.current = true;
    container.style.scrollSnapType = "none"; // disable snapping temporarily
    container.scrollTo({
      left: scrollLeft,
      behavior: smooth ? "smooth" : "auto",
    });

    // Re-enable snapping after scroll
    setTimeout(() => {
      if (container) container.style.scrollSnapType = "x mandatory";
      wasProgrammaticScroll.current = false;
    }, 300);
  };

  // ----------------------------------------
  // On initial mount or data change, scroll to today’s panel or default to index 1
  // ----------------------------------------
  useEffect(() => {
    if (extendedDailyHours.length === 0 || dailyHours.length === 0) return;
    // Get today's date in YYYY-MM-DD format (matching your data)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    // Normalize all dailyHours dates to YYYY-MM-DD
    const normalizedDailyHours = dailyHours.map((d) => ({
      ...d,
      date: new Date(d.date).toISOString().slice(0, 10),
    }));

    // Find the index of today in the normalizedDailyHours
    const todayIndex = normalizedDailyHours.findIndex(
      (d) => d.date === todayStr,
    );
    if (todayIndex === -1) {
      // eslint-disable-next-line no-console
      console.warn(
        "Today's date not found in dailyHours:",
        todayStr,
        normalizedDailyHours.map((d) => d.date),
      );
    }
    // Account for placeholder at the start
    const initialIndex = todayIndex !== -1 ? todayIndex + 1 : 1;
    setCurrentIndex(initialIndex);
    setInitialIndexSet(true); // Mark initial index as set
  }, [extendedDailyHours, dailyHours]);

  // Ensure scroll position is set as soon as DOM is ready
  useLayoutEffect(() => {
    if (!initialIndexSet || !containerRef.current) return;
    const container = containerRef.current;
    const panelWidth = container.clientWidth / 3;
    let scrollLeft = (currentIndex - 1) * panelWidth;
    scrollLeft = Math.max(
      0,
      Math.min(scrollLeft, container.scrollWidth - container.clientWidth),
    );
    container.style.scrollBehavior = "auto";
    container.style.scrollSnapType = "none";
    container.scrollLeft = scrollLeft;
    setTimeout(() => {
      if (container) {
        container.style.scrollBehavior = "";
        container.style.scrollSnapType = "x mandatory";
      }
    }, 0);
  }, [initialIndexSet, currentIndex]);

  // ----------------------------------------
  // When user scrolls, update the focus panel in real time
  // ----------------------------------------
  const [scrollingIndex, setScrollingIndex] = useState<number | null>(null);
  // Track last user action to prevent race conditions
  const lastActionRef = useRef<"scroll" | "button" | null>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    lastActionRef.current = "scroll";
    const container = containerRef.current;
    const panelWidth = container.clientWidth / 3;
    const scrollLeft = container.scrollLeft;
    // Deadzone: 20% of panel width on either side of the center
    const deadzone = panelWidth * 0.2;
    // The center of the viewport
    const center = scrollLeft + container.clientWidth / 2;
    // The center of the current panel
    const currentPanelCenter = (currentIndex - 1) * panelWidth + panelWidth / 2;
    // If the scroll is within the deadzone, do not change focus
    if (Math.abs(center - (currentPanelCenter + 8)) <= deadzone) {
      setScrollingIndex(null); // No highlight
      return;
    }
    // Otherwise, determine which panel is closest to center (outside deadzone)
    let closestIndex = Math.round(scrollLeft / panelWidth) + 1;
    closestIndex = Math.min(
      Math.max(closestIndex, 1),
      extendedDailyHours.length - 2,
    );
    setScrollingIndex(closestIndex); // Only visually highlight, don't setCurrentIndex
  };

  // ----------------------------------------
  // When user stops scrolling, snap to the closest panel and update the view
  // ----------------------------------------
  const onScrollEnd = () => {
    if (wasProgrammaticScroll.current || !containerRef.current) return;
    // Only allow scroll-based update if last action was scroll
    if (lastActionRef.current !== "scroll") {
      setScrollingIndex(null);
      return;
    }
    const container = containerRef.current;
    const panelWidth = container.clientWidth / 3;
    const scrollLeft = container.scrollLeft;
    let closestIndex = Math.round(scrollLeft / panelWidth) + 1;
    closestIndex = Math.min(
      Math.max(closestIndex, 1),
      extendedDailyHours.length - 2,
    );
    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex);
      scrollToIndexCentered(closestIndex, true);
    } else if (scrollingIndex !== null && scrollingIndex !== currentIndex) {
      setCurrentIndex(scrollingIndex);
      scrollToIndexCentered(scrollingIndex, true);
    }
    setScrollingIndex(null);
    lastActionRef.current = null;
  };

  // Update scroll position if currentIndex changes due to button click or programmatic change
  useEffect(() => {
    if (!containerRef.current) return;
    scrollToIndexCentered(currentIndex, true);
  }, [currentIndex]);

  // ----------------------------------------
  // Navigate to previous panel (infinite loop, always use latest state)
  // ----------------------------------------
  const scrollLeft = () => {
    setCurrentIndex((prev) => {
      const baseIndex = scrollingIndex !== null ? scrollingIndex : prev;
      const minIndex = 1;
      const maxIndex = extendedDailyHours.length - 2;
      let newIndex = baseIndex - 1;
      if (newIndex < minIndex) {
        newIndex = maxIndex; // Loop to end
      }
      lastActionRef.current = "button";
      setScrollingIndex(null);
      scrollToIndexCentered(newIndex);
      return newIndex;
    });
  };

  // ----------------------------------------
  // Navigate to next panel (infinite loop, always use latest state)
  // ----------------------------------------
  const scrollRight = () => {
    setCurrentIndex((prev) => {
      const baseIndex = scrollingIndex !== null ? scrollingIndex : prev;
      const minIndex = 1;
      const maxIndex = extendedDailyHours.length - 2;
      let newIndex = baseIndex + 1;
      if (newIndex > maxIndex) {
        newIndex = minIndex; // Loop to start
      }
      lastActionRef.current = "button";
      setScrollingIndex(null);
      scrollToIndexCentered(newIndex);
      return newIndex;
    });
  };

  // ----------------------------------------
  // Trigger return to the main view (outside this panel system)
  // ----------------------------------------
  const returnToMain = () => toggle(false);

  // ----------------------------------------
  // JSX Layout: Grid layout with top panel, center scrollable view, and bottom nav
  // ----------------------------------------
  return (
    <Grids rows="6" gap={"2"} className="h-full w-full">
      {/* Top panel controls */}
      <Holds position="row" className="row-span-1 h-full gap-2 w-full">
        <TopControlPanel returnToMain={returnToMain} />
      </Holds>
      {/* Center panel with horizontally scrollable day panels */}
      <Holds className="row-span-5 h-full w-full rounded-[10px] overflow-hidden">
        {/* Custom horizontal scrollbar above the panels */}
        <div className="mb-2">
          {/* Add margin below scrollbar to move it farther from panels */}
          <HorizontalScrollbar containerRef={containerRef} />
        </div>
        <motion.div
          ref={containerRef}
          className="flex h-full overflow-x-auto overflow-y-hidden snap-x snap-proximity no-scrollbar"
          style={{
            overscrollBehaviorX: "contain",
            WebkitOverflowScrolling: "touch",
            padding: "0 8px",
          }}
          onScroll={handleScroll}
        >
          <LayoutGroup id="hour-panels-group">
            {initialIndexSet &&
              extendedDailyHours.map((data, idx) => (
                <Panel
                  key={`${data.date}-${idx}`}
                  data={data}
                  isCenter={
                    scrollingIndex !== null
                      ? idx === scrollingIndex
                      : idx === currentIndex
                  }
                  distanceFromCenter={
                    scrollingIndex !== null
                      ? idx - scrollingIndex
                      : idx - currentIndex
                  }
                />
              ))}
          </LayoutGroup>
        </motion.div>
      </Holds>
      {/* Bottom view for navigation and date display */}
      {/* <Holds className="row-span-1 h-full w-full">
        {initialIndexSet && (
          <ViewComponent
            scrollLeft={scrollLeft}
            scrollRight={scrollRight}
            currentDate={extendedDailyHours[
              scrollingIndex !== null ? scrollingIndex : currentIndex
            ]?.date || ''}
            disableInitialAnimation={true}
          />
        )}
      </Holds> */}
    </Grids>
  );
}
