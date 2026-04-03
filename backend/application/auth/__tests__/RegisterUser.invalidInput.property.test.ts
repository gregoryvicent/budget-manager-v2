import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { registerUser } from "@/backend/application/auth/RegisterUser";
import type { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import type { User } from "@/backend/domain/budgetManager/User";

/**
 * Creates a mock IUserRepository that tracks whether createWithPassword was called.
 */
function createMockRepo() {
  let createCalled = false;

  const repo: IUserRepository = {
    findByEmail: async () => null,
    findByEmailWithPassword: async () => null,
    createWithPassword: async (data: {
      email: string;
      name: string;
      passwordHash: string;
    }): Promise<User> => {
      createCalled = true;
      const now = new Date();
      return {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        createdAt: now,
        updatedAt: now,
      };
    },
    findAll: async () => [],
    findById: async () => null,
    create: async () => ({}) as User,
    update: async () => ({}) as User,
    delete: async () => ({}) as User,
  };

  return { repo, wasCreateCalled: () => createCalled, reset: () => { createCalled = false; } };
}

// Feature: nextauth-authentication, Property 2: Rechazo de entradas inválidas en registro
describe("Property 2: Invalid registration input rejection", () => {
  it("rejects empty name with any email and password", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("", " ", "  ", "\t", "\n"),
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 72 }),
        async (name, email, password) => {
          const { repo, wasCreateCalled } = createMockRepo();
          await expect(
            registerUser(repo, { name, email, password }),
          ).rejects.toThrow();
          expect(wasCreateCalled()).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("rejects empty email with any name and password", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom("", " ", "  ", "\t", "\n"),
        fc.string({ minLength: 8, maxLength: 72 }),
        async (name, email, password) => {
          const { repo, wasCreateCalled } = createMockRepo();
          await expect(
            registerUser(repo, { name, email, password }),
          ).rejects.toThrow();
          expect(wasCreateCalled()).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("rejects password shorter than 8 characters", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.emailAddress(),
        fc.string({ minLength: 0, maxLength: 7 }),
        async (name, email, password) => {
          const { repo, wasCreateCalled } = createMockRepo();
          await expect(
            registerUser(repo, { name, email, password }),
          ).rejects.toThrow();
          expect(wasCreateCalled()).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
