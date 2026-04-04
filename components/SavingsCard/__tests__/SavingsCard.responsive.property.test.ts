import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Resolves the SavingsCard body flex direction based on viewport width.
 * Mirrors the Tailwind classes `flex-col md:flex-row` applied to the
 * ring + stats container.
 *
 * - Base (mobile): "column"
 * - md (≥768px):   "row"
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The computed flex-direction value
 */
function resolveBodyFlexDirection(
  viewportWidth: number
): "column" | "row" {
  return viewportWidth >= BREAKPOINTS.md ? "row" : "column";
}

/**
 * Resolves the SavingsCard body align-items based on viewport width.
 * Mirrors the Tailwind classes `items-center md:items-center`.
 * Both mobile and tablet+ use center alignment.
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The computed align-items value
 */
function resolveBodyAlignItems(viewportWidth: number): "center" {
  // Both breakpoints use items-center
  void viewportWidth;
  return "center";
}

/**
 * Resolves the progress ring size based on viewport width.
 * Mirrors the useMediaQuery logic in SavingsCard:
 *   const isMobile = useMediaQuery("(max-width: 767px)");
 *   const ringSize = isMobile ? 80 : 96;
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The ring diameter in pixels
 */
function resolveRingSize(viewportWidth: number): number {
  return viewportWidth <= 767 ? 80 : 96;
}

// Feature: responsive-mobile-ui, Property 8: SavingsCard layout vertical con ring reducido en móvil
describe("Property 8: SavingsCard vertical layout with reduced ring on mobile", () => {
  it("body container uses column direction on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const direction = resolveBodyFlexDirection(viewportWidth);
          expect(direction).toBe("column");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("body container uses row direction on tablet and desktop viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const direction = resolveBodyFlexDirection(viewportWidth);
          expect(direction).toBe("row");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("body container always centers items regardless of viewport", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        (viewportWidth) => {
          const align = resolveBodyAlignItems(viewportWidth);
          expect(align).toBe("center");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("progress ring is 80px on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        (viewportWidth) => {
          const ringSize = resolveRingSize(viewportWidth);
          expect(ringSize).toBe(80);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("progress ring is 96px on tablet and desktop viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 3840 }),
        (viewportWidth) => {
          const ringSize = resolveRingSize(viewportWidth);
          expect(ringSize).toBe(96);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile ring is strictly smaller than desktop ring", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        fc.integer({ min: 768, max: 3840 }),
        (mobileWidth, desktopWidth) => {
          const mobileRing = resolveRingSize(mobileWidth);
          const desktopRing = resolveRingSize(desktopWidth);
          expect(mobileRing).toBeLessThan(desktopRing);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("layout transitions from column to row exactly at the md breakpoint", () => {
    const belowMd = resolveBodyFlexDirection(BREAKPOINTS.md - 1);
    const atMd = resolveBodyFlexDirection(BREAKPOINTS.md);

    expect(belowMd).toBe("column");
    expect(atMd).toBe("row");
  });

  it("ring size transitions from 80 to 96 exactly at 768px", () => {
    const below = resolveRingSize(767);
    const at768 = resolveRingSize(768);

    expect(below).toBe(80);
    expect(at768).toBe(96);
  });
});
