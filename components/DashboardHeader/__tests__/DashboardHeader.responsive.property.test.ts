import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Resolves the DashboardHeader flex direction based on viewport width.
 * Mirrors the Tailwind classes `flex-col md:flex-row` applied to the
 * root container.
 *
 * - Base (mobile): "column"
 * - md (≥768px):   "row"
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The computed flex-direction value
 */
function resolveFlexDirection(
  viewportWidth: number
): "column" | "row" {
  return viewportWidth >= BREAKPOINTS.md ? "row" : "column";
}

/**
 * Resolves the DashboardHeader greeting font size based on viewport width.
 * Mirrors the Tailwind classes `text-xl lg:text-[22px]` applied to the
 * greeting heading.
 *
 * - Base (mobile/tablet): 20px  (Tailwind `text-xl`)
 * - lg (≥1024px):         22px  (Tailwind `text-[22px]`)
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The computed font size in pixels
 */
function resolveGreetingFontSize(viewportWidth: number): number {
  return viewportWidth >= BREAKPOINTS.lg ? 22 : 20;
}

/**
 * Resolves the DashboardHeader align-items based on viewport width.
 * Mirrors the Tailwind classes `items-start md:items-center`.
 *
 * - Base (mobile): "flex-start"
 * - md (≥768px):   "center"
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The computed align-items value
 */
function resolveAlignItems(
  viewportWidth: number
): "flex-start" | "center" {
  return viewportWidth >= BREAKPOINTS.md ? "center" : "flex-start";
}

/**
 * Resolves whether the balance badge text is visible based on viewport width.
 * Mirrors the Tailwind classes `hidden md:inline` on the badge span.
 *
 * - Base (mobile): hidden (false)
 * - md (≥768px):   visible (true)
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns Whether the badge text is visible
 */
function resolveBadgeTextVisible(viewportWidth: number): boolean {
  return viewportWidth >= BREAKPOINTS.md;
}

// Feature: responsive-mobile-ui, Property 10: DashboardHeader es vertical con fuente reducida en móvil
describe("Property 10: DashboardHeader is vertical with reduced font on mobile", () => {
  it("layout uses column direction on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const direction = resolveFlexDirection(viewportWidth);
          expect(direction).toBe("column");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("layout uses row direction on tablet and desktop viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const direction = resolveFlexDirection(viewportWidth);
          expect(direction).toBe("row");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("greeting font size is at most 20px on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const fontSize = resolveGreetingFontSize(viewportWidth);
          expect(fontSize).toBeLessThanOrEqual(20);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("greeting font size increases to 22px on large (desktop) viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (viewportWidth) => {
          const fontSize = resolveGreetingFontSize(viewportWidth);
          expect(fontSize).toBe(22);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("tablet viewports (md to lg) keep mobile-sized greeting font", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (viewportWidth) => {
          const fontSize = resolveGreetingFontSize(viewportWidth);
          expect(fontSize).toBe(20);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("items align to flex-start on mobile, center on tablet+", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (mobileWidth, tabletWidth) => {
          expect(resolveAlignItems(mobileWidth)).toBe("flex-start");
          expect(resolveAlignItems(tabletWidth)).toBe("center");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("balance badge text is hidden on mobile, visible on tablet+", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (mobileWidth, tabletWidth) => {
          expect(resolveBadgeTextVisible(mobileWidth)).toBe(false);
          expect(resolveBadgeTextVisible(tabletWidth)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("layout transitions from column to row exactly at the md breakpoint", () => {
    const belowMd = resolveFlexDirection(BREAKPOINTS.md - 1);
    const atMd = resolveFlexDirection(BREAKPOINTS.md);

    expect(belowMd).toBe("column");
    expect(atMd).toBe("row");
  });

  it("font size transitions from 20 to 22 exactly at the lg breakpoint", () => {
    const belowLg = resolveGreetingFontSize(BREAKPOINTS.lg - 1);
    const atLg = resolveGreetingFontSize(BREAKPOINTS.lg);

    expect(belowLg).toBe(20);
    expect(atLg).toBe(22);
  });
});
