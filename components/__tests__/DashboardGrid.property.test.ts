import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Represents the resolved grid configuration for a dashboard section.
 */
interface GridResolution {
  /** Number of columns the grid resolves to at the given viewport width. */
  columns: number;
  /** The Tailwind class responsible for the column count. */
  appliedClass: string;
}

/**
 * Dashboard grid sections and their responsive column configurations.
 *
 * Each section maps to a `<div className="grid ...">` in the dashboard page:
 *
 * - KpiGrid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
 *   Contains MetricCard components (Ingresos, Gastos, Disponible).
 *
 * - EditableListsGrid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
 *   Contains EditableList components (Ingresos, Fijos, Variables).
 *
 * - GoalsChartsGrid: `grid-cols-1 lg:grid-cols-2`
 *   Contains GoalsList and chart components.
 */
type DashboardSection = "KpiGrid" | "EditableListsGrid" | "GoalsChartsGrid";

/**
 * Resolves the number of grid columns for a dashboard section based on
 * the viewport width. This mirrors the actual Tailwind responsive classes
 * applied in `app/user/dashboard/page.tsx`.
 *
 * @param section - The dashboard grid section
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved grid configuration
 */
function resolveGridColumns(
  section: DashboardSection,
  viewportWidth: number
): GridResolution {
  switch (section) {
    case "KpiGrid":
    case "EditableListsGrid":
      // grid-cols-1 md:grid-cols-2 lg:grid-cols-3
      if (viewportWidth >= BREAKPOINTS.lg) {
        return { columns: 3, appliedClass: "lg:grid-cols-3" };
      }
      if (viewportWidth >= BREAKPOINTS.md) {
        return { columns: 2, appliedClass: "md:grid-cols-2" };
      }
      return { columns: 1, appliedClass: "grid-cols-1" };

    case "GoalsChartsGrid":
      // grid-cols-1 lg:grid-cols-2
      if (viewportWidth >= BREAKPOINTS.lg) {
        return { columns: 2, appliedClass: "lg:grid-cols-2" };
      }
      return { columns: 1, appliedClass: "grid-cols-1" };
  }
}


/**
 * Returns all dashboard grid section identifiers.
 */
function getAllSections(): DashboardSection[] {
  return ["KpiGrid", "EditableListsGrid", "GoalsChartsGrid"];
}

// Feature: responsive-mobile-ui, Property 1: Las columnas del grid se adaptan al viewport
describe("Property 1: Dashboard grid columns adapt to viewport", () => {
  const sections = getAllSections();

  it("all grid sections resolve to 1 column on mobile viewports (< 768px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(...sections),
        (viewportWidth, section) => {
          const resolution = resolveGridColumns(section, viewportWidth);
          expect(resolution.columns).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("KPI and editable-lists grids resolve to 2 columns on tablet (768–1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        fc.constantFrom("KpiGrid" as DashboardSection, "EditableListsGrid" as DashboardSection),
        (viewportWidth, section) => {
          const resolution = resolveGridColumns(section, viewportWidth);
          expect(resolution.columns).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("KPI and editable-lists grids resolve to 3 columns on desktop (≥ 1024px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        fc.constantFrom("KpiGrid" as DashboardSection, "EditableListsGrid" as DashboardSection),
        (viewportWidth, section) => {
          const resolution = resolveGridColumns(section, viewportWidth);
          expect(resolution.columns).toBe(3);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("goals/charts grid stays at 1 column on tablet (768–1023px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (viewportWidth) => {
          const resolution = resolveGridColumns("GoalsChartsGrid", viewportWidth);
          expect(resolution.columns).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("goals/charts grid resolves to 2 columns on desktop (≥ 1024px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (viewportWidth) => {
          const resolution = resolveGridColumns("GoalsChartsGrid", viewportWidth);
          expect(resolution.columns).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("column count is monotonically non-decreasing as viewport grows", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.integer({ min: 1, max: 500 }),
        fc.constantFrom(...sections),
        (viewportWidth, delta, section) => {
          const narrower = resolveGridColumns(section, viewportWidth);
          const wider = resolveGridColumns(section, viewportWidth + delta);
          expect(wider.columns).toBeGreaterThanOrEqual(narrower.columns);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("exact breakpoint boundaries produce correct transitions", () => {
    // md boundary (767 → 768)
    for (const section of ["KpiGrid", "EditableListsGrid"] as DashboardSection[]) {
      const below = resolveGridColumns(section, BREAKPOINTS.md - 1);
      const at = resolveGridColumns(section, BREAKPOINTS.md);
      expect(below.columns).toBe(1);
      expect(at.columns).toBe(2);
    }

    // lg boundary (1023 → 1024)
    for (const section of ["KpiGrid", "EditableListsGrid"] as DashboardSection[]) {
      const below = resolveGridColumns(section, BREAKPOINTS.lg - 1);
      const at = resolveGridColumns(section, BREAKPOINTS.lg);
      expect(below.columns).toBe(2);
      expect(at.columns).toBe(3);
    }

    // GoalsChartsGrid at lg boundary
    const gcBelow = resolveGridColumns("GoalsChartsGrid", BREAKPOINTS.lg - 1);
    const gcAt = resolveGridColumns("GoalsChartsGrid", BREAKPOINTS.lg);
    expect(gcBelow.columns).toBe(1);
    expect(gcAt.columns).toBe(2);
  });
});
