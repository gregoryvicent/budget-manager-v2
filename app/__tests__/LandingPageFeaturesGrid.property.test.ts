import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Represents the resolved responsive layout for the features grid.
 *
 * Models the classes from app/page.tsx features section:
 *   `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
 */
interface FeaturesGridLayout {
  /** Number of columns in the grid. */
  columns: number;
  /** The Tailwind classes responsible for the resolution. */
  appliedClasses: string[];
}

/**
 * Resolves the responsive grid layout for the features section
 * based on viewport width.
 *
 * The features grid in app/page.tsx uses these responsive classes:
 *   `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
 *
 * On mobile (< 768px):
 *   - `grid-cols-1` → 1 column
 *
 * On tablet (768px – 1023px):
 *   - `md:grid-cols-2` → 2 columns
 *
 * On desktop (≥ 1024px):
 *   - `lg:grid-cols-3` → 3 columns
 *
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved responsive features grid layout
 */
function resolveFeaturesGridLayout(viewportWidth: number): FeaturesGridLayout {
  if (viewportWidth >= BREAKPOINTS.lg) {
    return {
      columns: 3,
      appliedClasses: ["grid", "lg:grid-cols-3", "gap-6"],
    };
  }

  if (viewportWidth >= BREAKPOINTS.md) {
    return {
      columns: 2,
      appliedClasses: ["grid", "md:grid-cols-2", "gap-6"],
    };
  }

  return {
    columns: 1,
    appliedClasses: ["grid", "grid-cols-1", "gap-6"],
  };
}

// Feature: landing-page, Property 2: El grid de features adapta sus columnas al viewport
describe("Property 2: The features grid adapts its columns to the viewport", () => {
  /**
   * **Validates: Requirements 4.3, 4.4**
   *
   * Requirement 4.3: WHEN viewport < 768px, features in single-column grid.
   * Requirement 4.4: WHEN viewport >= 768px, features in multi-column grid
   *   (2 columns at md:, 3 columns at lg:).
   */

  it("mobile viewports (< 768px) resolve to 1 column", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const layout = resolveFeaturesGridLayout(viewportWidth);
          expect(layout.columns).toBe(1);
          expect(layout.appliedClasses).toContain("grid-cols-1");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("tablet viewports (768px–1023px) resolve to 2 columns", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (viewportWidth) => {
          const layout = resolveFeaturesGridLayout(viewportWidth);
          expect(layout.columns).toBe(2);
          expect(layout.appliedClasses).toContain("md:grid-cols-2");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("desktop viewports (>= 1024px) resolve to 3 columns", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (viewportWidth) => {
          const layout = resolveFeaturesGridLayout(viewportWidth);
          expect(layout.columns).toBe(3);
          expect(layout.appliedClasses).toContain("lg:grid-cols-3");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("column count increases monotonically across breakpoints (mobile < tablet < desktop)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (mobileWidth, tabletWidth, desktopWidth) => {
          const mobile = resolveFeaturesGridLayout(mobileWidth);
          const tablet = resolveFeaturesGridLayout(tabletWidth);
          const desktop = resolveFeaturesGridLayout(desktopWidth);

          // Columns increase monotonically: 1 < 2 < 3
          expect(mobile.columns).toBeLessThan(tablet.columns);
          expect(tablet.columns).toBeLessThan(desktop.columns);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("boundary transition at md breakpoint (768px): mobile → tablet", () => {
    const belowMd = resolveFeaturesGridLayout(BREAKPOINTS.md - 1);
    const atMd = resolveFeaturesGridLayout(BREAKPOINTS.md);

    // Below md: 1 column (mobile)
    expect(belowMd.columns).toBe(1);
    expect(belowMd.appliedClasses).toContain("grid-cols-1");

    // At md: 2 columns (tablet)
    expect(atMd.columns).toBe(2);
    expect(atMd.appliedClasses).toContain("md:grid-cols-2");
  });

  it("boundary transition at lg breakpoint (1024px): tablet → desktop", () => {
    const belowLg = resolveFeaturesGridLayout(BREAKPOINTS.lg - 1);
    const atLg = resolveFeaturesGridLayout(BREAKPOINTS.lg);

    // Below lg: 2 columns (tablet)
    expect(belowLg.columns).toBe(2);
    expect(belowLg.appliedClasses).toContain("md:grid-cols-2");

    // At lg: 3 columns (desktop)
    expect(atLg.columns).toBe(3);
    expect(atLg.appliedClasses).toContain("lg:grid-cols-3");
  });

  it("correct Tailwind classes are applied per viewport range", () => {
    // Mobile range
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const layout = resolveFeaturesGridLayout(viewportWidth);
          expect(layout.appliedClasses).toContain("grid");
          expect(layout.appliedClasses).toContain("grid-cols-1");
          expect(layout.appliedClasses).toContain("gap-6");
          expect(layout.appliedClasses).not.toContain("md:grid-cols-2");
          expect(layout.appliedClasses).not.toContain("lg:grid-cols-3");
        }
      ),
      { numRuns: 100 }
    );

    // Tablet range
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (viewportWidth) => {
          const layout = resolveFeaturesGridLayout(viewportWidth);
          expect(layout.appliedClasses).toContain("grid");
          expect(layout.appliedClasses).toContain("md:grid-cols-2");
          expect(layout.appliedClasses).toContain("gap-6");
          expect(layout.appliedClasses).not.toContain("grid-cols-1");
          expect(layout.appliedClasses).not.toContain("lg:grid-cols-3");
        }
      ),
      { numRuns: 100 }
    );

    // Desktop range
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (viewportWidth) => {
          const layout = resolveFeaturesGridLayout(viewportWidth);
          expect(layout.appliedClasses).toContain("grid");
          expect(layout.appliedClasses).toContain("lg:grid-cols-3");
          expect(layout.appliedClasses).toContain("gap-6");
          expect(layout.appliedClasses).not.toContain("grid-cols-1");
          expect(layout.appliedClasses).not.toContain("md:grid-cols-2");
        }
      ),
      { numRuns: 100 }
    );
  });
});
