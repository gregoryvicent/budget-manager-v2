import { ISavingsGoalRepository } from "@/backend/ports/budgetManager/ISavingsGoalRepository";
import { SavingsGoal } from "@/backend/domain/budgetManager/SavingsGoal";

export interface UpdateSavingsGoalInput {
  title?: string;
  goalAmount?: number;
}

/**
 * Actualiza el título o el importe objetivo de una meta de ahorro.
 *
 * @param {ISavingsGoalRepository} repo - Repositorio de metas.
 * @param {string} id - ID de la meta a actualizar.
 * @param {UpdateSavingsGoalInput} input - Campos a actualizar.
 * @returns {Promise<SavingsGoal>} Meta actualizada.
 * @throws {Error} Si la meta no existe.
 */
export const updateSavingsGoal = async (
  repo: ISavingsGoalRepository,
  id: string,
  input: UpdateSavingsGoalInput,
): Promise<SavingsGoal> => {
  const existing = await repo.findById(id);
  if (!existing) throw new Error(`Meta con id ${id} no encontrada.`);
  return repo.update(id, input);
};
