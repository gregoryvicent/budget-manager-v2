import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Tailwind CSS 4 font size values in pixels.
 */
const FONT_SIZES = {
  "text-base": 16, // 1rem
  "text-lg": 18, // 1.125rem
  "text-xl": 20, // 1.25rem
  "text-3xl": 30, // 1.875rem
  "text-5xl": 48, // 3rem
  "text-6xl": 60, // 3.75rem
} as const;

/**
 * Represents the resolved responsive typography for the Hero section.
 */
interface HeroTypography {
  /** h1 font size in pixels. */
  h1FontSize: number;
  /** p font size in pixels. */
  pFontSize: number;
  /** The Tailwind classes responsible for the resolution. */
  appliedClasses: { h1: string; p: string };
}

/**
 * Resolves the responsive typography for the Hero section based on viewport width.
 *
 * The Hero section in app/page.tsx uses these responsive classes:
 * - h1: `text-3xl md:text-5xl lg:text-6xl`
 * - p:  `text-base md:text-lg lg:text-xl`
 *
 * On mobile (< 768px):
 *   - `text-3xl` → 30px h1
 *   - `text-base` → 16px p
 *
 * On tablet (768px – 1023px):
 *   - `md:text-5xl` → 48px h1
 *   - `md:text-lg` → 18px p
 *
 * On desktop (≥ 1024px):
 *   - `lg:text-6xl` → 60px h1
 *   - `lg:text-xl` → 20px p
 *
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved responsive Hero typography
 */
function resolveHeroTypography(viewportWidth: number): HeroTypography {
  if (viewportWidth >= BREAKPOINTS.lg) {
    return {
      h1FontSize: FONT_SIZES["text-6xl"], // 60px
      pFontSize: FONT_SIZES["text-xl"], // 20px
      appliedClasses: { h1: "lg:text-6xl", p: "lg:text-xl" },
    };
  }

  if (viewportWidth >= BREAKPOINTS.md) {
    return {
      h1FontSize: FONT_SIZES["text-5xl"], // 48px
      pFontSize: FONT_SIZES["text-lg"], // 18px
      appliedClasses: { h1: "md:text-5xl", p: "md:text-lg" },
    };
  }

  return {
    h1FontSize: FONT_SIZES["text-3xl"], // 30px
    pFontSize: FONT_SIZES["text-base"], // 16px
    appliedClasses: { h1: "text-3xl", p: "text-base" },
  };
}

// Feature: landing-page, Property 3: La tipografía del Hero escala con el viewport
describe("Property 3: Hero typography scales with the viewport", () => {
  /**
   * **Validates: Requirements 3.4**
   *
   * Requirement 3.4: THE Hero_Section SHALL use font sizes that are readable
   * on mobile screens (minimum 16px for body text) and scale up at md: and lg:
   * breakpoints for larger viewports.
   */

  it("mobile viewports (< 768px) resolve to text-3xl h1 (30px) and text-base p (16px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const typography = resolveHeroTypography(viewportWidth);
          expect(typography.h1FontSize).toBe(30);
          expect(typography.pFontSize).toBe(16);
          expect(typography.appliedClasses.h1).toBe("text-3xl");
          expect(typography.appliedClasses.p).toBe("text-base");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("tablet viewports (768px–1023px) resolve to text-5xl h1 (48px) and text-lg p (18px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        (viewportWidth) => {
          const typography = resolveHeroTypography(viewportWidth);
          expect(typography.h1FontSize).toBe(48);
          expect(typography.pFontSize).toBe(18);
          expect(typography.appliedClasses.h1).toBe("md:text-5xl");
          expect(typography.appliedClasses.p).toBe("md:text-lg");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("desktop viewports (>= 1024px) resolve to text-6xl h1 (60px) and text-xl p (20px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (viewportWidth) => {
          const typography = resolveHeroTypography(viewportWidth);
          expect(typography.h1FontSize).toBe(60);
          expect(typography.pFontSize).toBe(20);
          expect(typography.appliedClasses.h1).toBe("lg:text-6xl");
          expect(typography.appliedClasses.p).toBe("lg:text-xl");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("font sizes increase monotonically across breakpoints (mobile < tablet < desktop)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.integer({ min: BREAKPOINTS.md, max: BREAKPOINTS.lg - 1 }),
        fc.integer({ min: BREAKPOINTS.lg, max: 3840 }),
        (mobileWidth, tabletWidth, desktopWidth) => {
          const mobile = resolveHeroTypography(mobileWidth);
          const tablet = resolveHeroTypography(tabletWidth);
          const desktop = resolveHeroTypography(desktopWidth);

          // h1 increases monotonically: 30 < 48 < 60
          expect(mobile.h1FontSize).toBeLessThan(tablet.h1FontSize);
          expect(tablet.h1FontSize).toBeLessThan(desktop.h1FontSize);

          // p increases monotonically: 16 < 18 < 20
          expect(mobile.pFontSize).toBeLessThan(tablet.pFontSize);
          expect(tablet.pFontSize).toBeLessThan(desktop.pFontSize);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("boundary transition at md breakpoint (768px): mobile → tablet", () => {
    const belowMd = resolveHeroTypography(BREAKPOINTS.md - 1);
    const atMd = resolveHeroTypography(BREAKPOINTS.md);

    // Below md: mobile sizes
    expect(belowMd.h1FontSize).toBe(30);
    expect(belowMd.pFontSize).toBe(16);

    // At md: tablet sizes
    expect(atMd.h1FontSize).toBe(48);
    expect(atMd.pFontSize).toBe(18);
  });

  it("boundary transition at lg breakpoint (1024px): tablet → desktop", () => {
    const belowLg = resolveHeroTypography(BREAKPOINTS.lg - 1);
    const atLg = resolveHeroTypography(BREAKPOINTS.lg);

    // Below lg: tablet sizes
    expect(belowLg.h1FontSize).toBe(48);
    expect(belowLg.pFontSize).toBe(18);

    // At lg: desktop sizes
    expect(atLg.h1FontSize).toBe(60);
    expect(atLg.pFontSize).toBe(20);
  });
});
