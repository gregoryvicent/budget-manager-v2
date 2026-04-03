import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { registerUser } from "@/backend/application/auth/RegisterUser";
import type { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import type { User } from "@/backend/domain/budgetManager/User";

/**
 * Creates a mock IUserRepository that stores users in memory.
 * Tracks all created users to verify no duplicate was persisted.
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

  return { repo, getUsers: () => users };
}

// Feature: nextauth-authentication, Property 3: Unicidad de email en registro
describe("Property 3: Email uniqueness in registration", () => {
  it(
    "rejects a second registration with the same email without modifying the original user",
    async () => {
      // Use stringMatching to guarantee non-whitespace-only names
      const validName = fc.stringMatching(/^[a-zA-Z][a-zA-Z ]{0,49}$/);
      const validPassword = fc.string({ minLength: 8, maxLength: 72 });

      await fc.assert(
        fc.asyncProperty(
          validName,
          fc.emailAddress(),
          validPassword,
          validName,
          validPassword,
          async (name1, email, password1, name2, password2) => {
            const { repo, getUsers } = createMockRepo();

            // First registration should succeed
            const firstUser = await registerUser(repo, {
              name: name1,
              email,
              password: password1,
            });
            expect(firstUser.email).toBe(email);

            // Second registration with the same email should be rejected
            await expect(
              registerUser(repo, { name: name2, email, password: password2 }),
            ).rejects.toThrow("El email ya está en uso.");

            // Only one user with that email should exist in the store
            const matchingUsers = getUsers().filter((u) => u.email === email);
            expect(matchingUsers).toHaveLength(1);
            expect(matchingUsers[0].id).toBe(firstUser.id);
          },
        ),
        { numRuns: 100 },
      );
    },
    60_000,
  );
});
