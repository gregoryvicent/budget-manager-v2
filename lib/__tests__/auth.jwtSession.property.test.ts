import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { authOptions } from "@/lib/auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

/**
 * Extracts the jwt and session callbacks from authOptions.
 * These are the units under test — they must propagate user.id
 * through the token and into the session object.
 */
const jwtCallback = authOptions.callbacks!.jwt!;
const sessionCallback = authOptions.callbacks!.session!;

// Feature: nextauth-authentication, Property 9: Sesión JWT contiene el ID de Prisma
describe("Property 9: JWT session contains Prisma user ID", () => {
  it(
    "jwt callback propagates user.id into token, session callback propagates token.id into session.user.id",
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (userId) => {
          // Simulate the jwt callback receiving a freshly authenticated user
          const baseToken: JWT = { sub: "", iat: 0, exp: 0, jti: "" } as JWT;
          const user = { id: userId, email: "a@b.com", name: "Test" };

          const token = await (jwtCallback as Function)({
            token: baseToken,
            user,
            account: null,
            trigger: "signIn",
          });

          // The token must contain the user's Prisma ID
          expect(token.id).toBe(userId);

          // Simulate the session callback receiving the enriched token
          const baseSession: Session = {
            user: { id: "", email: "a@b.com", name: "Test" },
            expires: new Date(Date.now() + 86400000).toISOString(),
          };

          const session = await (sessionCallback as Function)({
            session: baseSession,
            token,
          });

          // The session.user.id must match the original Prisma user ID
          expect(session.user.id).toBe(userId);
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    "jwt callback preserves existing token.id on subsequent calls (no user object)",
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (userId) => {
          // First call: user is present (sign-in)
          const initialToken = await (jwtCallback as Function)({
            token: { sub: "" } as JWT,
            user: { id: userId, email: "a@b.com", name: "Test" },
            account: null,
            trigger: "signIn",
          });

          // Subsequent call: user is undefined (session refresh)
          const refreshedToken = await (jwtCallback as Function)({
            token: initialToken,
            user: undefined,
            account: null,
            trigger: "update",
          });

          // The id must persist across refreshes
          expect(refreshedToken.id).toBe(userId);
        }),
        { numRuns: 100 },
      );
    },
  );
});
