"use client";

import { useState, useEffect } from "react";

/**
 * Detects whether a CSS media query matches the current viewport.
 * Returns `false` during SSR to avoid hydration mismatches (mobile-first).
 * Synchronizes state on the client via `useEffect` and `matchMedia` listener.
 *
 * @param {string} query - CSS media query string, e.g. "(min-width: 768px)"
 * @returns {boolean} Whether the media query currently matches
 * @example
 * const isMobile = useMediaQuery("(max-width: 767px)");
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
