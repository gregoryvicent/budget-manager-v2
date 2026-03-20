import { IBudgetMonthRepository } from "@/backend/ports/budgetManager/IBudgetMonthRepository";
import { BudgetMonth } from "@/backend/domain/budgetManager/BudgetMonth";

/**
 * Retorna el presupuesto mensual para un usuario dado; lo crea si no existe.
 *
 * @param {IBudgetMonthRepository} repo - Repositorio de presupuestos.
 * @param {string} userId - ID del usuario.
 * @param {number} year - Año del presupuesto.
 * @param {number} month - Mes del presupuesto (1-12).
 * @returns {Promise<BudgetMonth>} Presupuesto encontrado o recién creado.
 */
export const getOrCreateBudgetMonth = async (
  repo: IBudgetMonthRepository,
  userId: string,
  year: number,
  month: number,
): Promise<BudgetMonth> => {
  const existing = await repo.findByUserAndMonth(userId, year, month);
  if (existing) return existing;
  return repo.create({ userId, year, month });
};
