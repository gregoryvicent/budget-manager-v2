import { IUserRepository } from "@/backend/ports/budgetManager/IUserRepository";
import { User } from "@/backend/domain/budgetManager/User";

/**
 * Retorna todos los usuarios registrados.
 *
 * @param {IUserRepository} userRepo - Repositorio de usuarios.
 * @returns {Promise<User[]>} Lista de usuarios ordenada por fecha de creación.
 */
export const getUsers = async (userRepo: IUserRepository): Promise<User[]> => {
  return userRepo.findAll();
};
