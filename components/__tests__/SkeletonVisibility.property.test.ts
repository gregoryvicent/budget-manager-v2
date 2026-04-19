import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Pure function that mirrors the skeleton visibility logic used across
 * dashboard and history pages.
 *
 * A skeleton is shown if and only if the component is loading AND there
 * is no cached data available to display in the meantime.
 *
 * @param {boolean} loading - Whether the data hook is currently fetching
 * @param {boolean} hasCachedData - Whether previously fetched data exists
 * @returns {boolean} True when the skeleton should be rendered
 */
function shouldShowSkeleton(loading: boolean, hasCachedData: boolean): boolean {
  return loading && !hasCachedData;
}

/**
 * Inverse: determines whether real content (data or empty state) should render.
 *
 * @param {boolean} loading - Whether the data hook is currently fetching
 * @param {boolean} hasCachedData - Whether previously fetched data exists
 * @returns {boolean} True when real content should be rendered
 */
function shouldShowContent(loading: boolean, hasCachedData: boolean): boolean {
  return !loading || hasCachedData;
}

describe("Feature: loading-skeletons-cache, Property 6: Skeleton visibility determined by cache state", () => {
  it("skeleton is shown if and only if loading=true AND hasCachedData=false", () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), (loading, hasCachedData) => {
        const showSkeleton = shouldShowSkeleton(loading, hasCachedData);
        expect(showSkeleton).toBe(loading && !hasCachedData);
      }),
      { numRuns: 100 },
    );
  });

  it("skeleton and content are mutually exclusive and exhaustive", () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), (loading, hasCachedData) => {
        const skeleton = shouldShowSkeleton(loading, hasCachedData);
        const content = shouldShowContent(loading, hasCachedData);

        // Exactly one of the two must be true at all times
        expect(skeleton).not.toBe(content);
      }),
      { numRuns: 100 },
    );
  });

  it("skeleton never shows when cached data is available, regardless of loading state", () => {
    fc.assert(
      fc.property(fc.boolean(), (loading) => {
        const hasCachedData = true;
        expect(shouldShowSkeleton(loading, hasCachedData)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("skeleton never shows when not loading, regardless of cache state", () => {
    fc.assert(
      fc.property(fc.boolean(), (hasCachedData) => {
        const loading = false;
        expect(shouldShowSkeleton(loading, hasCachedData)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("skeleton always shows when loading with no cached data", () => {
    // This is a deterministic case but included for completeness
    expect(shouldShowSkeleton(true, false)).toBe(true);
    expect(shouldShowContent(true, false)).toBe(false);
  });

  it("dashboard KPI pattern: loading with empty array means no cached data", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.array(fc.record({ name: fc.string(), amount: fc.float({ min: 0, max: 100000, noNaN: true }) })),
        (loading, items) => {
          const hasCachedData = items.length > 0;
          const showSkeleton = shouldShowSkeleton(loading, hasCachedData);

          // Matches the dashboard pattern: hook.loading && items.length === 0
          expect(showSkeleton).toBe(loading && items.length === 0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("history page pattern: loading with no chart data means no cached data", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.array(
          fc.record({
            income: fc.float({ min: 0, max: 100000, noNaN: true }),
            expenses: fc.float({ min: 0, max: 100000, noNaN: true }),
          }),
        ),
        (loading, chartData) => {
          const hasData = chartData.some((d) => d.income > 0 || d.expenses > 0);
          const showSkeleton = shouldShowSkeleton(loading, hasData);

          // Matches the history page pattern: loading && !hasData
          expect(showSkeleton).toBe(loading && !hasData);
        },
      ),
      { numRuns: 100 },
    );
  });
});
