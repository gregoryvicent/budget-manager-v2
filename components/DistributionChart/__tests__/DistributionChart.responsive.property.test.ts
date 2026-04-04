import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Resolves the chart container height based on viewport width.
 * Mirrors the useMediaQuery logic in DistributionChart:
 *   const isMobile = useMediaQuery("(max-width: 767px)");
 *   const chartHeight = isMobile ? 220 : 280;
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The chart height in pixels
 */
function resolveChartHeight(viewportWidth: number): number {
  return viewportWidth <= 767 ? 220 : 280;
}

/**
 * Resolves the pie chart outer radius based on viewport width.
 * Mirrors: const outerRadius = isMobile ? 70 : 90;
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The outer radius in pixels
 */
function resolveOuterRadius(viewportWidth: number): number {
  return viewportWidth <= 767 ? 70 : 90;
}

/**
 * Resolves the pie chart margins based on viewport width.
 * Mirrors the margin object in DistributionChart:
 *   isMobile ? { top: 20, right: 50, bottom: 20, left: 50 }
 *            : { top: 32, right: 80, bottom: 32, left: 80 }
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The chart margin object
 */
function resolveChartMargin(viewportWidth: number) {
  return viewportWidth <= 767
    ? { top: 20, right: 50, bottom: 20, left: 50 }
    : { top: 32, right: 80, bottom: 32, left: 80 };
}

// Feature: responsive-mobile-ui, Property 9: DistributionChart reduce altura en móvil
describe("Property 9: DistributionChart reduces height on mobile", () => {
  it("chart height is 220px on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        (viewportWidth) => {
          expect(resolveChartHeight(viewportWidth)).toBe(220);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("chart height is 280px on tablet and desktop viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 3840 }),
        (viewportWidth) => {
          expect(resolveChartHeight(viewportWidth)).toBe(280);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile chart height is strictly less than desktop chart height", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        fc.integer({ min: 768, max: 3840 }),
        (mobileWidth, desktopWidth) => {
          expect(resolveChartHeight(mobileWidth)).toBeLessThan(
            resolveChartHeight(desktopWidth)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("chart height transitions from 220 to 280 exactly at 768px", () => {
    expect(resolveChartHeight(767)).toBe(220);
    expect(resolveChartHeight(768)).toBe(280);
  });

  it("outer radius is 70px on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        (viewportWidth) => {
          expect(resolveOuterRadius(viewportWidth)).toBe(70);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("outer radius is 90px on tablet and desktop viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 768, max: 3840 }),
        (viewportWidth) => {
          expect(resolveOuterRadius(viewportWidth)).toBe(90);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile margins are smaller than desktop margins", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }),
        fc.integer({ min: 768, max: 3840 }),
        (mobileWidth, desktopWidth) => {
          const mobileMargin = resolveChartMargin(mobileWidth);
          const desktopMargin = resolveChartMargin(desktopWidth);

          expect(mobileMargin.top).toBeLessThan(desktopMargin.top);
          expect(mobileMargin.right).toBeLessThan(desktopMargin.right);
          expect(mobileMargin.bottom).toBeLessThan(desktopMargin.bottom);
          expect(mobileMargin.left).toBeLessThan(desktopMargin.left);
        }
      ),
      { numRuns: 100 }
    );
  });
});
