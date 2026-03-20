import { IBudgetMonthRepository } from "@/backend/ports/budgetManager/IBudgetMonthRepository";
import { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";

/**
 * Busca un presupuesto mensual por su ID.
 *
 * @param {IBudgetMonthRepository} repo - Repositorio de presupuestos.
 * @param {string} id - ID del presupuesto.
 * @returns {Promise<BudgetMonth>} Presupuesto encontrado.
 * @throws {Error} Si el presupuesto no existe.
 */
export const getBudgetMonthById = async (
  repo: IBudgetMonthRepository,
  id: string,
): Promise<BudgetMonth> => {
  const budget = await repo.findById(id);
  if (!budget) {
    throw new Error(`Presupuesto con id ${id} no encontrado.`);
  }
  return budget;
};
