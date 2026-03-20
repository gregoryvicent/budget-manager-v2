import { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import { User } from "@/backend/domain/budgetManager/User";

/**
 * Busca un usuario por su ID.
 *
 * @param {IUserRepository} userRepo - Repositorio de usuarios.
 * @param {string} id - ID del usuario.
 * @returns {Promise<User>} Usuario encontrado.
 * @throws {Error} Si el usuario no existe.
 */
export const getUserById = async (userRepo: IUserRepository, id: string): Promise<User> => {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new Error(`Usuario con id ${id} no encontrado.`);
  }
  return user;
};
