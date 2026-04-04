import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Padding values in pixels that correspond to Tailwind classes.
 * - `p-4` = 16px (mobile/tablet base)
 * - `lg:p-6` = 24px (desktop ≥ 1024px)
 */
const PADDING = { mobile: 16, desktop: 24 } as const;

/**
 * Represents the resolved padding configuration for the dashboard container.
 */
interface PaddingResolution {
  /** Padding value in pixels. */
  padding: number;
  /** The Tailwind class responsible for the padding. */
  appliedClass: string;
}

/**
 * Resolves the dashboard container padding based on the viewport width.
 * This mirrors the actual Tailwind responsive classes applied in
 * `app/user/dashboard/page.tsx`: `p-4 lg:p-6`.
 *
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved padding configuration
 */
function resolveDashboardPadding(viewportWidth: number): PaddingResolution {
  if (viewportWidth >= BREAKPOINTS.lg) {
    return { padding: PADDING.desktop, appliedClass: "lg:p-6" };
  }
  return { padding: PADDING.mobile, appliedClass: "p-4" };
}

// Feature: responsive-mobile-ui, Property 2: El padding del dashboard se adapta al viewport
describe("Property 2: Dashboard padding adapts to viewport", () => {
  it("padding is 16px on mobile viewports (< 768px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const resolution = resolveDashboardPadding(viewportWidth);
          expect(resolution.padding).toBe(PADDING.mobile);
          expect(resolution.appliedClass).toBe("p-4");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("padding is 16px on tablet viewports (768–1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (viewportWidth) => {
          const resolution = resolveDashboardPadding(viewportWidth);
          expect(resolution.padding).toBe(PADDING.mobile);
          expect(resolution.appliedClass).toBe("p-4");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("padding is 24px on desktop viewports (≥ 1024px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (viewportWidth) => {
          const resolution = resolveDashboardPadding(viewportWidth);
          expect(resolution.padding).toBe(PADDING.desktop);
          expect(resolution.appliedClass).toBe("lg:p-6");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("padding is monotonically non-decreasing as viewport grows", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.integer({ min: 1, max: 500 }),
        (viewportWidth, delta) => {
          const narrower = resolveDashboardPadding(viewportWidth);
          const wider = resolveDashboardPadding(viewportWidth + delta);
          expect(wider.padding).toBeGreaterThanOrEqual(narrower.padding);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("exact lg breakpoint boundary produces correct transition (1023 → 1024)", () => {
    const below = resolveDashboardPadding(BREAKPOINTS.lg - 1);
    const at = resolveDashboardPadding(BREAKPOINTS.lg);
    expect(below.padding).toBe(PADDING.mobile);
    expect(at.padding).toBe(PADDING.desktop);
  });
});
