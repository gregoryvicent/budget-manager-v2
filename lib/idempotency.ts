/**
 * Generates a unique idempotency key (UUID v4) for use in mutating HTTP requests.
 *
 * @returns {string} A new UUID v4 string.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
