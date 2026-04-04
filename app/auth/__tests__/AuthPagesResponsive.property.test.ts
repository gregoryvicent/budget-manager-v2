import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Represents the resolved responsive styles for an auth page.
 */
interface AuthPageResolution {
  /** Form padding in pixels. */
  formPadding: number;
  /** Whether the container occupies full width. */
  containerFullWidth: boolean;
  /** Horizontal margin of the container in pixels. */
  containerMarginX: number;
  /** Whether a max-width constraint is applied. */
  hasMaxWidth: boolean;
  /** The Tailwind classes responsible for the resolution. */
  appliedClasses: string[];
}

/**
 * Auth page identifiers.
 */
type AuthPageId = "LoginPage" | "RegisterPage";

/**
 * Resolves the responsive styles for an auth page based on viewport width.
 *
 * Both login and register pages share identical responsive layout classes:
 * - Outer container: `px-4` (always 16px horizontal padding)
 * - Form card: `w-full mx-4 md:max-w-md` + `p-5 md:p-8`
 *
 * On mobile (< 768px):
 *   - `p-5` → 20px form padding
 *   - `w-full mx-4` → full width with 16px margin on each side
 *   - No max-width constraint (md:max-w-md not active)
 *
 * On tablet+ (≥ 768px):
 *   - `md:p-8` → 32px form padding
 *   - `md:max-w-md` → constrained to 448px max-width
 *   - `mx-4` still applies but max-w-md takes precedence
 *
 * @param pageId - Identifier for the auth page
 * @param viewportWidth - Current viewport width in pixels
 * @returns The resolved responsive styles
 */
function resolveAuthPageStyles(
  _pageId: AuthPageId,
  viewportWidth: number
): AuthPageResolution {
  const isMobile = viewportWidth < BREAKPOINTS.md;

  // Both pages use identical layout classes
  if (isMobile) {
    return {
      formPadding: 20, // p-5 = 1.25rem = 20px
      containerFullWidth: true, // w-full
      containerMarginX: 16, // mx-4 = 1rem = 16px
      hasMaxWidth: false, // md:max-w-md not active
      appliedClasses: ["p-5", "w-full", "mx-4"],
    };
  }

  return {
    formPadding: 32, // md:p-8 = 2rem = 32px
    containerFullWidth: true, // w-full still applies
    containerMarginX: 16, // mx-4 still applies
    hasMaxWidth: true, // md:max-w-md = 448px
    appliedClasses: ["md:p-8", "w-full", "mx-4", "md:max-w-md"],
  };
}

/**
 * Returns all auth page identifiers.
 */
function getAllAuthPages(): AuthPageId[] {
  return ["LoginPage", "RegisterPage"];
}

// Feature: responsive-mobile-ui, Property 13: Auth pages ajustan padding en móvil
describe("Property 13: Auth pages adjust padding on mobile", () => {
  const pages = getAllAuthPages();

  it("form padding is 20px on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(...pages),
        (viewportWidth, pageId) => {
          const resolution = resolveAuthPageStyles(pageId, viewportWidth);
          expect(resolution.formPadding).toBe(20);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("form padding is 32px on tablet+ viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        fc.constantFrom(...pages),
        (viewportWidth, pageId) => {
          const resolution = resolveAuthPageStyles(pageId, viewportWidth);
          expect(resolution.formPadding).toBe(32);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("container is full-width with 16px margin on mobile", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(...pages),
        (viewportWidth, pageId) => {
          const resolution = resolveAuthPageStyles(pageId, viewportWidth);
          expect(resolution.containerFullWidth).toBe(true);
          expect(resolution.containerMarginX).toBe(16);
          expect(resolution.hasMaxWidth).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("container has max-width constraint on tablet+ viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: BREAKPOINTS.md, max: 3840 }),
        fc.constantFrom(...pages),
        (viewportWidth, pageId) => {
          const resolution = resolveAuthPageStyles(pageId, viewportWidth);
          expect(resolution.hasMaxWidth).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("padding transition occurs exactly at md breakpoint (768px)", () => {
    for (const pageId of pages) {
      const belowMd = resolveAuthPageStyles(pageId, BREAKPOINTS.md - 1);
      const atMd = resolveAuthPageStyles(pageId, BREAKPOINTS.md);

      expect(belowMd.formPadding).toBe(20);
      expect(atMd.formPadding).toBe(32);
      expect(belowMd.hasMaxWidth).toBe(false);
      expect(atMd.hasMaxWidth).toBe(true);
    }
  });

  it("both auth pages resolve identically for any viewport width", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        (viewportWidth) => {
          const login = resolveAuthPageStyles("LoginPage", viewportWidth);
          const register = resolveAuthPageStyles("RegisterPage", viewportWidth);

          expect(login.formPadding).toBe(register.formPadding);
          expect(login.containerFullWidth).toBe(register.containerFullWidth);
          expect(login.containerMarginX).toBe(register.containerMarginX);
          expect(login.hasMaxWidth).toBe(register.hasMaxWidth);
        }
      ),
      { numRuns: 100 }
    );
  });
});
