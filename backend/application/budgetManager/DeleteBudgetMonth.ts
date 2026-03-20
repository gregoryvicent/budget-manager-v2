import { IBudgetMonthRepository } from "@/backend/ports/budgetManager/IBudgetMonthRepository";
import { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";

/**
 * Elimina un presupuesto mensual por su ID y retorna sus datos.
 *
 * @param {IBudgetMonthRepository} repo - Repositorio de presupuestos.
 * @param {string} id - ID del presupuesto a eliminar.
 * @returns {Promise<BudgetMonth>} Datos del presupuesto eliminado.
 * @throws {Error} Si el presupuesto no existe.
 */
export const deleteBudgetMonth = async (
  repo: IBudgetMonthRepository,
  id: string,
): Promise<BudgetMonth> => {
  const existing = await repo.findById(id);
  if (!existing) {
    throw new Error(`Presupuesto con id ${id} no encontrado.`);
  }
  return repo.delete(id);
};
