import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { NextRequest } from "next/server";

// Mock requireAuth
const mockRequireAuth = vi.fn();
vi.mock("@/lib/apiAuth", () => ({
  requireAuth: () => mockRequireAuth(),
}));

// Mock bulkCopyItems
const mockBulkCopyItems = vi.fn();
vi.mock("@/backend/application/budgetManager/BulkCopyItems", () => ({
  bulkCopyItems: (...args: unknown[]) => mockBulkCopyItems(...args),
}));

// Mock withIdempotency to execute the handler directly
vi.mock("@/lib/withIdempotency", () => ({
  withIdempotency: async ({ handler }: { handler: () => Promise<unknown> }) => ({
    response: await handler(),
    fromCache: false,
  }),
}));

// Mock Prisma repositories (module-level instantiation in route.ts)
const mockFindById = vi.fn();
vi.mock("@/backend/adapters/db/prisma/budgetManager/PrismaBudgetMonthRepository", () => {
  return {
    PrismaBudgetMonthRepository: class {
      findById = (...args: unknown[]) => mockFindById(...args);
    },
  };
});
vi.mock("@/backend/adapters/db/prisma/budgetManager/PrismaIncomeEntryRepository", () => {
  return { PrismaIncomeEntryRepository: class {} };
});
vi.mock("@/backend/adapters/db/prisma/budgetManager/PrismaExpenseEntryRepository", () => {
  return { PrismaExpenseEntryRepository: class {} };
});

import { POST } from "../route";

const USER_ID = "user-123";
const SOURCE_ID = "source-month-id";
const TARGET_ID = "target-month-id";
const VALID_CATEGORIES = ["INCOME", "FIXED_EXPENSE", "VARIABLE_EXPENSE"] as const;

/**
 * Builds a NextRequest with the given JSON body.
 */
function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL("http://localhost/api/bulk-copy"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** All four required field names for the bulk-copy endpoint. */
const REQUIRED_FIELDS = [
  "sourceBudgetMonthId",
  "targetBudgetMonthId",
  "category",
  "itemIds",
] as const;

// Feature: copy-items-between-months, Property 7: Validación de parámetros del endpoint
describe("Property 7: Endpoint parameter validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ userId: USER_ID });
  });

  it(
    "returns 400 when at least one required field is missing",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a non-empty subset of fields to REMOVE (at least 1 missing)
          fc.subarray(REQUIRED_FIELDS as unknown as string[], {
            minLength: 1,
            maxLength: 4,
          }),
          fc.constantFrom(...VALID_CATEGORIES),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          async (fieldsToRemove, category, itemIds) => {
            // Start with a complete valid body
            const fullBody: Record<string, unknown> = {
              sourceBudgetMonthId: SOURCE_ID,
              targetBudgetMonthId: TARGET_ID,
              category,
              itemIds,
            };

            // Remove the selected fields
            const body = { ...fullBody };
            for (const field of fieldsToRemove) {
              delete body[field];
            }

            const res = await POST(makeRequest(body));
            expect(res.status).toBe(400);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    "does not return 400 for validation when all required fields are present with valid values",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...VALID_CATEGORIES),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
          async (category, itemIds) => {
            // Mock ownership check — user owns both months
            mockFindById.mockImplementation((id: string) =>
              Promise.resolve({ id, userId: USER_ID, year: 2025, month: 1 }),
            );

            // Mock successful copy
            mockBulkCopyItems.mockResolvedValue({
              copiedItems: itemIds.map((id) => ({ id, name: "item", amount: 100 })),
              count: itemIds.length,
            });

            const body = {
              sourceBudgetMonthId: SOURCE_ID,
              targetBudgetMonthId: TARGET_ID,
              category,
              itemIds,
            };

            const res = await POST(makeRequest(body));

            // Should NOT be 400 — the request passes validation
            expect(res.status).not.toBe(400);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// Feature: copy-items-between-months, Property 8: Verificación de ownership
describe("Property 8: Ownership verification", () => {
  const OTHER_USER_ID = "other-user-456";

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ userId: USER_ID });
  });

  it(
    "returns 403 when the user does not own at least one of the two months",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate ownership pairs where at least one is false
          fc.tuple(fc.boolean(), fc.boolean()).filter(
            ([ownSource, ownTarget]) => !ownSource || !ownTarget,
          ),
          fc.constantFrom(...VALID_CATEGORIES),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          async ([ownsSource, ownsTarget], category, itemIds) => {
            mockFindById.mockImplementation((id: string) => {
              if (id === SOURCE_ID) {
                return Promise.resolve({
                  id: SOURCE_ID,
                  userId: ownsSource ? USER_ID : OTHER_USER_ID,
                  year: 2025,
                  month: 1,
                });
              }
              if (id === TARGET_ID) {
                return Promise.resolve({
                  id: TARGET_ID,
                  userId: ownsTarget ? USER_ID : OTHER_USER_ID,
                  year: 2025,
                  month: 2,
                });
              }
              return Promise.resolve(null);
            });

            const body = {
              sourceBudgetMonthId: SOURCE_ID,
              targetBudgetMonthId: TARGET_ID,
              category,
              itemIds,
            };

            const res = await POST(makeRequest(body));
            expect(res.status).toBe(403);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    "does not return 403 when the user owns both months",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...VALID_CATEGORIES),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          async (category, itemIds) => {
            // User owns both months
            mockFindById.mockImplementation((id: string) =>
              Promise.resolve({ id, userId: USER_ID, year: 2025, month: 1 }),
            );

            mockBulkCopyItems.mockResolvedValue({
              copiedItems: itemIds.map((id) => ({ id, name: "item", amount: 100 })),
              count: itemIds.length,
            });

            const body = {
              sourceBudgetMonthId: SOURCE_ID,
              targetBudgetMonthId: TARGET_ID,
              category,
              itemIds,
            };

            const res = await POST(makeRequest(body));
            expect(res.status).not.toBe(403);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    "returns 403 when source month is not found (null)",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...VALID_CATEGORIES),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          async (category, itemIds) => {
            mockFindById.mockImplementation((id: string) => {
              if (id === SOURCE_ID) return Promise.resolve(null);
              return Promise.resolve({ id, userId: USER_ID, year: 2025, month: 2 });
            });

            const body = {
              sourceBudgetMonthId: SOURCE_ID,
              targetBudgetMonthId: TARGET_ID,
              category,
              itemIds,
            };

            const res = await POST(makeRequest(body));
            expect(res.status).toBe(403);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    "returns 403 when target month is not found (null)",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...VALID_CATEGORIES),
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          async (category, itemIds) => {
            mockFindById.mockImplementation((id: string) => {
              if (id === TARGET_ID) return Promise.resolve(null);
              return Promise.resolve({ id, userId: USER_ID, year: 2025, month: 1 });
            });

            const body = {
              sourceBudgetMonthId: SOURCE_ID,
              targetBudgetMonthId: TARGET_ID,
              category,
              itemIds,
            };

            const res = await POST(makeRequest(body));
            expect(res.status).toBe(403);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});
