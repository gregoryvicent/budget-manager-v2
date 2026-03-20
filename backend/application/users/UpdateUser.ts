import { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import { User } from "@/backend/domain/budgetManager/User";

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

/**
 * Actualiza los datos de un usuario.
 *
 * @param {IUserRepository} userRepo - Repositorio de usuarios.
 * @param {string} id - ID del usuario a actualizar.
 * @param {UpdateUserInput} input - Campos a actualizar.
 * @returns {Promise<User>} Usuario actualizado.
 * @throws {Error} Si el usuario no existe o el email ya está en uso.
 */
export const updateUser = async (
  userRepo: IUserRepository,
  id: string,
  input: UpdateUserInput,
): Promise<User> => {
  const existing = await userRepo.findById(id);
  if (!existing) {
    throw new Error(`Usuario con id ${id} no encontrado.`);
  }

  if (input.email && input.email !== existing.email) {
    const emailTaken = await userRepo.findByEmail(input.email);
    if (emailTaken) {
      throw new Error(`El email ${input.email} ya está en uso.`);
    }
  }

  return userRepo.update(id, input);
};
