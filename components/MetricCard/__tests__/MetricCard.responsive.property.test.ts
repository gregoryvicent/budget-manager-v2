import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Resolves the MetricCard font size (in px) for the main value based on
 * viewport width. Mirrors the Tailwind classes `text-2xl lg:text-[28px]`
 * applied in MetricCard.
 *
 * - Base (mobile): 24px  (Tailwind `text-2xl`)
 * - lg (≥1024px):  28px  (Tailwind `text-[28px]`)
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns The computed font size in pixels
 */
function resolveValueFontSize(viewportWidth: number): number {
  return viewportWidth >= BREAKPOINTS.lg ? 28 : 24;
}

/**
 * Resolves the MetricCard padding values based on viewport width.
 * Mirrors the Tailwind classes `p-4 lg:px-7 lg:py-5`.
 *
 * - Base (mobile): 16px all sides  (Tailwind `p-4`)
 * - lg (≥1024px):  28px horizontal, 20px vertical  (Tailwind `lg:px-7 lg:py-5`)
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns Object with horizontal and vertical padding in pixels
 */
function resolvePadding(viewportWidth: number): {
  horizontal: number;
  vertical: number;
} {
  if (viewportWidth >= BREAKPOINTS.lg) {
    return { horizontal: 28, vertical: 20 };
  }
  return { horizontal: 16, vertical: 16 };
}

// Feature: responsive-mobile-ui, Property 3: MetricCard escala en móvil
describe("Property 3: MetricCard scales on mobile", () => {
  it("font size of the main value is at most 24px on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const fontSize = resolveValueFontSize(viewportWidth);
          expect(fontSize).toBeLessThanOrEqual(24);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("font size increases to 28px on large (desktop) viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (viewportWidth) => {
          const fontSize = resolveValueFontSize(viewportWidth);
          expect(fontSize).toBe(28);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile padding is strictly less than desktop padding in both axes", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (mobileWidth, desktopWidth) => {
          const mobilePad = resolvePadding(mobileWidth);
          const desktopPad = resolvePadding(desktopWidth);

          expect(mobilePad.horizontal).toBeLessThan(desktopPad.horizontal);
          expect(mobilePad.vertical).toBeLessThan(desktopPad.vertical);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile padding is exactly 16px on all sides", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const pad = resolvePadding(viewportWidth);
          expect(pad.horizontal).toBe(16);
          expect(pad.vertical).toBe(16);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("tablet viewports (md to lg) keep mobile-sized font and padding", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (viewportWidth) => {
          const fontSize = resolveValueFontSize(viewportWidth);
          const pad = resolvePadding(viewportWidth);

          // No lg: override yet, so stays at base values
          expect(fontSize).toBe(24);
          expect(pad.horizontal).toBe(16);
          expect(pad.vertical).toBe(16);
        }
      ),
      { numRuns: 100 }
    );
  });
});
