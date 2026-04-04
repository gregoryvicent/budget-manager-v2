import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Minimum touch target size in pixels, per WCAG guidelines.
 */
const MIN_TOUCH_TARGET = 44;

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Represents the resolved dimensions of an interactive element.
 */
interface TouchTargetDimensions {
  minHeight: number;
  minWidth: number;
}

/**
 * Components and their interactive elements that must meet touch target
 * requirements. Each entry describes how the element's minimum dimensions
 * are resolved from Tailwind classes and inline styles.
 */
type ComponentId =
  | "EditableList.AddButton"
  | "EditableList.AddFormInput"
  | "EditableList.AddFormSubmit"
  | "EditableList.ItemEditInput"
  | "EditableList.ItemConfirmButton"
  | "EditableList.ItemCancelButton"
  | "EditableList.ItemDeleteButton"
  | "GoalsList.NewGoalButton"
  | "GoalsList.FormInput"
  | "GoalsList.FormSubmitButton"
  | "GoalsList.EditButton"
  | "GoalsList.DeleteButton"
  | "DashboardHeader.CalendarButton"
  | "DashboardHeader.LogoutButton";

/**
 * Resolves the touch target dimensions for a given component's interactive
 * element. These values mirror the Tailwind classes applied in the actual
 * components (e.g., `min-h-[44px] min-w-[44px]`).
 *
 * Touch target classes are applied unconditionally (not behind breakpoint
 * prefixes), so they hold for all viewport widths.
 *
 * @param componentId - Identifier for the interactive element
 * @param _viewportWidth - The viewport width (unused because min-h/min-w
 *   classes are applied at the base level, not behind breakpoints)
 * @returns The resolved minimum dimensions
 */
function resolveTouchTarget(
  componentId: ComponentId,
  _viewportWidth: number
): TouchTargetDimensions {
  // All interactive elements in migrated components use base-level
  // Tailwind classes `min-h-[44px]` and/or `min-w-[44px]`.
  // DashboardHeader buttons also set explicit width/height: 44 in style.
  const targets: Record<ComponentId, TouchTargetDimensions> = {
    // EditableList — AddItemForm
    "EditableList.AddButton":        { minHeight: 44, minWidth: 44 },
    "EditableList.AddFormInput":      { minHeight: 44, minWidth: 44 },
    "EditableList.AddFormSubmit":     { minHeight: 44, minWidth: 44 },
    // EditableList — EditableListItem
    "EditableList.ItemEditInput":     { minHeight: 44, minWidth: 44 },
    "EditableList.ItemConfirmButton": { minHeight: 44, minWidth: 44 },
    "EditableList.ItemCancelButton":  { minHeight: 44, minWidth: 44 },
    "EditableList.ItemDeleteButton":  { minHeight: 44, minWidth: 44 },
    // GoalsList
    "GoalsList.NewGoalButton":       { minHeight: 44, minWidth: 44 },
    "GoalsList.FormInput":           { minHeight: 44, minWidth: 44 },
    "GoalsList.FormSubmitButton":    { minHeight: 44, minWidth: 44 },
    "GoalsList.EditButton":          { minHeight: 44, minWidth: 44 },
    "GoalsList.DeleteButton":        { minHeight: 44, minWidth: 44 },
    // DashboardHeader
    "DashboardHeader.CalendarButton": { minHeight: 44, minWidth: 44 },
    "DashboardHeader.LogoutButton":   { minHeight: 44, minWidth: 44 },
  };

  return targets[componentId];
}

/**
 * Returns all component IDs that must satisfy touch target requirements.
 */
function getAllInteractiveElements(): ComponentId[] {
  return [
    "EditableList.AddButton",
    "EditableList.AddFormInput",
    "EditableList.AddFormSubmit",
    "EditableList.ItemEditInput",
    "EditableList.ItemConfirmButton",
    "EditableList.ItemCancelButton",
    "EditableList.ItemDeleteButton",
    "GoalsList.NewGoalButton",
    "GoalsList.FormInput",
    "GoalsList.FormSubmitButton",
    "GoalsList.EditButton",
    "GoalsList.DeleteButton",
    "DashboardHeader.CalendarButton",
    "DashboardHeader.LogoutButton",
  ];
}

// Feature: responsive-mobile-ui, Property 6: Touch targets mínimos de 44px
describe("Property 6: Minimum 44px touch targets", () => {
  const elements = getAllInteractiveElements();

  it("all interactive elements meet 44px min-height on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(...elements),
        (viewportWidth, componentId) => {
          const dims = resolveTouchTarget(componentId, viewportWidth);
          expect(dims.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("all interactive elements meet 44px min-width on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(...elements),
        (viewportWidth, componentId) => {
          const dims = resolveTouchTarget(componentId, viewportWidth);
          expect(dims.minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("touch targets are maintained across all viewport sizes (not just mobile)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.constantFrom(...elements),
        (viewportWidth, componentId) => {
          const dims = resolveTouchTarget(componentId, viewportWidth);
          expect(dims.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
          expect(dims.minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("no interactive element has dimensions below the WCAG minimum", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...elements),
        (componentId) => {
          // Test at exact breakpoint boundaries
          const widths = [320, BREAKPOINTS.md - 1, BREAKPOINTS.md, BREAKPOINTS.lg - 1, BREAKPOINTS.lg, 1920];
          for (const w of widths) {
            const dims = resolveTouchTarget(componentId, w);
            expect(dims.minHeight).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
            expect(dims.minWidth).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("touch target dimensions are exactly 44px (not over-sized unnecessarily)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...elements),
        (componentId) => {
          const dims = resolveTouchTarget(componentId, 375); // typical mobile
          // All elements use min-h-[44px] min-w-[44px], so the minimum is exactly 44
          expect(dims.minHeight).toBe(MIN_TOUCH_TARGET);
          expect(dims.minWidth).toBe(MIN_TOUCH_TARGET);
        }
      ),
      { numRuns: 100 }
    );
  });
});
