import React, { useRef, useEffect, useState, RefObject } from "react";
import { motion } from "framer-motion";

// Custom interface for scroll container to store scroll timeout
interface ScrollTimeoutDiv extends HTMLDivElement {
  _scrollTimeout?: ReturnType<typeof setTimeout>;
}

interface HorizontalScrollbarProps {
  containerRef: RefObject<ScrollTimeoutDiv>;
}

/**
 * Custom horizontal scrollbar for visually representing and controlling scroll position.
 * @param containerRef - Ref to the scrollable container to sync with.
 */
const HorizontalScrollbar: React.FC<HorizontalScrollbarProps> = ({
  containerRef,
}) => {
  const [scrollRatio, setScrollRatio] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update thumb position and size on scroll or resize
  const updateThumb = () => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setScrollRatio(scrollLeft / (scrollWidth - clientWidth));
    setThumbWidth(
      (clientWidth / scrollWidth) * (trackRef.current?.clientWidth || 1)
    );
  };

  // Sync thumb with container scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    updateThumb();
    const handleScroll = () => {
      setIsScrolling(true);
      updateThumb();
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 300);
    };
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateThumb);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateThumb);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [containerRef]);

  // Handle thumb drag
  const onDrag = (e: MouseEvent) => {
    if (!dragging.current || !trackRef.current || !containerRef.current) return;
    const track = trackRef.current;
    const container = containerRef.current;
    const trackRect = track.getBoundingClientRect();
    const x = e.clientX - trackRect.left;
    const ratio = Math.max(
      0,
      Math.min(1, (x - thumbWidth / 2) / (trackRect.width - thumbWidth))
    );
    container.scrollLeft =
      ratio * (container.scrollWidth - container.clientWidth);
  };

  // Drag events
  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onDrag);
    window.addEventListener(
      "mouseup",
      () => {
        dragging.current = false;
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onDrag);
      },
      { once: true }
    );
  };

  // Click on track to jump
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !containerRef.current) return;
    const track = trackRef.current;
    const container = containerRef.current;
    const trackRect = track.getBoundingClientRect();
    const x = e.clientX - trackRect.left;
    const ratio = Math.max(
      0,
      Math.min(1, (x - thumbWidth / 2) / (trackRect.width - thumbWidth))
    );
    container.scrollLeft =
      ratio * (container.scrollWidth - container.clientWidth);
  };

  // Thumb as a ball instead of a bar
  const thumbSize = isScrolling ? 12 : 10; // px, ball grows slightly when scrolling
  const thumbStyle: React.CSSProperties = {
    position: "absolute",
    left: `${scrollRatio * 100}%`,
    top: "50%",
    width: `${thumbSize}px`,
    height: `${thumbSize}px`,
    transform: "translate(-50%, -50%)",
    background: "rgba(255,255,255,0.8)", // white with 0.8 opacity
    borderRadius: "50%", // make it a circle
    boxShadow: isScrolling ? "0 2px 8px rgba(37,99,235,0.18)" : "none",
    transition:
      "width 0.25s cubic-bezier(.4,1.6,.4,1), height 0.25s cubic-bezier(.4,1.6,.4,1), box-shadow 0.25s, background 0.2s",
    zIndex: 10, // ensure thumb is always on top
    cursor: "grab",
    pointerEvents: "auto",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        width: "100%",
        height: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        position: "relative",
        padding: "0 5%",
      }}
    >
      {/* The outer wrapper now has horizontal padding to create space on the sides, but the scrollbar track fills the available width */}
      <div
        ref={trackRef}
        style={{
          position: "relative",
          width: "100%",
          height: 4, // set track height to 4px
          background: "rgba(255,255,255,0.3)", // set opacity to 0.30
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          pointerEvents: "auto",
        }}
        onClick={handleTrackClick}
      >
        <div
          style={thumbStyle}
          onMouseDown={handleThumbMouseDown}
          aria-label="Scroll thumb"
        />
      </div>
    </div>
  );
};

export default HorizontalScrollbar;
