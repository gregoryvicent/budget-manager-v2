import bcrypt from "bcryptjs";
import type { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import type { User } from "@/backend/domain/budgetManager/User";

/**
 * Verifies email/password credentials against stored hash.
 * Returns User if valid, null otherwise. Never reveals which field failed.
 *
 * @param {IUserRepository} userRepo - The user repository instance
 * @param {string} email - The email to verify
 * @param {string} password - The plaintext password to verify
 * @returns {Promise<User | null>} The authenticated user or null
 */
export async function verifyCredentials(
  userRepo: IUserRepository,
  email: string,
  password: string,
): Promise<User | null> {
  const user = await userRepo.findByEmailWithPassword(email);
  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}
