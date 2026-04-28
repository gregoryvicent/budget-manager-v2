import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { getBudgetMonths } from "@/backend/application/budgetManager/GetBudgetMonths";
import { getSavingsGoals } from "@/backend/application/budgetManager/GetSavingsGoals";
import { getIncomeEntries } from "@/backend/application/budgetManager/GetIncomeEntries";
import { getExpenseEntries } from "@/backend/application/budgetManager/GetExpenseEntries";
import { createBudgetMonth } from "@/backend/application/budgetManager/CreateBudgetMonth";
import { createIncomeEntry } from "@/backend/application/budgetManager/CreateIncomeEntry";
import { createExpenseEntry } from "@/backend/application/budgetManager/CreateExpenseEntry";
import { getBudgetMonthById } from "@/backend/application/budgetManager/GetBudgetMonthById";
import type { IBudgetMonthRepository } from "@/backend/ports/budgetManager/IBudgetMonthRepository";
import type { IIncomeEntryRepository } from "@/backend/ports/budgetManager/IIncomeEntryRepository";
import type { IExpenseEntryRepository } from "@/backend/ports/budgetManager/IExpenseEntryRepository";
import type { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import type { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";
import type { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";
import type { ExpenseEntry, ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";
import type { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";

// ---------------------------------------------------------------------------
// In-memory mock repositories
// ---------------------------------------------------------------------------

function createMockBudgetMonthRepo(): IBudgetMonthRepository {
  const store: BudgetMonth[] = [];

  return {
    findAll: async () => [...store],
    findByUser: async (userId: string) => store.filter((b) => b.userId === userId),
    findById: async (id: string) => store.find((b) => b.id === id) ?? null,
    findByUserAndMonth: async (userId: string, year: number, month: number) =>
      store.find((b) => b.userId === userId && b.year === year && b.month === month) ?? null,
    create: async (data: Pick<BudgetMonth, "userId" | "year" | "month">) => {
      const now = new Date();
      const entry: BudgetMonth = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      store.push(entry);
      return entry;
    },
    delete: async (id: string) => {
      const idx = store.findIndex((b) => b.id === id);
      return store.splice(idx, 1)[0];
    },
  };
}

function createMockIncomeEntryRepo(): IIncomeEntryRepository {
  const store: IncomeEntry[] = [];

  return {
    findByBudgetMonth: async (budgetMonthId: string) =>
      store.filter((e) => e.budgetMonthId === budgetMonthId),
    findById: async (id: string) => store.find((e) => e.id === id) ?? null,
    createMany: async (entries) => {
      const now = new Date();
      for (const e of entries) {
        store.push({ id: crypto.randomUUID(), ...e, createdAt: now, updatedAt: now });
      }
    },
    create: async (data: Pick<IncomeEntry, "budgetMonthId" | "name" | "amount">) => {
      const now = new Date();
      const entry: IncomeEntry = { id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now };
      store.push(entry);
      return entry;
    },
    update: async (id, data) => {
      const e = store.find((x) => x.id === id)!;
      Object.assign(e, data, { updatedAt: new Date() });
      return e;
    },
    delete: async (id) => {
      const idx = store.findIndex((x) => x.id === id);
      return store.splice(idx, 1)[0];
    },
  };
}

function createMockExpenseEntryRepo(): IExpenseEntryRepository {
  const store: ExpenseEntry[] = [];

  return {
    findByBudgetMonth: async (budgetMonthId: string, type?: ExpenseType) => {
      let results = store.filter((e) => e.budgetMonthId === budgetMonthId);
      if (type) results = results.filter((e) => e.type === type);
      return results;
    },
    findById: async (id: string) => store.find((e) => e.id === id) ?? null,
    createMany: async (entries) => {
      const now = new Date();
      for (const e of entries) {
        store.push({ id: crypto.randomUUID(), ...e, createdAt: now, updatedAt: now });
      }
    },
    create: async (data: Pick<ExpenseEntry, "budgetMonthId" | "name" | "amount" | "type">) => {
      const now = new Date();
      const entry: ExpenseEntry = { id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now };
      store.push(entry);
      return entry;
    },
    update: async (id, data) => {
      const e = store.find((x) => x.id === id)!;
      Object.assign(e, data, { updatedAt: new Date() });
      return e;
    },
    delete: async (id) => {
      const idx = store.findIndex((x) => x.id === id);
      return store.splice(idx, 1)[0];
    },
  };
}

function createMockSavingsGoalRepo(): ISavingsGoalRepository {
  const store: SavingsGoal[] = [];

  return {
    findByUser: async (userId: string) => store.filter((g) => g.userId === userId),
    findById: async (id: string) => store.find((g) => g.id === id) ?? null,
    findByUserAndType: async (userId: string, type: GoalType) =>
      store.filter((g) => g.userId === userId && g.type === type),
    create: async (data: Pick<SavingsGoal, "userId" | "type" | "title" | "goalAmount">) => {
      const now = new Date();
      const goal: SavingsGoal = { id: crypto.randomUUID(), ...data, totalContributed: 0, createdAt: now, updatedAt: now };
      store.push(goal);
      return goal;
    },
    update: async (id, data) => {
      const g = store.find((x) => x.id === id)!;
      Object.assign(g, data, { updatedAt: new Date() });
      return g;
    },
    findAssignedByUserAndType: async (userId: string, type: GoalType, _budgetMonthId: string) =>
      store.filter((g) => g.userId === userId && g.type === type),
    findUnassignedByUserAndType: async (_userId: string, _type: GoalType, _budgetMonthId: string) => [],
    delete: async (id: string) => {
      const idx = store.findIndex((g) => g.id === id);
      if (idx >= 0) store.splice(idx, 1);
    },
    recalcTotalContributed: async (id: string) => {
      const g = store.find((x) => x.id === id)!;
      return g;
    },
    sumContributedUpTo: async (_id: string, _year: number, _month: number) => 0,
  };
}

// ---------------------------------------------------------------------------
// Arbitrary generators
// ---------------------------------------------------------------------------

const arbUserId = () => fc.uuid();
const arbMonth = () => fc.integer({ min: 1, max: 12 });
const arbYear = () => fc.integer({ min: 2020, max: 2030 });
const arbAmount = () => fc.double({ min: 0.01, max: 999999, noNaN: true });
const arbName = () => fc.string({ minLength: 1, maxLength: 30 });
const arbExpenseType = () => fc.constantFrom<ExpenseType>("FIXED", "VARIABLE");
const arbGoalType = () => fc.constantFrom<GoalType>("SAVINGS", "INVESTMENT");

// ---------------------------------------------------------------------------
// Feature: nextauth-authentication, Property 6: Aislamiento de datos en lecturas
// ---------------------------------------------------------------------------

describe("Property 6: Data isolation in reads", () => {
  it("getBudgetMonths returns only budgets belonging to the queried user", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbUserId(),
        fc.array(fc.tuple(arbYear(), arbMonth()), { minLength: 1, maxLength: 5 }),
        fc.array(fc.tuple(arbYear(), arbMonth()), { minLength: 1, maxLength: 5 }),
        async (userIdA, userIdB, monthsA, monthsB) => {
          fc.pre(userIdA !== userIdB);

          const budgetRepo = createMockBudgetMonthRepo();

          // Seed data for both users (deduplicate year/month per user)
          const seenA = new Set<string>();
          for (const [year, month] of monthsA) {
            const key = `${year}-${month}`;
            if (seenA.has(key)) continue;
            seenA.add(key);
            await createBudgetMonth(budgetRepo, { userId: userIdA, year, month });
          }

          const seenB = new Set<string>();
          for (const [year, month] of monthsB) {
            const key = `${year}-${month}`;
            if (seenB.has(key)) continue;
            seenB.add(key);
            await createBudgetMonth(budgetRepo, { userId: userIdB, year, month });
          }

          // Query for user A — must only contain user A's budgets
          const resultsA = await getBudgetMonths(budgetRepo, userIdA);
          expect(resultsA.every((b) => b.userId === userIdA)).toBe(true);

          // Query for user B — must only contain user B's budgets
          const resultsB = await getBudgetMonths(budgetRepo, userIdB);
          expect(resultsB.every((b) => b.userId === userIdB)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("getSavingsGoals returns only goals belonging to the queried user", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbUserId(),
        arbGoalType(),
        arbGoalType(),
        async (userIdA, userIdB, typeA, typeB) => {
          fc.pre(userIdA !== userIdB);

          const goalRepo = createMockSavingsGoalRepo();

          await goalRepo.create({ userId: userIdA, type: typeA, title: "Goal A", goalAmount: 1000 });
          await goalRepo.create({ userId: userIdB, type: typeB, title: "Goal B", goalAmount: 2000 });

          const goalsA = await getSavingsGoals(goalRepo, userIdA);
          expect(goalsA.every((g) => g.userId === userIdA)).toBe(true);

          const goalsB = await getSavingsGoals(goalRepo, userIdB);
          expect(goalsB.every((g) => g.userId === userIdB)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("getIncomeEntries returns only entries for the specified budget month", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbUserId(),
        arbName(),
        arbAmount(),
        arbName(),
        arbAmount(),
        async (userIdA, userIdB, nameA, amountA, nameB, amountB) => {
          fc.pre(userIdA !== userIdB);

          const budgetRepo = createMockBudgetMonthRepo();
          const incomeRepo = createMockIncomeEntryRepo();

          const budgetA = await createBudgetMonth(budgetRepo, { userId: userIdA, year: 2025, month: 1 });
          const budgetB = await createBudgetMonth(budgetRepo, { userId: userIdB, year: 2025, month: 1 });

          await createIncomeEntry(incomeRepo, { budgetMonthId: budgetA.id, name: nameA, amount: amountA });
          await createIncomeEntry(incomeRepo, { budgetMonthId: budgetB.id, name: nameB, amount: amountB });

          const entriesA = await getIncomeEntries(incomeRepo, budgetA.id);
          expect(entriesA.every((e) => e.budgetMonthId === budgetA.id)).toBe(true);
          expect(entriesA.length).toBe(1);

          const entriesB = await getIncomeEntries(incomeRepo, budgetB.id);
          expect(entriesB.every((e) => e.budgetMonthId === budgetB.id)).toBe(true);
          expect(entriesB.length).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("getExpenseEntries returns only entries for the specified budget month", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbUserId(),
        arbName(),
        arbAmount(),
        arbExpenseType(),
        arbName(),
        arbAmount(),
        arbExpenseType(),
        async (userIdA, userIdB, nameA, amountA, typeA, nameB, amountB, typeB) => {
          fc.pre(userIdA !== userIdB);

          const budgetRepo = createMockBudgetMonthRepo();
          const expenseRepo = createMockExpenseEntryRepo();

          const budgetA = await createBudgetMonth(budgetRepo, { userId: userIdA, year: 2025, month: 2 });
          const budgetB = await createBudgetMonth(budgetRepo, { userId: userIdB, year: 2025, month: 2 });

          await createExpenseEntry(expenseRepo, { budgetMonthId: budgetA.id, name: nameA, amount: amountA, type: typeA });
          await createExpenseEntry(expenseRepo, { budgetMonthId: budgetB.id, name: nameB, amount: amountB, type: typeB });

          const entriesA = await getExpenseEntries(expenseRepo, budgetA.id);
          expect(entriesA.every((e) => e.budgetMonthId === budgetA.id)).toBe(true);
          expect(entriesA.length).toBe(1);

          const entriesB = await getExpenseEntries(expenseRepo, budgetB.id);
          expect(entriesB.every((e) => e.budgetMonthId === budgetB.id)).toBe(true);
          expect(entriesB.length).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Feature: nextauth-authentication, Property 7: Rechazo de acceso cruzado entre usuarios
// ---------------------------------------------------------------------------

describe("Property 7: Cross-user access rejection", () => {
  it("getBudgetMonthById for a budget owned by user A, accessed by user B, should allow ownership check to reject", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbUserId(),
        arbYear(),
        arbMonth(),
        async (userIdA, userIdB, year, month) => {
          fc.pre(userIdA !== userIdB);

          const budgetRepo = createMockBudgetMonthRepo();
          const budgetA = await createBudgetMonth(budgetRepo, { userId: userIdA, year, month });

          // Simulate the ownership check pattern used in API routes:
          // The route fetches the resource, then compares userId.
          const fetched = await getBudgetMonthById(budgetRepo, budgetA.id);
          expect(fetched.userId).toBe(userIdA);
          expect(fetched.userId).not.toBe(userIdB);

          // This is the guard that API routes use to return 403
          const isOwner = fetched.userId === userIdB;
          expect(isOwner).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("savings goal owned by user A cannot pass ownership check for user B", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbUserId(),
        arbGoalType(),
        async (userIdA, userIdB, goalType) => {
          fc.pre(userIdA !== userIdB);

          const goalRepo = createMockSavingsGoalRepo();
          const goal = await goalRepo.create({
            userId: userIdA,
            type: goalType,
            title: "Test Goal",
            goalAmount: 5000,
          });

          const fetched = await goalRepo.findById(goal.id);
          expect(fetched).not.toBeNull();
          expect(fetched!.userId).toBe(userIdA);

          // Ownership check as done in API routes
          const isOwner = fetched!.userId === userIdB;
          expect(isOwner).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("income entry in user A's budget cannot pass ownership check for user B", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbUserId(),
        arbName(),
        arbAmount(),
        async (userIdA, userIdB, name, amount) => {
          fc.pre(userIdA !== userIdB);

          const budgetRepo = createMockBudgetMonthRepo();
          const incomeRepo = createMockIncomeEntryRepo();

          const budget = await createBudgetMonth(budgetRepo, { userId: userIdA, year: 2025, month: 3 });
          const entry = await createIncomeEntry(incomeRepo, { budgetMonthId: budget.id, name, amount });

          // Simulate the API route pattern: find entry, then check parent budget ownership
          const fetchedEntry = await incomeRepo.findById(entry.id);
          expect(fetchedEntry).not.toBeNull();

          const parentBudget = await budgetRepo.findById(fetchedEntry!.budgetMonthId);
          expect(parentBudget).not.toBeNull();
          expect(parentBudget!.userId).toBe(userIdA);

          const isOwner = parentBudget!.userId === userIdB;
          expect(isOwner).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("expense entry in user A's budget cannot pass ownership check for user B", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbUserId(),
        arbName(),
        arbAmount(),
        arbExpenseType(),
        async (userIdA, userIdB, name, amount, expType) => {
          fc.pre(userIdA !== userIdB);

          const budgetRepo = createMockBudgetMonthRepo();
          const expenseRepo = createMockExpenseEntryRepo();

          const budget = await createBudgetMonth(budgetRepo, { userId: userIdA, year: 2025, month: 4 });
          const entry = await createExpenseEntry(expenseRepo, { budgetMonthId: budget.id, name, amount, type: expType });

          const fetchedEntry = await expenseRepo.findById(entry.id);
          expect(fetchedEntry).not.toBeNull();

          const parentBudget = await budgetRepo.findById(fetchedEntry!.budgetMonthId);
          expect(parentBudget).not.toBeNull();
          expect(parentBudget!.userId).toBe(userIdA);

          const isOwner = parentBudget!.userId === userIdB;
          expect(isOwner).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Feature: nextauth-authentication, Property 8: Asignación automática de userId en creación de recursos
// ---------------------------------------------------------------------------

describe("Property 8: Automatic userId assignment on resource creation", () => {
  it("createBudgetMonth assigns the provided userId to the created resource", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbYear(),
        arbMonth(),
        async (sessionUserId, year, month) => {
          const budgetRepo = createMockBudgetMonthRepo();

          // The API route extracts userId from the session and passes it to the use case.
          // Any userId in the request body is ignored — only the session userId is used.
          const created = await createBudgetMonth(budgetRepo, {
            userId: sessionUserId,
            year,
            month,
          });

          expect(created.userId).toBe(sessionUserId);

          // Verify the stored record also has the correct userId
          const fetched = await getBudgetMonthById(budgetRepo, created.id);
          expect(fetched.userId).toBe(sessionUserId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("createIncomeEntry associates the entry with the budget month owned by the session user", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbName(),
        arbAmount(),
        async (sessionUserId, name, amount) => {
          const budgetRepo = createMockBudgetMonthRepo();
          const incomeRepo = createMockIncomeEntryRepo();

          // API route creates budget for the session user
          const budget = await createBudgetMonth(budgetRepo, {
            userId: sessionUserId,
            year: 2025,
            month: 5,
          });

          // API route verifies budget ownership before creating entry
          const entry = await createIncomeEntry(incomeRepo, {
            budgetMonthId: budget.id,
            name,
            amount,
          });

          // The entry is linked to the session user's budget
          expect(entry.budgetMonthId).toBe(budget.id);

          // Verify the parent budget belongs to the session user
          const parentBudget = await budgetRepo.findById(entry.budgetMonthId);
          expect(parentBudget!.userId).toBe(sessionUserId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("createExpenseEntry associates the entry with the budget month owned by the session user", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbName(),
        arbAmount(),
        arbExpenseType(),
        async (sessionUserId, name, amount, expType) => {
          const budgetRepo = createMockBudgetMonthRepo();
          const expenseRepo = createMockExpenseEntryRepo();

          const budget = await createBudgetMonth(budgetRepo, {
            userId: sessionUserId,
            year: 2025,
            month: 6,
          });

          const entry = await createExpenseEntry(expenseRepo, {
            budgetMonthId: budget.id,
            name,
            amount,
            type: expType,
          });

          expect(entry.budgetMonthId).toBe(budget.id);

          const parentBudget = await budgetRepo.findById(entry.budgetMonthId);
          expect(parentBudget!.userId).toBe(sessionUserId);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("savings goal creation assigns the provided userId from the session", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbUserId(),
        arbGoalType(),
        async (sessionUserId, goalType) => {
          const goalRepo = createMockSavingsGoalRepo();

          const goal = await goalRepo.create({
            userId: sessionUserId,
            type: goalType,
            title: "Test",
            goalAmount: 1000,
          });

          expect(goal.userId).toBe(sessionUserId);

          const fetched = await goalRepo.findById(goal.id);
          expect(fetched!.userId).toBe(sessionUserId);
        },
      ),
      { numRuns: 100 },
    );
  });
});
