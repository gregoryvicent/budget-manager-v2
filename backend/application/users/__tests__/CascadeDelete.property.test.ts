import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { deleteUser } from "@/backend/application/users/DeleteUser";
import type { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import type { User } from "@/backend/domain/budgetManager/User";
import type { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";
import type { IncomeEntry } from "@/backend/domain/budgetManager/IncomeEntry";
import type { ExpenseEntry, ExpenseType } from "@/backend/domain/budgetManager/ExpenseEntry";
import type { SavingsGoal, GoalType } from "@/backend/domain/budgetManager/SavingsGoal";
import type { GoalMonthSetting } from "@/backend/domain/budgetManager/GoalMonthSetting";

// ---------------------------------------------------------------------------
// In-memory stores with cascade deletion (simulates Prisma onDelete: Cascade)
// ---------------------------------------------------------------------------

interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
}

interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

interface CascadeStores {
  users: User[];
  budgetMonths: BudgetMonth[];
  incomeEntries: IncomeEntry[];
  expenseEntries: ExpenseEntry[];
  savingsGoals: SavingsGoal[];
  goalMonthSettings: GoalMonthSetting[];
  accounts: Account[];
  sessions: Session[];
}

function createStores(): CascadeStores {
  return {
    users: [],
    budgetMonths: [],
    incomeEntries: [],
    expenseEntries: [],
    savingsGoals: [],
    goalMonthSettings: [],
    accounts: [],
    sessions: [],
  };
}


/**
 * Simulates Prisma onDelete: Cascade behavior.
 * When a user is deleted, all directly related records (BudgetMonth, SavingsGoal,
 * Account, Session) are removed. Indirectly related records (IncomeEntry,
 * ExpenseEntry, GoalMonthSetting) are removed via their parent cascade.
 */
function cascadeDeleteUser(stores: CascadeStores, userId: string): void {
  // Collect IDs of records that will cascade
  const budgetMonthIds = stores.budgetMonths
    .filter((b) => b.userId === userId)
    .map((b) => b.id);
  const savingsGoalIds = stores.savingsGoals
    .filter((g) => g.userId === userId)
    .map((g) => g.id);

  // Level 2 cascade: remove children of BudgetMonth and SavingsGoal
  stores.incomeEntries = stores.incomeEntries.filter(
    (e) => !budgetMonthIds.includes(e.budgetMonthId),
  );
  stores.expenseEntries = stores.expenseEntries.filter(
    (e) => !budgetMonthIds.includes(e.budgetMonthId),
  );
  stores.goalMonthSettings = stores.goalMonthSettings.filter(
    (g) =>
      !budgetMonthIds.includes(g.budgetMonthId) &&
      !savingsGoalIds.includes(g.savingsGoalId),
  );

  // Level 1 cascade: remove direct children of User
  stores.budgetMonths = stores.budgetMonths.filter((b) => b.userId !== userId);
  stores.savingsGoals = stores.savingsGoals.filter((g) => g.userId !== userId);
  stores.accounts = stores.accounts.filter((a) => a.userId !== userId);
  stores.sessions = stores.sessions.filter((s) => s.userId !== userId);

  // Remove the user
  stores.users = stores.users.filter((u) => u.id !== userId);
}

/**
 * Creates an IUserRepository backed by CascadeStores.
 * The delete method triggers full cascade deletion.
 */
function createCascadeUserRepo(stores: CascadeStores): IUserRepository {
  return {
    findAll: async () => [...stores.users],
    findById: async (id) => stores.users.find((u) => u.id === id) ?? null,
    findByEmail: async (email) => stores.users.find((u) => u.email === email) ?? null,
    findByEmailWithPassword: async (email) => {
      const u = stores.users.find((x) => x.email === email);
      return u ? { ...u, passwordHash: u.passwordHash ?? null } : null;
    },
    create: async (data) => {
      const now = new Date();
      const user: User = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      stores.users.push(user);
      return user;
    },
    createWithPassword: async (data) => {
      const now = new Date();
      const user: User = {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        createdAt: now,
        updatedAt: now,
      };
      stores.users.push(user);
      return user;
    },
    update: async (id, data) => {
      const u = stores.users.find((x) => x.id === id)!;
      Object.assign(u, data, { updatedAt: new Date() });
      return u;
    },
    delete: async (id) => {
      const user = stores.users.find((u) => u.id === id)!;
      cascadeDeleteUser(stores, id);
      return user;
    },
  };
}


// ---------------------------------------------------------------------------
// Helpers to seed data into stores
// ---------------------------------------------------------------------------

function seedUser(stores: CascadeStores, email: string, name: string): User {
  const now = new Date();
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash: "hashed_pw",
    createdAt: now,
    updatedAt: now,
  };
  stores.users.push(user);
  return user;
}

function seedBudgetMonth(stores: CascadeStores, userId: string, year: number, month: number): BudgetMonth {
  const now = new Date();
  const bm: BudgetMonth = { id: crypto.randomUUID(), userId, year, month, createdAt: now, updatedAt: now };
  stores.budgetMonths.push(bm);
  return bm;
}

function seedIncomeEntry(stores: CascadeStores, budgetMonthId: string, name: string, amount: number): IncomeEntry {
  const now = new Date();
  const entry: IncomeEntry = { id: crypto.randomUUID(), budgetMonthId, name, amount, createdAt: now, updatedAt: now };
  stores.incomeEntries.push(entry);
  return entry;
}

function seedExpenseEntry(stores: CascadeStores, budgetMonthId: string, name: string, amount: number, type: ExpenseType): ExpenseEntry {
  const now = new Date();
  const entry: ExpenseEntry = { id: crypto.randomUUID(), budgetMonthId, name, amount, type, createdAt: now, updatedAt: now };
  stores.expenseEntries.push(entry);
  return entry;
}

function seedSavingsGoal(stores: CascadeStores, userId: string, type: GoalType, title: string, goalAmount: number): SavingsGoal {
  const now = new Date();
  const goal: SavingsGoal = { id: crypto.randomUUID(), userId, type, title, goalAmount, totalContributed: 0, createdAt: now, updatedAt: now };
  stores.savingsGoals.push(goal);
  return goal;
}

function seedGoalMonthSetting(stores: CascadeStores, savingsGoalId: string, budgetMonthId: string, allocationPct: number): GoalMonthSetting {
  const now = new Date();
  const gms: GoalMonthSetting = {
    id: crypto.randomUUID(),
    savingsGoalId,
    budgetMonthId,
    allocationPct,
    amountContributed: null,
    createdAt: now,
    updatedAt: now,
  };
  stores.goalMonthSettings.push(gms);
  return gms;
}

function seedAccount(stores: CascadeStores, userId: string): Account {
  const acc: Account = {
    id: crypto.randomUUID(),
    userId,
    type: "credentials",
    provider: "credentials",
    providerAccountId: crypto.randomUUID(),
  };
  stores.accounts.push(acc);
  return acc;
}

function seedSession(stores: CascadeStores, userId: string): Session {
  const sess: Session = {
    id: crypto.randomUUID(),
    sessionToken: crypto.randomUUID(),
    userId,
    expires: new Date(Date.now() + 86400000),
  };
  stores.sessions.push(sess);
  return sess;
}


// ---------------------------------------------------------------------------
// Arbitrary generators
// ---------------------------------------------------------------------------

const arbName = () => fc.string({ minLength: 1, maxLength: 30 });
const arbEmail = () => fc.emailAddress();
const arbAmount = () => fc.double({ min: 0.01, max: 999999, noNaN: true });
const arbExpenseType = () => fc.constantFrom<ExpenseType>("FIXED", "VARIABLE");
const arbGoalType = () => fc.constantFrom<GoalType>("SAVINGS", "INVESTMENT");
const arbAllocationPct = () => fc.double({ min: 0.01, max: 100, noNaN: true });

// Generates a count for how many of each child entity to create
const arbChildCounts = () =>
  fc.record({
    budgetMonthCount: fc.integer({ min: 1, max: 3 }),
    incomePerBudget: fc.integer({ min: 1, max: 3 }),
    expensePerBudget: fc.integer({ min: 1, max: 3 }),
    savingsGoalCount: fc.integer({ min: 1, max: 2 }),
    goalMonthSettingCount: fc.integer({ min: 1, max: 2 }),
    accountCount: fc.integer({ min: 1, max: 2 }),
    sessionCount: fc.integer({ min: 1, max: 2 }),
  });

// ---------------------------------------------------------------------------
// Feature: nextauth-authentication, Property 10: Completitud de eliminación en cascada
// ---------------------------------------------------------------------------

describe("Property 10: Cascade deletion completeness", () => {
  it("deleting a user removes all associated records across all tables", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbName(),
        arbEmail(),
        arbChildCounts(),
        arbAmount(),
        arbExpenseType(),
        arbGoalType(),
        arbAllocationPct(),
        async (name, email, counts, amount, expType, goalType, allocPct) => {
          const stores = createStores();
          const userRepo = createCascadeUserRepo(stores);

          // Seed user
          const user = seedUser(stores, email, name);
          const userId = user.id;

          // Seed budget months with income and expense entries
          const budgetMonthIds: string[] = [];
          for (let i = 0; i < counts.budgetMonthCount; i++) {
            const bm = seedBudgetMonth(stores, userId, 2025, i + 1);
            budgetMonthIds.push(bm.id);

            for (let j = 0; j < counts.incomePerBudget; j++) {
              seedIncomeEntry(stores, bm.id, `Income ${j}`, amount);
            }
            for (let j = 0; j < counts.expensePerBudget; j++) {
              seedExpenseEntry(stores, bm.id, `Expense ${j}`, amount, expType);
            }
          }

          // Seed savings goals with goal month settings
          const savingsGoalIds: string[] = [];
          for (let i = 0; i < counts.savingsGoalCount; i++) {
            const goal = seedSavingsGoal(stores, userId, goalType, `Goal ${i}`, amount);
            savingsGoalIds.push(goal.id);

            // Link goal month settings to existing budget months
            const settingsToCreate = Math.min(counts.goalMonthSettingCount, budgetMonthIds.length);
            for (let j = 0; j < settingsToCreate; j++) {
              seedGoalMonthSetting(stores, goal.id, budgetMonthIds[j], allocPct);
            }
          }

          // Seed NextAuth records
          for (let i = 0; i < counts.accountCount; i++) {
            seedAccount(stores, userId);
          }
          for (let i = 0; i < counts.sessionCount; i++) {
            seedSession(stores, userId);
          }

          // Verify data was seeded
          expect(stores.users.filter((u) => u.id === userId).length).toBe(1);
          expect(stores.budgetMonths.filter((b) => b.userId === userId).length).toBeGreaterThan(0);
          expect(stores.incomeEntries.length).toBeGreaterThan(0);
          expect(stores.expenseEntries.length).toBeGreaterThan(0);
          expect(stores.savingsGoals.filter((g) => g.userId === userId).length).toBeGreaterThan(0);
          expect(stores.goalMonthSettings.length).toBeGreaterThan(0);
          expect(stores.accounts.filter((a) => a.userId === userId).length).toBeGreaterThan(0);
          expect(stores.sessions.filter((s) => s.userId === userId).length).toBeGreaterThan(0);

          // Delete the user via the use case
          await deleteUser(userRepo, userId);

          // Verify zero records remain for the deleted user across ALL tables
          expect(stores.users.filter((u) => u.id === userId).length).toBe(0);
          expect(stores.budgetMonths.filter((b) => b.userId === userId).length).toBe(0);
          expect(stores.savingsGoals.filter((g) => g.userId === userId).length).toBe(0);
          expect(stores.accounts.filter((a) => a.userId === userId).length).toBe(0);
          expect(stores.sessions.filter((s) => s.userId === userId).length).toBe(0);

          // Verify indirect cascades: no orphaned entries referencing deleted budget months or goals
          for (const bmId of budgetMonthIds) {
            expect(stores.incomeEntries.filter((e) => e.budgetMonthId === bmId).length).toBe(0);
            expect(stores.expenseEntries.filter((e) => e.budgetMonthId === bmId).length).toBe(0);
            expect(stores.goalMonthSettings.filter((g) => g.budgetMonthId === bmId).length).toBe(0);
          }
          for (const goalId of savingsGoalIds) {
            expect(stores.goalMonthSettings.filter((g) => g.savingsGoalId === goalId).length).toBe(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});


// ---------------------------------------------------------------------------
// Feature: nextauth-authentication, Property 11: Aislamiento en eliminación en cascada
// ---------------------------------------------------------------------------

/**
 * Helper to seed a full user with all related entities and return snapshot counts.
 */
function seedFullUser(
  stores: CascadeStores,
  email: string,
  name: string,
  counts: {
    budgetMonthCount: number;
    incomePerBudget: number;
    expensePerBudget: number;
    savingsGoalCount: number;
    goalMonthSettingCount: number;
    accountCount: number;
    sessionCount: number;
  },
  amount: number,
  expType: ExpenseType,
  goalType: GoalType,
  allocPct: number,
): { user: User; budgetMonthIds: string[]; savingsGoalIds: string[] } {
  const user = seedUser(stores, email, name);

  const budgetMonthIds: string[] = [];
  for (let i = 0; i < counts.budgetMonthCount; i++) {
    const bm = seedBudgetMonth(stores, user.id, 2025, i + 1);
    budgetMonthIds.push(bm.id);
    for (let j = 0; j < counts.incomePerBudget; j++) {
      seedIncomeEntry(stores, bm.id, `Income ${j}`, amount);
    }
    for (let j = 0; j < counts.expensePerBudget; j++) {
      seedExpenseEntry(stores, bm.id, `Expense ${j}`, amount, expType);
    }
  }

  const savingsGoalIds: string[] = [];
  for (let i = 0; i < counts.savingsGoalCount; i++) {
    const goal = seedSavingsGoal(stores, user.id, goalType, `Goal ${i}`, amount);
    savingsGoalIds.push(goal.id);
    const settingsToCreate = Math.min(counts.goalMonthSettingCount, budgetMonthIds.length);
    for (let j = 0; j < settingsToCreate; j++) {
      seedGoalMonthSetting(stores, goal.id, budgetMonthIds[j], allocPct);
    }
  }

  for (let i = 0; i < counts.accountCount; i++) {
    seedAccount(stores, user.id);
  }
  for (let i = 0; i < counts.sessionCount; i++) {
    seedSession(stores, user.id);
  }

  return { user, budgetMonthIds, savingsGoalIds };
}

describe("Property 11: Cascade deletion isolation", () => {
  it("deleting user A preserves all records belonging to user B", async () => {
    await fc.assert(
      fc.asyncProperty(
        arbName(),
        arbEmail(),
        arbName(),
        arbEmail(),
        arbChildCounts(),
        arbChildCounts(),
        arbAmount(),
        arbExpenseType(),
        arbGoalType(),
        arbAllocationPct(),
        async (
          nameA, emailA,
          nameB, emailB,
          countsA, countsB,
          amount, expType, goalType, allocPct,
        ) => {
          // Ensure distinct emails
          fc.pre(emailA !== emailB);

          const stores = createStores();
          const userRepo = createCascadeUserRepo(stores);

          // Seed both users with full data
          const { user: userA } = seedFullUser(
            stores, emailA, nameA, countsA, amount, expType, goalType, allocPct,
          );
          const { user: userB, budgetMonthIds: bmIdsB, savingsGoalIds: goalIdsB } = seedFullUser(
            stores, emailB, nameB, countsB, amount, expType, goalType, allocPct,
          );

          // Snapshot user B's record counts before deletion
          const beforeB = {
            budgetMonths: stores.budgetMonths.filter((b) => b.userId === userB.id).length,
            savingsGoals: stores.savingsGoals.filter((g) => g.userId === userB.id).length,
            accounts: stores.accounts.filter((a) => a.userId === userB.id).length,
            sessions: stores.sessions.filter((s) => s.userId === userB.id).length,
            incomeEntries: bmIdsB.reduce(
              (sum, bmId) => sum + stores.incomeEntries.filter((e) => e.budgetMonthId === bmId).length, 0,
            ),
            expenseEntries: bmIdsB.reduce(
              (sum, bmId) => sum + stores.expenseEntries.filter((e) => e.budgetMonthId === bmId).length, 0,
            ),
            goalMonthSettings: goalIdsB.reduce(
              (sum, gId) => sum + stores.goalMonthSettings.filter((g) => g.savingsGoalId === gId).length, 0,
            ),
          };

          // Verify both users have data
          expect(beforeB.budgetMonths).toBeGreaterThan(0);
          expect(beforeB.savingsGoals).toBeGreaterThan(0);

          // Delete user A
          await deleteUser(userRepo, userA.id);

          // Verify user A is gone
          expect(stores.users.find((u) => u.id === userA.id)).toBeUndefined();

          // Verify user B still exists
          expect(stores.users.find((u) => u.id === userB.id)).toBeDefined();

          // Verify user B's record counts are unchanged
          expect(stores.budgetMonths.filter((b) => b.userId === userB.id).length).toBe(beforeB.budgetMonths);
          expect(stores.savingsGoals.filter((g) => g.userId === userB.id).length).toBe(beforeB.savingsGoals);
          expect(stores.accounts.filter((a) => a.userId === userB.id).length).toBe(beforeB.accounts);
          expect(stores.sessions.filter((s) => s.userId === userB.id).length).toBe(beforeB.sessions);

          // Verify user B's indirect records are unchanged
          const afterIncomeB = bmIdsB.reduce(
            (sum, bmId) => sum + stores.incomeEntries.filter((e) => e.budgetMonthId === bmId).length, 0,
          );
          const afterExpenseB = bmIdsB.reduce(
            (sum, bmId) => sum + stores.expenseEntries.filter((e) => e.budgetMonthId === bmId).length, 0,
          );
          const afterGmsB = goalIdsB.reduce(
            (sum, gId) => sum + stores.goalMonthSettings.filter((g) => g.savingsGoalId === gId).length, 0,
          );

          expect(afterIncomeB).toBe(beforeB.incomeEntries);
          expect(afterExpenseB).toBe(beforeB.expenseEntries);
          expect(afterGmsB).toBe(beforeB.goalMonthSettings);
        },
      ),
      { numRuns: 100 },
    );
  });
});
