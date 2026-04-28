"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Detects whether a CSS media query matches the current viewport.
 * Returns `false` during SSR to avoid hydration mismatches (mobile-first).
 * Uses useSyncExternalStore for safe synchronization with the browser.
 *
 * @param {string} query - CSS media query string, e.g. "(min-width: 768px)"
 * @returns {boolean} Whether the media query currently matches
 * @example
 * const isMobile = useMediaQuery("(max-width: 767px)");
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
