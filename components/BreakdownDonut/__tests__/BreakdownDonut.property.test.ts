import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { PieDataItem } from "@/components/DistributionChart/types/PieDataItem";
import {
  INCOME_PALETTE,
  EXPENSE_PALETTE,
  SAVINGS_PALETTE,
  INVESTMENT_PALETTE,
} from "@/lib/breakdownPalette";

/** All palette colors combined for generating valid PieDataItems. */
const ALL_PALETTE_COLORS = [
  ...INCOME_PALETTE,
  ...EXPENSE_PALETTE,
  ...SAVINGS_PALETTE,
  ...INVESTMENT_PALETTE,
];

/**
 * Replicates the data transformation logic used by BreakdownDonut:
 * filters out zero-value items and returns the remaining items unchanged.
 *
 * @param items - Array of PieDataItem to transform
 * @returns Filtered array with zero-value items removed
 */
function transformItemsToSlices(items: PieDataItem[]): PieDataItem[] {
  return items.filter((item) => item.value !== 0);
}

/**
 * Arbitrary that generates a valid PieDataItem with a positive value.
 */
const pieDataItemArb = fc
  .record({
    name: fc.string({ minLength: 1, maxLength: 30 }),
    value: fc.double({ min: 0.01, max: 1_000_000, noNaN: true }),
    color: fc.constantFrom(...ALL_PALETTE_COLORS),
  })
  .map(({ name, value, color }): PieDataItem => ({ name, value, color }));

/**
 * Arbitrary that generates a PieDataItem that may have value === 0.
 */
const pieDataItemWithZeroArb = fc
  .record({
    name: fc.string({ minLength: 1, maxLength: 30 }),
    value: fc.oneof(
      fc.constant(0),
      fc.double({ min: 0.01, max: 1_000_000, noNaN: true }),
    ),
    color: fc.constantFrom(...ALL_PALETTE_COLORS),
  })
  .map(({ name, value, color }): PieDataItem => ({ name, value, color }));

/**
 * Replicates the percentage calculation logic used by BreakdownDonut's
 * labelWithReference: percent = value / referenceTotal when referenceTotal > 0,
 * otherwise 0. The displayed percentage is percent * 100.
 *
 * @param value - The item value
 * @param referenceTotal - The reference total for the category
 * @returns The percentage (0-100 scale) as displayed by CustomLabel
 */
function calculatePercentage(value: number, referenceTotal: number): number {
  if (referenceTotal <= 0) return 0;
  return (value / referenceTotal) * 100;
}

// Feature: distribution-detail-modal, Property 2: Cálculo de porcentaje relativo al total de referencia
describe("Property 2: Relative percentage calculation against reference total", () => {
  it("each item percentage equals (item.value / referenceTotal) * 100 for positive referenceTotal", () => {
    fc.assert(
      fc.property(
        fc.array(pieDataItemArb, { minLength: 1, maxLength: 20 }),
        fc.double({ min: 0.01, max: 10_000_000, noNaN: true }),
        (items, referenceTotal) => {
          for (const item of items) {
            const pct = calculatePercentage(item.value, referenceTotal);
            const expected = (item.value / referenceTotal) * 100;
            expect(pct).toBeCloseTo(expected, 10);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all percentages are zero when referenceTotal is zero", () => {
    fc.assert(
      fc.property(
        fc.array(pieDataItemArb, { minLength: 1, maxLength: 20 }),
        (items) => {
          for (const item of items) {
            expect(calculatePercentage(item.value, 0)).toBe(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("sum of percentages is <= 100 when all items are included in referenceTotal", () => {
    fc.assert(
      fc.property(
        fc.array(pieDataItemArb, { minLength: 1, maxLength: 20 }),
        (items) => {
          const referenceTotal = items.reduce((sum, i) => sum + i.value, 0);
          if (referenceTotal <= 0) return;

          const totalPct = items.reduce(
            (sum, item) => sum + calculatePercentage(item.value, referenceTotal),
            0,
          );
          // When referenceTotal equals the sum of items, percentages sum to ~100
          expect(totalPct).toBeCloseTo(100, 5);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("individual percentages can exceed 100 when referenceTotal is smaller than item value", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 100, max: 1_000_000, noNaN: true }),
        fc.double({ min: 0.01, max: 99, noNaN: true }),
        (value, referenceTotal) => {
          const pct = calculatePercentage(value, referenceTotal);
          expect(pct).toBeGreaterThan(100);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("percentage is always non-negative for positive values and positive referenceTotal", () => {
    fc.assert(
      fc.property(
        fc.array(pieDataItemArb, { minLength: 1, maxLength: 20 }),
        fc.double({ min: 0.01, max: 10_000_000, noNaN: true }),
        (items, referenceTotal) => {
          for (const item of items) {
            expect(calculatePercentage(item.value, referenceTotal)).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: distribution-detail-modal, Property 1: Mapeo de items a slices preserva valores
describe("Property 1: Item-to-slice mapping preserves values", () => {
  it("each slice value equals the corresponding input item value for positive-value items", () => {
    fc.assert(
      fc.property(fc.array(pieDataItemArb, { maxLength: 20 }), (items) => {
        const slices = transformItemsToSlices(items);

        // All positive-value items should pass through unchanged
        expect(slices).toHaveLength(items.length);
        for (let i = 0; i < slices.length; i++) {
          expect(slices[i].value).toBe(items[i].value);
          expect(slices[i].name).toBe(items[i].name);
          expect(slices[i].color).toBe(items[i].color);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("zero-value items are filtered out and non-zero items preserve their values", () => {
    fc.assert(
      fc.property(
        fc.array(pieDataItemWithZeroArb, { minLength: 1, maxLength: 20 }),
        (items) => {
          const slices = transformItemsToSlices(items);
          const nonZeroItems = items.filter((item) => item.value !== 0);

          // Slice count matches non-zero item count
          expect(slices).toHaveLength(nonZeroItems.length);

          // Each slice preserves the value of its corresponding non-zero item
          for (let i = 0; i < slices.length; i++) {
            expect(slices[i].value).toBe(nonZeroItems[i].value);
            expect(slices[i].name).toBe(nonZeroItems[i].name);
            expect(slices[i].color).toBe(nonZeroItems[i].color);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("the transformation is idempotent on already-filtered data", () => {
    fc.assert(
      fc.property(fc.array(pieDataItemArb, { maxLength: 20 }), (items) => {
        const firstPass = transformItemsToSlices(items);
        const secondPass = transformItemsToSlices(firstPass);

        expect(secondPass).toEqual(firstPass);
      }),
      { numRuns: 100 },
    );
  });

  it("empty input produces empty output (no slices)", () => {
    const slices = transformItemsToSlices([]);
    expect(slices).toHaveLength(0);
  });
});
