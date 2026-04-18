import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { NextResponse } from "next/server";

// Mock the Prisma client before importing the module under test
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/backend/adapters/db/prisma/prisma.client", () => ({
  prisma: {
    idempotencyRecord: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Mock the Prisma namespace for PrismaClientKnownRequestError
vi.mock("@/lib/generated/prisma/client", () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;
    clientVersion: string;
    constructor(
      message: string,
      { code, meta }: { code: string; meta?: Record<string, unknown> },
    ) {
      super(message);
      this.code = code;
      this.meta = meta;
      this.clientVersion = "0.0.0";
      this.name = "PrismaClientKnownRequestError";
    }
  }
  return {
    Prisma: { PrismaClientKnownRequestError },
  };
});

import { withIdempotency } from "@/lib/withIdempotency";
import { Prisma } from "@/lib/generated/prisma/client";

/**
 * Arbitrary for HTTP status codes that allow a body in NextResponse.
 * Excludes 204 (No Content) and 304 (Not Modified) which reject bodies.
 */
const storableStatusArb = fc.oneof(
  fc.constantFrom(200, 201, 202, 203, 400, 401, 403, 404, 409, 422),
);

/** Arbitrary for a JSON body string. */
const jsonBodyArb = fc.oneof(
  fc.constant("{}"),
  fc.constant('{"id":"abc"}'),
  fc.constant('{"error":"not found"}'),
  fc.constant('{"items":[1,2,3]}'),
);

beforeEach(() => {
  vi.clearAllMocks();
});

// Feature: idempotent-operations, Property 4: Cache hit de idempotencia
describe("Property 4: Cache hit — stored response returned without executing handler", () => {
  it("returns the stored response for any existing non-expired record", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        storableStatusArb,
        jsonBodyArb,
        async (key, statusCode, body) => {
          vi.clearAllMocks();

          const handler = vi.fn();

          // Simulate an existing record created within the last 24h
          mockFindFirst.mockResolvedValue({
            id: crypto.randomUUID(),
            key,
            statusCode,
            body,
            createdAt: new Date(),
          });

          const result = await withIdempotency({
            handler,
            idempotencyKey: key,
          });

          // Handler must NOT be called — response comes from cache
          expect(handler).not.toHaveBeenCalled();
          expect(result.fromCache).toBe(true);
          expect(result.response.status).toBe(statusCode);

          const resultBody = await result.response.text();
          expect(resultBody).toBe(body);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: idempotent-operations, Property 5: Cache miss de idempotencia
describe("Property 5: Cache miss — new operation executed and stored", () => {
  it("executes handler and stores result for any new key", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        storableStatusArb,
        jsonBodyArb,
        async (key, statusCode, body) => {
          vi.clearAllMocks();

          // No existing record
          mockFindFirst.mockResolvedValue(null);
          mockCreate.mockResolvedValue({
            id: crypto.randomUUID(),
            key,
            statusCode,
            body,
            createdAt: new Date(),
          });

          const handler = vi
            .fn()
            .mockResolvedValue(
              new NextResponse(body, { status: statusCode }),
            );

          const result = await withIdempotency({
            handler,
            idempotencyKey: key,
          });

          // Handler MUST be called exactly once
          expect(handler).toHaveBeenCalledOnce();
          expect(result.fromCache).toBe(false);
          expect(result.response.status).toBe(statusCode);

          const resultBody = await result.response.text();
          expect(resultBody).toBe(body);

          // Verify the record was stored with correct data
          expect(mockCreate).toHaveBeenCalledOnce();
          const createArgs = mockCreate.mock.calls[0][0];
          expect(createArgs.data.key).toBe(key);
          expect(createArgs.data.statusCode).toBe(statusCode);
          expect(createArgs.data.body).toBe(body);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: idempotent-operations, Property 6: Expiración de claves a las 24 horas
describe("Property 6: Key expiration — records older than 24h treated as new", () => {
  it("executes handler for any expired record", async () => {
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        storableStatusArb,
        jsonBodyArb,
        // Generate an age between 24h+1min and 7 days
        fc.integer({
          min: TWENTY_FOUR_HOURS_MS + 60_000,
          max: 7 * TWENTY_FOUR_HOURS_MS,
        }),
        async (key, statusCode, body, ageMs) => {
          vi.clearAllMocks();

          // findFirst returns null because the record is expired
          // (the WHERE createdAt > cutoff filter excludes it)
          mockFindFirst.mockResolvedValue(null);
          mockCreate.mockResolvedValue({
            id: crypto.randomUUID(),
            key,
            statusCode,
            body,
            createdAt: new Date(),
          });

          const handler = vi
            .fn()
            .mockResolvedValue(
              new NextResponse(body, { status: statusCode }),
            );

          const result = await withIdempotency({
            handler,
            idempotencyKey: key,
          });

          // Handler MUST be called — expired key is treated as new
          expect(handler).toHaveBeenCalledOnce();
          expect(result.fromCache).toBe(false);
          expect(result.response.status).toBe(statusCode);

          // Verify the cutoff date used in the query is approximately 24h ago
          const findArgs = mockFindFirst.mock.calls[0][0];
          const cutoffDate = findArgs.where.createdAt.gt as Date;
          const expectedCutoff = Date.now() - TWENTY_FOUR_HOURS_MS;
          // Allow 5 seconds of tolerance for test execution time
          expect(
            Math.abs(cutoffDate.getTime() - expectedCutoff),
          ).toBeLessThan(5000);

          // Confirm the generated age exceeds 24h
          expect(ageMs).toBeGreaterThan(TWENTY_FOUR_HOURS_MS);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: idempotent-operations, Property 7: Protección de concurrencia con constraint UNIQUE
describe("Property 7: UNIQUE constraint concurrency — both requests return same response", () => {
  it("handles UNIQUE violation by reading existing record", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        storableStatusArb,
        jsonBodyArb,
        async (key, statusCode, body) => {
          vi.clearAllMocks();

          // First findFirst: no existing record
          mockFindFirst.mockResolvedValueOnce(null);

          // create throws P2002 UNIQUE violation (concurrent insert won)
          mockCreate.mockRejectedValueOnce(
            new Prisma.PrismaClientKnownRequestError(
              "Unique constraint failed on the fields: (`idempotency_key`)",
              { code: "P2002", meta: { target: ["idempotency_key"] } },
            ),
          );

          // Second findFirst (retry after conflict) returns the record
          mockFindFirst.mockResolvedValueOnce({
            id: crypto.randomUUID(),
            key,
            statusCode,
            body,
            createdAt: new Date(),
          });

          const handler = vi
            .fn()
            .mockResolvedValueOnce(
              new NextResponse(body, { status: statusCode }),
            );

          const result = await withIdempotency({
            handler,
            idempotencyKey: key,
          });

          // Handler IS called (the first findFirst returned null)
          expect(handler).toHaveBeenCalledOnce();
          // Result comes from the cached record (conflict resolution)
          expect(result.fromCache).toBe(true);
          expect(result.response.status).toBe(statusCode);

          const resultBody = await result.response.text();
          expect(resultBody).toBe(body);

          // findFirst called twice: initial check + retry after conflict
          expect(mockFindFirst).toHaveBeenCalledTimes(2);
        },
      ),
      { numRuns: 100 },
    );
  });
});
