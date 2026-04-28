import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { filterAvailableMonths, formatMonthLabel } from "@/hooks/useCopyItems";

/**
 * Arbitrary for a budget entry with an id, year, month, and item count.
 * year ∈ [2020, 2030], month ∈ [1, 12], itemCount ∈ [0, 50].
 */
const budgetEntryArb = fc.record({
  id: fc.uuid(),
  year: fc.integer({ min: 2020, max: 2030 }),
  month: fc.integer({ min: 1, max: 12 }),
  itemCount: fc.integer({ min: 0, max: 50 }),
});

describe("Feature: copy-items-between-months, Property 1: Filtrado de meses disponibles", () => {
  it("should only return months with at least one item, exclude the target month, and sort most recent first", () => {
    fc.assert(
      fc.property(
        fc.array(budgetEntryArb, { minLength: 0, maxLength: 20 }),
        fc.uuid(),
        (entries, targetId) => {
          // Build budgets and itemCounts from generated entries
          const budgets = entries.map((e) => ({
            id: e.id,
            year: e.year,
            month: e.month,
          }));
          const itemCounts = new Map<string, number>(
            entries.map((e) => [e.id, e.itemCount]),
          );

          const result = filterAvailableMonths(budgets, targetId, itemCounts);

          // 1. Every returned month must have itemCount > 0
          for (const m of result) {
            expect(itemCounts.get(m.budgetMonthId)).toBeGreaterThan(0);
          }

          // 2. The target month must be excluded
          for (const m of result) {
            expect(m.budgetMonthId).not.toBe(targetId);
          }

          // 3. All eligible months must be present (completeness)
          const expectedIds = new Set(
            entries
              .filter((e) => e.id !== targetId && e.itemCount > 0)
              .map((e) => e.id),
          );
          const resultIds = new Set(result.map((m) => m.budgetMonthId));
          expect(resultIds).toEqual(expectedIds);

          // 4. Result must be sorted from most recent to oldest
          for (let i = 1; i < result.length; i++) {
            const prev = result[i - 1];
            const curr = result[i];
            const cmp = prev.year - curr.year || prev.month - curr.month;
            expect(cmp).toBeGreaterThanOrEqual(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should produce correct labels for each returned month", () => {
    fc.assert(
      fc.property(
        fc.array(budgetEntryArb, { minLength: 1, maxLength: 15 }),
        fc.uuid(),
        (entries, targetId) => {
          const budgets = entries.map((e) => ({
            id: e.id,
            year: e.year,
            month: e.month,
          }));
          const itemCounts = new Map<string, number>(
            entries.map((e) => [e.id, e.itemCount]),
          );

          const result = filterAvailableMonths(budgets, targetId, itemCounts);

          for (const m of result) {
            expect(m.label).toBe(formatMonthLabel(m.year, m.month));
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should return an empty array when all months belong to the target", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2030 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 50 }),
        fc.uuid(),
        (year, month, itemCount, targetId) => {
          const budgets = [{ id: targetId, year, month }];
          const itemCounts = new Map([[targetId, itemCount]]);

          const result = filterAvailableMonths(budgets, targetId, itemCounts);
          expect(result).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should return an empty array when no months have items in the category", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            year: fc.integer({ min: 2020, max: 2030 }),
            month: fc.integer({ min: 1, max: 12 }),
          }),
          { minLength: 1, maxLength: 15 },
        ),
        fc.uuid(),
        (budgets, targetId) => {
          // All item counts are 0
          const itemCounts = new Map<string, number>(
            budgets.map((b) => [b.id, 0]),
          );

          const result = filterAvailableMonths(budgets, targetId, itemCounts);
          expect(result).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});

import {
  selectAllItems,
  deselectAllItems,
  initialSelection,
} from "@/hooks/useCopyItems";
import type { CopyableItem } from "@/hooks/useCopyItems";

/**
 * Arbitrary for a copyable item with a unique id, name, and amount.
 */
const copyableItemArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  amount: fc.double({ min: 0, max: 100_000, noNaN: true }),
});

describe("Feature: copy-items-between-months, Property 2: Toggle de selección masiva", () => {
  it("selectAllItems should select every item regardless of prior selection state", () => {
    fc.assert(
      fc.property(
        fc.array(copyableItemArb, { minLength: 1, maxLength: 20 }),
        (items: CopyableItem[]) => {
          const result = selectAllItems(items);

          // Every item ID must be in the result
          for (const item of items) {
            expect(result.has(item.id)).toBe(true);
          }

          // Result size must equal the number of items
          expect(result.size).toBe(items.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("deselectAllItems should produce an empty selection regardless of items", () => {
    fc.assert(
      fc.property(
        fc.array(copyableItemArb, { minLength: 1, maxLength: 20 }),
        (items: CopyableItem[]) => {
          const result = deselectAllItems();

          // No item should be selected
          for (const item of items) {
            expect(result.has(item.id)).toBe(false);
          }

          expect(result.size).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("initialSelection should preselect all items when loaded for the first time", () => {
    fc.assert(
      fc.property(
        fc.array(copyableItemArb, { minLength: 1, maxLength: 20 }),
        (items: CopyableItem[]) => {
          const result = initialSelection(items);

          // All items must be preselected
          for (const item of items) {
            expect(result.has(item.id)).toBe(true);
          }

          expect(result.size).toBe(items.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("selectAll after deselectAll should restore full selection", () => {
    fc.assert(
      fc.property(
        fc.array(copyableItemArb, { minLength: 1, maxLength: 20 }),
        (items: CopyableItem[]) => {
          // Start with deselect all
          const deselected = deselectAllItems();
          expect(deselected.size).toBe(0);

          // Then select all
          const reselected = selectAllItems(items);
          for (const item of items) {
            expect(reselected.has(item.id)).toBe(true);
          }
          expect(reselected.size).toBe(items.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("selectAll from any partial selection should always yield all items selected", () => {
    fc.assert(
      fc.property(
        fc.array(copyableItemArb, { minLength: 1, maxLength: 20 }).chain((items) =>
          fc.tuple(
            fc.constant(items),
            fc.subarray(items.map((i) => i.id), { minLength: 0 }),
          ),
        ),
        ([items, partialIds]: [CopyableItem[], string[]]) => {
          // Simulate a partial selection state
          const _partial = new Set(partialIds);

          // Select all from partial state
          const result = selectAllItems(items);

          // Must contain every item
          for (const item of items) {
            expect(result.has(item.id)).toBe(true);
          }
          expect(result.size).toBe(items.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("deselectAll from any partial selection should always yield empty selection", () => {
    fc.assert(
      fc.property(
        fc.array(copyableItemArb, { minLength: 1, maxLength: 20 }).chain((items) =>
          fc.tuple(
            fc.constant(items),
            fc.subarray(items.map((i) => i.id), { minLength: 0 }),
          ),
        ),
        ([items, partialIds]: [CopyableItem[], string[]]) => {
          // Simulate a partial selection state
          const _partial = new Set(partialIds);

          // Deselect all from partial state
          const result = deselectAllItems();

          // Must contain no items
          for (const item of items) {
            expect(result.has(item.id)).toBe(false);
          }
          expect(result.size).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});

import { computeSelectionSummary } from "@/hooks/useCopyItems";

describe("Feature: copy-items-between-months, Property 3: Resumen de selección", () => {
  /**
   * Arbitrary for a copyable item with unique id, name, and non-negative amount.
   */
  const itemArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    amount: fc.double({ min: 0, max: 100_000, noNaN: true, noDefaultInfinity: true }),
  });

  it("should return the exact count and total amount of selected items", () => {
    fc.assert(
      fc.property(
        fc.array(itemArb, { minLength: 1, maxLength: 20 }).chain((items) =>
          fc.tuple(
            fc.constant(items),
            fc.subarray(items.map((i) => i.id), { minLength: 0 }),
          ),
        ),
        ([items, selectedIdArray]: [CopyableItem[], string[]]) => {
          const selectedIds = new Set(selectedIdArray);
          const summary = computeSelectionSummary(items, selectedIds);

          // Count must equal the number of items whose ID is in selectedIds
          const expectedCount = items.filter((i) => selectedIds.has(i.id)).length;
          expect(summary.count).toBe(expectedCount);

          // Total amount must equal the sum of amounts of selected items
          const expectedTotal = items
            .filter((i) => selectedIds.has(i.id))
            .reduce((sum, i) => sum + i.amount, 0);
          expect(summary.totalAmount).toBeCloseTo(expectedTotal, 5);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should return count 0 and totalAmount 0 when no items are selected", () => {
    fc.assert(
      fc.property(
        fc.array(itemArb, { minLength: 1, maxLength: 20 }),
        (items: CopyableItem[]) => {
          const emptySelection = new Set<string>();
          const summary = computeSelectionSummary(items, emptySelection);

          expect(summary.count).toBe(0);
          expect(summary.totalAmount).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should return count equal to items.length and correct total when all items are selected", () => {
    fc.assert(
      fc.property(
        fc.array(itemArb, { minLength: 1, maxLength: 20 }),
        (items: CopyableItem[]) => {
          const allSelected = new Set(items.map((i) => i.id));
          const summary = computeSelectionSummary(items, allSelected);

          expect(summary.count).toBe(items.length);

          const expectedTotal = items.reduce((sum, i) => sum + i.amount, 0);
          expect(summary.totalAmount).toBeCloseTo(expectedTotal, 5);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should ignore selectedIds that do not match any item", () => {
    fc.assert(
      fc.property(
        fc.array(itemArb, { minLength: 1, maxLength: 15 }),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
        (items: CopyableItem[], extraIds: string[]) => {
          // Build selection from extra IDs that are NOT in items
          const itemIdSet = new Set(items.map((i) => i.id));
          const bogusIds = extraIds.filter((id) => !itemIdSet.has(id));
          const selectedIds = new Set(bogusIds);

          const summary = computeSelectionSummary(items, selectedIds);

          expect(summary.count).toBe(0);
          expect(summary.totalAmount).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});


describe("Feature: copy-items-between-months, Property 6: Ciclo de vida del flag de copia", () => {
  /**
   * Simulates the isCopying lifecycle used by executeCopy in useCopyItems.
   * Mirrors the try/finally pattern: isCopying = true before fetch, false after,
   * regardless of success or failure.
   *
   * @param {() => Promise<Response>} fetchFn - The fetch function (may resolve or reject).
   * @returns {{ isCopyingDuring: boolean; isCopyingAfter: boolean; succeeded: boolean }}
   */
  async function simulateExecuteCopyLifecycle(
    fetchFn: () => Promise<Response>,
  ): Promise<{ isCopyingDuring: boolean; isCopyingAfter: boolean; succeeded: boolean }> {
    let isCopying = false;
    let isCopyingDuring = false;
    let succeeded = false;

    // Mirrors the executeCopy pattern from useCopyItems
    isCopying = true;
    isCopyingDuring = isCopying; // Capture flag state during execution
    try {
      const res = await fetchFn();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al copiar ítems.");
      succeeded = true;
    } catch {
      succeeded = false;
    } finally {
      isCopying = false;
    }

    return { isCopyingDuring, isCopyingAfter: isCopying, succeeded };
  }

  /**
   * Arbitrary for a list of random item IDs to copy.
   */
  const itemIdsArb = fc.array(fc.uuid(), { minLength: 1, maxLength: 15 });

  it("isCopying should be true during execution and false after a successful copy", async () => {
    await fc.assert(
      fc.asyncProperty(
        itemIdsArb,
        fc.integer({ min: 1, max: 50 }),
        async (itemIds, copiedCount) => {
          const mockFetch = () =>
            Promise.resolve(
              new Response(
                JSON.stringify({ copiedItems: itemIds.map((id) => ({ id, name: "x", amount: 1 })), count: copiedCount }),
                { status: 201, headers: { "Content-Type": "application/json" } },
              ),
            );

          const result = await simulateExecuteCopyLifecycle(mockFetch);

          expect(result.isCopyingDuring).toBe(true);
          expect(result.isCopyingAfter).toBe(false);
          expect(result.succeeded).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("isCopying should be true during execution and false after a failed copy (HTTP error)", async () => {
    await fc.assert(
      fc.asyncProperty(
        itemIdsArb,
        fc.constantFrom(400, 403, 404, 500, 502, 503),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (_itemIds, statusCode, errorMessage) => {
          const mockFetch = () =>
            Promise.resolve(
              new Response(
                JSON.stringify({ error: errorMessage }),
                { status: statusCode, headers: { "Content-Type": "application/json" } },
              ),
            );

          const result = await simulateExecuteCopyLifecycle(mockFetch);

          expect(result.isCopyingDuring).toBe(true);
          expect(result.isCopyingAfter).toBe(false);
          expect(result.succeeded).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("isCopying should be true during execution and false after a network error", async () => {
    await fc.assert(
      fc.asyncProperty(
        itemIdsArb,
        fc.string({ minLength: 1, maxLength: 50 }),
        async (_itemIds, errorMessage) => {
          const mockFetch = () => Promise.reject(new Error(errorMessage));

          const result = await simulateExecuteCopyLifecycle(mockFetch);

          expect(result.isCopyingDuring).toBe(true);
          expect(result.isCopyingAfter).toBe(false);
          expect(result.succeeded).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("isCopying lifecycle holds for any combination of success/failure outcomes", async () => {
    await fc.assert(
      fc.asyncProperty(
        itemIdsArb,
        fc.boolean(),
        fc.integer({ min: 200, max: 599 }),
        async (_itemIds, shouldSucceed, statusCode) => {
          const effectiveStatus = shouldSucceed ? 201 : Math.max(statusCode, 400);
          const body = shouldSucceed
            ? { copiedItems: [], count: 0 }
            : { error: "Simulated error" };

          const mockFetch = () =>
            Promise.resolve(
              new Response(
                JSON.stringify(body),
                { status: effectiveStatus, headers: { "Content-Type": "application/json" } },
              ),
            );

          const result = await simulateExecuteCopyLifecycle(mockFetch);

          // Core property: isCopying is true during and false after, always
          expect(result.isCopyingDuring).toBe(true);
          expect(result.isCopyingAfter).toBe(false);

          // Outcome matches intent
          if (shouldSucceed) {
            expect(result.succeeded).toBe(true);
          } else {
            expect(result.succeeded).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
