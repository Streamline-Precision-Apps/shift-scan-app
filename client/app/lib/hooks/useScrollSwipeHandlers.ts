import { useRef, useCallback } from "react";

export function useScrollSwipeHandlers(setIsScrolling: (b: boolean) => void) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStart.current.x);
      const dy = Math.abs(touch.clientY - touchStart.current.y);
      setIsScrolling(dy > dx);
    },
    [setIsScrolling]
  );

  const onTouchEnd = useCallback(() => {
    touchStart.current = null;
    setIsScrolling(false);
  }, [setIsScrolling]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}
