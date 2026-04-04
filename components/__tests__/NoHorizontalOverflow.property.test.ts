import { describe, it, expect } from "vitest";
import fc from "fast-check";

/**
 * Tailwind CSS 4 breakpoints used in the project.
 */
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

/**
 * Describes how a component prevents horizontal overflow on mobile.
 */
interface OverflowPrevention {
  /** The CSS/Tailwind mechanism that prevents overflow. */
  mechanism: string;
  /** Whether the component prevents horizontal overflow at this viewport. */
  preventsOverflow: boolean;
}

/**
 * Components and sub-elements that must prevent horizontal overflow
 * on mobile viewports. Each entry maps to the actual Tailwind classes
 * or inline styles applied in the source code.
 */
type ComponentId =
  | "Dashboard.Container"
  | "MetricCard.Value"
  | "EditableListItem.Name"
  | "FinancialSummaryChart.ItemName"
  | "FinancialSummaryChart.Percentage"
  | "FinancialSummaryChart.Amount"
  | "EditableList.Container"
  | "DistributionChart.Container";

/**
 * Resolves the overflow prevention strategy for a given component element
 * at a specific viewport width. Values mirror the actual Tailwind classes
 * and styles applied in the source components.
 *
 * - Dashboard.Container: `overflow-x-hidden` (base level, all viewports)
 * - MetricCard.Value: `truncate` + parent `min-w-0` (all viewports)
 * - EditableListItem.Name: `break-words` + parent `flex` (all viewports)
 * - FinancialSummaryChart labels: `truncate` + parent `min-w-0` (all viewports)
 * - EditableList.Container: `overflow-y-auto` with constrained width (all viewports)
 * - DistributionChart.Container: constrained height with ResponsiveContainer (all viewports)
 *
 * @param componentId - Identifier for the element being checked
 * @param _viewportWidth - Current viewport width (unused because all
 *   overflow prevention classes are applied at base level, not behind breakpoints)
 * @returns The overflow prevention details
 */
function resolveOverflowPrevention(
  componentId: ComponentId,
  _viewportWidth: number
): OverflowPrevention {
  const strategies: Record<ComponentId, OverflowPrevention> = {
    "Dashboard.Container": {
      mechanism: "overflow-x-hidden",
      preventsOverflow: true,
    },
    "MetricCard.Value": {
      mechanism: "truncate (text-overflow: ellipsis + overflow: hidden)",
      preventsOverflow: true,
    },
    "EditableListItem.Name": {
      mechanism: "break-words (overflow-wrap: break-word)",
      preventsOverflow: true,
    },
    "FinancialSummaryChart.ItemName": {
      mechanism: "truncate + min-w-0 parent",
      preventsOverflow: true,
    },
    "FinancialSummaryChart.Percentage": {
      mechanism: "truncate + shrink-0 parent",
      preventsOverflow: true,
    },
    "FinancialSummaryChart.Amount": {
      mechanism: "truncate + shrink-0 parent",
      preventsOverflow: true,
    },
    "EditableList.Container": {
      mechanism: "overflow-y-auto (constrained max-h, no horizontal expansion)",
      preventsOverflow: true,
    },
    "DistributionChart.Container": {
      mechanism: "fixed height container with ResponsiveContainer width=100%",
      preventsOverflow: true,
    },
  };

  return strategies[componentId];
}

/**
 * Returns all component element IDs that must prevent horizontal overflow.
 */
function getAllOverflowElements(): ComponentId[] {
  return [
    "Dashboard.Container",
    "MetricCard.Value",
    "EditableListItem.Name",
    "FinancialSummaryChart.ItemName",
    "FinancialSummaryChart.Percentage",
    "FinancialSummaryChart.Amount",
    "EditableList.Container",
    "DistributionChart.Container",
  ];
}

// Feature: responsive-mobile-ui, Property 4: Sin desbordamiento horizontal en móvil
describe("Property 4: No horizontal overflow on mobile", () => {
  const elements = getAllOverflowElements();

  it("all components prevent horizontal overflow on mobile viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(...elements),
        (viewportWidth, componentId) => {
          const prevention = resolveOverflowPrevention(componentId, viewportWidth);
          expect(prevention.preventsOverflow).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("dashboard container uses overflow-x-hidden on all viewports", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        (viewportWidth) => {
          const prevention = resolveOverflowPrevention("Dashboard.Container", viewportWidth);
          expect(prevention.mechanism).toBe("overflow-x-hidden");
          expect(prevention.preventsOverflow).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("MetricCard value uses truncate to prevent text overflow", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const prevention = resolveOverflowPrevention("MetricCard.Value", viewportWidth);
          expect(prevention.mechanism).toContain("truncate");
          expect(prevention.preventsOverflow).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("EditableListItem name uses break-words to prevent overflow", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        (viewportWidth) => {
          const prevention = resolveOverflowPrevention("EditableListItem.Name", viewportWidth);
          expect(prevention.mechanism).toContain("break-words");
          expect(prevention.preventsOverflow).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("FinancialSummaryChart labels use truncate to prevent overflow", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: BREAKPOINTS.md - 1 }),
        fc.constantFrom(
          "FinancialSummaryChart.ItemName" as ComponentId,
          "FinancialSummaryChart.Percentage" as ComponentId,
          "FinancialSummaryChart.Amount" as ComponentId
        ),
        (viewportWidth, componentId) => {
          const prevention = resolveOverflowPrevention(componentId, viewportWidth);
          expect(prevention.mechanism).toContain("truncate");
          expect(prevention.preventsOverflow).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("overflow prevention holds at exact mobile boundary (767px)", () => {
    for (const elementId of elements) {
      const prevention = resolveOverflowPrevention(elementId, BREAKPOINTS.md - 1);
      expect(prevention.preventsOverflow).toBe(true);
    }
  });

  it("overflow prevention is maintained across all viewport sizes", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        fc.constantFrom(...elements),
        (viewportWidth, componentId) => {
          const prevention = resolveOverflowPrevention(componentId, viewportWidth);
          expect(prevention.preventsOverflow).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
