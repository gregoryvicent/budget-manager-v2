import { NextResponse } from "next/server";
import { prisma } from "@/backend/adapters/db/prisma/prisma.client";
import { Prisma } from "@/lib/generated/prisma/client";

const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface IdempotencyOptions {
  /** The handler that performs the actual operation. */
  handler: () => Promise<NextResponse>;
  /** The idempotency key from the request header. Null skips idempotency check. */
  idempotencyKey: string | null;
}

interface IdempotencyResult {
  response: NextResponse;
  fromCache: boolean;
}

/**
 * Wraps an API route handler with idempotency protection.
 *
 * - If `idempotencyKey` is null, executes the handler directly (backward compatible).
 * - If a non-expired record exists for the key, returns the stored response.
 * - Otherwise, executes the handler, stores the result (2xx/4xx only), and returns it.
 * - Handles UNIQUE constraint conflicts for concurrent requests with the same key.
 *
 * @param options - The handler and idempotency key.
 * @returns The response and whether it came from cache.
 */
export async function withIdempotency(
  options: IdempotencyOptions,
): Promise<IdempotencyResult> {
  const { handler, idempotencyKey } = options;

  // No key provided — execute handler directly (backward compatibility)
  if (!idempotencyKey) {
    const response = await handler();
    return { response, fromCache: false };
  }

  // Check for an existing non-expired record
  const cutoff = new Date(Date.now() - EXPIRATION_MS);
  const existing = await prisma.idempotencyRecord.findFirst({
    where: {
      key: idempotencyKey,
      createdAt: { gt: cutoff },
    },
  });

  if (existing) {
    return {
      response: new NextResponse(existing.body, {
        status: existing.statusCode,
        headers: { "Content-Type": "application/json" },
      }),
      fromCache: true,
    };
  }

  // Execute the handler
  const response = await handler();
  const status = response.status;

  // Only store 2xx and 4xx responses; skip 5xx to allow retries
  if (status >= 200 && status < 500) {
    const body = await response.text();

    try {
      await prisma.idempotencyRecord.create({
        data: {
          key: idempotencyKey,
          statusCode: status,
          body,
        },
      });
    } catch (error: unknown) {
      // Handle UNIQUE constraint violation (concurrent request with same key)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const record = await prisma.idempotencyRecord.findFirst({
          where: {
            key: idempotencyKey,
            createdAt: { gt: cutoff },
          },
        });

        if (record) {
          return {
            response: new NextResponse(record.body, {
              status: record.statusCode,
              headers: { "Content-Type": "application/json" },
            }),
            fromCache: true,
          };
        }
      }

      // Re-throw any other error
      throw error;
    }

    // Reconstruct response since we consumed the body with .text()
    return {
      response: new NextResponse(body, {
        status,
        headers: { "Content-Type": "application/json" },
      }),
      fromCache: false,
    };
  }

  // 5xx — return as-is without storing
  return { response, fromCache: false };
}
