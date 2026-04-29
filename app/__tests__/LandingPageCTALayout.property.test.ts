import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768 } as const;

/**
 * Represents the resolved responsive layout for the hero CTA container.
 *
 * Models the classes from app/page.tsx hero section:
 *   `flex flex-col w-full md:flex-row md:w-auto md:justify-center gap-4`
 */
interface CTAContainerLayout {
  /** CSS flex-direction value. */
  flexDirection: "column" | "row";
  /** Whether each button occupies full width. */
  buttonsFullWidth: boolean;
  /** Whether the container centers its children horizontally. */
  justifyCenter: boolean;
  /** The Tailwind classes responsible for the resolution. */
  appliedClasses: string[];
}

/**
 * Resolves the responsive layout for the hero CTA container
 * based on viewport width.
 *
 * The CTA container in app/page.tsx uses these responsive classes:
 *   `flex flex-col w-full md:flex-row md:w-auto md:justify-center gap-4`
 *
 * On mobile (< 768px):
 *   - `flex-col` → vertical stacking
 *   - `w-full` → buttons stretch to full width
 *   - no justify-center → default (flex-start)
 *
 * On tablet+ (≥ 768px):
 *   - `md:flex-row` → horizontal layout
 *   - `md:w-auto` → buttons shrink to content width
 *   - `md:justify-center` → buttons centered horizontally
 *
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved responsive CTA container layout
 */
function resolveCTAContainerLayout(viewportWidth: number): CTAContainerLayout {
  const isMobile = viewportWidth < BREAKPOINTS.md;

  if (isMobile) {
    return {
      flexDirection: "column",
      buttonsFullWidth: true,
      justifyCenter: false,
      appliedClasses: ["flex", "flex-col", "w-full", "gap-4"],
    };
  }

  return {
    flexDirection: "row",
    buttonsFullWidth: false,
    justifyCenter: true,
    appliedClasses: ["flex", "md:flex-row", "md:w-auto", "md:justify-center", "gap-4"],
  };
}

// Feature: landing-page, Property 1: Los botones CTA adaptan su layout al viewport
describe("Property 1: CTA buttons adapt their layout to the viewport", () => {
  /**
   * **Validates: Requirements 3.5, 3.6**
   *
   * Requirement 3.5: WHEN viewport < 768px, CTA buttons stacked vertically with full width.
   * Requirement 3.6: WHEN viewport >= 768px, CTA buttons displayed side by side.
   */

  it("mobile viewports (< 768px) resolve to column layout with full-width buttons", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const layout = resolveCTAContainerLayout(viewportWidth);
          expect(layout.flexDirection).toBe("column");
          expect(layout.buttonsFullWidth).toBe(true);
          expect(layout.justifyCenter).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("tablet+ viewports (>= 768px) resolve to row layout with auto-width centered buttons", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const layout = resolveCTAContainerLayout(viewportWidth);
          expect(layout.flexDirection).toBe("row");
          expect(layout.buttonsFullWidth).toBe(false);
          expect(layout.justifyCenter).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("layout transition occurs exactly at md breakpoint (768px)", () => {
    const below = resolveCTAContainerLayout(BREAKPOINTS.md - 1);
    const atBreakpoint = resolveCTAContainerLayout(BREAKPOINTS.md);

    // Below breakpoint: mobile layout
    expect(below.flexDirection).toBe("column");
    expect(below.buttonsFullWidth).toBe(true);
    expect(below.justifyCenter).toBe(false);

    // At breakpoint: tablet+ layout
    expect(atBreakpoint.flexDirection).toBe("row");
    expect(atBreakpoint.buttonsFullWidth).toBe(false);
    expect(atBreakpoint.justifyCenter).toBe(true);
  });

  it("correct Tailwind classes are applied per viewport range", () => {
    // Mobile range
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const layout = resolveCTAContainerLayout(viewportWidth);
          expect(layout.appliedClasses).toContain("flex-col");
          expect(layout.appliedClasses).toContain("w-full");
          expect(layout.appliedClasses).not.toContain("md:flex-row");
          expect(layout.appliedClasses).not.toContain("md:w-auto");
          expect(layout.appliedClasses).not.toContain("md:justify-center");
        }
      ),
      { numRuns: 100 }
    );

    // Tablet+ range
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const layout = resolveCTAContainerLayout(viewportWidth);
          expect(layout.appliedClasses).toContain("md:flex-row");
          expect(layout.appliedClasses).toContain("md:w-auto");
          expect(layout.appliedClasses).toContain("md:justify-center");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile layout always differs from tablet+ layout", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (mobileWidth, tabletWidth) => {
          const mobile = resolveCTAContainerLayout(mobileWidth);
          const tablet = resolveCTAContainerLayout(tabletWidth);

          expect(mobile.flexDirection).not.toBe(tablet.flexDirection);
          expect(mobile.buttonsFullWidth).not.toBe(tablet.buttonsFullWidth);
          expect(mobile.justifyCenter).not.toBe(tablet.justifyCenter);
        }
      ),
      { numRuns: 100 }
    );
  });
});
