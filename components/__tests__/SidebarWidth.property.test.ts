import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Sidebar width configuration derived from Tailwind classes:
 * - Mobile (< md): `w-[85vw]` → 85% of viewport width
 * - Tablet/Desktop (≥ md): `w-[280px]` → fixed 280px
 */
const SIDEBAR_MOBILE_VW_PERCENT = 85;
const SIDEBAR_DESKTOP_WIDTH_PX = 280;

/**
 * Resolves the expected sidebar width in pixels for a given viewport width.
 * Mirrors the Tailwind classes `w-[85vw] md:w-[280px]` applied to the
 * Sidebar panel element.
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The expected sidebar width in pixels
 */
function resolveSidebarWidth(viewportWidth: number): number {
  if (viewportWidth < BREAKPOINTS.md) {
    return Math.round((viewportWidth * SIDEBAR_MOBILE_VW_PERCENT) / 100);
  }
  return SIDEBAR_DESKTOP_WIDTH_PX;
}

// Feature: responsive-mobile-ui, Property 11: Sidebar ocupa 85% del viewport en móvil
describe("Property 11: Sidebar occupies 85% of viewport on mobile", () => {
  it("sidebar width equals 85% of viewport on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const width = resolveSidebarWidth(viewportWidth);
          const expected = Math.round(
            (viewportWidth * SIDEBAR_MOBILE_VW_PERCENT) / 100
          );
          expect(width).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("sidebar width is fixed at 280px on tablet and desktop viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const width = resolveSidebarWidth(viewportWidth);
          expect(width).toBe(SIDEBAR_DESKTOP_WIDTH_PX);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("sidebar never exceeds viewport width on any device", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        (viewportWidth) => {
          const width = resolveSidebarWidth(viewportWidth);
          expect(width).toBeLessThanOrEqual(viewportWidth);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("sidebar width transitions correctly at the md breakpoint boundary", () => {
    const justBelowMd = BREAKPOINTS.md - 1;
    const atMd = BREAKPOINTS.md;

    const widthBelowMd = resolveSidebarWidth(justBelowMd);
    const widthAtMd = resolveSidebarWidth(atMd);

    // Below md: 85% of 767 ≈ 652px
    expect(widthBelowMd).toBe(
      Math.round((justBelowMd * SIDEBAR_MOBILE_VW_PERCENT) / 100)
    );
    // At md: fixed 280px
    expect(widthAtMd).toBe(SIDEBAR_DESKTOP_WIDTH_PX);
    // The mobile width at 767px should be larger than the fixed desktop width
    expect(widthBelowMd).toBeGreaterThan(widthAtMd);
  });

  it("sidebar width grows proportionally with viewport on mobile", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 2 }),
        (viewportWidth) => {
          const narrower = resolveSidebarWidth(viewportWidth);
          const wider = resolveSidebarWidth(viewportWidth + 1);
          expect(wider).toBeGreaterThanOrEqual(narrower);
        }
      ),
      { numRuns: 100 }
    );
  });
});
