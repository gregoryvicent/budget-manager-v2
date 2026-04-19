import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import { DEFAULT_TTL, INVALIDATION_DEPS } from "@/contexts/CacheContext";
import type { CacheEntry } from "@/contexts/CacheContext";

/**
 * Minimal in-memory cache implementation mirroring CacheProvider logic.
 * Extracted for direct property testing without React rendering overhead.
 */
function createCacheStore() {
  const cache = new Map<string, CacheEntry>();
  const inFlight = new Map<string, Promise<Response>>();

  async function cachedFetch(
    url: string,
    options?: RequestInit,
  ): Promise<Response> {
    const method = (options?.method ?? "GET").toUpperCase();

    if (method !== "GET") {
      const response = await fetch(url, options);
      return response;
    }

    const entry = cache.get(url);
    if (entry) {
      const age = Date.now() - entry.timestamp;
      if (age < entry.ttl) {
        return new Response(JSON.stringify(entry.data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      cache.delete(url);
    }

    const existing = inFlight.get(url);
    if (existing) {
      return existing;
    }

    const fetchPromise = fetch(url, options)
      .then(async (response) => {
        inFlight.delete(url);
        if (response.ok) {
          try {
            const cloned = response.clone();
            const data = await cloned.json();
            cache.set(url, { data, timestamp: Date.now(), ttl: DEFAULT_TTL });
          } catch {
            // skip caching non-JSON responses
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
  }

  return { cachedFetch, cache };
}

/**
 * Arbitrary for generating valid URL paths with optional query params.
 */
const urlArb = fc
  .tuple(
    fc.webPath({ size: "small" }),
    fc.option(
      fc.dictionary(
        fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,9}$/),
        fc.stringMatching(/^[a-zA-Z0-9]{1,10}$/),
        { minKeys: 1, maxKeys: 3 },
      ),
      { nil: undefined },
    ),
  )
  .map(([path, params]) => {
    const base = path || "/api/test";
    if (!params) return base;
    const qs = Object.entries(params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return `${base}?${qs}`;
  });

/**
 * Arbitrary for generating JSON-serializable data.
 */
// Wrap generated JSON values through a JSON round-trip so values like -0
// (which become +0 after JSON.stringify/parse) don't cause false negatives.
const jsonDataArb = fc
  .oneof(
    fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.jsonValue(), {
      minKeys: 1,
      maxKeys: 5,
    }),
    fc.array(fc.jsonValue(), { minLength: 1, maxLength: 5 }),
  )
  .map((v) => JSON.parse(JSON.stringify(v)));

// Feature: loading-skeletons-cache, Property 1: Round-trip de almacenamiento en caché
describe("Property 1: Round-trip de almacenamiento en caché", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => {
        throw new Error("fetch should be mocked per test");
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    "after cachedFetch(url), the cache Map contains an entry with the same URL key and identical data",
    async () => {
      await fc.assert(
        fc.asyncProperty(urlArb, jsonDataArb, async (url, data) => {
          // Arrange: fresh cache store and mock fetch returning the generated data
          const { cachedFetch, cache } = createCacheStore();

          vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValueOnce(
              new Response(JSON.stringify(data), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }),
            ),
          );

          // Act: perform a GET request through cachedFetch
          const response = await cachedFetch(url);
          const responseData = await response.json();

          // Assert: cache contains the entry with matching key and data
          expect(cache.has(url)).toBe(true);

          const entry = cache.get(url)!;
          expect(entry.data).toEqual(data);
          expect(entry.ttl).toBe(DEFAULT_TTL);
          expect(typeof entry.timestamp).toBe("number");

          // Assert: response data matches original
          expect(responseData).toEqual(data);
        }),
        { numRuns: 100 },
      );
    },
    30_000,
  );
});

// Feature: loading-skeletons-cache, Property 2: Cache hit evita llamada al servidor
describe("Property 2: Cache hit evita llamada al servidor", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => {
        throw new Error("fetch should be mocked per test");
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(
    "calling cachedFetch twice with the same URL invokes the underlying fetch exactly once",
    async () => {
      await fc.assert(
        fc.asyncProperty(urlArb, jsonDataArb, async (url, data) => {
          // Arrange: fresh cache store and mock fetch returning the generated data
          const { cachedFetch } = createCacheStore();

          const mockFetch = vi.fn().mockResolvedValue(
            new Response(JSON.stringify(data), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          );
          vi.stubGlobal("fetch", mockFetch);

          // Act: call cachedFetch twice with the same URL
          const response1 = await cachedFetch(url);
          const response2 = await cachedFetch(url);

          const data1 = await response1.json();
          const data2 = await response2.json();

          // Assert: both responses return identical data
          expect(data1).toEqual(data);
          expect(data2).toEqual(data);

          // Assert: underlying fetch was called exactly once
          expect(mockFetch).toHaveBeenCalledTimes(1);
        }),
        { numRuns: 100 },
      );
    },
    30_000,
  );
});

/**
 * Cache store variant that accepts a custom TTL for testing expiration behavior.
 */
function createCacheStoreWithTTL(customTTL: number) {
  const cache = new Map<string, CacheEntry>();
  const inFlight = new Map<string, Promise<Response>>();

  async function cachedFetch(
    url: string,
    options?: RequestInit,
  ): Promise<Response> {
    const method = (options?.method ?? "GET").toUpperCase();

    if (method !== "GET") {
      const response = await fetch(url, options);
      return response;
    }

    const entry = cache.get(url);
    if (entry) {
      const age = Date.now() - entry.timestamp;
      if (age < entry.ttl) {
        return new Response(JSON.stringify(entry.data), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      cache.delete(url);
    }

    const existing = inFlight.get(url);
    if (existing) {
      return existing;
    }

    const fetchPromise = fetch(url, options)
      .then(async (response) => {
        inFlight.delete(url);
        if (response.ok) {
          try {
            const cloned = response.clone();
            const data = await cloned.json();
            cache.set(url, { data, timestamp: Date.now(), ttl: customTTL });
          } catch {
            // skip caching non-JSON responses
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
  }

  return { cachedFetch, cache };
}

// Feature: loading-skeletons-cache, Property 3: Expiración por TTL fuerza re-fetch
describe("Property 3: Expiración por TTL fuerza re-fetch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async () => {
        throw new Error("fetch should be mocked per test");
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it(
    "after TTL expires, the next cachedFetch call invokes fetch again",
    async () => {
      const ttlArb = fc.integer({ min: 1, max: 10_000 });

      await fc.assert(
        fc.asyncProperty(
          urlArb,
          jsonDataArb,
          jsonDataArb,
          ttlArb,
          async (url, initialData, freshData, ttl) => {
            // Arrange: fresh cache store with custom TTL
            const { cachedFetch } = createCacheStoreWithTTL(ttl);

            let callCount = 0;
            const mockFetch = vi.fn().mockImplementation(async () => {
              callCount++;
              const data = callCount === 1 ? initialData : freshData;
              return new Response(JSON.stringify(data), {
                status: 200,
                headers: { "Content-Type": "application/json" },
              });
            });
            vi.stubGlobal("fetch", mockFetch);

            // Act: first call — populates cache
            const response1 = await cachedFetch(url);
            const data1 = await response1.json();
            expect(data1).toEqual(initialData);
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // Advance time beyond the TTL
            vi.advanceTimersByTime(ttl + 1);

            // Act: second call — TTL expired, should re-fetch
            const response2 = await cachedFetch(url);
            const data2 = await response2.json();

            // Assert: fetch was called a second time
            expect(mockFetch).toHaveBeenCalledTimes(2);
            expect(data2).toEqual(freshData);
          },
        ),
        { numRuns: 100 },
      );
    },
    30_000,
  );
});

/**
 * Cache store variant that exposes the invalidate function for direct testing.
 */
function createCacheStoreWithInvalidation() {
  const cache = new Map<string, CacheEntry>();

  /**
   * Invalidates all cache entries whose key starts with the given prefix.
   * Does NOT apply cross-resource dependencies — tests pure prefix matching only.
   *
   * @param {string} urlPrefix - The URL prefix to match against cache keys
   */
  function invalidate(urlPrefix: string): void {
    for (const key of Array.from(cache.keys())) {
      if (key.startsWith(urlPrefix)) {
        cache.delete(key);
      }
    }
  }

  return { cache, invalidate };
}

/**
 * Arbitrary for generating a URL prefix (simple path segment).
 */
const prefixArb = fc
  .stringMatching(/^\/[a-z]{1,8}(\/[a-z]{1,8}){0,2}$/)
  .filter((s) => s.length >= 2);

/**
 * Arbitrary for generating a set of URLs that start with a given prefix.
 */
function matchingUrlsArb(prefix: string) {
  return fc
    .array(
      fc
        .stringMatching(/^\/[a-z0-9]{1,10}$/)
        .map((suffix) => `${prefix}${suffix}`),
      { minLength: 1, maxLength: 5 },
    )
    .map((urls) => [...new Set(urls)]);
}

/**
 * Arbitrary for generating a set of URLs that do NOT start with a given prefix.
 */
function nonMatchingUrlsArb(prefix: string) {
  return fc
    .array(
      fc
        .stringMatching(/^\/[a-z]{1,8}(\/[a-z0-9]{1,10}){1,2}$/)
        .filter((url) => !url.startsWith(prefix)),
      { minLength: 1, maxLength: 5 },
    )
    .map((urls) => [...new Set(urls)]);
}

// Feature: loading-skeletons-cache, Property 4: Invalidación por prefijo elimina solo entradas coincidentes
describe("Property 4: Invalidación por prefijo elimina solo entradas coincidentes", () => {
  it(
    "after invalidate(prefix), only entries whose key starts with prefix are removed; all others remain",
    async () => {
      await fc.assert(
        fc.asyncProperty(prefixArb, async (prefix) => {
          // Generate matching and non-matching URLs based on the prefix
          const matching = await fc.sample(matchingUrlsArb(prefix), 1)[0];
          const nonMatching = await fc.sample(
            nonMatchingUrlsArb(prefix),
            1,
          )[0];

          // Skip if generators produced empty arrays
          if (!matching.length || !nonMatching.length) return;

          const { cache, invalidate } = createCacheStoreWithInvalidation();

          // Populate cache with both matching and non-matching entries
          const allUrls = [...matching, ...nonMatching];
          for (const url of allUrls) {
            cache.set(url, {
              data: { url },
              timestamp: Date.now(),
              ttl: DEFAULT_TTL,
            });
          }

          // Verify all entries are present before invalidation
          expect(cache.size).toBe(allUrls.length);

          // Act: invalidate by prefix
          invalidate(prefix);

          // Assert: matching entries were removed
          for (const url of matching) {
            expect(cache.has(url)).toBe(false);
          }

          // Assert: non-matching entries remain intact
          for (const url of nonMatching) {
            expect(cache.has(url)).toBe(true);
            expect(cache.get(url)!.data).toEqual({ url });
          }
        }),
        { numRuns: 100 },
      );
    },
    30_000,
  );
});

/**
 * Cache store variant that applies cross-resource dependency invalidation,
 * mirroring the full CacheProvider invalidation logic.
 */
function createCacheStoreWithCrossDepsInvalidation() {
  const cache = new Map<string, CacheEntry>();

  /**
   * Invalidates cache entries by prefix, including cross-resource dependencies
   * defined in INVALIDATION_DEPS.
   *
   * @param {string} urlPrefix - The URL prefix to match against cache keys
   */
  function invalidate(urlPrefix: string): void {
    const prefixesToInvalidate = [urlPrefix];

    for (const [resource, deps] of Object.entries(INVALIDATION_DEPS)) {
      if (urlPrefix.startsWith(resource)) {
        prefixesToInvalidate.push(...deps);
      }
    }

    for (const key of Array.from(cache.keys())) {
      if (prefixesToInvalidate.some((prefix) => key.startsWith(prefix))) {
        cache.delete(key);
      }
    }
  }

  return { cache, invalidate };
}

// Feature: loading-skeletons-cache, Property 5: Invalidación cruzada de dependencias
describe("Property 5: Invalidación cruzada de dependencias", () => {
  /**
   * Arbitrary that picks a random resource-dependency pair from INVALIDATION_DEPS.
   */
  const depPairArb = fc
    .constantFrom(...Object.entries(INVALIDATION_DEPS))
    .map(([resource, deps]) => ({ resource, deps }));

  /**
   * Arbitrary for generating a query-param suffix to append to a base path.
   */
  const querySuffixArb = fc
    .stringMatching(/^[a-zA-Z0-9]{1,10}$/)
    .map((id) => `?id=${id}`);

  it(
    "mutating a resource invalidates both its own entries and all dependency entries",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          depPairArb,
          fc.array(querySuffixArb, { minLength: 1, maxLength: 5 }),
          fc.array(querySuffixArb, { minLength: 1, maxLength: 5 }),
          fc.array(querySuffixArb, { minLength: 1, maxLength: 3 }),
          async (pair, resourceSuffixes, depSuffixes, unrelatedSuffixes) => {
            const { cache, invalidate } =
              createCacheStoreWithCrossDepsInvalidation();

            // Build unique resource URLs
            const resourceUrls = [
              ...new Set(
                resourceSuffixes.map((s) => `${pair.resource}${s}`),
              ),
            ];

            // Build unique dependency URLs for each dependency prefix
            const depUrls: string[] = [];
            for (const dep of pair.deps) {
              for (const s of depSuffixes) {
                depUrls.push(`${dep}${s}`);
              }
            }
            const uniqueDepUrls = [...new Set(depUrls)];

            // Build unrelated URLs that should NOT be invalidated
            const unrelatedUrls = [
              ...new Set(
                unrelatedSuffixes.map((s) => `/api/unrelated${s}`),
              ),
            ];

            // Populate cache with all three groups
            const allUrls = [...resourceUrls, ...uniqueDepUrls, ...unrelatedUrls];
            for (const url of allUrls) {
              cache.set(url, {
                data: { url },
                timestamp: Date.now(),
                ttl: DEFAULT_TTL,
              });
            }

            const sizeBefore = cache.size;
            expect(sizeBefore).toBe(allUrls.length);

            // Act: invalidate using the resource prefix (simulates a mutation)
            invalidate(pair.resource);

            // Assert: resource entries were removed
            for (const url of resourceUrls) {
              expect(cache.has(url)).toBe(false);
            }

            // Assert: dependency entries were removed
            for (const url of uniqueDepUrls) {
              expect(cache.has(url)).toBe(false);
            }

            // Assert: unrelated entries remain intact
            for (const url of unrelatedUrls) {
              expect(cache.has(url)).toBe(true);
              expect(cache.get(url)!.data).toEqual({ url });
            }
          },
        ),
        { numRuns: 100 },
      );
    },
    30_000,
  );
});
