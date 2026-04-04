"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Configuration options for the swipe gesture hook.
 *
 * @param {() => void} onSwipeRight - Callback fired on a right swipe
 * @param {() => void} onSwipeLeft - Callback fired on a left swipe
 * @param {number} threshold - Minimum horizontal distance in px to trigger a swipe (default: 50)
 */
export interface UseSwipeGestureOptions {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  threshold?: number;
}

/**
 * Detects horizontal swipe gestures on a referenced element.
 * Listens to `touchstart`, `touchmove`, and `touchend` with `passive: true`.
 * Fires the appropriate callback when the horizontal delta exceeds the threshold.
 * No-ops on devices without touch support.
 *
 * @param {RefObject<HTMLElement | null>} ref - React ref to the target element
 * @param {UseSwipeGestureOptions} options - Swipe configuration and callbacks
 * @example
 * const panelRef = useRef<HTMLDivElement>(null);
 * useSwipeGesture(panelRef, { onSwipeRight: () => closeSidebar(), threshold: 60 });
 */
export function useSwipeGesture(
  ref: RefObject<HTMLElement | null>,
  options: UseSwipeGestureOptions
): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip registration on devices without touch support
    if (typeof window === "undefined" || !("ontouchstart" in window)) return;

    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const delta = endX - startX;
      const threshold = optionsRef.current.threshold ?? 50;

      if (Math.abs(delta) >= threshold) {
        if (delta > 0) {
          optionsRef.current.onSwipeRight?.();
        } else {
          optionsRef.current.onSwipeLeft?.();
        }
      }
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref]);
}
