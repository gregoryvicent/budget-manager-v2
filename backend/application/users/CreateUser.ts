import { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import { User } from "@/backend/domain/budgetManager/User";

export interface CreateUserInput {
  email: string;
  name: string;
}

/**
 * Crea un nuevo usuario.
 *
 * @param {IUserRepository} userRepo - Repositorio de usuarios.
 * @param {CreateUserInput} input - Datos del usuario a crear.
 * @returns {Promise<User>} Usuario creado.
 * @throws {Error} Si el email ya está en uso.
 */
export const createUser = async (
  userRepo: IUserRepository,
  input: CreateUserInput,
): Promise<User> => {
  const existing = await userRepo.findByEmail(input.email);
  if (existing) {
    throw new Error(`El email ${input.email} ya está en uso.`);
  }
  return userRepo.create(input);
};
