import { IBudgetMonthRepository } from "@/backend/ports/budgetManager/IBudgetMonthRepository";
import { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";

/**
 * Retorna los presupuestos mensuales, opcionalmente filtrados por usuario.
 *
 * @param {IBudgetMonthRepository} repo - Repositorio de presupuestos.
 * @param {string} [userId] - ID del usuario para filtrar. Si se omite, retorna todos.
 * @returns {Promise<BudgetMonth[]>} Lista de presupuestos ordenada por año y mes descendente.
 */
export const getBudgetMonths = async (
  repo: IBudgetMonthRepository,
  userId?: string,
): Promise<BudgetMonth[]> => {
  if (userId) {
    return repo.findByUser(userId);
  }
  return repo.findAll();
};
