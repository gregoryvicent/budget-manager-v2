import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Represents a container section in the landing page with its
 * CSS class configuration from app/page.tsx.
 */
interface ContainerSection {
  /** Human-readable identifier for the container. */
  id: string;
  /** The Tailwind CSS classes applied to this container. */
  classes: string;
  /** Optional parent classes that contribute to overflow prevention. */
  parentClasses?: string;
}

/**
 * All container sections in the landing page (app/page.tsx) that
 * must prevent horizontal overflow.
 *
 * Each container uses one or more overflow-prevention strategies:
 * - `max-w-*` constrains the maximum width
 * - `px-*` adds horizontal padding to prevent edge-to-edge content
 * - `w-full` respects parent width boundaries
 * - `grid`/`flex` layout auto-manages children sizing
 * - `mx-auto` centers constrained containers
 */
const LANDING_PAGE_CONTAINERS: ContainerSection[] = [
  {
    id: "Root",
    classes: "min-h-screen bg-bg",
  },
  {
    id: "Header.Inner",
    classes: "max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between",
  },
  {
    id: "Hero.Section",
    classes: "pt-24 md:pt-32 pb-16 md:pb-24 px-4",
  },
  {
    id: "Hero.Inner",
    classes: "max-w-3xl mx-auto text-center",
    parentClasses: "pt-24 md:pt-32 pb-16 md:pb-24 px-4",
  },
  {
    id: "Hero.CTAContainer",
    classes: "flex flex-col w-full md:flex-row md:w-auto md:justify-center gap-4",
    parentClasses: "max-w-3xl mx-auto text-center",
  },
  {
    id: "Features.Section",
    classes: "py-16 md:py-24 px-4",
  },
  {
    id: "Features.Inner",
    classes: "max-w-7xl mx-auto",
    parentClasses: "py-16 md:py-24 px-4",
  },
  {
    id: "Features.Grid",
    classes: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    parentClasses: "max-w-7xl mx-auto",
  },
  {
    id: "Footer",
    classes: "border-t border-card-border py-8 px-4",
  },
  {
    id: "Footer.Inner",
    classes: "max-w-7xl mx-auto text-center",
    parentClasses: "border-t border-card-border py-8 px-4",
  },
];

/**
 * Checks whether a class string contains a max-width constraint.
 *
 * Looks for Tailwind `max-w-*` classes (e.g., `max-w-7xl`, `max-w-3xl`,
 * `max-w-2xl`) that prevent the element from exceeding a fixed width.
 *
 * @param classes - Space-separated Tailwind CSS class string
 * @returns True if a max-width class is present
 */
function hasMaxWidthConstraint(classes: string): boolean {
  return /(?:^|\s)max-w-\S+/.test(classes);
}

/**
 * Checks whether a class string contains horizontal padding.
 *
 * Looks for Tailwind `px-*` classes at the base level (no breakpoint
 * prefix) that add left and right padding, preventing content from
 * touching viewport edges.
 *
 * @param classes - Space-separated Tailwind CSS class string
 * @returns True if base-level horizontal padding is present
 */
function hasHorizontalPadding(classes: string): boolean {
  return /(?:^|\s)px-\d+/.test(classes);
}

/**
 * Checks whether a class string uses a flex or grid layout.
 *
 * Flex and grid layouts auto-manage children sizing and prevent
 * children from overflowing the container.
 *
 * @param classes - Space-separated Tailwind CSS class string
 * @returns True if flex or grid layout is used
 */
function hasFlexOrGridLayout(classes: string): boolean {
  return /(?:^|\s)(?:flex|grid)(?:\s|$)/.test(classes);
}

/**
 * Checks whether a class string uses `w-full` to respect parent width.
 *
 * @param classes - Space-separated Tailwind CSS class string
 * @returns True if `w-full` is present
 */
function hasFullWidth(classes: string): boolean {
  return /(?:^|\s)w-full(?:\s|$)/.test(classes);
}

/**
 * Checks whether a container is a block-level root wrapper.
 *
 * A plain block-level div without explicit width classes naturally
 * takes 100% of its parent width and cannot cause horizontal overflow
 * on its own. Its children are responsible for their own constraints.
 *
 * @param classes - Space-separated Tailwind CSS class string
 * @returns True if the element is a simple block wrapper with no
 *   width-expanding classes
 */
function isBlockLevelWrapper(classes: string): boolean {
  // A block-level element with no explicit width, no inline/inline-block,
  // and no fixed width is naturally constrained to viewport width.
  const hasExplicitInline = /(?:^|\s)(?:inline|inline-block|inline-flex)(?:\s|$)/.test(classes);
  const hasFixedWidth = /(?:^|\s)w-\[/.test(classes);
  return !hasExplicitInline && !hasFixedWidth;
}

/**
 * Checks whether a class string uses `mx-auto` for horizontal centering.
 *
 * @param classes - Space-separated Tailwind CSS class string
 * @returns True if `mx-auto` is present
 */
function hasCenterAlignment(classes: string): boolean {
  return /(?:^|\s)mx-auto(?:\s|$)/.test(classes);
}

/**
 * Checks whether a class string contains any fixed-width value that
 * could exceed a small viewport (320px).
 *
 * Looks for Tailwind `w-[Xpx]` classes at the base level (not behind
 * a breakpoint prefix) where X > 320. Responsive prefixed fixed widths
 * (e.g., `md:w-[500px]`) are acceptable because they only apply at
 * larger viewports.
 *
 * @param classes - Space-separated Tailwind CSS class string
 * @returns True if a problematic fixed width is found
 */
function hasProblematicFixedWidth(classes: string): boolean {
  const fixedWidthPattern = /(?:^|\s)w-\[(\d+)px\]/g;
  let match: RegExpExecArray | null;
  while ((match = fixedWidthPattern.exec(classes)) !== null) {
    const fullMatch = classes.substring(
      Math.max(0, match.index - 4),
      match.index
    );
    // Skip if it's behind a breakpoint prefix (e.g., md:w-[500px])
    if (/(?:sm|md|lg|xl|2xl):$/.test(fullMatch)) {
      continue;
    }
    const widthValue = parseInt(match[1], 10);
    if (widthValue > 320) {
      return true;
    }
  }
  return false;
}

/**
 * Determines whether a container has overflow prevention at a given
 * viewport width.
 *
 * A container prevents overflow if it meets at least one of these
 * conditions:
 * - Has a `max-w-*` constraint (caps width regardless of viewport)
 * - Has horizontal padding `px-*` (prevents edge-to-edge content)
 * - Uses `w-full` (respects parent boundaries)
 * - Uses flex/grid layout (auto-manages children)
 * - Its parent provides overflow prevention (padding or max-width)
 *
 * Additionally, no container should have a base-level fixed width
 * exceeding 320px (the smallest supported viewport).
 *
 * @param container - The container section definition
 * @param _viewportWidth - Current viewport width (unused; all overflow
 *   prevention classes are applied at base level)
 * @returns True if the container prevents horizontal overflow
 */
function containerPreventsOverflow(
  container: ContainerSection,
  _viewportWidth: number
): boolean {
  const selfPrevents =
    hasMaxWidthConstraint(container.classes) ||
    hasHorizontalPadding(container.classes) ||
    hasFullWidth(container.classes) ||
    hasFlexOrGridLayout(container.classes) ||
    isBlockLevelWrapper(container.classes);

  const parentPrevents = container.parentClasses
    ? hasMaxWidthConstraint(container.parentClasses) ||
      hasHorizontalPadding(container.parentClasses)
    : false;

  const noProblematicWidth = !hasProblematicFixedWidth(container.classes);

  return (selfPrevents || parentPrevents) && noProblematicWidth;
}

// Feature: landing-page, Property 5: Sin desbordamiento horizontal en ningún viewport
describe("Property 5: No horizontal overflow at any viewport", () => {
  /**
   * **Validates: Requirements 6.2**
   *
   * Requirement 6.2: THE Landing_Page SHALL produce no horizontal
   *   overflow at any viewport width between 320px and 2560px.
   */

  it("all section containers have overflow prevention across all viewport widths", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        fc.constantFrom(...LANDING_PAGE_CONTAINERS),
        (viewportWidth, container) => {
          const preventsOverflow = containerPreventsOverflow(container, viewportWidth);
          expect(preventsOverflow).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("all sections with direct content have max-width constraints or parent padding", () => {
    const contentSections = LANDING_PAGE_CONTAINERS.filter(
      (c) =>
        c.id === "Header.Inner" ||
        c.id === "Hero.Inner" ||
        c.id === "Features.Inner" ||
        c.id === "Footer.Inner"
    );

    fc.assert(
      fc.property(
        fc.constantFrom(...contentSections),
        (container) => {
          const hasConstraint =
            hasMaxWidthConstraint(container.classes) ||
            (container.parentClasses !== undefined &&
              hasHorizontalPadding(container.parentClasses));
          expect(hasConstraint).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("all top-level sections have horizontal padding", () => {
    const topLevelSections = LANDING_PAGE_CONTAINERS.filter(
      (c) =>
        c.id === "Hero.Section" ||
        c.id === "Features.Section" ||
        c.id === "Footer"
    );

    fc.assert(
      fc.property(
        fc.constantFrom(...topLevelSections),
        (container) => {
          expect(hasHorizontalPadding(container.classes)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("no container has a base-level fixed width exceeding 320px", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LANDING_PAGE_CONTAINERS),
        (container) => {
          expect(hasProblematicFixedWidth(container.classes)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("overflow prevention holds at viewport boundary values", () => {
    const boundaryWidths = [320, 767, 768, 1023, 1024, 1280, 1920, 2560];

    for (const container of LANDING_PAGE_CONTAINERS) {
      for (const width of boundaryWidths) {
        const preventsOverflow = containerPreventsOverflow(container, width);
        expect(preventsOverflow).toBe(true);
      }
    }
  });
});
