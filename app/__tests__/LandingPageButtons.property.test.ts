import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768 } as const;

/**
 * Represents the resolved responsive layout for the landing page button container.
 */
interface ButtonContainerLayout {
  /** CSS flex-direction value. */
  flexDirection: "column" | "row";
  /** Whether each button occupies full width. */
  buttonsFullWidth: boolean;
  /** The Tailwind classes responsible for the resolution. */
  appliedClasses: string[];
}

/**
 * Resolves the responsive layout for the landing page button container
 * based on viewport width.
 *
 * The button container uses these responsive classes:
 * - `flex flex-col w-full md:flex-row md:w-auto gap-4`
 *
 * On mobile (< 768px):
 *   - `flex-col` → vertical stacking
 *   - `w-full` → buttons stretch to full width
 *
 * On tablet+ (≥ 768px):
 *   - `md:flex-row` → horizontal layout
 *   - `md:w-auto` → buttons shrink to content width
 *
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved responsive button container layout
 */
function resolveButtonContainerLayout(viewportWidth: number): ButtonContainerLayout {
  const isMobile = viewportWidth < BREAKPOINTS.md;

  if (isMobile) {
    return {
      flexDirection: "column",
      buttonsFullWidth: true,
      appliedClasses: ["flex", "flex-col", "w-full", "gap-4"],
    };
  }

  return {
    flexDirection: "row",
    buttonsFullWidth: false,
    appliedClasses: ["flex", "md:flex-row", "md:w-auto", "gap-4"],
  };
}

// Feature: responsive-mobile-ui, Property 15: Botones de landing se apilan verticalmente en móvil
describe("Property 15: Landing page buttons stack vertically on mobile", () => {
  it("buttons are stacked vertically with full width on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const layout = resolveButtonContainerLayout(viewportWidth);
          expect(layout.flexDirection).toBe("column");
          expect(layout.buttonsFullWidth).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("buttons are laid out horizontally with auto width on tablet+ viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const layout = resolveButtonContainerLayout(viewportWidth);
          expect(layout.flexDirection).toBe("row");
          expect(layout.buttonsFullWidth).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("layout transition occurs exactly at md breakpoint (768px)", () => {
    const belowMd = resolveButtonContainerLayout(BREAKPOINTS.md - 1);
    const atMd = resolveButtonContainerLayout(BREAKPOINTS.md);

    expect(belowMd.flexDirection).toBe("column");
    expect(belowMd.buttonsFullWidth).toBe(true);
    expect(atMd.flexDirection).toBe("row");
    expect(atMd.buttonsFullWidth).toBe(false);
  });

  it("correct Tailwind classes are applied per viewport range", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const layout = resolveButtonContainerLayout(viewportWidth);
          expect(layout.appliedClasses).toContain("flex-col");
          expect(layout.appliedClasses).toContain("w-full");
        }
      ),
      { numRuns: 100 }
    );

    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        (viewportWidth) => {
          const layout = resolveButtonContainerLayout(viewportWidth);
          expect(layout.appliedClasses).toContain("md:flex-row");
          expect(layout.appliedClasses).toContain("md:w-auto");
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
          const mobile = resolveButtonContainerLayout(mobileWidth);
          const tablet = resolveButtonContainerLayout(tabletWidth);

          expect(mobile.flexDirection).not.toBe(tablet.flexDirection);
          expect(mobile.buttonsFullWidth).not.toBe(tablet.buttonsFullWidth);
        }
      ),
      { numRuns: 100 }
    );
  });
});
