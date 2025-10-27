"use client";
import { useState, useCallback, useRef, useEffect } from "react";

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxDistance?: number;
  resistanceFactor?: number;
  scrollCheckDelay?: number;
}

interface PullToRefreshHandlers {
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

interface UsePullToRefreshReturn {
  isRefreshing: boolean;
  pullToRefreshHandlers: PullToRefreshHandlers;
  refreshIndicatorStyle: {
    height: string;
    opacity: number;
    transform: string;
  };
  pullDistance: number;
  pullProgress: number;
}

/**
 * A hook that implements a smooth pull-to-refresh functionality
 * @param {Function} onRefresh - The function to call when refresh is triggered
 * @param {number} threshold - The minimum pull distance needed to trigger refresh (default: 70)
 * @param {number} maxDistance - The maximum pull distance (default: 150)
 * @param {number} resistanceFactor - The resistance factor for the pull (default: 0.4)
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 30, // Reduced from 70 to 50 for easier triggering
  maxDistance = 30,
  resistanceFactor = 0.4,
  scrollCheckDelay = 150,
}: UsePullToRefreshProps): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [releaseState, setReleaseState] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const isAtTopRef = useRef(false);
  const lastTouchY = useRef(0);
  const velocityRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const lastScrollTime = useRef(0);
  const scrollElementRef = useRef<HTMLDivElement | null>(null);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Animate the pull release with a spring effect
  const animateRelease = useCallback(() => {
    // Spring animation for smooth release
    const animateSpring = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
        animationRef.current = requestAnimationFrame(animateSpring);
        return;
      }

      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Spring physics parameters
      const springStrength = 0.04;
      const damping = 0.75;

      // Apply spring force (proportional to displacement)
      const springForce = -springStrength * pullDistance;

      // Update velocity with spring force and damping
      velocityRef.current += springForce;
      velocityRef.current *= damping;

      // Update position with velocity
      const newDistance = pullDistance + velocityRef.current * deltaTime;

      if (Math.abs(newDistance) < 0.5 && Math.abs(velocityRef.current) < 0.05) {
        // Stop animation when almost at rest
        setPullDistance(0);
        setPullProgress(0);
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      } else {
        // Continue animation
        setPullDistance(Math.max(0, newDistance));
        setPullProgress(Math.max(0, newDistance) / threshold);
        animationRef.current = requestAnimationFrame(animateSpring);
      }
    };

    // Start the spring animation
    animationRef.current = requestAnimationFrame(animateSpring);
  }, [pullDistance, threshold]);

  // Check if we're at the top of the scrollable area
  const checkIfAtTop = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Get the scrollable element (the one that received the touch event)
    const scrollElement = e.currentTarget;

    // Check if the element is scrolled to the top (with a small tolerance)
    return scrollElement.scrollTop <= 5;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      // Stop any ongoing animations
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Reset animation values
      lastTimestampRef.current = 0;
      velocityRef.current = 0;

      // Only allow pull-to-refresh at the top of the container
      isAtTopRef.current = checkIfAtTop(e);

      if (isAtTopRef.current) {
        setStartY(e.touches[0].clientY);
        lastTouchY.current = e.touches[0].clientY;
        setReleaseState(false);
      }
    },
    [checkIfAtTop]
  );
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isAtTopRef.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;

      // Double-check if we're still at the top - user might have scrolled during touch
      const scrollElement = e.currentTarget;
      if (scrollElement.scrollTop > 5) {
        // User has scrolled down during the touch, so we cancel the pull-to-refresh
        isAtTopRef.current = false;
        setPullDistance(0);
        setPullProgress(0);
        return;
      }

      // Calculate velocity for momentum
      const deltaY = currentY - lastTouchY.current;
      lastTouchY.current = currentY;

      // Update velocity (can be used for momentum effect)
      velocityRef.current = deltaY * 0.5; // Scale down for better feel

      const rawDistance = currentY - startY;

      // Only allow pulling down, not up
      if (rawDistance <= 0) {
        setPullDistance(0);
        setPullProgress(0);
        return;
      }

      // Apply resistance for a more natural feel as user pulls further
      const appliedResistance =
        resistanceFactor * (1 - Math.exp(-rawDistance / maxDistance));
      const normalizedDistance = rawDistance * appliedResistance;

      // Cap the maximum distance
      const cappedDistance = Math.min(normalizedDistance, maxDistance);

      setPullDistance(cappedDistance);
      setPullProgress(cappedDistance / threshold); // Calculate progress ratio

      // Set release state when we cross the threshold
      if (cappedDistance >= threshold && !isRefreshing) {
        setReleaseState(true);
      } else if (cappedDistance < threshold * 0.8) {
        // Add hysteresis to prevent flickering
        setReleaseState(false);
      }
    },
    [isRefreshing, startY, threshold, maxDistance, resistanceFactor]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isAtTopRef.current) return;

    if (releaseState && pullDistance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(0);
      setPullProgress(0);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        // Start the release animation after refresh completes
        animateRelease();
      }
    } else {
      // If we didn't cross the threshold, just animate back to 0
      animateRelease();
    }

    setReleaseState(false);
  }, [onRefresh, releaseState, pullDistance, threshold, animateRelease]);

  // Generate styles for the refresh indicator
  const refreshIndicatorStyle = {
    height: `${Math.min(pullDistance, maxDistance)}px`,
    opacity: pullProgress,
    transform: isRefreshing
      ? "rotate(360deg)"
      : `rotate(${pullProgress * 180}deg)`,
  };

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const now = Date.now();

      // Don't check too frequently to avoid performance issues
      if (now - lastScrollTime.current < scrollCheckDelay) return;

      lastScrollTime.current = now;
      scrollElementRef.current = e.currentTarget;

      // If we're scrolled away from the top, disable pull-to-refresh
      if (e.currentTarget.scrollTop > 5) {
        isAtTopRef.current = false;

        // If we were in the middle of a pull, cancel it
        if (pullDistance > 0) {
          setPullDistance(0);
          setPullProgress(0);
        }
      } else {
        isAtTopRef.current = true;
      }
    },
    [pullDistance, scrollCheckDelay]
  );

  return {
    isRefreshing,
    pullToRefreshHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onScroll: handleScroll,
    },
    pullDistance,
    pullProgress,
    refreshIndicatorStyle,
  };
}
