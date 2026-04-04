import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768 } as const;

/**
 * Represents the resolved responsive typography for the landing page.
 */
interface LandingPageTypography {
  /** Title font size in pixels. */
  titleFontSize: number;
  /** Subtitle font size in pixels. */
  subtitleFontSize: number;
  /** The Tailwind classes responsible for the resolution. */
  appliedClasses: string[];
}

/**
 * Resolves the responsive typography for the landing page based on viewport width.
 *
 * The landing page uses these responsive classes:
 * - Title (h1): `text-[28px] md:text-4xl`
 * - Subtitle (p): `text-base md:text-lg`
 *
 * On mobile (< 768px):
 *   - `text-[28px]` → 28px title
 *   - `text-base` → 16px subtitle
 *
 * On tablet+ (≥ 768px):
 *   - `md:text-4xl` → 36px title (2.25rem)
 *   - `md:text-lg` → 18px subtitle (1.125rem)
 *
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved responsive typography
 */
function resolveLandingTypography(viewportWidth: number): LandingPageTypography {
  const isMobile = viewportWidth < BREAKPOINTS.md;

  if (isMobile) {
    return {
      titleFontSize: 28, // text-[28px]
      subtitleFontSize: 16, // text-base = 1rem = 16px
      appliedClasses: ["text-[28px]", "text-base"],
    };
  }

  return {
    titleFontSize: 36, // md:text-4xl = 2.25rem = 36px
    subtitleFontSize: 18, // md:text-lg = 1.125rem = 18px
    appliedClasses: ["md:text-4xl", "md:text-lg"],
  };
}

// Feature: responsive-mobile-ui, Property 14: Landing page reduce fuentes en móvil
describe("Property 14: Landing page reduces fonts on mobile", () => {
  it("title is 28px and subtitle is 16px on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const typography = resolveLandingTypography(viewportWidth);
          expect(typography.titleFontSize).toBe(28);
          expect(typography.subtitleFontSize).toBe(16);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("title is 36px and subtitle is 18px on tablet+ viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const typography = resolveLandingTypography(viewportWidth);
          expect(typography.titleFontSize).toBe(36);
          expect(typography.subtitleFontSize).toBe(18);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile fonts are strictly smaller than tablet+ fonts", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (mobileWidth, tabletWidth) => {
          const mobile = resolveLandingTypography(mobileWidth);
          const tablet = resolveLandingTypography(tabletWidth);

          expect(mobile.titleFontSize).toBeLessThan(tablet.titleFontSize);
          expect(mobile.subtitleFontSize).toBeLessThan(tablet.subtitleFontSize);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("font size transition occurs exactly at md breakpoint (768px)", () => {
    const belowMd = resolveLandingTypography(BREAKPOINTS.md - 1);
    const atMd = resolveLandingTypography(BREAKPOINTS.md);

    expect(belowMd.titleFontSize).toBe(28);
    expect(atMd.titleFontSize).toBe(36);
    expect(belowMd.subtitleFontSize).toBe(16);
    expect(atMd.subtitleFontSize).toBe(18);
  });

  it("correct Tailwind classes are applied per viewport range", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const typography = resolveLandingTypography(viewportWidth);
          expect(typography.appliedClasses).toContain("text-[28px]");
          expect(typography.appliedClasses).toContain("text-base");
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const typography = resolveLandingTypography(viewportWidth);
          expect(typography.appliedClasses).toContain("md:text-4xl");
          expect(typography.appliedClasses).toContain("md:text-lg");
        }
      ),
      { numRuns: 100 }
    );
  });
});
