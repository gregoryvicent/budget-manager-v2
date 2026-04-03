import bcrypt from "bcryptjs";
import type { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import type { User } from "@/backend/domain/budgetManager/User";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

/**
 * Registers a new user with hashed password.
 *
 * @param {IUserRepository} userRepo - The user repository instance
 * @param {RegisterUserInput} input - Registration data (name, email, password)
 * @returns {Promise<User>} The created user
 * @throws {Error} If email already exists or validation fails
 */
export async function registerUser(
  userRepo: IUserRepository,
  input: RegisterUserInput,
): Promise<User> {
  if (!input.name.trim() || !input.email.trim()) {
    throw new Error("Nombre y email son requeridos.");
  }
  if (input.password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  const existing = await userRepo.findByEmail(input.email);
  if (existing) {
    throw new Error("El email ya está en uso.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return userRepo.createWithPassword({
    name: input.name,
    email: input.email,
    passwordHash,
  });
}
