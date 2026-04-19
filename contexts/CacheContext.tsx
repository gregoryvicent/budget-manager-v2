"use client";

import React, { createContext, useCallback, useRef } from "react";

/**
 * Default time-to-live for cache entries in milliseconds (5 minutes).
 */
export const DEFAULT_TTL = 300_000;

/**
 * Represents a single entry stored in the in-memory cache.
 */
export interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

/**
 * Context value exposed by CacheContext.
 */
export interface CacheContextValue {
  cachedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  invalidate: (urlPrefix: string) => void;
  invalidateAll: () => void;
}

/**
 * Cross-resource invalidation dependency map.
 * When a mutation occurs on a resource key, all dependent prefixes are also invalidated.
 */
export const INVALIDATION_DEPS: Record<string, string[]> = {
  "/api/income-entries": ["/api/budgets/history"],
  "/api/expense-entries": ["/api/budgets/history"],
  "/api/savings-goals": ["/api/budgets/history"],
  "/api/goal-month-settings": ["/api/budgets/history"],
  "/api/budgets": ["/api/budgets/history"],
};

export const CacheContext = createContext<CacheContextValue | null>(null);

/**
 * Extracts the resource prefix from a URL (path without query params).
 *
 * @param {string} url - Full URL including query params
 * @returns {string} The URL path portion before any query string
 */
function getResourcePrefix(url: string): string {
  const qIndex = url.indexOf("?");
  return qIndex === -1 ? url : url.substring(0, qIndex);
}

/**
 * Provider that manages an in-memory cache for API responses.
 * Wraps the application and exposes cachedFetch, invalidate, and invalidateAll
 * through CacheContext.
 *
 * - GET requests are cached by full URL (including query params) with a configurable TTL.
 * - POST/PATCH/DELETE requests bypass the cache and trigger prefix-based invalidation.
 * - In-flight request deduplication prevents redundant fetches for the same URL.
 *
 * @param {object} props - Provider props
 * @param {React.ReactNode} props.children - Child components
 */
export function CacheProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const inFlightRef = useRef<Map<string, Promise<Response>>>(new Map());

  /**
   * Invalidates all cache entries whose key starts with the given prefix,
   * plus any cross-resource dependencies defined in INVALIDATION_DEPS.
   *
   * @param {string} urlPrefix - The URL prefix to match against cache keys
   */
  const invalidate = useCallback((urlPrefix: string) => {
    const cache = cacheRef.current;
    const prefixesToInvalidate = [urlPrefix];

    // Collect cross-resource dependencies
    for (const [resource, deps] of Object.entries(INVALIDATION_DEPS)) {
      if (urlPrefix.startsWith(resource)) {
        prefixesToInvalidate.push(...deps);
      }
    }

    // Remove matching entries
    for (const key of Array.from(cache.keys())) {
      if (prefixesToInvalidate.some((prefix) => key.startsWith(prefix))) {
        cache.delete(key);
      }
    }
  }, []);

  /**
   * Clears the entire cache store.
   */
  const invalidateAll = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Fetch wrapper that caches GET responses and invalidates on mutations.
   *
   * @param {string} url - The request URL
   * @param {RequestInit} [options] - Standard fetch options
   * @returns {Promise<Response>} The response (from cache or server)
   */
  const cachedFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const method = (options?.method ?? "GET").toUpperCase();

      // For mutations: execute fetch then invalidate
      if (method !== "GET") {
        const response = await fetch(url, options);
        if (response.ok) {
          const prefix = getResourcePrefix(url);
          invalidate(prefix);
        }
        return response;
      }

      // For GET: check cache first
      const cache = cacheRef.current;
      const entry = cache.get(url);

      if (entry) {
        const age = Date.now() - entry.timestamp;
        if (age < entry.ttl) {
          return new Response(JSON.stringify(entry.data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        // Expired — remove stale entry
        cache.delete(url);
      }

      // Check for in-flight request deduplication
      const inFlight = inFlightRef.current;
      const existing = inFlight.get(url);
      if (existing) {
        return existing;
      }

      // Execute fetch, store in cache, and handle deduplication
      const fetchPromise = fetch(url, options)
        .then(async (response) => {
          inFlight.delete(url);

          if (response.ok) {
            try {
              const cloned = response.clone();
              const data = await cloned.json();
              cache.set(url, {
                data,
                timestamp: Date.now(),
                ttl: DEFAULT_TTL,
              });
            } catch {
              // Response not JSON-parseable — skip caching
            }
          }

          return response;
        })
        .catch((error) => {
          inFlight.delete(url);
          throw error;
        });

      inFlight.set(url, fetchPromise);
      return fetchPromise;
    },
    [invalidate],
  );

  return (
    <CacheContext.Provider value={{ cachedFetch, invalidate, invalidateAll }}>
      {children}
    </CacheContext.Provider>
  );
}
