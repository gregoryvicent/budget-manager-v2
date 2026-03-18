import { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";

/**
 * Elimina un usuario por su ID.
 *
 * @param {IUserRepository} userRepo - Repositorio de usuarios.
 * @param {string} id - ID del usuario a eliminar.
 * @throws {Error} Si el usuario no existe.
 */
export const deleteUser = async (userRepo: IUserRepository, id: string): Promise<void> => {
  const existing = await userRepo.findById(id);
  if (!existing) {
    throw new Error(`Usuario con id ${id} no encontrado.`);
  }
  await userRepo.delete(id);
};
