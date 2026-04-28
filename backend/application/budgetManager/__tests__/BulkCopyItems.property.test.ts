import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { bulkCopyItems } from "@/backend/application/budgetManager/BulkCopyItems";
import type { CopyCategory } from "@/backend/application/budgetManager/BulkCopyItems";
import type { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import type { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import type { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";
import type { ExpenseEntry } from "@/backend/domain/budgetManager/ExpenseEntry";

const SOURCE_MONTH_ID = "source-month-id";
const TARGET_MONTH_ID = "target-month-id";

/**
 * Creates a mock IIncomeEntryRepository backed by an in-memory store.
 * `findByBudgetMonth` returns the seeded source items.
 * `create` generates a new entry with a unique ID.
 */
function createMockIncomeRepo(sourceItems: IncomeEntry[]): IIncomeEntryRepository {
  return {
    findByBudgetMonth: async (budgetMonthId: string) =>
      sourceItems.filter((i) => i.budgetMonthId === budgetMonthId),
    findById: async () => null,
    createMany: async () => {},
    create: async (data) => {
      const now = new Date();
      return {
        id: crypto.randomUUID(),
        budgetMonthId: data.budgetMonthId,
        name: data.name,
        amount: data.amount,
        createdAt: now,
        updatedAt: now,
      };
    },
    update: async () => ({}) as IncomeEntry,
    delete: async () => ({}) as IncomeEntry,
  };
}

/**
 * Creates a mock IExpenseEntryRepository backed by an in-memory store.
 * `findByBudgetMonth` returns the seeded source items filtered by type.
 * `create` generates a new entry with a unique ID.
 */
function createMockExpenseRepo(sourceItems: ExpenseEntry[]): IExpenseEntryRepository {
  return {
    findByBudgetMonth: async (budgetMonthId: string, type?) =>
      sourceItems.filter(
        (i) => i.budgetMonthId === budgetMonthId && (!type || i.type === type),
      ),
    findById: async () => null,
    createMany: async () => {},
    create: async (data) => {
      const now = new Date();
      return {
        id: crypto.randomUUID(),
        budgetMonthId: data.budgetMonthId,
        name: data.name,
        amount: data.amount,
        type: data.type,
        createdAt: now,
        updatedAt: now,
      };
    },
    update: async () => ({}) as ExpenseEntry,
    delete: async () => ({}) as ExpenseEntry,
  };
}

/** Arbitrary for a single item with name and positive amount. */
const itemArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  amount: fc.double({ min: 0.01, max: 999_999.99, noNaN: true }),
});

/**
 * Creates a mock IIncomeEntryRepository that also tracks items in the target month.
 * `findByBudgetMonth` returns source items or existing target items as appropriate.
 * `create` appends to the target store and returns the new entry.
 */
function createTrackingIncomeRepo(
  sourceItems: IncomeEntry[],
  existingTargetItems: IncomeEntry[],
): { repo: IIncomeEntryRepository; getTargetItems: () => IncomeEntry[] } {
  const targetStore = [...existingTargetItems];
  const repo: IIncomeEntryRepository = {
    findByBudgetMonth: async (budgetMonthId: string) =>
      budgetMonthId === SOURCE_MONTH_ID
        ? sourceItems.filter((i) => i.budgetMonthId === budgetMonthId)
        : targetStore.filter((i) => i.budgetMonthId === budgetMonthId),
    findById: async () => null,
    createMany: async () => {},
    create: async (data) => {
      const now = new Date();
      const entry: IncomeEntry = {
        id: crypto.randomUUID(),
        budgetMonthId: data.budgetMonthId,
        name: data.name,
        amount: data.amount,
        createdAt: now,
        updatedAt: now,
      };
      targetStore.push(entry);
      return entry;
    },
    update: async () => ({}) as IncomeEntry,
    delete: async () => ({}) as IncomeEntry,
  };
  return { repo, getTargetItems: () => targetStore };
}

/**
 * Creates a mock IExpenseEntryRepository that also tracks items in the target month.
 * `findByBudgetMonth` returns source items or existing target items as appropriate.
 * `create` appends to the target store and returns the new entry.
 */
function createTrackingExpenseRepo(
  sourceItems: ExpenseEntry[],
  existingTargetItems: ExpenseEntry[],
): { repo: IExpenseEntryRepository; getTargetItems: () => ExpenseEntry[] } {
  const targetStore = [...existingTargetItems];
  const repo: IExpenseEntryRepository = {
    findByBudgetMonth: async (budgetMonthId: string, type?) =>
      budgetMonthId === SOURCE_MONTH_ID
        ? sourceItems.filter(
            (i) => i.budgetMonthId === budgetMonthId && (!type || i.type === type),
          )
        : targetStore.filter(
            (i) => i.budgetMonthId === budgetMonthId && (!type || i.type === type),
          ),
    findById: async () => null,
    createMany: async () => {},
    create: async (data) => {
      const now = new Date();
      const entry: ExpenseEntry = {
        id: crypto.randomUUID(),
        budgetMonthId: data.budgetMonthId,
        name: data.name,
        amount: data.amount,
        type: data.type,
        createdAt: now,
        updatedAt: now,
      };
      targetStore.push(entry);
      return entry;
    },
    update: async () => ({}) as ExpenseEntry,
    delete: async () => ({}) as ExpenseEntry,
  };
  return { repo, getTargetItems: () => targetStore };
}

// Feature: copy-items-between-months, Property 4: Preservación de datos en la copia
describe("Property 4: Data preservation during copy", () => {
  it(
    "copied INCOME items preserve name and amount with unique IDs, count equals selection size",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(itemArb, { minLength: 1, maxLength: 15 }),
          async (items) => {
            const now = new Date();
            const sourceItems: IncomeEntry[] = items.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: SOURCE_MONTH_ID,
              name: item.name,
              amount: item.amount,
              createdAt: now,
              updatedAt: now,
            }));

            const incomeRepo = createMockIncomeRepo(sourceItems);
            const expenseRepo = createMockExpenseRepo([]);

            const result = await bulkCopyItems(incomeRepo, expenseRepo, {
              sourceBudgetMonthId: SOURCE_MONTH_ID,
              targetBudgetMonthId: TARGET_MONTH_ID,
              category: "INCOME",
              itemIds: sourceItems.map((i) => i.id),
            });

            // Count must equal the number of selected items
            expect(result.count).toBe(sourceItems.length);
            expect(result.copiedItems).toHaveLength(sourceItems.length);

            // Each copied item preserves name and amount but has a different ID
            for (let idx = 0; idx < sourceItems.length; idx++) {
              const original = sourceItems[idx];
              const copied = result.copiedItems[idx];
              expect(copied.name).toBe(original.name);
              expect(copied.amount).toBe(original.amount);
              expect(copied.id).not.toBe(original.id);
            }

            // All copied IDs are unique
            const ids = new Set(result.copiedItems.map((c) => c.id));
            expect(ids.size).toBe(result.copiedItems.length);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    "copied FIXED_EXPENSE items preserve name and amount with unique IDs, count equals selection size",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(itemArb, { minLength: 1, maxLength: 15 }),
          async (items) => {
            const now = new Date();
            const sourceItems: ExpenseEntry[] = items.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: SOURCE_MONTH_ID,
              name: item.name,
              amount: item.amount,
              type: "FIXED" as const,
              createdAt: now,
              updatedAt: now,
            }));

            const incomeRepo = createMockIncomeRepo([]);
            const expenseRepo = createMockExpenseRepo(sourceItems);

            const result = await bulkCopyItems(incomeRepo, expenseRepo, {
              sourceBudgetMonthId: SOURCE_MONTH_ID,
              targetBudgetMonthId: TARGET_MONTH_ID,
              category: "FIXED_EXPENSE",
              itemIds: sourceItems.map((i) => i.id),
            });

            expect(result.count).toBe(sourceItems.length);
            expect(result.copiedItems).toHaveLength(sourceItems.length);

            for (let idx = 0; idx < sourceItems.length; idx++) {
              const original = sourceItems[idx];
              const copied = result.copiedItems[idx];
              expect(copied.name).toBe(original.name);
              expect(copied.amount).toBe(original.amount);
              expect(copied.id).not.toBe(original.id);
            }

            const ids = new Set(result.copiedItems.map((c) => c.id));
            expect(ids.size).toBe(result.copiedItems.length);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    "copied VARIABLE_EXPENSE items preserve name and amount with unique IDs, count equals selection size",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(itemArb, { minLength: 1, maxLength: 15 }),
          async (items) => {
            const now = new Date();
            const sourceItems: ExpenseEntry[] = items.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: SOURCE_MONTH_ID,
              name: item.name,
              amount: item.amount,
              type: "VARIABLE" as const,
              createdAt: now,
              updatedAt: now,
            }));

            const incomeRepo = createMockIncomeRepo([]);
            const expenseRepo = createMockExpenseRepo(sourceItems);

            const result = await bulkCopyItems(incomeRepo, expenseRepo, {
              sourceBudgetMonthId: SOURCE_MONTH_ID,
              targetBudgetMonthId: TARGET_MONTH_ID,
              category: "VARIABLE_EXPENSE",
              itemIds: sourceItems.map((i) => i.id),
            });

            expect(result.count).toBe(sourceItems.length);
            expect(result.copiedItems).toHaveLength(sourceItems.length);

            for (let idx = 0; idx < sourceItems.length; idx++) {
              const original = sourceItems[idx];
              const copied = result.copiedItems[idx];
              expect(copied.name).toBe(original.name);
              expect(copied.amount).toBe(original.amount);
              expect(copied.id).not.toBe(original.id);
            }

            const ids = new Set(result.copiedItems.map((c) => c.id));
            expect(ids.size).toBe(result.copiedItems.length);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});


// Feature: copy-items-between-months, Property 5: Invariante de ítems existentes
describe("Property 5: Existing items invariant", () => {
  it(
    "existing INCOME items in target month remain unchanged after copy",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(itemArb, { minLength: 1, maxLength: 10 }),
          fc.array(itemArb, { minLength: 1, maxLength: 10 }),
          async (existingRaw, sourceRaw) => {
            const now = new Date();

            const existingItems: IncomeEntry[] = existingRaw.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: TARGET_MONTH_ID,
              name: item.name,
              amount: item.amount,
              createdAt: now,
              updatedAt: now,
            }));

            const sourceItems: IncomeEntry[] = sourceRaw.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: SOURCE_MONTH_ID,
              name: item.name,
              amount: item.amount,
              createdAt: now,
              updatedAt: now,
            }));

            // Snapshot existing items before copy
            const snapshot = existingItems.map((i) => ({
              id: i.id,
              name: i.name,
              amount: i.amount,
            }));

            const { repo: incomeRepo, getTargetItems } = createTrackingIncomeRepo(
              sourceItems,
              existingItems,
            );
            const expenseRepo = createMockExpenseRepo([]);

            await bulkCopyItems(incomeRepo, expenseRepo, {
              sourceBudgetMonthId: SOURCE_MONTH_ID,
              targetBudgetMonthId: TARGET_MONTH_ID,
              category: "INCOME",
              itemIds: sourceItems.map((i) => i.id),
            });

            // Verify existing items are still present and unchanged
            const targetItems = getTargetItems();
            for (const original of snapshot) {
              const found = targetItems.find((t) => t.id === original.id);
              expect(found).toBeDefined();
              expect(found!.name).toBe(original.name);
              expect(found!.amount).toBe(original.amount);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    "existing FIXED_EXPENSE items in target month remain unchanged after copy",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(itemArb, { minLength: 1, maxLength: 10 }),
          fc.array(itemArb, { minLength: 1, maxLength: 10 }),
          async (existingRaw, sourceRaw) => {
            const now = new Date();

            const existingItems: ExpenseEntry[] = existingRaw.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: TARGET_MONTH_ID,
              name: item.name,
              amount: item.amount,
              type: "FIXED" as const,
              createdAt: now,
              updatedAt: now,
            }));

            const sourceItems: ExpenseEntry[] = sourceRaw.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: SOURCE_MONTH_ID,
              name: item.name,
              amount: item.amount,
              type: "FIXED" as const,
              createdAt: now,
              updatedAt: now,
            }));

            const snapshot = existingItems.map((i) => ({
              id: i.id,
              name: i.name,
              amount: i.amount,
            }));

            const incomeRepo = createMockIncomeRepo([]);
            const { repo: expenseRepo, getTargetItems } = createTrackingExpenseRepo(
              sourceItems,
              existingItems,
            );

            await bulkCopyItems(incomeRepo, expenseRepo, {
              sourceBudgetMonthId: SOURCE_MONTH_ID,
              targetBudgetMonthId: TARGET_MONTH_ID,
              category: "FIXED_EXPENSE",
              itemIds: sourceItems.map((i) => i.id),
            });

            const targetItems = getTargetItems();
            for (const original of snapshot) {
              const found = targetItems.find((t) => t.id === original.id);
              expect(found).toBeDefined();
              expect(found!.name).toBe(original.name);
              expect(found!.amount).toBe(original.amount);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    "existing VARIABLE_EXPENSE items in target month remain unchanged after copy",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(itemArb, { minLength: 1, maxLength: 10 }),
          fc.array(itemArb, { minLength: 1, maxLength: 10 }),
          async (existingRaw, sourceRaw) => {
            const now = new Date();

            const existingItems: ExpenseEntry[] = existingRaw.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: TARGET_MONTH_ID,
              name: item.name,
              amount: item.amount,
              type: "VARIABLE" as const,
              createdAt: now,
              updatedAt: now,
            }));

            const sourceItems: ExpenseEntry[] = sourceRaw.map((item) => ({
              id: crypto.randomUUID(),
              budgetMonthId: SOURCE_MONTH_ID,
              name: item.name,
              amount: item.amount,
              type: "VARIABLE" as const,
              createdAt: now,
              updatedAt: now,
            }));

            const snapshot = existingItems.map((i) => ({
              id: i.id,
              name: i.name,
              amount: i.amount,
            }));

            const incomeRepo = createMockIncomeRepo([]);
            const { repo: expenseRepo, getTargetItems } = createTrackingExpenseRepo(
              sourceItems,
              existingItems,
            );

            await bulkCopyItems(incomeRepo, expenseRepo, {
              sourceBudgetMonthId: SOURCE_MONTH_ID,
              targetBudgetMonthId: TARGET_MONTH_ID,
              category: "VARIABLE_EXPENSE",
              itemIds: sourceItems.map((i) => i.id),
            });

            const targetItems = getTargetItems();
            for (const original of snapshot) {
              const found = targetItems.find((t) => t.id === original.id);
              expect(found).toBeDefined();
              expect(found!.name).toBe(original.name);
              expect(found!.amount).toBe(original.amount);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
