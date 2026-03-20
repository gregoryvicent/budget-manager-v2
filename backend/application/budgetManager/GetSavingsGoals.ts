import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal } from "@/backend/domain/budgetManager/SavingsGoal";

/**
 * Retorna todas las metas de ahorro e inversión de un usuario.
 *
 * @param {ISavingsGoalRepository} repo - Repositorio de metas.
 * @param {string} userId - ID del usuario.
 * @returns {Promise<SavingsGoal[]>} Lista de metas del usuario.
 */
export const getSavingsGoals = async (
  repo: ISavingsGoalRepository,
  userId: string,
): Promise<SavingsGoal[]> => {
  return repo.findByUser(userId);
};
