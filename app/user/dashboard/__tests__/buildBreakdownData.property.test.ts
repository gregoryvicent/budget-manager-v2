import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { getCategoryColor } from "@/lib/breakdownPalette";
import type { CategoryKey } from "@/lib/breakdownPalette";

/**
 * Represents a savings or investment goal as used by the dashboard hooks.
 */
interface GoalInput {
  id: string;
  title: string;
}

/**
 * Replicates the dashboard transformation logic that converts goals with
 * allocation percentages into donut slice values:
 *
 *   1. Filter goals whose allocationPct > 0 in the settings map.
 *   2. For each remaining goal, compute value = totalIncome * allocationPct / 100.
 *   3. Assign a color from the breakdown palette by index.
 *
 * @param goals - Array of goal objects with id and title
 * @param settings - Map of goalId → allocationPct
 * @param totalIncome - Total monthly income (≥ 0)
 * @returns Array of PieDataItem-shaped objects
 */
function buildGoalSlices(
  goals: GoalInput[],
  settings: Map<string, number>,
  totalIncome: number,
  category: CategoryKey = "savings",
): { name: string; value: number; color: string }[] {
  return goals
    .filter((g) => (settings.get(g.id) ?? 0) > 0)
    .map((g, i) => ({
      name: g.title,
      value: (totalIncome * settings.get(g.id)!) / 100,
      color: getCategoryColor(category, i),
    }));
}

/**
 * Arbitrary that generates a goal with a unique id and a non-empty title.
 */
const goalArb = fc
  .record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 30 }),
  });

/**
 * Arbitrary that generates a set of goals together with a matching settings map.
 * Each goal has a 50/50 chance of having an allocation (1–100%) or being absent.
 */
const goalsWithSettingsArb = fc
  .array(goalArb, { minLength: 1, maxLength: 15 })
  .chain((goals) =>
    fc
      .tuple(
        ...goals.map((g) =>
          fc.oneof(
            fc.constant<[string, number]>([g.id, 0]),
            fc.double({ min: 0.01, max: 100, noNaN: true }).map(
              (pct): [string, number] => [g.id, pct],
            ),
          ),
        ),
      )
      .map((entries) => ({
        goals,
        settings: new Map<string, number>(entries),
      })),
  );

// Feature: distribution-detail-modal, Property 3: Transformación de metas con asignación a valores de dona
describe("Property 3: Goal-to-donut-slice transformation with allocation percentages", () => {
  it("each slice value equals totalIncome × allocationPct / 100", () => {
    fc.assert(
      fc.property(
        goalsWithSettingsArb,
        fc.double({ min: 0, max: 10_000_000, noNaN: true }),
        ({ goals, settings }, totalIncome) => {
          const slices = buildGoalSlices(goals, settings, totalIncome);

          for (const slice of slices) {
            const goal = goals.find((g) => g.title === slice.name)!;
            const pct = settings.get(goal.id)!;
            const expected = (totalIncome * pct) / 100;
            expect(slice.value).toBeCloseTo(expected, 10);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("goals without allocation (pct === 0 or absent) produce no slices", () => {
    fc.assert(
      fc.property(
        goalsWithSettingsArb,
        fc.double({ min: 0, max: 10_000_000, noNaN: true }),
        ({ goals, settings }, totalIncome) => {
          const slices = buildGoalSlices(goals, settings, totalIncome);

          const goalsWithAllocation = goals.filter(
            (g) => (settings.get(g.id) ?? 0) > 0,
          );
          expect(slices).toHaveLength(goalsWithAllocation.length);

          // No slice should correspond to a goal with zero or missing allocation
          const sliceNames = new Set(slices.map((s) => s.name));
          for (const g of goals) {
            const pct = settings.get(g.id) ?? 0;
            if (pct <= 0) {
              expect(sliceNames.has(g.title)).toBe(false);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all slice values are zero when totalIncome is zero", () => {
    fc.assert(
      fc.property(goalsWithSettingsArb, ({ goals, settings }) => {
        const slices = buildGoalSlices(goals, settings, 0);

        for (const slice of slices) {
          expect(slice.value).toBe(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("slice values are non-negative for non-negative totalIncome", () => {
    fc.assert(
      fc.property(
        goalsWithSettingsArb,
        fc.double({ min: 0, max: 10_000_000, noNaN: true }),
        ({ goals, settings }, totalIncome) => {
          const slices = buildGoalSlices(goals, settings, totalIncome);

          for (const slice of slices) {
            expect(slice.value).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("empty goals array produces no slices regardless of settings", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10_000_000, noNaN: true }),
        (totalIncome) => {
          const slices = buildGoalSlices([], new Map(), totalIncome);
          expect(slices).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
