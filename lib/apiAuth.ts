import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface AuthResult {
  userId: string;
}

/**
 * Validates the current session and returns the authenticated userId.
 * Throws an object with status 401 if no valid session exists.
 *
 * @returns {Promise<AuthResult>} Object containing the authenticated userId
 * @throws {{ status: number; message: string }} If no valid session exists
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw { status: 401, message: "Autenticación requerida." };
  }
  return { userId: session.user.id };
}
