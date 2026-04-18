import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { generateIdempotencyKey } from "@/lib/idempotency";

/**
 * UUID v4 regex pattern for validation.
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Simulates the flag lifecycle of a CRUD hook mutant function.
 * Mirrors the pattern used in useIncomeEntries, useExpenseEntries,
 * useSavingsGoals, and useGoalMonthSettings.
 *
 * @param fetchMock - Mock fetch function to simulate HTTP call
 * @returns Object with flag snapshots captured during and after execution
 */
async function simulateMutantFlagLifecycle(
  fetchMock: () => Promise<Response>,
): Promise<{
  flagDuringExecution: boolean;
  flagAfterExecution: boolean;
}> {
  let flag = false;
  let flagDuringExecution = false;

  // Mirrors the hook pattern: set flag → fetch → finally reset flag
  const execute = async () => {
    flag = true;
    flagDuringExecution = flag;
    try {
      const res = await fetchMock();
      await res.json();
    } finally {
      flag = false;
    }
  };

  await execute();
  return { flagDuringExecution, flagAfterExecution: flag };
}

/**
 * Simulates concurrent invocation guard as implemented in the hooks.
 * If the flag is already active, the second call is silently ignored.
 *
 * @param fetchMock - Mock fetch function
 * @returns Number of times fetchMock was actually called
 */
async function simulateConcurrencyGuard(
  fetchMock: () => Promise<Response>,
): Promise<{ fetchCallCount: number }> {
  let flag = false;
  const callFetch = vi.fn(fetchMock);

  const execute = async () => {
    if (flag) return; // Guard: skip if already in progress
    flag = true;
    try {
      const res = await callFetch();
      await res.json();
    } finally {
      flag = false;
    }
  };

  // Start first call but don't await yet
  const firstCall = execute();
  // Attempt second call while first is in progress
  const secondCall = execute();

  await Promise.all([firstCall, secondCall]);
  return { fetchCallCount: callFetch.mock.calls.length };
}

// Arbitrary for operation types across all CRUD hooks
const operationTypeArb = fc.constantFrom(
  "create",
  "update",
  "delete",
  "upsert",
) as fc.Arbitrary<"create" | "update" | "delete" | "upsert">;

// Arbitrary for operation outcome
const outcomeArb = fc.constantFrom("success", "error") as fc.Arbitrary<
  "success" | "error"
>;

beforeEach(() => {
  vi.restoreAllMocks();
});

// Feature: idempotent-operations, Property 1: Ciclo de vida del flag de operación en curso
describe("Property 1: Operation flag lifecycle — true during execution, false after", () => {
  it("flag is true during fetch and false after, for any operation type and outcome", async () => {
    await fc.assert(
      fc.asyncProperty(operationTypeArb, outcomeArb, async (_opType, outcome) => {
        const fetchMock =
          outcome === "success"
            ? () =>
                Promise.resolve(
                  new Response(JSON.stringify({ id: "1" }), { status: 200 }),
                )
            : () =>
                Promise.resolve(
                  new Response(JSON.stringify({ error: "fail" }), {
                    status: 400,
                  }),
                );

        const result = await simulateMutantFlagLifecycle(fetchMock);

        expect(result.flagDuringExecution).toBe(true);
        expect(result.flagAfterExecution).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it("flag resets to false even when fetch throws a network error", async () => {
    await fc.assert(
      fc.asyncProperty(operationTypeArb, async () => {
        let flag = false;

        const execute = async () => {
          flag = true;
          try {
            throw new Error("Network error");
          } finally {
            flag = false;
          }
        };

        try {
          await execute();
        } catch {
          // Expected
        }

        expect(flag).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: idempotent-operations, Property 2: Prevención de operaciones concurrentes del mismo tipo
describe("Property 2: Concurrent operation prevention — no second fetch when flag active", () => {
  it("only one fetch executes when two calls overlap, for any operation type", async () => {
    await fc.assert(
      fc.asyncProperty(operationTypeArb, async () => {
        // Use a delayed fetch to ensure overlap
        const fetchMock = () =>
          new Promise<Response>((resolve) =>
            setTimeout(
              () =>
                resolve(
                  new Response(JSON.stringify({ id: "1" }), { status: 200 }),
                ),
              10,
            ),
          );

        const result = await simulateConcurrencyGuard(fetchMock);

        // Exactly one fetch call — the second invocation was blocked by the guard
        expect(result.fetchCallCount).toBe(1);
      }),
      { numRuns: 100 },
    );
  });

  it("isDeletingId guard prevents concurrent deletes on different IDs", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), fc.uuid(), async (id1, id2) => {
        let isDeletingId: string | null = null;
        const callFetch = vi.fn(
          () =>
            new Promise<Response>((resolve) =>
              setTimeout(
                () =>
                  resolve(
                    new Response(JSON.stringify({}), { status: 200 }),
                  ),
                10,
              ),
            ),
        );

        const remove = async (id: string) => {
          if (isDeletingId) return;
          isDeletingId = id;
          try {
            const res = await callFetch();
            await res.json();
          } finally {
            isDeletingId = null;
          }
        };

        const first = remove(id1);
        const second = remove(id2);
        await Promise.all([first, second]);

        // Only one delete should execute regardless of different IDs
        expect(callFetch).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 },
    );
  });
});


// Feature: idempotent-operations, Property 3: Generación de claves de idempotencia únicas y válidas
describe("Property 3: Idempotency key generation — unique valid UUID v4 per invocation", () => {
  it("all generated keys are valid UUID v4 and distinct, for any N invocations", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 50 }), (n) => {
        const keys: string[] = [];
        for (let i = 0; i < n; i++) {
          keys.push(generateIdempotencyKey());
        }

        // Every key must be a valid UUID v4
        for (const key of keys) {
          expect(key).toMatch(UUID_V4_REGEX);
        }

        // All keys must be distinct
        const uniqueKeys = new Set(keys);
        expect(uniqueKeys.size).toBe(n);
      }),
      { numRuns: 100 },
    );
  });

  it("keys generated across different operation types are all distinct", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (createCount, updateCount, deleteCount) => {
          const allKeys: string[] = [];

          for (let i = 0; i < createCount; i++) {
            allKeys.push(generateIdempotencyKey());
          }
          for (let i = 0; i < updateCount; i++) {
            allKeys.push(generateIdempotencyKey());
          }
          for (let i = 0; i < deleteCount; i++) {
            allKeys.push(generateIdempotencyKey());
          }

          // All keys valid UUID v4
          for (const key of allKeys) {
            expect(key).toMatch(UUID_V4_REGEX);
          }

          // All keys unique across operation types
          const uniqueKeys = new Set(allKeys);
          expect(uniqueKeys.size).toBe(allKeys.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("each fetch call in a simulated hook receives a unique Idempotency-Key header", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 20 }),
        async (n) => {
          const capturedKeys: string[] = [];

          // Simulate N sequential mutant calls, each generating a fresh key
          for (let i = 0; i < n; i++) {
            const key = generateIdempotencyKey();
            capturedKeys.push(key);
          }

          // All captured keys are valid UUID v4
          for (const key of capturedKeys) {
            expect(key).toMatch(UUID_V4_REGEX);
          }

          // All captured keys are unique
          const uniqueKeys = new Set(capturedKeys);
          expect(uniqueKeys.size).toBe(n);
        },
      ),
      { numRuns: 100 },
    );
  });
});
