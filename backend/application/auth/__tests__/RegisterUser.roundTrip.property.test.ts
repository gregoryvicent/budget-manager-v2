import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { registerUser } from "@/backend/application/auth/RegisterUser";
import { verifyCredentials } from "@/backend/application/auth/VerifyCredentials";
import type { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import type { User } from "@/backend/domain/budgetManager/User";

/**
 * Creates a mock IUserRepository that stores users in memory,
 * including their passwordHash for credential verification.
 */
function createMockRepo() {
  const users: (User & { passwordHash: string })[] = [];

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
    findAll: async () => [],
    findById: async () => null,
    create: async () => ({}) as User,
    update: async () => ({}) as User,
    delete: async () => ({}) as User,
  };

  return { repo };
}

// Feature: nextauth-authentication, Property 4: Round-trip de registro y verificación de credenciales
describe("Property 4: Registration and credential verification round-trip", () => {
  it(
    "register then verify with correct password returns user, wrong password returns null",
    async () => {
      const validName = fc.stringMatching(/^[a-zA-Z][a-zA-Z ]{0,49}$/);
      const validPassword = fc.string({ minLength: 8, maxLength: 72 });

      await fc.assert(
        fc.asyncProperty(
          validName,
          fc.emailAddress(),
          validPassword,
          validPassword,
          async (name, email, correctPassword, wrongPassword) => {
            fc.pre(correctPassword !== wrongPassword);

            const { repo } = createMockRepo();

            // Register the user
            const registered = await registerUser(repo, {
              name,
              email,
              password: correctPassword,
            });
            expect(registered.email).toBe(email);

            // Verify with correct password should return the user
            const verified = await verifyCredentials(repo, email, correctPassword);
            expect(verified).not.toBeNull();
            expect(verified!.email).toBe(email);
            expect(verified!.id).toBe(registered.id);

            // Verify with wrong password should return null
            const rejected = await verifyCredentials(repo, email, wrongPassword);
            expect(rejected).toBeNull();
          },
        ),
        { numRuns: 100 },
      );
    },
    120_000,
  );
});
