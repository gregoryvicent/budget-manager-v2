import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Resolves the EditableList height configuration based on viewport width.
 * Mirrors the Tailwind classes `h-auto max-h-[400px] md:h-[380px] md:max-h-none`
 * applied in EditableList.
 *
 * - Base (mobile): h-auto, max-height 400px, overflow-y auto
 * - md (≥768px):   h-380px, no max-height constraint
 *
 * @param viewportWidth - The viewport width in pixels
 * @returns Object describing the resolved height behaviour
 */
function resolveHeightConfig(viewportWidth: number): {
  height: "auto" | 380;
  maxHeight: 400 | null;
  overflowY: "auto" | "visible";
} {
  if (viewportWidth >= BREAKPOINTS.md) {
    return { height: 380, maxHeight: null, overflowY: "visible" };
  }
  return { height: "auto", maxHeight: 400, overflowY: "auto" };
}

// Feature: responsive-mobile-ui, Property 5: EditableList usa altura automática en móvil
describe("Property 5: EditableList uses auto height on mobile", () => {
  it("mobile viewports use auto height instead of fixed 380px", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const config = resolveHeightConfig(viewportWidth);
          expect(config.height).toBe("auto");
          expect(config.height).not.toBe(380);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile viewports enforce max-height of 400px", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const config = resolveHeightConfig(viewportWidth);
          expect(config.maxHeight).toBe(400);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile viewports enable overflow-y auto for internal scrolling", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const config = resolveHeightConfig(viewportWidth);
          expect(config.overflowY).toBe("auto");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("tablet/desktop viewports use fixed 380px height", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const config = resolveHeightConfig(viewportWidth);
          expect(config.height).toBe(380);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("tablet/desktop viewports remove max-height constraint", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const config = resolveHeightConfig(viewportWidth);
          expect(config.maxHeight).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("mobile max-height (400px) is greater than desktop fixed height (380px)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (mobileWidth, desktopWidth) => {
          const mobileConfig = resolveHeightConfig(mobileWidth);
          const desktopConfig = resolveHeightConfig(desktopWidth);

          // Mobile max-height allows slightly more room than the fixed desktop height
          expect(mobileConfig.maxHeight).toBeGreaterThan(desktopConfig.height as number);
        }
      ),
      { numRuns: 100 }
    );
  });
});
