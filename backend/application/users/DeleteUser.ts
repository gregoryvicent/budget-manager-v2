import { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import { User } from "@/backend/domain/budgetManager/User";

/**
 * Elimina un usuario por su ID y retorna sus datos.
 *
 * @param {IUserRepository} userRepo - Repositorio de usuarios.
 * @param {string} id - ID del usuario a eliminar.
 * @returns {Promise<User>} Datos del usuario eliminado.
 * @throws {Error} Si el usuario no existe.
 */
export const deleteUser = async (userRepo: IUserRepository, id: string): Promise<User> => {
  const existing = await userRepo.findById(id);
  if (!existing) {
    throw new Error(`Usuario con id ${id} no encontrado.`);
  }
  return userRepo.delete(id);
};
