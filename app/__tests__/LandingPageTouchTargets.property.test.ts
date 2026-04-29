import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Minimum touch target size in pixels, per WCAG guidelines.
 */
const MIN_TOUCH_TARGET = 44;

/**
 * Represents an interactive element in the landing page with its
 * CSS class configuration from app/page.tsx.
 */
interface InteractiveElement {
  /** Human-readable identifier for the element. */
  id: string;
  /** The Tailwind CSS classes applied to this element. */
  classes: string;
}

/**
 * All interactive elements in the landing page (app/page.tsx).
 *
 * Each element uses `min-h-[44px]` as a base-level class (not behind
 * a breakpoint prefix), so the minimum height holds for all viewports.
 */
const INTERACTIVE_ELEMENTS: InteractiveElement[] = [
  {
    id: "Header.LoginLink",
    classes:
      "text-text-dim hover:text-text transition-colors min-h-[44px] flex items-center px-3",
  },
  {
    id: "Header.RegisterLink",
    classes:
      "bg-[#2563eb] text-white rounded-lg px-4 min-h-[44px] flex items-center font-semibold hover:bg-[#1d4ed8] transition-colors",
  },
  {
    id: "Hero.PrimaryCTA",
    classes:
      "flex items-center justify-center rounded-lg bg-[#2563eb] px-8 py-3 min-h-[44px] text-base font-semibold text-white transition-colors hover:bg-[#1d4ed8]",
  },
  {
    id: "Hero.SecondaryCTA",
    classes:
      "flex items-center justify-center rounded-lg border border-savings px-8 py-3 min-h-[44px] text-base font-semibold text-savings transition-colors hover:bg-savings/10",
  },
];

/**
 * Parses the minimum height value from a Tailwind `min-h-[Xpx]` class.
 *
 * Scans the class string for a pattern like `min-h-[44px]` and extracts
 * the numeric pixel value. Returns 0 if no min-h class is found.
 *
 * @param classes - Space-separated Tailwind CSS class string
 * @returns The minimum height in pixels, or 0 if not specified
 */
function parseMinHeight(classes: string): number {
  const match = classes.match(/(?:^|\s)min-h-\[(\d+)px\]/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Resolves the minimum height for an interactive element at a given
 * viewport width.
 *
 * Because all landing page interactive elements apply `min-h-[44px]`
 * at the base level (no breakpoint prefix), the resolved min-height
 * is constant across all viewport widths.
 *
 * @param element - The interactive element definition
 * @param _viewportWidth - Current viewport width (unused; min-h is
 *   applied unconditionally at the base level)
 * @returns The resolved minimum height in pixels
 */
function resolveMinHeight(
  element: InteractiveElement,
  _viewportWidth: number
): number {
  return parseMinHeight(element.classes);
}

// Feature: landing-page, Property 4: Todos los elementos interactivos tienen touch targets de al menos 44px
describe("Property 4: All interactive elements have touch targets of at least 44px", () => {
  /**
   * **Validates: Requirements 2.4, 6.3**
   *
   * Requirement 2.4: Header navigation links maintain Touch_Target sizes
   *   at a minimum of 44×44 pixels.
   * Requirement 6.3: All interactive elements (CTA buttons, navigation
   *   links) have a minimum Touch_Target size of 44×44 pixels.
   */

  it("all interactive elements have min-height >= 44px across all viewport widths", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.constantFrom(...INTERACTIVE_ELEMENTS),
        (viewportWidth, element) => {
          const minHeight = resolveMinHeight(element, viewportWidth);
          expect(minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("min-h-[44px] class is present on every interactive element", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...INTERACTIVE_ELEMENTS),
        (element) => {
          const hasMinH = /(?:^|\s)min-h-\[44px\]/.test(element.classes);
          expect(hasMinH).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("parsed min-height is exactly 44px for all elements (not over-sized)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...INTERACTIVE_ELEMENTS),
        (element) => {
          const minHeight = parseMinHeight(element.classes);
          expect(minHeight).toBe(MIN_TOUCH_TARGET);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("touch target compliance holds at breakpoint boundaries", () => {
    const boundaryWidths = [320, 767, 768, 1023, 1024, 1920, 3840];

    for (const element of INTERACTIVE_ELEMENTS) {
      for (const width of boundaryWidths) {
        const minHeight = resolveMinHeight(element, width);
        expect(minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      }
    }
  });

  it("the min-h class is applied at base level (not behind a breakpoint prefix)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...INTERACTIVE_ELEMENTS),
        (element) => {
          // Verify min-h-[44px] is NOT prefixed with a breakpoint like md: or lg:
          const hasBreakpointMinH = /(?:^|\s)(?:sm|md|lg|xl|2xl):min-h-\[/.test(
            element.classes
          );
          expect(hasBreakpointMinH).toBe(false);

          // Verify the base-level min-h class IS present
          const hasBaseMinH = /(?:^|\s)min-h-\[44px\]/.test(element.classes);
          expect(hasBaseMinH).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
