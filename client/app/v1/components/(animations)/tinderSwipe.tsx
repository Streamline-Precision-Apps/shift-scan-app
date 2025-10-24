"use client";
import { motion, useAnimation, PanInfo } from "framer-motion";
import React, {
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useRef,
} from "react";
import { Holds } from "../(reusable)/holds";
import { Images } from "../(reusable)/images";
import { Texts } from "../(reusable)/texts";

interface SlidingDivProps extends React.PropsWithChildren {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  minHoldTime?: number;
}

export type TinderSwipeRef = {
  swipeLeft: () => void;
  swipeRight: () => void;
};

const TinderSwipe = forwardRef<TinderSwipeRef, SlidingDivProps>(
  function TinderSwipe(
    {
      children,
      onSwipeLeft,
      onSwipeRight,
      swipeThreshold = 80, // Lower threshold for easier swipe
      minHoldTime = 50, // Lower hold time for quicker drag enable
    },
    ref,
  ) {
    const controls = useAnimation();
    const [bgColor, setBgColor] = useState("bg-transparent");
    const [message, setMessage] = useState("");
    const [isScrolling, setIsScrolling] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [dragEnabled, setDragEnabled] = useState(false);
    const scrollableRef = useRef<HTMLDivElement>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    // Memoized swipe trigger function
    const triggerSwipe = useCallback(
      async (direction: "left" | "right") => {
        const x = direction === "left" ? -350 : 350;
        const bg = direction === "left" ? "bg-app-orange" : "bg-app-green";
        const msg =
          direction === "left"
            ? "Editing Time Sheets"
            : "Approving Time Sheets";

        setBgColor(bg);
        setMessage(msg);

        await controls.start({
          x,
          transition: { duration: 0.45, ease: "easeOut" },
        });

        // Execute the swipe callback
        if (direction === "left") {
          if (onSwipeLeft) onSwipeLeft();
        } else {
          if (onSwipeRight) onSwipeRight();
        }

        // Reset to initial state
        await controls.start({
          x: 0,
          transition: { duration: 0 },
        });
        setBgColor("bg-transparent");
        setMessage("");
      },
      [controls, onSwipeLeft, onSwipeRight],
    );

    // Expose swipe functions to parent component
    useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => triggerSwipe("left"),
        swipeRight: () => triggerSwipe("right"),
      }),
      [triggerSwipe],
    );

    const handleDragStart = () => {
      if (dragEnabled) return; // Already enabled

      // Start hold timer
      holdTimerRef.current = setTimeout(() => {
        setDragEnabled(true);
        setIsHolding(false);
      }, minHoldTime);

      setIsHolding(true);
    };

    const handleDrag = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      // If minimum hold time hasn't passed, prevent dragging
      if (!dragEnabled) {
        return false; // This cancels the drag gesture
      }
      // Ignore vertical scrolling
      if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
        setIsScrolling(true);
        return;
      }
      setIsScrolling(false);

      // Visual feedback based on drag position
      if (info.offset.x < -swipeThreshold) {
        setBgColor("bg-app-orange");
        setMessage("Editing Time Sheets");
      } else if (info.offset.x > swipeThreshold) {
        setBgColor("bg-app-green");
        setMessage("Approving Time Sheets");
      } else {
        setBgColor("bg-transparent");
        setMessage("");
      }
    };

    const handleDragEnd = (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      // Clear any pending hold timer
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }

      // Reset drag state regardless of outcome
      setDragEnabled(false);
      setIsHolding(false);

      // If minimum hold time wasn't met, cancel the swipe
      if (!dragEnabled) {
        controls.start({
          x: 0,
          transition: { duration: 0.2 },
        });
        return;
      }

      // If scrolling, ignore swipe actions
      if (isScrolling) return;

      const { offset } = info;
      const shouldSwipeLeft = offset.x < -swipeThreshold;
      const shouldSwipeRight = offset.x > swipeThreshold;

      if (shouldSwipeLeft) {
        triggerSwipe("left");
      } else if (shouldSwipeRight) {
        triggerSwipe("right");
      } else {
        // Snap back to center with spring animation
        controls.start({
          x: 0,
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 30,
            restDelta: 0.1,
          },
        });
        setBgColor("bg-transparent");
        setMessage("");
      }
    };

    // Touch event handlers to distinguish scroll vs swipe
    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStart.current.x);
      const dy = Math.abs(touch.clientY - touchStart.current.y);
      // If vertical movement is greater, treat as scroll
      if (dy > dx) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    };

    const handleTouchEnd = () => {
      touchStart.current = null;
    };

    return (
      <Holds
        className={`w-full h-full rounded-[10px] relative overflow-hidden transition-colors duration-200 ${bgColor}`}
      >
        {message && (
          <div className="flex flex-col h-full items-center justify-center absolute w-full top-0 left-0 pointer-events-none">
            <Images
              titleImg={
                bgColor === "bg-app-orange"
                  ? "/formEdit.svg"
                  : "/statusApprovedFilled.svg"
              }
              titleImgAlt="verification icon"
              className=" h-10 w-10 mb-4 animate-fade-in"
            />
            <Texts size={"md"} className=" w-full text-center">
              {message}
            </Texts>
          </div>
        )}
        <motion.div
          drag="x"
          dragConstraints={{ left: -350, right: 350 }}
          dragElastic={0.35} // More elastic for easier swipe
          animate={controls}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative h-full overflow-y-auto"
          style={{ touchAction: "pan-y" }}
          ref={scrollableRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {children}
        </motion.div>
      </Holds>
    );
  },
);

export default TinderSwipe;
