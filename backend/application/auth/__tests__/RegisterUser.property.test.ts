import { describe, it, expect } from "vitest";
import fc from "fast-check";
import bcrypt from "bcryptjs";
import { registerUser } from "@/backend/application/auth/RegisterUser";
import type { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import type { User } from "@/backend/domain/budgetManager/User";

/**
 * Creates a mock IUserRepository that stores users in memory.
 * Captures the passwordHash passed to createWithPassword for assertion.
 */
function createMockRepo() {
  const users: (User & { passwordHash: string })[] = [];
  let capturedHash: string | null = null;

  const repo: IUserRepository = {
    findByEmail: async (email: string) =>
      users.find((u) => u.email === email) ?? null,
    findByEmailWithPassword: async (email: string) =>
      users.find((u) => u.email === email) ?? null,
    createWithPassword: async (data: {
      email: string;
      name: string;
      passwordHash: string;
    }): Promise<User> => {
      capturedHash = data.passwordHash;
      const now = new Date();
      const user: User & { passwordHash: string } = {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        createdAt: now,
        updatedAt: now,
      };
      users.push(user);
      return user;
    },
    // Stub remaining interface methods (not used by registerUser)
    findAll: async () => [],
    findById: async () => null,
    create: async () => ({}) as User,
    update: async () => ({}) as User,
    delete: async () => ({}) as User,
  };

  return { repo, getCapturedHash: () => capturedHash };
}

// Feature: nextauth-authentication, Property 1: Invariante de hashing de contraseña
describe("Property 1: Password hashing invariant", () => {
  it(
    "stored hash is never equal to plaintext and bcrypt.compare returns true",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 8, maxLength: 72 }),
          async (password) => {
            const { repo, getCapturedHash } = createMockRepo();
            const email = `${crypto.randomUUID()}@test.com`;

            await registerUser(repo, {
              name: "Test User",
              email,
              password,
            });

            const storedHash = getCapturedHash();
            expect(storedHash).not.toBeNull();
            // Hash must never equal the plaintext password
            expect(storedHash).not.toBe(password);
            // bcrypt.compare must confirm the hash matches the original password
            const isValid = await bcrypt.compare(password, storedHash!);
            expect(isValid).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    },
    // bcrypt with cost factor 12 is intentionally slow (~250ms per hash);
    // 100 runs × ~250ms ≈ 25s + compare overhead
    60_000,
  );
});
