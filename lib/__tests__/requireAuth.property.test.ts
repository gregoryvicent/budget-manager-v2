import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { requireAuth } from "@/lib/apiAuth";

const mockedGetServerSession = vi.mocked(getServerSession);

beforeEach(() => {
  mockedGetServerSession.mockReset();
});

// Feature: nextauth-authentication, Property 5: Comportamiento de requireAuth
describe("Property 5: requireAuth behavior", () => {
  it("returns { userId } when session contains a valid user.id", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (userId) => {
        mockedGetServerSession.mockResolvedValueOnce({
          user: { id: userId, email: "test@test.com", name: "Test" },
          expires: new Date(Date.now() + 86400000).toISOString(),
        });

        const result = await requireAuth();
        expect(result).toEqual({ userId });
      }),
      { numRuns: 100 },
    );
  });

  it("throws 401 when session is null", async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);

    await expect(requireAuth()).rejects.toEqual({
      status: 401,
      message: "Autenticación requerida.",
    });
  });

  it("throws 401 for any session missing a truthy user.id", async () => {
    const invalidSessionArb = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.constant({}),
      fc.constant({ user: null }),
      fc.constant({ user: undefined }),
      fc.constant({ user: {} }),
      fc.constant({ user: { email: "a@b.com" } }),
      fc.constant({ user: { id: "", name: "X" } }),
      fc.constant({ user: { id: null } }),
      fc.constant({ user: { id: undefined } }),
    );

    await fc.assert(
      fc.asyncProperty(invalidSessionArb, async (session) => {
        mockedGetServerSession.mockResolvedValueOnce(session as never);

        try {
          await requireAuth();
          // Should never reach here — requireAuth must throw for invalid sessions
          expect.unreachable("Expected requireAuth to throw for invalid session");
        } catch (error: unknown) {
          expect(error).toEqual({
            status: 401,
            message: "Autenticación requerida.",
          });
        }
      }),
      { numRuns: 100 },
    );
  });
});
